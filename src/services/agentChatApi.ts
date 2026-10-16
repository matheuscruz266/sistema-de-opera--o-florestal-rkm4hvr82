import pb from '@/lib/pocketbase/client'
import {
  streamAgentChat,
  displayableMessages,
  type AgentMessage,
  type DisplayMessage,
  type AgentCitation,
} from '@/lib/skipAi'

export interface AgentConversationItem {
  id: string
  title?: string
  created?: string
  updated?: string
  message_count?: number
}

export interface AgentInfo {
  slug: string
  name: string
  display_title: string
  description: string
}

export const DEFAULT_AGENT_SLUG = 'apoio-florestal'

/**
 * Obtém a URL base do backend PocketBase.
 * Usa import.meta.env.VITE_POCKETBASE_URL e garante formato limpo.
 */
function getBackendUrl(): string {
  const envUrl = import.meta.env.VITE_POCKETBASE_URL
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.replace(/\/+$/, '')
  }
  return pb.baseUrl.replace(/\/+$/, '')
}

/**
 * Retorna os headers de autenticação padrão com o token ativo do PocketBase.
 */
function getAuthHeaders(): Record<string, string> {
  const token = pb.authStore.token || ''
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: token } : {}),
  }
}

/**
 * Consulta informações do agente nativo ativo.
 */
export async function getAgentInfo(agentSlug = DEFAULT_AGENT_SLUG): Promise<AgentInfo> {
  try {
    const res = await fetch(
      `${getBackendUrl()}/backend/v1/agent/info?agent_slug=${encodeURIComponent(agentSlug)}`,
      {
        headers: getAuthHeaders(),
      },
    )
    if (!res.ok) {
      throw new Error(`Erro ${res.status} ao consultar info do agente`)
    }
    const data = (await res.json()) as AgentInfo
    return data
  } catch (err) {
    // Retorna dados seguros padrão em caso de oscilação
    return {
      slug: agentSlug,
      name: 'Apoio - Florestal',
      display_title: 'Assistente da Operação Florestal',
      description:
        'Copiloto operacional florestal conectado aos dados de fazendas, máquinas, pilhas, baldeio, descarga, picador e conciliação.',
    }
  }
}

/**
 * Lista conversas anteriores do usuário logado com o agente nativo.
 */
export async function listAgentConversations(
  agentSlug = DEFAULT_AGENT_SLUG,
  limit = 20,
): Promise<AgentConversationItem[]> {
  try {
    const res = await fetch(
      `${getBackendUrl()}/backend/v1/agent/conversations?agent_slug=${encodeURIComponent(
        agentSlug,
      )}&limit=${limit}`,
      {
        headers: getAuthHeaders(),
      },
    )
    if (!res.ok) {
      return []
    }
    const data = (await res.json()) as
      | { items?: AgentConversationItem[]; conversations?: AgentConversationItem[] }
      | AgentConversationItem[]

    if (Array.isArray(data)) {
      return data
    }
    if (Array.isArray(data?.items)) {
      return data.items
    }
    if (Array.isArray(data?.conversations)) {
      return data.conversations
    }
    return []
  } catch (err) {
    console.warn('Erro ao listar conversas do agente:', err)
    return []
  }
}

/**
 * Carrega o histórico de mensagens de uma conversa com o agente nativo.
 * Aplica displayableMessages para filtrar eventos internos de auditoria/ferramentas.
 */
export async function loadConversationMessages(
  conversationId: string,
  agentSlug = DEFAULT_AGENT_SLUG,
): Promise<DisplayMessage[]> {
  if (!conversationId) return []
  try {
    const res = await fetch(
      `${getBackendUrl()}/backend/v1/agent/conversations/${encodeURIComponent(
        conversationId,
      )}/messages?agent_slug=${encodeURIComponent(agentSlug)}&limit=100`,
      {
        headers: getAuthHeaders(),
      },
    )
    if (!res.ok) {
      return []
    }
    const payload = (await res.json()) as { messages?: AgentMessage[]; items?: AgentMessage[] }
    const rawList = payload?.messages || payload?.items || []
    if (!Array.isArray(rawList)) return []
    return displayableMessages(rawList)
  } catch (err) {
    console.warn('Erro ao carregar mensagens da conversa:', err)
    return []
  }
}

