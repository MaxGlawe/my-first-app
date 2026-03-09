export function getDeviceType(ua: string): "mobile" | "tablet" | "desktop" {
  if (/Tablet|iPad/i.test(ua)) return "tablet"
  if (/Mobi|Android.*Mobile|iPhone/i.test(ua)) return "mobile"
  return "desktop"
}

export function getBrowser(ua: string): string {
  if (/Edg\//i.test(ua)) return "Edge"
  if (/OPR\//i.test(ua) || /Opera/i.test(ua)) return "Opera"
  if (/SamsungBrowser/i.test(ua)) return "Samsung"
  if (/Chrome\//i.test(ua) && !/Edg/i.test(ua)) return "Chrome"
  if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) return "Safari"
  if (/Firefox\//i.test(ua)) return "Firefox"
  return "Sonstige"
}

export function isBot(ua: string): boolean {
  return /bot|crawl|spider|slurp|Googlebot|Bingbot|Yandex|DuckDuck|Baidu|facebookexternalhit|Twitterbot|LinkedInBot/i.test(ua)
}
