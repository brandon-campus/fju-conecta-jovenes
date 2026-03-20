import { useState, useRef, useEffect } from 'react';
import { Bot, Send } from 'lucide-react';
import { useRole } from '@/lib/roleContext';
import { supabase } from '@/lib/supabase';

// Tipo de los mensajes
type Message = {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
};

// Chips sugeridos
const SUGGESTED_QUERIES = [
  "Jóvenes nuevos este mes",
  "¿Quiénes no volvieron?",
  "Actividad con más asistencias"
];

const Asistente = () => {
  const { role } = useRole();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "assistant",
      text: "¡Hola! Soy el Asistente FJU. Podés preguntarme cosas como:\n• ¿Cuántos jóvenes nuevos vinieron este mes?\n• ¿Quiénes asistieron solo una vez?\n• ¿Cuántas veces vino Lucas Pérez?\n• ¿Cuál fue la actividad con más asistencias en marzo?\n¿En qué te puedo ayudar?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al final del chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    // Ocultar sugerencias tras el primer mensaje
    if (showSuggestions) {
      setShowSuggestions(false);
    }

    const newUserMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: text,
      timestamp: new Date()
    };

    // Actualizar historial asegurando max 50 mensajes
    setMessages(prev => {
      const newMessages = [...prev, newUserMessage];
      return newMessages.slice(-50);
    });
    
    setInputValue("");
    setIsLoading(true);

    try {
      // Intentar obtener info del usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      
      const payload = {
        mensaje: text,
        coordinador_id: user?.id || 'anonymous',
        coordinador_nombre: user?.email || 'Usuario FJU',
        timestamp: new Date().toISOString(),
        rol: role
      };

      const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const newAssistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: data.respuesta || "Recibí tu mensaje, pero no tengo una respuesta configurada.",
        timestamp: new Date()
      };

      setMessages(prev => {
        const newMessages = [...prev, newAssistantMessage];
        return newMessages.slice(-50);
      });

    } catch (error: any) {
      let errorMessage = "No pude conectarme al asistente en este momento. Revisá tu conexión e intentá de nuevo.";
      
      if (error.name === 'AbortError') {
        errorMessage = "El asistente está tardando más de lo habitual. Por favor intentá de nuevo.";
      }

      const errorAssistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: errorMessage,
        timestamp: new Date()
      };

      setMessages(prev => {
        const newMessages = [...prev, errorAssistantMessage];
        return newMessages.slice(-50);
      });
      console.error("Error al comunicarse con n8n:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(inputValue);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white">
        <div className="w-10 h-10 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white shrink-0">
          <Bot size={24} />
        </div>
        <div className="flex flex-col">
          <h1 className="text-[#1E3A5F] font-semibold text-lg leading-tight">Asistente FJU</h1>
          <p className="text-gray-500 text-xs">Consultá datos de la organización en lenguaje natural</p>
        </div>
      </div>

      {/* Área de mensajes */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap ${
                msg.sender === 'user'
                  ? 'bg-[#1E3A5F] text-white rounded-tr-sm'
                  : 'bg-[#F3F4F6] text-[#1A1A1A] rounded-tl-sm'
              }`}
            >
              {msg.text}
            </div>
            <span className="text-[10px] text-gray-400 mt-1 px-1">
              {formatTime(msg.timestamp)}
            </span>
          </div>
        ))}
        
        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-start">
            <div className="bg-[#F3F4F6] rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1">
              <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}

        {/* Chips de sugerencias */}
        {showSuggestions && (
          <div className="flex flex-col gap-2 mt-2">
            {SUGGESTED_QUERIES.map((query, idx) => (
              <button
                key={idx}
                onClick={() => setInputValue(query)}
                className="self-start text-left bg-white border border-[#F5A623] text-[#F5A623] hover:bg-[#F5A623]/10 text-xs px-3 py-1.5 rounded-full transition-colors"
              >
                {query}
              </button>
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-gray-100 bg-white p-3 pb-[env(safe-area-inset-bottom)] shrink-0">
        <div className="flex items-end gap-2 max-w-lg mx-auto bg-gray-50 rounded-2xl px-3 py-2 border border-gray-200 focus-within:border-[#1E3A5F] transition-colors">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribí tu consulta..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-[#1A1A1A] placeholder:text-gray-400 min-h-[24px] max-h-32 py-1"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSend(inputValue)}
            disabled={!inputValue.trim() || isLoading}
            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
              inputValue.trim() && !isLoading
                ? 'bg-[#1E3A5F] text-white hover:bg-[#1E3A5F]/90'
                : 'bg-gray-200 text-gray-400'
            }`}
          >
            <Send size={16} className="ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Asistente;
