import React from 'react';
import { User, Bot } from 'lucide-react';

const MessageBubble = ({ text, sender, timestamp }) => {
    const isUser = sender === 'user';

    return (
        <div className={`message ${isUser ? 'user-message' : 'bot-message'}`}>
            <div className={`avatar ${isUser ? 'user-avatar' : 'bot-avatar'}`}>
                {isUser ? <User size={20} /> : <Bot size={20} />}
            </div>
            <div className="message-content">
                <div className="bubble">
                    {text}
                </div>
                <div className="message-meta">
                    <span>{timestamp}</span>
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;
