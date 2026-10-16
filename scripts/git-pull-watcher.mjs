import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const pollIntervalMs = 30_000
let pollTimer
let pullProcess
let stopped = false

function pullFromGitHub(reason) {
  if (stopped) return

  if (pullProcess) {
    return
  }

  console.log(`[Git Pull Watcher] Iniciando verificação: ${reason}`)
  pullProcess = spawn(
    'powershell.exe',
    [
      '-NoProfile',
      '-ExecutionPolicy',
      'Bypass',
      '-File',
      path.join(repositoryRoot, 'scripts', 'git-pull.ps1'),
    ],
    { cwd: repositoryRoot, stdio: 'inherit', windowsHide: true },
  )

  pullProcess.on('error', (error) => {
    console.error(`[Git Pull Watcher] Não foi possível iniciar o script de pull: ${error.message}`)
  })

  pullProcess.on('close', (code) => {
    pullProcess = undefined

    if (stopped) return

    if (code === 2) {
      console.error(
        '[Git Pull Watcher] Monitoramento de pull pausado: resolva os conflitos de Git antes de continuar.',
      )
      return
    }

    if (code !== 0) {
      console.error(
        `[Git Pull Watcher] O pull encerrou com código ${code ?? 'desconhecido'}; nova tentativa em ${pollIntervalMs / 1000} segundos.`,
      )
    }

    pollTimer = setTimeout(() => {
      void pullFromGitHub(
        code === 0
          ? 'verificando novas alterações no GitHub'
          : 'tentando novamente após falha no pull',
      )
    }, pollIntervalMs)
  })
}

console.log(
  `[Git Pull Watcher] Watcher de PULL ativo (verifica atualizações remotas no GitHub a cada ${pollIntervalMs / 1000}s).`,
)
pullFromGitHub('verificação inicial de novidades no GitHub')

function stopWatcher() {
  if (stopped) return
  stopped = true
  clearTimeout(pollTimer)
  if (pullProcess) pullProcess.kill()
  console.log('[Git Pull Watcher] Watcher de PULL interrompido.')
}

process.once('SIGINT', stopWatcher)
process.once('SIGTERM', stopWatcher)
process.once('SIGHUP', stopWatcher)
