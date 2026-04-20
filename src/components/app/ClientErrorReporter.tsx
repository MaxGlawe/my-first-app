"use client"

import { Component, useEffect, type ReactNode } from "react"

const MAX_REPORTS_PER_LOAD = 5
let reportCount = 0

type ErrorSource = "error" | "unhandledrejection" | "errorboundary"

function sendReport(payload: {
  message: string
  stack?: string | null
  source: ErrorSource
  lineno?: number | null
  colno?: number | null
}) {
  if (reportCount >= MAX_REPORTS_PER_LOAD) return
  reportCount++

  const body = JSON.stringify({
    ...payload,
    url: typeof window !== "undefined" ? window.location.href : null,
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
  })

  // Prefer sendBeacon for fire-and-forget (works during page unload)
  try {
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" })
      if (navigator.sendBeacon("/api/log/client-error", blob)) return
    }
  } catch {
    // fall through to fetch
  }

  fetch("/api/log/client-error", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    // Logging itself should never throw visibly
  })
}

function GlobalHandlers() {
  useEffect(() => {
    function onError(event: ErrorEvent) {
      sendReport({
        message: event.message || "Unknown error",
        stack: event.error?.stack ?? null,
        source: "error",
        lineno: event.lineno ?? null,
        colno: event.colno ?? null,
      })
    }

    function onUnhandledRejection(event: PromiseRejectionEvent) {
      const reason = event.reason
      const message =
        reason instanceof Error
          ? reason.message
          : typeof reason === "string"
            ? reason
            : "Unhandled promise rejection"
      const stack = reason instanceof Error ? reason.stack : null

      sendReport({
        message,
        stack,
        source: "unhandledrejection",
      })
    }

    window.addEventListener("error", onError)
    window.addEventListener("unhandledrejection", onUnhandledRejection)

    return () => {
      window.removeEventListener("error", onError)
      window.removeEventListener("unhandledrejection", onUnhandledRejection)
    }
  }, [])

  return null
}

interface ErrorBoundaryState {
  hasError: boolean
}

class ReactErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    const stackParts = [error.stack, info.componentStack].filter(Boolean).join("\n---\n")
    sendReport({
      message: error.message || "React render error",
      stack: stackParts || null,
      source: "errorboundary",
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-6 bg-slate-50">
          <div className="max-w-sm text-center space-y-4">
            <h1 className="text-xl font-semibold text-slate-800">
              Da ist etwas schiefgelaufen
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              Wir haben den Fehler automatisch gemeldet. Lade die App bitte neu — falls das
              Problem bleibt, melde dich bei deinem Therapeuten per Chat.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false })
                if (typeof window !== "undefined") window.location.reload()
              }}
              className="mt-2 inline-flex items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-2.5 text-sm"
            >
              App neu laden
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export function ClientErrorReporter({ children }: { children: ReactNode }) {
  return (
    <ReactErrorBoundary>
      <GlobalHandlers />
      {children}
    </ReactErrorBoundary>
  )
}
