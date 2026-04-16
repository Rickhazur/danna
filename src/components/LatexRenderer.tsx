import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface LatexRendererProps {
  text: string;
  className?: string;
}

const LatexRenderer = ({ text, className = "" }: LatexRendererProps) => {
  // Regex to find $...$ (inline) or $$...$$ (block)
  const parts = text.split(/(\$\$.*?\$\$|\$.*?\$)/g);

  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          const content = part.slice(2, -2);
          return <BlockMath key={i} math={content} />;
        }
        if (part.startsWith('$') && part.endsWith('$')) {
          const content = part.slice(1, -1);
          return <InlineMath key={i} math={content} />;
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
};

export default LatexRenderer;
