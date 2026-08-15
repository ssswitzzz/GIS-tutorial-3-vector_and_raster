import React from 'react';
import katex from 'katex';

interface LatexProps {
  math: string;
  inline?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export const Latex: React.FC<LatexProps> = ({
  math,
  inline = true,
  style,
  className,
}) => {
  const html = React.useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode: !inline,
        throwOnError: false,
      });
    } catch {
      return math;
    }
  }, [math, inline]);

  return (
    <span
      className={className}
      style={{
        display: inline ? 'inline-block' : 'block',
        verticalAlign: inline ? 'middle' : 'baseline',
        ...style,
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
