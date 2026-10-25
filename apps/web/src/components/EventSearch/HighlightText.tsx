import React from 'react';

interface HighlightTextProps {
  text?: string | null;
  query?: string;
  style?: React.CSSProperties;
  markStyle?: React.CSSProperties;
}

export function HighlightText({
  text,
  query,
  style,
  markStyle,
}: HighlightTextProps) {
  if (!text) return null;

  const trimmedQuery = query?.trim();
  if (!trimmedQuery) {
    return <span style={style}>{text}</span>;
  }

  // Escape special regex characters
  const escaped = trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);

  const defaultMarkStyle: React.CSSProperties = {
    backgroundColor: '#fef08a',
    color: '#854d0e',
    padding: '1px 3px',
    borderRadius: '3px',
    fontWeight: 600,
    ...markStyle,
  };

  return (
    <span style={style}>
      {parts.map((part, index) => {
        if (part.toLowerCase() === trimmedQuery.toLowerCase()) {
          return (
            <mark key={index} style={defaultMarkStyle}>
              {part}
            </mark>
          );
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </span>
  );
}
