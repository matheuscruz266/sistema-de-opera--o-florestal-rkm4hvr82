import { spawn } from 'node:child_process'
import { watch } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const debounceMs = 2000
const pollIntervalMs = 30_000
const ignoredDirectories = new Set([
  '.git',
  'node_modules',
  'dist',
  'dist-ssr',
  'dev-dist',
  'dev-dist-ssr',
])
let debounceTimer
let pollTimer
let syncProcess
let pendingSync = false
let stopped = false

function isIgnored(relativePath) {
  return relativePath
    .split(/[\\/]/)
    .some((part) => ignoredDirectories.has(part) || part.startsWith('.pnpm'))
}

function scheduleSync(delayMs, reason) {
  if (stopped) return

  clearTimeout(debounceTimer)
  clearTimeout(pollTimer)
  debounceTimer = setTimeout(() => {
    void synchronize(reason)
  }, delayMs)
}

function synchronize(reason) {
  if (stopped) return

  if (syncProcess) {
    pendingSync = true
    return
  }

  console.log(`GitHub sync: ${reason}`)
  syncProcess = spawn(
    'powershell.exe',
    [
      '-NoProfile',
      '-ExecutionPolicy',
      'Bypass',
      '-File',
      path.join(repositoryRoot, 'scripts', 'git-auto-sync.ps1'),
    ],
    { cwd: repositoryRoot, stdio: 'inherit', windowsHide: true },
  )

  syncProcess.on('error', (error) => {
    console.error(`GitHub sync could not start: ${error.message}`)
  })

  syncProcess.on('close', (code) => {
    syncProcess = undefined

    if (stopped) return

    if (pendingSync) {
      pendingSync = false
      scheduleSync(debounceMs, 'syncing changes saved during the previous run')
      return
    }

    if (code === 2) {
      console.error('Automatic sync is paused until Git conflicts are resolved.')
      return
    }

    if (code !== 0) {
      console.error(
        `GitHub sync failed with exit code ${code ?? 'unknown'}; it will retry in 30 seconds.`,
      )
    }

    pollTimer = setTimeout(() => {
      void synchronize(
        code === 0 ? 'checking for updates from GitHub' : 'retrying after a sync failure',
      )
    }, pollIntervalMs)
  })
}

let fileWatcher

try {
  fileWatcher = watch(repositoryRoot, { recursive: true }, (_eventType, filename) => {
    if (!filename) {
      console.warn(
        'A file changed, but Windows did not report its path; syncing to ensure no change is missed.',
      )
      scheduleSync(debounceMs, 'detected a file change')
      return
    }

    const relativePath = filename.toString()
    if (!isIgnored(relativePath)) {
      scheduleSync(debounceMs, `file change: ${relativePath}`)
    }
  })
} catch (error) {
  console.error(`Could not watch project files: ${error.message}`)
  process.exitCode = 1
}

if (fileWatcher) {
  console.log(
    'GitHub file watcher active (2-second save debounce; checks remote every 30 seconds).',
  )
  scheduleSync(debounceMs, 'initial synchronization')

  function stopWatcher() {
    if (stopped) return
    stopped = true
    clearTimeout(debounceTimer)
    clearTimeout(pollTimer)
    fileWatcher.close()
    if (syncProcess) syncProcess.kill()
    console.log('GitHub file watcher stopped.')
  }

  process.once('SIGINT', stopWatcher)
  process.once('SIGTERM', stopWatcher)
  process.once('SIGHUP', stopWatcher)
}
