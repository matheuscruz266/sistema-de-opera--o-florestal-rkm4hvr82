import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  MessageSquare,
  X,
  Send,
  Loader2,
  Bot,
  User,
  PlusCircle,
  History,
  RotateCcw,
  Sparkles,
  Maximize2,
  Minimize2,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/context/AuthContext'
import {
  DEFAULT_AGENT_SLUG,
  getAgentInfo,
  listAgentConversations,
  loadConversationMessages,
  sendAgentMessageStream,
  sendAgentMessageSync,
  type AgentInfo,
  type AgentConversationItem,
} from '@/services/agentChatApi'
import type { DisplayMessage, AgentCitation } from '@/lib/skipAi'

interface ChatMessageItem {
  id: string
  role: 'user' | 'assistant'
  content: string
  created?: string
  citations?: AgentCitation[]
  isStreaming?: boolean
  error?: boolean
}

// Perguntas sugeridas para onboarding / estado vazio
const SUGESTOES_RAPIDAS = [
  'Qual o estoque total atual nas pilhas de toras?',
  'Há algum alerta de divergência de estoque pendente?',
  'Quais máquinas estão ativas na operação?',
  'Como funciona a conciliação entre o ToraCerta e o saldo calculado?',
]

export function FloatingChatBot() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [agentInfo, setAgentInfo] = useState<AgentInfo | null>(null)

  // Mensagens e entrada
  const [messages, setMessages] = useState<ChatMessageItem[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeConversationId, setActiveConversationId] = useState<string | null>(() => {
    try {
      return localStorage.getItem('skip_agent_last_conversation_id') || null
    } catch {
      return null
    }
  })

  // Lista de conversas anteriores (para histórico/sessões)
  const [conversations, setConversations] = useState<AgentConversationItem[]>([])
  const [showHistoryList, setShowHistoryList] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)

  // Referências para scroll e controle de abort
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Carrega informações do agente nativo ao abrir
  useEffect(() => {
    if (!user) return
    getAgentInfo(DEFAULT_AGENT_SLUG)
      .then((info) => setAgentInfo(info))
      .catch(() => {})
  }, [user])

  // Salva a conversa ativa atual no storage
  useEffect(() => {
    try {
      if (activeConversationId) {
        localStorage.setItem('skip_agent_last_conversation_id', activeConversationId)
      }
    } catch {
      /* intentionally ignored */
    }
  }, [activeConversationId])

  // Auto-scroll suave sempre que as mensagens mudarem
  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
        block: 'end',
      })
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      scrollToBottom(false)
    }
  }, [isOpen, messages, scrollToBottom])

  // Foco no campo de input ao abrir o chat
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 150)
    }
  }, [isOpen])

  // Carrega lista de conversas e mensagens da conversa ativa ao inicializar ou reabrir
  useEffect(() => {
    if (!user || !isOpen) return

    let isMounted = true
    setLoadingHistory(true)

    // Busca conversas do usuário
    listAgentConversations(DEFAULT_AGENT_SLUG, 20)
      .then((convs) => {
        if (!isMounted) return
        setConversations(convs || [])

        // Se tem uma conversa ativa salva, carrega suas mensagens
        const targetConvId =
          activeConversationId || (convs && convs.length > 0 ? convs[0].id : null)

        if (targetConvId) {
          if (!activeConversationId) {
            setActiveConversationId(targetConvId)
          }
          return loadConversationMessages(targetConvId, DEFAULT_AGENT_SLUG).then((loadedMsgs) => {
            if (!isMounted) return
            if (loadedMsgs && loadedMsgs.length > 0) {
              setMessages(
                loadedMsgs.map((m: DisplayMessage) => ({
                  id: m.id,
                  role: m.role,
                  content: m.content,
                  created: m.created,
                  citations: m.citations,
                })),
              )
            }
          })
        }
      })
      .catch((err) => {
        console.warn('Falha ao restaurar histórico do agente:', err)
      })
      .finally(() => {
        if (isMounted) setLoadingHistory(false)
      })

    return () => {
      isMounted = false
    }
  }, [user, isOpen, activeConversationId])

  // Inicia uma nova conversa limpa
  const handleStartNewConversation = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setActiveConversationId(null)
    try {
      localStorage.removeItem('skip_agent_last_conversation_id')
    } catch {
      /* intentionally ignored */
    }
    setMessages([])
    setShowHistoryList(false)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  // Troca para uma conversa anterior existente
  const handleSelectConversation = async (convId: string) => {
    if (convId === activeConversationId) {
      setShowHistoryList(false)
      return
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setActiveConversationId(convId)
    setShowHistoryList(false)
    setLoadingHistory(true)
    try {
      const msgs = await loadConversationMessages(convId, DEFAULT_AGENT_SLUG)
      setMessages(
        msgs.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          created: m.created,
          citations: m.citations,
        })),
      )
    } catch (err) {
      console.warn('Erro ao carregar conversa:', err)
    } finally {
      setLoadingHistory(false)
    }
  }

  // Envio de mensagem (streaming com fallback para síncrono)
  const handleSendMessage = async (textToSend?: string) => {
    const rawMessage = (textToSend ?? inputValue).trim()
    if (!rawMessage || isSubmitting) return

    setInputValue('')

    const tempUserMsgId = `user_${Date.now()}`
    const tempBotMsgId = `bot_${Date.now()}`

    const userMessageItem: ChatMessageItem = {
      id: tempUserMsgId,
      role: 'user',
      content: rawMessage,
      created: new Date().toISOString(),
    }

    const placeholderBotItem: ChatMessageItem = {
      id: tempBotMsgId,
      role: 'assistant',
      content: '',
      isStreaming: true,
      created: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessageItem, placeholderBotItem])
    setIsSubmitting(true)

    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      let accumulatedText = ''

      const result = await sendAgentMessageStream({
        message: rawMessage,
        conversationId: activeConversationId,
        agentSlug: DEFAULT_AGENT_SLUG,
        signal: controller.signal,
        onChunk: (_delta, full) => {
          accumulatedText = full
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === tempBotMsgId ? { ...msg, content: full, isStreaming: true } : msg,
            ),
          )
        },
        onCitations: (citations) => {
          setMessages((prev) =>
            prev.map((msg) => (msg.id === tempBotMsgId ? { ...msg, citations } : msg)),
          )
        },
      })

      // Atualiza com o resultado final e persiste conversationId
      if (result.conversationId && result.conversationId !== activeConversationId) {
        setActiveConversationId(result.conversationId)
        // Atualiza lista de conversas
        listAgentConversations(DEFAULT_AGENT_SLUG, 20)
          .then((convs) => setConversations(convs || []))
          .catch(() => {})
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempBotMsgId
            ? {
                ...msg,
                content: result.content || accumulatedText,
                id: result.messageId || msg.id,
                isStreaming: false,
                citations: result.citations || msg.citations,
              }
            : msg,
        ),
      )
    } catch (err: unknown) {
      if (controller.signal.aborted) {
        // Cancelado pelo usuário
        setMessages((prev) => prev.filter((m) => m.id !== tempBotMsgId))
        return
      }

      console.warn('Tentando fallback síncrono para o agente após falha no stream:', err)

      // Fallback síncrono caso o SSE tenha falhado por rede/proxy
      try {
        const syncRes = await sendAgentMessageSync({
          message: rawMessage,
          conversationId: activeConversationId,
          agentSlug: DEFAULT_AGENT_SLUG,
        })

        if (syncRes.conversationId && syncRes.conversationId !== activeConversationId) {
          setActiveConversationId(syncRes.conversationId)
        }

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempBotMsgId
              ? {
                  ...msg,
                  content: syncRes.content,
                  id: syncRes.messageId || msg.id,
                  isStreaming: false,
                  citations: syncRes.citations,
                }
              : msg,
          ),
        )
      } catch (fallbackErr) {
        console.error('Falha em ambas as chamadas ao agente:', fallbackErr)
        const friendlyError =
          err instanceof Error && err.message && !err.message.includes('fetch')
            ? err.message
            : 'Não foi possível falar com o assistente agora. Tente novamente em instantes.'

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempBotMsgId
              ? {
                  ...msg,
                  content: friendlyError,
                  isStreaming: false,
                  error: true,
                }
              : msg,
          ),
        )
      }
    } finally {
      setIsSubmitting(false)
      abortControllerRef.current = null
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!user) return null

  const assistantName = agentInfo?.display_title || 'Assistente da Operação'

  return (
    <>
      {/* BOTÃO FLUTUANTE DISCRETO E FIXO NO CANTO INFERIOR DIREITO */}
      {!isOpen && (
        <div className="fixed bottom-5 right-5 z-40 print:hidden animate-in fade-in duration-300">
          <Button
            type="button"
            onClick={() => setIsOpen(true)}
            size="lg"
            className="h-14 w-14 rounded-full bg-[#1B5E20] hover:bg-[#144818] text-white shadow-xl hover:shadow-2xl flex items-center justify-center p-0 transition-all duration-200 hover:scale-105 active:scale-95 group relative border-2 border-white/20"
            title="Abrir Assistente da Operação Florestal"
            aria-label="Abrir Assistente da Operação Florestal"
          >
            <MessageSquare className="w-6 h-6 transition-transform group-hover:scale-110" />
            <span className="sr-only">Abrir Chat com Assistente</span>

            {/* Indicador de status online nativo */}
            <span className="absolute top-1 right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white" />
            </span>
          </Button>
        </div>
      )}

      {/* PAINEL DE CONVERSA (CARD FLUTUANTE NO DESKTOP, DRAWER EM TELA CHEIA/MODAL NO MOBILE) */}
      {isOpen && (
        <aside
          role="complementary"
          aria-label="Painel de Chat do Assistente"
          className={`fixed z-50 bg-white shadow-2xl flex flex-col overflow-hidden transition-all duration-300 border border-[#DDE4DE] ${
            isExpanded
              ? 'inset-3 sm:inset-6 sm:bottom-6 sm:right-6 rounded-2xl'
              : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-[420px] md:w-[460px] h-[calc(100vh-2rem)] sm:h-[620px] max-h-[92vh] rounded-2xl'
          }`}
        >
          {/* CABEÇALHO COM NOME DO AGENTE E CONTROLES */}
          <div className="bg-[#1B5E20] text-white px-4 py-3 flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0 border border-white/20">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="overflow-hidden">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm tracking-tight truncate block">
                    {assistantName}
                  </span>
                  <Badge className="bg-emerald-500/25 text-emerald-100 hover:bg-emerald-500/25 text-[10px] px-1.5 py-0 border border-emerald-400/30">
                    Skip AI
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-100/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="truncate">Conectado ao banco operacional</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {/* Botão de Histórico / Sessões */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowHistoryList((v) => !v)}
                title="Histórico de conversas"
                className={`h-8 w-8 text-white/80 hover:text-white hover:bg-white/15 rounded-lg ${
                  showHistoryList ? 'bg-white/20 text-white' : ''
                }`}
              >
                <History className="w-4 h-4" />
              </Button>

              {/* Botão de Nova Conversa */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleStartNewConversation}
                title="Nova conversa"
                className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/15 rounded-lg"
              >
                <PlusCircle className="w-4 h-4" />
              </Button>

              {/* Botão Maximizar / Minimizar no desktop */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded((v) => !v)}
                title={isExpanded ? 'Reduzir tamanho' : 'Expandir painel'}
                className="hidden sm:flex h-8 w-8 text-white/80 hover:text-white hover:bg-white/15 rounded-lg"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>

              {/* Botão Fechar */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsOpen(false)
                  setShowHistoryList(false)
                }}
                title="Fechar chat"
                className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/15 rounded-lg ml-0.5"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* MENU LATERAL/OVERLAY DE HISTÓRICO DE CONVERSAS */}
          {showHistoryList && (
            <div className="bg-neutral-50 border-b border-[#DDE4DE] p-3 max-h-56 overflow-y-auto space-y-2 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between text-xs font-semibold text-[#5A6D5A] px-1">
                <span>Histórico de Conversas</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleStartNewConversation}
                  className="h-6 text-[11px] px-2 gap-1 text-[#1B5E20] border-[#1B5E20]"
                >
                  <PlusCircle className="w-3 h-3" />
                  Nova
                </Button>
              </div>

              {conversations.length === 0 ? (
                <div className="text-center py-4 text-xs text-[#5A6D5A]">
                  Nenhuma conversa gravada ainda.
                </div>
              ) : (
                <div className="space-y-1">
                  {conversations.map((c) => {
                    const isSelected = c.id === activeConversationId
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleSelectConversation(c.id)}
                        className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#E8F5E9] text-[#1B5E20] font-semibold'
                            : 'bg-white hover:bg-neutral-100 text-[#1A2E1A] border border-[#E2E8F0]'
                        }`}
                      >
                        <span className="truncate pr-2">
                          {c.title || `Conversa ${c.id.slice(0, 8)}`}
                        </span>
                        {c.created && (
                          <span className="text-[10px] text-[#5A6D5A] shrink-0">
                            {new Date(c.created).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                            })}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ÁREA DE MENSAGENS / CORPO DO CHAT */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#F8FAF8]">
            {loadingHistory && (
              <div className="flex items-center justify-center py-8 text-xs text-[#5A6D5A] gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#1B5E20]" />
                <span>Carregando histórico com o assistente…</span>
              </div>
            )}

            {/* ESTADO VAZIO / BOAS-VINDAS EM PT-BR */}
            {!loadingHistory && messages.length === 0 && (
              <div className="py-4 space-y-4 text-center max-w-sm mx-auto animate-in fade-in duration-300">
                <div className="w-14 h-14 rounded-2xl bg-[#E8F5E9] text-[#1B5E20] flex items-center justify-center mx-auto shadow-xs border border-[#C8E6C9]">
                  <Sparkles className="w-7 h-7" />
                </div>
                <div className="space-y-1.5 px-2">
                  <h3 className="font-bold text-base text-[#1A2E1A]">
                    Olá, {user.name ? user.name.split(' ')[0] : 'Operador'}!
                  </h3>
                  <p className="text-xs text-[#5A6D5A] leading-relaxed">
                    Sou o assistente de IA nativo do{' '}
                    <strong>Sistema Integrado de Operação Florestal</strong>. Posso te ajudar com
                    consultas rápidas sobre:
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-left text-[11px] px-2 text-[#2E4A2E]">
                  <div className="p-2.5 rounded-lg bg-white border border-[#DDE4DE] flex items-start gap-2 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1B5E20] shrink-0 mt-0.5" />
                    <span>Estoques de pilhas de toras e cavaco</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-[#DDE4DE] flex items-start gap-2 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1B5E20] shrink-0 mt-0.5" />
                    <span>Fazendas, talhões e dados cadastrais</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-[#DDE4DE] flex items-start gap-2 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1B5E20] shrink-0 mt-0.5" />
                    <span>Históricos de baldeio, descarga e picador</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-[#DDE4DE] flex items-start gap-2 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1B5E20] shrink-0 mt-0.5" />
                    <span>Alertas e conciliação ToraCerta</span>
                  </div>
                </div>

                {/* Perguntas sugeridas */}
                <div className="pt-2 text-left space-y-1.5 px-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A6D5A] px-1 flex items-center gap-1">
                    <HelpCircle className="w-3 h-3 text-[#1B5E20]" />
                    Sugestões de perguntas:
                  </span>
                  <div className="space-y-1.5">
                    {SUGESTOES_RAPIDAS.map((sugestao, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendMessage(sugestao)}
                        className="w-full text-left text-xs p-2 rounded-lg bg-white hover:bg-[#E8F5E9] hover:text-[#1B5E20] text-[#1A2E1A] border border-[#DDE4DE] transition-colors shadow-2xs"
                      >
                        {sugestao}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* HISTÓRICO DE MENSAGENS COM BOLHAS DIFERENCIADAS */}
            {messages.map((msg) => {
              const isUser = msg.role === 'user'

              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-lg bg-[#1B5E20] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`space-y-1 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        isUser
                          ? 'bg-[#1B5E20] text-white rounded-br-xs shadow-xs'
                          : msg.error
                            ? 'bg-red-50 text-red-900 border border-red-200 rounded-bl-xs'
                            : 'bg-white text-[#1A2E1A] border border-[#DDE4DE] rounded-bl-xs shadow-xs'
                      }`}
                    >
                      {msg.error && (
                        <div className="flex items-center gap-1.5 text-red-700 font-semibold mb-1 text-xs">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>Aviso</span>
                        </div>
                      )}

                      {/* Conteúdo de texto */}
                      {msg.content ? (
                        <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                      ) : msg.isStreaming ? (
                        <div className="flex items-center gap-2 text-neutral-500 py-0.5 italic text-xs">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1B5E20]" />
                          <span>Digitando…</span>
                        </div>
                      ) : null}

                      {/* Citações de fontes encontradas no banco de dados / RAG */}
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-neutral-200/60 text-[11px] text-[#5A6D5A] space-y-1">
                          <span className="font-semibold block text-[10px] uppercase text-[#1B5E20]">
                            Fontes consultadas:
                          </span>
                          {msg.citations.map((c, i) => (
                            <div
                              key={i}
                              className="truncate bg-neutral-50 px-1.5 py-0.5 rounded text-[10px]"
                            >
                              [{c.n}] {c.excerpt?.slice(0, 100)}...
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Data/Hora da mensagem */}
                    {msg.created && (
                      <span className="text-[10px] text-[#5A6D5A] px-1 block">
                        {new Date(msg.created).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                  </div>

                  {isUser && (
                    <div className="w-7 h-7 rounded-lg bg-emerald-800 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              )
            })}

            <div ref={messagesEndRef} />
          </div>

          {/* CAMPO DE ENTRADA E BOTÃO ENVIAR */}
          <div className="p-3 bg-white border-t border-[#DDE4DE] shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSendMessage()
              }}
              className="flex items-end gap-2"
            >
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Pergunte sobre estoques, máquinas, pilhas..."
                  disabled={isSubmitting}
                  rows={1}
                  className="w-full resize-none min-h-[42px] max-h-24 p-2.5 text-xs sm:text-sm rounded-xl border border-[#DDE4DE] focus:border-[#1B5E20] focus:ring-1 focus:ring-[#1B5E20] outline-hidden transition-all bg-neutral-50 focus:bg-white placeholder:text-neutral-400"
                />
              </div>

              <Button
                type="submit"
                disabled={!inputValue.trim() || isSubmitting}
                className="h-[42px] px-3.5 rounded-xl bg-[#1B5E20] hover:bg-[#144818] text-white disabled:opacity-50 shrink-0"
                title="Enviar mensagem (Enter)"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </form>

            <div className="mt-1.5 flex items-center justify-between text-[10px] text-[#5A6D5A] px-1">
              <span>
                Pressione <strong>Enter</strong> para enviar
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Memória nativa persistente
              </span>
            </div>
          </div>
        </aside>
      )}
    </>
  )
}
export default FloatingChatBot
