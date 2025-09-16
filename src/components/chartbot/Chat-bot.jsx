// src/components/Chatbot/Chatbot.jsx
import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css';

const GEMINI_API_KEY = import.meta.env.AIzaSyAYGoEGiBSv1FEPeEMo9lGd_rPnbGjiZbU;

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hello! I'm Stockfyy AI. How can I help you with your financial questions today?", sender: 'bot' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userMessage = { text: inputValue, sender: 'user' };
        setMessages(prevMessages => [...prevMessages, userMessage]);
        setInputValue('');
        setIsLoading(true);

        // This is the prompt that tells the AI how to behave.
        const systemPrompt = "You are a helpful and friendly financial assistant for an Indian stock market app called 'Stockfyy'. Your name is Stockfyy AI. Provide concise and accurate information about financial topics, stocks, and market concepts. Always be polite and professional.";
        
        const apiRequestBody = {
            contents: [
                ...messages.map(msg => ({
                    role: msg.sender === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.text }]
                })),
                {
                    role: 'user',
                    parts: [{ text: inputValue }]
                }
            ],
            system_instruction: {
                parts: [{ text: systemPrompt }]
            }
        };

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(apiRequestBody)
            });

            if (!response.ok) {
                throw new Error('Failed to get response from AI.');
            }

            const data = await response.json();
            const botResponse = data.candidates[0].content.parts[0].text;
            setMessages(prevMessages => [...prevMessages, { text: botResponse, sender: 'bot' }]);
        } catch (error) {
            console.error("AI Error:", error);
            setMessages(prevMessages => [...prevMessages, { text: "Sorry, I'm having trouble connecting. Please try again later.", sender: 'bot' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="chat-button" onClick={() => setIsOpen(true)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-robot" viewBox="0 0 16 16"><path d="M6 12.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5ZM3 8.062C3 6.76 4.235 5.765 5.53 5.886a26.58 26.58 0 0 0 4.94 0C11.765 5.765 13 6.76 13 8.062v1.157a.933.933 0 0 1-.765.935c-.845.147-2.34.346-4.235.346-1.895 0-3.39-.2-4.235-.346A.933.933 0 0 1 3 9.219V8.062Zm4.542-.827a.25.25 0 0 0-.217.068l-.92.9a24.767 24.767 0 0 1-1.871-.183.25.25 0 0 0-.265.25l-.095.95c-.013.122.027.248.114.331l.461.422a12.56 12.56 0 0 0 2.132 1.258l.462.292a.25.25 0 0 0 .234 0l.462-.292c.743-.468 1.542-.96 2.132-1.258l.461-.422a.25.25 0 0 0 .114-.331l-.095-.95a.25.25 0 0 0-.265-.25c-.62-.06-1.28-.13-1.871-.183l-.92-.9a.25.25 0 0 0-.217-.068Z"/><path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1ZM2.5 7.962V6.95c0-1.03.82-1.867 1.833-1.867h7.334C12.68 5.083 13.5 5.92 13.5 6.95v1.012c0 .927-.723 1.713-1.642 1.843-.842.13-2.373.328-4.358.328s-3.516-.198-4.358-.328C3.223 9.675 2.5 8.89 2.5 7.962Z"/></svg>
            </div>

            {isOpen && (
                <div className="chat-window">
                    <div className="chat-header">
                        <span>Stockfyy AI</span>
                        <button type="button" className="btn-close" onClick={() => setIsOpen(false)}></button>
                    </div>
                    <div className="chat-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.sender}`}>
                                {msg.text}
                            </div>
                        ))}
                        {isLoading && <div className="message bot">Thinking...</div>}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="chat-input">
                        <form onSubmit={handleSendMessage} className="d-flex">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Ask a question..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                disabled={isLoading}
                            />
                            <button type="submit" className="btn btn-primary ms-2" disabled={isLoading}>Send</button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Chatbot;