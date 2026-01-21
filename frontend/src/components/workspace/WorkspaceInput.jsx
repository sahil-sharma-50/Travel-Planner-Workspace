import React, { useState } from 'react';
import { Send } from 'lucide-react';

const WorkspaceInput = ({ onSubmit, disabled }) => {
    const [input, setInput] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim() && !disabled) {
            onSubmit(input.trim());
            setInput('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div className="workspace-input">
            <form onSubmit={handleSubmit} className="input-form">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter your travel query... (e.g., Plan a tour for Tokyo)"
                    disabled={disabled}
                    className="workspace-input-field"
                />
                <button
                    type="submit"
                    disabled={disabled || !input.trim()}
                    className="workspace-submit-btn"
                >
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
};

export default WorkspaceInput;
