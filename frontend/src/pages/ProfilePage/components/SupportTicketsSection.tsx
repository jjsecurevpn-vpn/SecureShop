import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Plus, LifeBuoy, Send, MessageSquare, HelpCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Title } from '../../../components/Title';
import { Subtitle } from '../../../components/Subtitle';
import { Button } from '../../../components/Button';
import { protonColors } from '../../../styles/colors';
import { SupportTicket } from '../../../lib/supabase';
import { useSupportTickets } from '../../../hooks/useSupportTickets';
import { formatDate } from '../utils';

function getTicketStatusLabel(status: SupportTicket['status']) {
  switch (status) {
    case 'open':
      return 'Abierto';
    case 'pending':
      return 'En revisión';
    case 'closed':
      return 'Cerrado';
    default:
      return status;
  }
}

function getTicketStatusClass(status: SupportTicket['status']) {
  switch (status) {
    case 'open':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'pending':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'closed':
      return 'bg-gray-100 text-gray-700 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

export function SupportTicketsSection({ userId }: { userId: string }) {
  const {
    tickets,
    ticketsLoading,
    ticketsError,
    fetchTickets,
    createTicket,
    messages,
    messagesLoading,
    messagesError,
    fetchMessages,
    sendMessage,
  } = useSupportTickets(userId);

  const [showNewTicket, setShowNewTicket] = useState(false);
  const [newAsunto, setNewAsunto] = useState('');
  const [newDescripcion, setNewDescripcion] = useState('');
  const [creating, setCreating] = useState(false);

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const selectedTicket = useMemo(
    () => tickets.find((t) => t.id === selectedTicketId) ?? null,
    [tickets, selectedTicketId]
  );

  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    if (!selectedTicketId) return;
    fetchMessages(selectedTicketId);
  }, [fetchMessages, selectedTicketId]);

  const handleCreateTicket = async () => {
    setCreating(true);
    const result = await createTicket({ asunto: newAsunto, descripcion: newDescripcion });
    setCreating(false);

    if (result.error) {
      alert(result.error);
      return;
    }

    setNewAsunto('');
    setNewDescripcion('');
    setShowNewTicket(false);

    if (result.ticketId) {
      setSelectedTicketId(result.ticketId);
    }
  };

  const handleSend = async () => {
    if (!selectedTicketId) return;

    setSending(true);
    const result = await sendMessage({ ticketId: selectedTicketId, content: reply });
    setSending(false);

    if (result.error) {
      alert(result.error);
      return;
    }

    setReply('');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
      {/* Quick Help Banner */}
      <Link 
        to="/ayuda" 
        className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 rounded-2xl p-4 mb-6 hover:border-purple-300 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="font-semibold text-purple-800">¿Necesitás ayuda rápida?</p>
            <p className="text-sm text-gray-600">Visitá nuestro Centro de Ayuda con guías y FAQs</p>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <Title as="h2">Soporte</Title>
          <Subtitle className="mt-1">Tickets de ayuda y seguimiento</Subtitle>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setShowNewTicket((v) => !v)}>
          <Plus className="w-4 h-4" />
          Nuevo ticket
        </Button>
      </div>

      {showNewTicket && (
        <div className="bg-white/80 backdrop-blur-sm border border-purple-100 rounded-2xl p-5 md:p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: protonColors.purple[50], border: `1px solid ${protonColors.purple[200]}` }}
            >
              <LifeBuoy className="w-5 h-5" style={{ color: protonColors.purple[500] }} />
            </div>
            <div>
              <p className="font-semibold" style={{ color: protonColors.purple[800] }}>Crear ticket</p>
              <p className="text-sm" style={{ color: protonColors.gray[500] }}>Contanos tu problema o consulta</p>
            </div>
          </div>

          <div className="grid gap-3">
            <input
              value={newAsunto}
              onChange={(e) => setNewAsunto(e.target.value)}
              placeholder="Asunto (ej: No puedo conectarme)"
              className="w-full px-4 py-2.5 bg-white border border-purple-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              style={{ color: protonColors.purple[800] }}
            />
            <textarea
              value={newDescripcion}
              onChange={(e) => setNewDescripcion(e.target.value)}
              placeholder="Detalle (opcional)"
              rows={4}
              className="w-full px-4 py-2.5 bg-white border border-purple-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm resize-none"
              style={{ color: protonColors.purple[800] }}
            />

            <div className="flex gap-2">
              <Button onClick={handleCreateTicket} isLoading={creating}>
                Crear
              </Button>
              <Button variant="secondary" onClick={() => setShowNewTicket(false)} disabled={creating}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {ticketsLoading ? (
        <div className="bg-white/80 backdrop-blur-sm border border-purple-100 rounded-2xl p-8 md:p-12 text-center">
          <Loader2 className="w-7 h-7 animate-spin mx-auto" style={{ color: protonColors.purple[500] }} />
          <p className="mt-3 text-sm" style={{ color: protonColors.gray[600] }}>Cargando tickets...</p>
        </div>
      ) : ticketsError ? (
        <div className="bg-white/80 backdrop-blur-sm border border-purple-100 rounded-2xl p-6">
          <p className="text-sm text-red-600">{ticketsError}</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm border border-purple-100 rounded-2xl p-8 md:p-12 text-center">
          <LifeBuoy className="w-14 h-14 mx-auto mb-4" style={{ color: protonColors.purple[300] }} />
          <Title as="h3" center className="mb-2">Todavía no tenés tickets</Title>
          <Subtitle center className="max-w-md mx-auto">
            Si necesitás ayuda, creá un ticket y te respondemos por acá.
          </Subtitle>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTicketId(t.id)}
              className="w-full text-left bg-white/80 backdrop-blur-sm border border-purple-100 rounded-2xl p-4 md:p-5 hover:border-purple-300 hover:shadow-lg transition-all"
              style={{ outline: 'none' }}
            >
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: protonColors.purple[50], border: `1px solid ${protonColors.purple[200]}` }}
                >
                  <MessageSquare className="w-5 h-5" style={{ color: protonColors.purple[500] }} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate" style={{ color: protonColors.purple[800] }}>{t.asunto}</p>
                  <p className="text-sm mt-0.5" style={{ color: protonColors.gray[500] }}>
                    Último movimiento: {formatDate(t.last_message_at)}
                  </p>
                </div>

                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${getTicketStatusClass(t.status)}`}>
                  <span className="text-sm font-medium">{getTicketStatusLabel(t.status)}</span>
                </div>
              </div>
            </button>
          ))}

          {selectedTicket && (
            <div className="bg-white/80 backdrop-blur-sm border border-purple-100 rounded-2xl p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-purple-500 font-semibold">Ticket</p>
                  <h3 className="text-lg font-bold mt-1" style={{ color: protonColors.purple[800] }}>{selectedTicket.asunto}</h3>
                  {selectedTicket.descripcion && (
                    <p className="text-sm mt-2" style={{ color: protonColors.gray[600] }}>{selectedTicket.descripcion}</p>
                  )}
                </div>

                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${getTicketStatusClass(selectedTicket.status)}`}>
                  <span className="text-sm font-medium">{getTicketStatusLabel(selectedTicket.status)}</span>
                </div>
              </div>

              <div
                className="rounded-xl p-4 border"
                style={{ backgroundColor: protonColors.purple[50], borderColor: protonColors.purple[200] }}
              >
                {messagesLoading ? (
                  <div className="flex items-center justify-center gap-2 py-6">
                    <Loader2 className="w-5 h-5 animate-spin" style={{ color: protonColors.purple[500] }} />
                    <span className="text-sm" style={{ color: protonColors.purple[500] }}>Cargando conversación...</span>
                  </div>
                ) : messagesError ? (
                  <p className="text-sm text-red-600">{messagesError}</p>
                ) : messages.length === 0 ? (
                  <p className="text-sm" style={{ color: protonColors.gray[600] }}>No hay mensajes aún.</p>
                ) : (
                  <div className="space-y-3">
                    {messages.map((m) => (
                      <div key={m.id} className="bg-white rounded-xl p-3 border" style={{ borderColor: protonColors.purple[100] }}>
                        <p className="text-sm" style={{ color: protonColors.purple[900] }}>{m.content}</p>
                        <p className="text-xs mt-2" style={{ color: protonColors.gray[500] }}>{formatDate(m.created_at)}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex flex-col md:flex-row gap-2">
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Escribir respuesta..."
                    rows={2}
                    className="flex-1 px-4 py-2.5 bg-white border border-purple-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm resize-none"
                    style={{ color: protonColors.purple[800] }}
                  />
                  <Button onClick={handleSend} disabled={!reply.trim() || sending}>
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Enviar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
