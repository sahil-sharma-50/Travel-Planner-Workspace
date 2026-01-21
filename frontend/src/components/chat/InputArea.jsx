import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

const InputArea = ({ onSendMessage, disabled }) => {
    const [text, setText] = useState('');
    const textareaRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (text.trim() && !disabled) {
            onSendMessage(text);
            setText('');
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto'; // Reset height
            }
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const handleChange = (e) => {
        setText(e.target.value);

        // Auto-expand
        const target = e.target;
        target.style.height = 'auto';
        target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
    };

    return (
        <form className="input-area glass" onSubmit={handleSubmit}>
            <textarea
                ref={textareaRef}
                className="chat-input"
                placeholder="Type a message..."
                rows={1}
                value={text}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                disabled={disabled}
            />
            <button
                type="submit"
                className="send-button"
                disabled={!text.trim() || disabled}
            >
                <Send size={24} />
            </button>
        </form>
    );
};

export default InputArea;
