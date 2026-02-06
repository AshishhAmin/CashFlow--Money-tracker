import { X, Send, Bot, User } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export default function LiveChatModal({ isOpen, onClose }) {
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! How can we help you today?", sender: 'bot', time: 'Just now' }
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = () => {
        if (!inputText.trim()) return;

        const newUserMsg = {
            id: Date.now(),
            text: inputText,
            sender: 'user',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, newUserMsg]);
        setInputText('');
        setIsTyping(true);

        // Simulate Bot Response
        setTimeout(() => {
            const botResponses = [
                "I understand. Could you provide more details?",
                "Thanks for reaching out. Let me check that for you.",
                "Our team is currently offline, but we've logged your request.",
                "Have you tried restarting the app?",
                "That sounds like a great feature suggestion! I'll pass it on."
            ];
            const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];

            const newBotMsg = {
                id: Date.now() + 1,
                text: randomResponse,
                sender: 'bot',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            setMessages(prev => [...prev, newBotMsg]);
            setIsTyping(false);
        }, 1500);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            <div className="relative bg-card-dark w-full max-w-md h-[500px] flex flex-col rounded-3xl border border-gray-800 shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-[#1a1a1a]">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-neon-green/20 flex items-center justify-center text-neon-green">
                                <Bot size={20} />
                            </div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-neon-green rounded-full border-2 border-[#1a1a1a]"></div>
                        </div>
                        <div>
                            <h2 className="font-bold text-white">CashFlow Support</h2>
                            <p className="text-xs text-neon-green">Online</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide bg-[#0a0a0a]">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-2xl p-3 ${msg.sender === 'user'
                                    ? 'bg-neon-green/10 text-white rounded-tr-none border border-neon-green/20'
                                    : 'bg-gray-800 text-gray-200 rounded-tl-none'
                                }`}>
                                <p className="text-sm">{msg.text}</p>
                                <p className="text-[10px] opacity-50 mt-1 text-right">{msg.time}</p>
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-gray-800 rounded-2xl rounded-tl-none p-3 flex gap-1">
                                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-100"></span>
                                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-200"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-[#1a1a1a] border-t border-gray-800">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type a message..."
                            className="flex-1 bg-black border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-neon-green/50 transition-colors"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!inputText.trim()}
                            className="p-3 bg-neon-green hover:bg-neon-green/90 text-black rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
