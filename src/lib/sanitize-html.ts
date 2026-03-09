import DOMPurify from "dompurify"

const ALLOWED_TAGS = ["h2", "h3", "h4", "p", "ul", "ol", "li", "strong", "em", "br", "a", "span", "div", "table", "thead", "tbody", "tr", "th", "td", "img"]
const ALLOWED_ATTR = ["href", "target", "rel", "class", "style", "src", "alt", "width", "height"]

export function sanitizeHtml(dirty: string): string {
  if (typeof window === "undefined") return dirty // SSR fallback
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS, ALLOWED_ATTR })
}
