"use client";

import React, { useMemo } from "react";
import { marked } from "marked";

interface MarkdownMessageProps {
  content: string;
  isDark?: boolean;
  className?: string;
}

export default function MarkdownMessage({
  content,
  isDark = false,
  className = ""
}: MarkdownMessageProps) {
  const html = useMemo(() => {
    if (!content) return "";
    try {
      return marked.parse(content, { breaks: true, gfm: true }) as string;
    } catch (e) {
      console.error("Markdown parse error:", e);
      return content;
    }
  }, [content]);

  return (
    <div
      className={`markdown-content prose prose-sm max-w-none break-words ${
        isDark ? "prose-invert" : ""
      } ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
