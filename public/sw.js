/**
 * Praxis OS — Service Worker
 * Handles push notifications and notification clicks.
 */

// ── Push Event — Display notification when push arrives ─────────────────────

self.addEventListener("push", function (event) {
  if (!event.data) return

  var payload
  try {
    payload = event.data.json()
  } catch (e) {
    payload = {
      title: "Praxis OS",
      body: event.data.text(),
    }
  }

  var options = {
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
    self.registration.showNotification(payload.title, options)
  )
})

// ── Notification Click — Open/focus the app at the right URL ────────────────

self.addEventListener("notificationclick", function (event) {
  event.notification.close()

  var targetUrl = (event.notification.data && event.notification.data.url) || "/app/dashboard"

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clients) {
      // If the app is already open, focus it and navigate
      for (var i = 0; i < clients.length; i++) {
        if (clients[i].url.indexOf(self.location.origin) !== -1) {
          clients[i].focus()
          clients[i].navigate(targetUrl)
          return
        }
      }
      // Otherwise open a new window
      return self.clients.openWindow(targetUrl)
    })
  )
})

// ── Activate — Take control immediately ─────────────────────────────────────

self.addEventListener("activate", function (event) {
  event.waitUntil(self.clients.claim())
})
