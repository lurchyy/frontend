import ReactMarkdown from "react-markdown";

interface MarkdownRendererProps {
  markdown: unknown;
  className?: string;
}

const MarkdownRenderer = ({ markdown, className }: MarkdownRendererProps) => {
  const content =
    typeof markdown === "string"
      ? markdown
      : markdown !== undefined
      ? JSON.stringify(markdown, null, 2)
      : "";
  return <div className={className}><ReactMarkdown>{content}</ReactMarkdown></div>;
};

export default MarkdownRenderer;
