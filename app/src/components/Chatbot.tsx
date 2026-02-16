import { MessageCircle, X, Send } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Hi! I'm your AthNexus assistant. How can I help you today?",
            sender: 'bot',
            timestamp: new Date(),
        },
    ]);
    const [inputValue, setInputValue] = useState('');

    const botResponses = [
        "That's a great question! Let me help you with that.",
        "Based on your profile, I'd recommend focusing on improving your fitness metrics.",
        "Your selection probability for the upcoming basketball tournament is 85%!",
        "You can register for events from the Events page.",
        "To improve your rating, try participating in more tournaments.",
        "Your current form shows great improvement! Keep it up!",
    ];

    const handleSend = () => {
        if (!inputValue.trim()) return;

        // Add user message
        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputValue,
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue('');

        // Simulate bot response
        setTimeout(() => {
            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: botResponses[Math.floor(Math.random() * botResponses.length)],
                sender: 'bot',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, botMessage]);
        }, 1000);
    };

    return (
        <>
            {/* Floating Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 w-14 h-14 bg-lime-400 hover:bg-lime-500 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 z-50 animate-pulse-glow"
                >
                    <MessageCircle className="w-6 h-6 text-[#0f172a]" />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-96 h-[500px] glass-dark rounded-2xl shadow-2xl flex flex-col z-50 border border-white/10">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-white/10">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-lime-400 flex items-center justify-center">
                                <MessageCircle className="w-4 h-4 text-[#0f172a]" />
                            </div>
                            <div>
                                <h3 className="text-white font-semibold">AI Assistant</h3>
                                <p className="text-xs text-gray-400">Always here to help</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-lg px-4 py-2 ${message.sender === 'user'
                                            ? 'bg-lime-400 text-[#0f172a]'
                                            : 'bg-white/10 text-white'
                                        }`}
                                >
                                    <p className="text-sm">{message.text}</p>
                                    <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-[#0f172a]/60' : 'text-gray-400'
                                        }`}>
                                        {message.timestamp.toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-white/10">
                        <div className="flex gap-2">
                            <Input
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Type your message..."
                                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                            />
                            <Button
                                onClick={handleSend}
                                className="bg-lime-400 hover:bg-lime-500 text-[#0f172a] px-4"
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Chatbot;
