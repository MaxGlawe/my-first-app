import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()
  const pathname = url.pathname

  // Public routes — no auth required
  const publicRoutes = ['/login', '/login/reset-password']
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))
  const isInviteRoute = pathname.startsWith('/invite/')

  if (!user && !isPublicRoute && !isInviteRoute) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user) {
    // Use service role to bypass RLS for profile check (trusted server-side context)
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    const { data: profile } = await adminClient
      .from('user_profiles')
      .select('role, status')
      .eq('id', user.id)
      .single()

    const role = profile?.role
    const isActive = profile?.status === 'aktiv'

    // Deactivated users get redirected to login
    if (!isActive && !isPublicRoute && !isInviteRoute) {
      await supabase.auth.signOut()
      url.pathname = '/login'
      url.searchParams.set('error', 'account_disabled')
      return NextResponse.redirect(url)
    }

    // Patients cannot access /os/* routes
    if (role === 'patient' && pathname.startsWith('/os')) {
      url.pathname = '/app/dashboard'
      return NextResponse.redirect(url)
    }

    // Helper: clinical routes that only Physio/HP/Admin may access
    const isClinicalRoute =
      pathname.startsWith('/os/befund') ||
      /^\/os\/patients\/[^/]+\/befund(\/|$)/.test(pathname) ||
      /^\/os\/patients\/[^/]+\/behandlung(\/|$)/.test(pathname) ||
      /^\/os\/patients\/[^/]+\/arztbericht(\/|$)/.test(pathname)

    // Physiotherapeuten cannot access Heilpraktiker-only routes (Befund & Diagnose)
    if (
      role === 'physiotherapeut' &&
      (pathname.startsWith('/os/befund') ||
        /^\/os\/patients\/[^/]+\/befund(\/|$)/.test(pathname))
    ) {
      url.pathname = '/403'
      return NextResponse.redirect(url)
    }

    // Praeventionstrainer / Personal Trainer: no access to clinical documentation
    if (
      (role === 'praeventionstrainer' || role === 'personal_trainer') &&
      isClinicalRoute
    ) {
      url.pathname = '/403'
      return NextResponse.redirect(url)
    }

    // Praxismanagement: restricted access
    // - Can READ clinical routes (handled at component level with read-only banner)
    // - Cannot access therapy tools (exercises, training plans, courses, etc.)
    // - Cannot access Funktionsuntersuchung or Trainingsdokumentation
    const isTherapyToolRoute =
      pathname.startsWith('/os/exercises') ||
      pathname.startsWith('/os/training-plans') ||
      pathname.startsWith('/os/hausaufgaben') ||
      pathname.startsWith('/os/courses') ||
      /^\/os\/patients\/[^/]+\/funktionsuntersuchung(\/|$)/.test(pathname) ||
      /^\/os\/patients\/[^/]+\/trainingsdoku(\/|$)/.test(pathname)

    if (role === 'praxismanagement' && isTherapyToolRoute) {
      url.pathname = '/403'
      return NextResponse.redirect(url)
    }

    // Non-admins cannot access admin routes
    if (role !== 'admin' && pathname.startsWith('/os/admin')) {
      url.pathname = '/403'
      return NextResponse.redirect(url)
    }

    // Redirect authenticated users away from login page
    if (isPublicRoute && pathname === '/login') {
      if (role === 'admin') url.pathname = '/os/admin/dashboard'
      else if (role === 'patient') url.pathname = '/app/dashboard'
      else url.pathname = '/os/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
