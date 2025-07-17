// This file is required for react-markdown to render markdown in React components.
// Install with: npm install react-markdown

import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownRendererProps {
  markdown: unknown;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ markdown, className }) => {
  let content: string;
  if (typeof markdown === "string") {
    content = markdown;
  } else if (markdown !== undefined && markdown !== null) {
    try {
      content = JSON.stringify(markdown, null, 2);
    } catch {
      content = String(markdown);
    }
  } else {
    content = "";
  }

  return (
    <div className={className}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
