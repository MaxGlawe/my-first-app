"use client"

import ReactMarkdown from "react-markdown"
import { cn } from "@/lib/utils"

/**
 * Renders a path lesson's markdown content with premium, course-themed typography.
 * The lesson content in docs/paths/*.md uses **bold**, bullet/numbered lists,
 * paragraphs and the occasional sub-heading — this maps each to a styled element
 * instead of dumping raw markdown.
 */
export function LessonContent({
  markdown,
  accentText,
  accentBullet,
}: {
  markdown: string
  /** tailwind text-color class for emphasis, e.g. "text-cyan-700" */
  accentText: string
  /** tailwind bg-color class for list bullets, e.g. "bg-cyan-400" */
  accentBullet: string
}) {
  return (
    <div className="space-y-3.5">
      <ReactMarkdown
        components={{
          p: ({ children }) => (
            <p className="text-[15px] leading-[1.75] text-slate-600">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className={cn("font-semibold", accentText)}>{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-slate-500">{children}</em>
          ),
          ul: ({ children }) => (
            <ul className="space-y-2 my-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="space-y-2 my-1 list-none">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="flex gap-2.5 text-[15px] leading-[1.7] text-slate-600">
              <span
                className={cn(
                  "mt-[0.5em] h-1.5 w-1.5 rounded-full shrink-0",
                  accentBullet
                )}
              />
              <span className="flex-1 min-w-0">{children}</span>
            </li>
          ),
          h2: ({ children }) => (
            <h2 className="text-base font-bold text-slate-800 mt-5 mb-1 first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-bold text-slate-700 mt-4 mb-1 first:mt-0">
              {children}
            </h3>
          ),
          hr: () => <hr className="border-slate-100 my-4" />,
          a: ({ children, href }) => (
            <a
              href={href}
              className={cn("underline underline-offset-2", accentText)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  )
}
