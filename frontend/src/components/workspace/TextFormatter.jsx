import React from 'react';

/**
 * TextFormatter component to render markdown-like text in the UI.
 * 
 * @param {Object} props
 * @param {string} props.text - The raw text to format.
 */
const TextFormatter = ({ text }) => {
    if (!text) return null;

    return text.split('\n').map((line, lineIdx) => {
        // Handle headers
        if (line.startsWith('### ')) {
            return (
                <h3 key={lineIdx} style={{ fontSize: '1.1rem', fontWeight: '600', margin: '1rem 0 0.5rem 0', color: 'var(--text-primary)' }}>
                    {line.substring(4)}
                </h3>
            );
        } else if (line.startsWith('## ')) {
            return (
                <h2 key={lineIdx} style={{ fontSize: '1.3rem', fontWeight: '600', margin: '1.2rem 0 0.6rem 0', color: 'var(--text-primary)' }}>
                    {line.substring(3)}
                </h2>
            );
        } else if (line.startsWith('# ')) {
            return (
                <h1 key={lineIdx} style={{ fontSize: '1.5rem', fontWeight: '600', margin: '1.5rem 0 0.75rem 0', color: 'var(--text-primary)' }}>
                    {line.substring(2)}
                </h1>
            );
        }

        // Handle bold text
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
            <div key={lineIdx} style={{ minHeight: '1.2em', marginBottom: '0.25em' }}>
                {parts.map((part, partIdx) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={partIdx}>{part.slice(2, -2)}</strong>;
                    }
                    return <span key={partIdx}>{part}</span>;
                })}
            </div>
        );
    });
};

export default TextFormatter;
