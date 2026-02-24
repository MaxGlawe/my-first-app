// @ts-nocheck
/**
 * Custom Service Worker — Push Notification Handlers
 *
 * This file is automatically bundled into the service worker by @ducanh2912/next-pwa.
 * It adds push event listeners that the default Workbox SW doesn't include.
 */

const sw = self

// ── Push Event — Display notification when push arrives ─────────────────────

sw.addEventListener("push", (event) => {
  if (!event.data) return

  let payload: {
    title: string
    body: string
    icon?: string
    badge?: string
    url?: string
    tag?: string
  }

  try {
    payload = event.data.json()
  } catch {
    payload = {
      title: "Praxis OS",
      body: event.data.text(),
    }
  }

  const options: NotificationOptions = {
    body: payload.body,
    icon: payload.icon || "/icons/icon-192.png",
    badge: payload.badge || "/icons/icon-192.png",
    tag: payload.tag || "praxis-os-default",
    data: {
      url: payload.url || "/app/dashboard",
    },
    vibrate: [100, 50, 200],
    requireInteraction: false,
  }

  event.waitUntil(
    sw.registration.showNotification(payload.title, options)
  )
})

// ── Notification Click — Open/focus the app at the right URL ────────────────

sw.addEventListener("notificationclick", (event) => {
  event.notification.close()

  const targetUrl = (event.notification.data?.url as string) || "/app/dashboard"

  event.waitUntil(
    sw.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(sw.location.origin)) {
          client.focus()
          client.navigate(targetUrl)
          return
        }
      }
      return sw.clients.openWindow(targetUrl)
    })
  )
})
