import React, { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import ThinkingIndicator from './ThinkingIndicator';
import InputArea from './InputArea';

const ChatInterface = () => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Hello! I'm your AI assistant. How can I help you today?",
            sender: 'bot',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [isThinking, setIsThinking] = useState(false);
    const [thinkingStatus, setThinkingStatus] = useState("Thinking...");
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isThinking]);

    const handleSendMessage = async (text) => {
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const newMessage = {
            id: Date.now(),
            text,
            sender: 'user',
            timestamp
        };

        setMessages(prev => [...prev, newMessage]);
        setIsThinking(true);
        setThinkingStatus("Initializing...");

        try {
            const response = await fetch('http://127.0.0.1:8000/plan_tour', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: text }),
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let botText = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split("\n").filter(line => line.trim() !== "");

                for (const line of lines) {
                    try {
                        const event = JSON.parse(line);
                        if (event.type === "status") {
                            setThinkingStatus(event.content);
                        } else if (event.type === "result") {
                            botText += event.content;
                        }
                    } catch (e) {
                        console.error("Error parsing chunk:", e);
                    }
                }
            }

            const botTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const botResponse = {
                id: Date.now() + 1,
                text: botText,
                sender: 'bot',
                timestamp: botTimestamp
            };
            setMessages(prev => [...prev, botResponse]);

        } catch (error) {
            console.error("Error sending message:", error);
            const botTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const botResponse = {
                id: Date.now() + 1,
                text: "Sorry, I'm having trouble connecting to the server. Is it running?",
                sender: 'bot',
                timestamp: botTimestamp
            };
            setMessages(prev => [...prev, botResponse]);
        } finally {
            setIsThinking(false);
            setThinkingStatus("Thinking...");
        }
    };

    return (
        <div className="chat-interface glass">
            <div className="chat-messages">
                {messages.map((msg) => (
                    <MessageBubble
                        key={msg.id}
                        text={msg.text}
                        sender={msg.sender}
                        timestamp={msg.timestamp}
                    />
                ))}
                {isThinking && <ThinkingIndicator status={thinkingStatus} />}
                <div ref={messagesEndRef} />
            </div>
            <InputArea onSendMessage={handleSendMessage} disabled={isThinking} />
        </div>
    );
};

export default ChatInterface;