/**
 * Envia uma mensagem para o agente nativo via Streaming SSE (com fallback para chamada síncrona).
 */
export async function sendAgentMessageStream(params: {
  message: string
  conversationId?: string | null
  agentSlug?: string
  signal?: AbortSignal
  onChunk?: (delta: string, full: string) => void
  onCitations?: (citations: AgentCitation[]) => void
}): Promise<{
  conversationId: string
  messageId: string
  content: string
  citations?: AgentCitation[]
}> {
  const {
    message,
    conversationId,
    agentSlug = DEFAULT_AGENT_SLUG,
    signal,
    onChunk,
    onCitations,
  } = params

  const res = await fetch(`${getBackendUrl()}/backend/v1/agent/chat-stream`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      message,
      conversation_id: conversationId || null,
      agent_slug: agentSlug,
    }),
    signal,
  })

  // Se a resposta for SSE / Ok, faz streaming com o helper skipAi
  if (res.ok && res.headers.get('content-type')?.includes('text/event-stream')) {
    const streamResult = await streamAgentChat(res, {
      onChunk: (delta, accumulated) => {
        onChunk?.(delta, accumulated)
      },
      onCitations: (citations) => {
        onCitations?.(citations)
      },
      signal,
    })

    const effectiveConvId =
      res.headers.get('X-Conversation-Id') || streamResult.conversation_id || conversationId || ''

    return {
      conversationId: effectiveConvId,
      messageId: streamResult.message_id,
      content: streamResult.content,
      citations: streamResult.citations,
    }
  }

  // Se não foi streaming (ex: erro ou JSON retornado pelo backend)
  if (!res.ok) {
    let errorMsg = 'Não foi possível falar com o assistente agora. Tente novamente em instantes.'
    try {
      const errData = (await res.json()) as { error?: string; message?: string }
      if (errData?.error && typeof errData.error === 'string') {
        errorMsg = errData.error
      } else if (errData?.message && typeof errData.message === 'string') {
        errorMsg = errData.message
      }
    } catch {
      /* intentionally ignored */
    }
    throw new Error(errorMsg)
  }

  // Fallback caso resposta tenha vindo 200 JSON
  const jsonResult = (await res.json()) as {
    conversation_id?: string
    message_id?: string
    content?: string
    citations?: AgentCitation[]
  }

  return {
    conversationId: jsonResult.conversation_id || conversationId || '',
    messageId: jsonResult.message_id || '',
    content: jsonResult.content || '',
    citations: jsonResult.citations,
  }
}

/**
 * Envio síncrono para fallback em navegadores ou conexões que bloqueiem SSE.
 */
export async function sendAgentMessageSync(params: {
  message: string
  conversationId?: string | null
  agentSlug?: string
}): Promise<{
  conversationId: string
  messageId: string
  content: string
  citations?: AgentCitation[]
}> {
  const { message, conversationId, agentSlug = DEFAULT_AGENT_SLUG } = params

  const res = await fetch(`${getBackendUrl()}/backend/v1/agent/chat`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      message,
      conversation_id: conversationId || null,
      agent_slug: agentSlug,
    }),
  })

  if (!res.ok) {
    let errorMsg = 'Não foi possível falar com o assistente agora. Tente novamente em instantes.'
    try {
      const errData = (await res.json()) as { error?: string }
      if (errData?.error) errorMsg = errData.error
    } catch {
      /* intentionally ignored */
    }
    throw new Error(errorMsg)
  }

  const jsonResult = (await res.json()) as {
    conversation_id: string
    message_id: string
    content: string
    citations?: AgentCitation[]
  }

  return {
    conversationId: jsonResult.conversation_id,
    messageId: jsonResult.message_id,
    content: jsonResult.content,
    citations: jsonResult.citations,
  }
}
