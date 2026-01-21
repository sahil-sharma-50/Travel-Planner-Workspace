import React from 'react';
import { Bot } from 'lucide-react';

const ThinkingIndicator = ({ status }) => {
    return (
        <div className="message bot-message thinking">
            <div className="avatar bot-avatar">
                <Bot size={20} />
            </div>
            <div className="bubble thinking-bubble glass">
                <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <span className="thinking-text">{status || "Thinking..."}</span>
            </div>
        </div>
    );
};

export default ThinkingIndicator;
