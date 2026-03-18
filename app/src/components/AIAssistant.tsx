import { useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { Loader2, MessageCircle, Send, X } from 'lucide-react';
import { ragChatService } from '@/services/ragChatService';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
};

const initialMessages: ChatMessage[] = [
  {
    id: 'welcome-message',
    role: 'assistant',
    text: 'Hi, I am the AthNexus AI assistant. Ask me about events, athlete guidance, training, or the platform.',
  },
];

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || isSending) {
      return;
    }

    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: 'user',
      text: trimmedMessage,
    };

    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setMessage('');
    setError(null);
    setIsSending(true);

    try {
      const data = await ragChatService.sendMessage({
        question: trimmedMessage,
      });
      const answerText = data.answer?.trim() || 'I could not generate a response right now.';

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `${Date.now()}-assistant`,
          role: 'assistant',
          text: answerText,
        },
      ]);
    } catch (requestError) {
      const fallbackMessage =
        requestError instanceof Error
          ? requestError.message
          : 'Unable to connect to the AI assistant.';

      setError('Unable to reach the AI assistant. Please try again in a moment.');
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `${Date.now()}-assistant-error`,
          role: 'assistant',
          text: `I ran into a connection issue: ${fallbackMessage}`,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await sendMessage();
  };

  const handleKeyDown = async (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      await sendMessage();
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[1000] flex items-end justify-end">
      {isOpen ? (
        <div className="flex h-[520px] w-[350px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-950/95 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/80 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-white">AthNexus AI</p>
              <p className="text-xs text-slate-400">Ask anything about your athlete journey</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
              aria-label="Close AI assistant"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-4">
            {messages.map((chatMessage) => {
              const isUser = chatMessage.role === 'user';

              return (
                <div
                  key={chatMessage.id}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-6 shadow-md ${
                      isUser
                        ? 'rounded-br-md bg-lime-400 text-slate-950'
                        : 'rounded-bl-md border border-white/10 bg-slate-800/95 text-slate-100'
                    }`}
                  >
                    {chatMessage.text}
                  </div>
                </div>
              );
            })}

            {isSending ? (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-white/10 bg-slate-800/95 px-3 py-2 text-sm text-slate-200">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Thinking...
                </div>
              </div>
            ) : null}
          </div>

          <div className="border-t border-white/10 bg-slate-950/90 px-4 py-3">
            {error ? <p className="mb-2 text-xs text-rose-400">{error}</p> : null}

            <form onSubmit={handleSubmit} className="flex items-end gap-2">
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Type your question..."
                className="max-h-28 min-h-[44px] flex-1 resize-none rounded-2xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-lime-400/60"
              />
              <button
                type="submit"
                disabled={isSending || !message.trim()}
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lime-400 text-slate-950 transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex h-16 w-16 items-center justify-center rounded-full border border-lime-300/20 bg-slate-950 text-lime-300 shadow-2xl shadow-lime-950/60 transition hover:-translate-y-1 hover:bg-slate-900"
          aria-label="Open AI assistant"
        >
          <MessageCircle className="h-7 w-7" />
        </button>
      )}
    </div>
  );
}
