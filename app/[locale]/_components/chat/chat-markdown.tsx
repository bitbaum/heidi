"use client";

import { Markdown } from "@bitbaum/chatkit/react";

/** Free-text explanations share the fleet renderer; dialect/gloss/move cards stay Heidi's. */
export function ChatMarkdown({ text, className = "", onReply }: { text: string; className?: string; onReply?: (text: string) => void }) {
  return <Markdown text={text} className={className} onReply={onReply} />;
}
