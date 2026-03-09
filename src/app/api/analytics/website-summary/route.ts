import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

export async function GET() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 })
  }

  const serviceClient = createSupabaseServiceClient()

  const { data: profile } = await serviceClient
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 })
  }

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const since = thirtyDaysAgo.toISOString()

  // Fetch page views and conversions in parallel
  const [pvResult, cvResult] = await Promise.all([
    serviceClient
      .from("page_views")
      .select("path, referrer, utm_source, utm_medium, utm_campaign, device_type, browser, session_id, duration_seconds, created_at")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(10000),
    serviceClient
      .from("conversion_events")
      .select("session_id, event_type, path, metadata, created_at")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(5000),
  ])

  const pageViews = pvResult.data ?? []
  const conversions = cvResult.data ?? []

  // --- Aggregate KPIs ---
  const uniqueSessions = new Set(pageViews.map((pv) => pv.session_id))
  const totalVisitors = uniqueSessions.size
  const totalPageViews = pageViews.length
  const totalConversions = conversions.length

  // Conversion rate: sessions that have at least one conversion
  const convertedSessions = new Set(conversions.map((c) => c.session_id))
  const conversionRate = totalVisitors > 0
    ? Math.round((convertedSessions.size / totalVisitors) * 1000) / 10
    : 0

  // Average duration (only where duration is recorded)
  const durationsRecorded = pageViews.filter((pv) => pv.duration_seconds != null && pv.duration_seconds > 0)
  const avgDuration = durationsRecorded.length > 0
    ? Math.round(durationsRecorded.reduce((sum, pv) => sum + pv.duration_seconds, 0) / durationsRecorded.length)
    : 0

  // --- Visitors by day (last 30 days) ---
  const visitorsByDay: Record<string, Set<string>> = {}
  const pvByDay: Record<string, number> = {}
  for (const pv of pageViews) {
    const day = pv.created_at.split("T")[0]
    if (!visitorsByDay[day]) visitorsByDay[day] = new Set()
    visitorsByDay[day].add(pv.session_id)
    pvByDay[day] = (pvByDay[day] ?? 0) + 1
  }

  const dailyData: { date: string; visitors: number; pageviews: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split("T")[0]
    dailyData.push({
      date: key,
      visitors: visitorsByDay[key]?.size ?? 0,
      pageviews: pvByDay[key] ?? 0,
    })
  }

  // --- Top pages ---
  const pageCounts: Record<string, number> = {}
  for (const pv of pageViews) {
    pageCounts[pv.path] = (pageCounts[pv.path] ?? 0) + 1
  }
  const topPages = Object.entries(pageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([path, count]) => ({ path, count }))

  // --- Traffic sources ---
  const sourceCounts: Record<string, number> = {}
  for (const pv of pageViews) {
    let source = "Direkt"
    if (pv.utm_source) {
      source = pv.utm_source
    } else if (pv.referrer) {
      try {
        source = new URL(pv.referrer).hostname
      } catch {
        source = pv.referrer.slice(0, 50)
      }
    }
    sourceCounts[source] = (sourceCounts[source] ?? 0) + 1
  }
  const trafficSources = Object.entries(sourceCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([source, count]) => ({ source, count }))

  // --- Device breakdown ---
  const deviceCounts: Record<string, number> = { mobile: 0, tablet: 0, desktop: 0 }
  for (const pv of pageViews) {
    if (pv.device_type in deviceCounts) {
      deviceCounts[pv.device_type]++
    }
  }

  // --- Browser breakdown ---
  const browserCounts: Record<string, number> = {}
  for (const pv of pageViews) {
    browserCounts[pv.browser] = (browserCounts[pv.browser] ?? 0) + 1
  }
  const browsers = Object.entries(browserCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([browser, count]) => ({ browser, count }))

  // --- UTM campaigns ---
  const campaignCounts: Record<string, number> = {}
  for (const pv of pageViews) {
    if (pv.utm_campaign) {
      const key = `${pv.utm_source ?? ""}/${pv.utm_medium ?? ""}/${pv.utm_campaign}`
      campaignCounts[key] = (campaignCounts[key] ?? 0) + 1
    }
  }
  const campaigns = Object.entries(campaignCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([campaign, count]) => ({ campaign, count }))

  // --- Conversion events by type ---
  const conversionByType: Record<string, number> = {}
  for (const c of conversions) {
    conversionByType[c.event_type] = (conversionByType[c.event_type] ?? 0) + 1
  }

  // --- Today vs yesterday ---
  const today = new Date().toISOString().split("T")[0]
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayKey = yesterday.toISOString().split("T")[0]

  const todayVisitors = visitorsByDay[today]?.size ?? 0
  const yesterdayVisitors = visitorsByDay[yesterdayKey]?.size ?? 0

  return NextResponse.json({
    kpi: {
      total_visitors: totalVisitors,
      total_pageviews: totalPageViews,
      total_conversions: totalConversions,
      conversion_rate: conversionRate,
      avg_duration_seconds: avgDuration,
      today_visitors: todayVisitors,
      yesterday_visitors: yesterdayVisitors,
    },
    daily: dailyData,
    top_pages: topPages,
    traffic_sources: trafficSources,
    devices: deviceCounts,
    browsers,
    campaigns,
    conversions_by_type: conversionByType,
  })
}
