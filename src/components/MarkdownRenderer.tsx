// This file is required for react-markdown to render markdown in React components.
// Install with: npm install react-markdown

import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownRendererProps {
    markdown: string;
    className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ markdown, className }) => {
    return (
        <div className={className}>
            <ReactMarkdown>{markdown}</ReactMarkdown>
        </div>
    );
};

export default MarkdownRenderer;
