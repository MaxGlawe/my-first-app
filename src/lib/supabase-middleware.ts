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
  const publicRoutes = ['/login', '/login/reset-password', '/datenschutz', '/agb', '/impressum', '/anfrage', '/danke', '/beschwerden', '/online-physiotherapie', '/unternehmen', '/kurse', '/decks', '/karten', '/schmerzcheck', '/check', '/masterclass']
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route + '/'))
  const isInviteRoute = pathname.startsWith('/invite/') || pathname.startsWith('/hr-invite/') || pathname.startsWith('/bgf-invite/')
  const isInviteApi = pathname.startsWith('/api/patients/invite/') || pathname.startsWith('/api/bgf/hr-invite/') || pathname.startsWith('/api/bgf/ma-invite/')
  const isContractSigningPage = pathname.startsWith('/vertrag/') || pathname.startsWith('/bgf-vertrag/')
  const isContractPublicApi = pathname.startsWith('/api/contracts/') || pathname.startsWith('/api/bgf-contracts/')
  const isIntakeApi = pathname === '/api/intake' && request.method === 'POST'
  // B2B-Unternehmens-Kontaktformular (/unternehmen/kontakt) — öffentlicher Mailversand
  const isBgfAnfrageApi = pathname === '/api/bgf-anfrage' && request.method === 'POST'
  // PROJ-23: Schmerzcheck-Funnel — öffentliche Lead-Capture (POST) + Double-Opt-in-Confirm (GET)
  const isSchmerzcheckLeadApi = pathname === '/api/leads/schmerzcheck' && request.method === 'POST'
  const isSchmerzcheckConfirmApi = pathname === '/api/leads/schmerzcheck/confirm' && request.method === 'GET'
  // PROJ-23: getrackter Buchungs-Klick-Redirect aus Mails (öffentlich, loggt + leitet weiter)
  const isSchmerzcheckGoApi = pathname === '/api/schmerzcheck/go' && request.method === 'GET'
  // PROJ-23 Phase 2: Schmerzcheck-Assessment-API (token-gated im Handler selbst)
  const isCheckApi = pathname.startsWith('/api/check/') && (request.method === 'GET' || request.method === 'POST')
  // PROJ-23 Phase 4: 1-Klick-Unsubscribe (token-gated im Handler selbst)
  const isUnsubscribeApi = pathname === '/api/email/unsubscribe' && request.method === 'GET'
  // PROJ-21: Gast-Checkout des öffentlichen Website-Shops — nur dieser eine POST-Endpunkt
  const isPublicCheckoutApi = pathname === '/api/shop/public-checkout' && request.method === 'POST'
  // PROJ-21: "Zugang erneut senden" — nur dieser eine POST-Endpunkt
  const isResendAccessApi = pathname === '/api/shop/resend-access' && request.method === 'POST'
  // PROJ-21: Öffentlicher Produktkatalog — nur lesend (GET) für anonyme Website-Besucher
  const isShopCatalogApi = pathname.startsWith('/api/shop/products') && request.method === 'GET'
  const isAnalyticsTrackApi = pathname === '/api/analytics/track'
  const isLandingAnalyticsApi = pathname === '/api/analytics/pageview' || pathname === '/api/analytics/conversion' || pathname === '/api/analytics/duration'
  const isClientErrorLogApi = pathname === '/api/log/client-error' && request.method === 'POST'
  const isRootPage = pathname === '/'

  // SEO-critical routes — must be accessible to crawlers
  const isSeoRoute = pathname === '/sitemap.xml' || pathname === '/robots.txt' || pathname === '/opengraph-image'

  // Static assets + API routes that handle their own auth
  const isStaticAsset = pathname === '/sw.js' || pathname.startsWith('/icons/') || pathname.startsWith('/images/') || pathname.startsWith('/audio/') || pathname.startsWith('/downloads/')
  const isCronApi = pathname.startsWith('/api/cron/')
  const isPushSendApi = pathname === '/api/push/send'
  const isWebhookApi = pathname.startsWith('/api/webhooks/') // includes /api/webhooks/stripe
  // Interner Endpunkt — server-to-server aufgerufen (Shop-Checkout, PROJ-20),
  // kein User-Cookie. Auth läuft über INTERNAL_API_SECRET im Route-Handler selbst.
  const isBuyerAccountApi = pathname === '/api/buyer-accounts' && request.method === 'POST'

  if (!user && !isPublicRoute && !isInviteRoute && !isInviteApi && !isContractSigningPage && !isContractPublicApi && !isIntakeApi && !isBgfAnfrageApi && !isSchmerzcheckLeadApi && !isSchmerzcheckConfirmApi && !isSchmerzcheckGoApi && !isCheckApi && !isUnsubscribeApi && !isPublicCheckoutApi && !isResendAccessApi && !isShopCatalogApi && !isAnalyticsTrackApi && !isLandingAnalyticsApi && !isClientErrorLogApi && !isRootPage && !isSeoRoute && !isStaticAsset && !isCronApi && !isPushSendApi && !isWebhookApi && !isBuyerAccountApi) {
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

    // ── PROJ-19: Externer Käufer ──────────────────────────────────────────
    // Externe Käufer sehen nur ihren eigenen Bereich (/shop/*).
    // Alle klinischen Bereiche (/app/*, /os/*, /hr/*) sind gesperrt.
    if (role === 'externer_kaeufer') {
      // Erlaubte Routen für externe Käufer
      const isBuyerRoute =
        pathname.startsWith('/shop') ||
        pathname.startsWith('/api/shop') ||
        pathname.startsWith('/api/me/buyer') ||
        pathname.startsWith('/api/me/profile') ||
        pathname.startsWith('/api/auth/') ||
        pathname === '/login' ||
        pathname === '/login/update-password' ||
        isPublicRoute

      if (!isBuyerRoute) {
        url.pathname = '/shop/dashboard'
        return NextResponse.redirect(url)
      }

      // Redirect from login to buyer dashboard
      if (pathname === '/login') {
        url.pathname = '/shop/dashboard'
        return NextResponse.redirect(url)
      }

      return supabaseResponse
    }

    // ── HR-Admin check: patients who are organization admins ──
    // They should access /hr/* routes, NOT /app/* or /os/*
    if (role === 'patient') {
      const { data: orgAdminCheck } = await adminClient
        .from('organization_admins')
        .select('organization_id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (orgAdminCheck) {
        // This "patient" is actually an HR admin
        // Clear must_change_password if still set (HR set password via invite link)
        if (user.user_metadata?.must_change_password === true) {
          await adminClient.auth.admin.updateUserById(user.id, {
            user_metadata: { ...user.user_metadata, must_change_password: false },
          })
        }

        // Allow /hr/* routes, redirect everything else
        if (pathname.startsWith('/hr')) {
          // Let them through to HR dashboard
        } else if (pathname === '/login') {
          url.pathname = '/hr/dashboard'
          return NextResponse.redirect(url)
        } else if (pathname.startsWith('/app') || pathname.startsWith('/os')) {
          url.pathname = '/hr/dashboard'
          return NextResponse.redirect(url)
        }
        // Skip the rest of patient-specific middleware
        return supabaseResponse
      }
    }

    // ── BGF-Member check: patients who are organization members ──
    // They should go to BGF onboarding first, then BGF dashboard
    if (role === 'patient' && pathname.startsWith('/app')) {
      // Allow BGF routes through without redirect
      if (!pathname.startsWith('/app/bgf')) {
        const { data: bgfMember } = await adminClient
          .from('organization_members')
          .select('id, ist_analyse_abgeschlossen, status')
          .eq('user_id', user.id)
          .in('status', ['aktiv', 'eingeladen'])
          .maybeSingle()

        if (bgfMember) {
          // BGF member detected — route to BGF flow
          if (!bgfMember.ist_analyse_abgeschlossen) {
            // Onboarding not done → send to Ist-Analyse
            if (pathname !== '/app/bgf/onboarding') {
              url.pathname = '/app/bgf/onboarding'
              return NextResponse.redirect(url)
            }
          } else {
            // Onboarding done → send to BGF dashboard (not patient dashboard)
            if (pathname === '/app/dashboard') {
              url.pathname = '/app/bgf/dashboard'
              return NextResponse.redirect(url)
            }
          }
        }
      }
    }

    // Patients cannot access /os/* routes
    if (role === 'patient' && pathname.startsWith('/os')) {
      url.pathname = '/app/dashboard'
      return NextResponse.redirect(url)
    }

    // ── Paywall: Patients with expired/cancelled subscriptions ──
    // Only block if a subscription exists but is NOT active.
    // No subscription record = billing not set up yet → allow access.
    if (role === 'patient' && pathname.startsWith('/app')) {
      // PROJ-34: Der Termin-Bereich ist immer zugänglich (auch ohne Abo) —
      // Booking-Patienten sollen ihre Termine sehen/koordinieren können.
      const isPaywallExempt =
        pathname === '/app/abo' ||
        pathname === '/app/onboarding' ||
        pathname.startsWith('/app/termine') ||
        pathname.startsWith('/api/auth/') ||
        pathname.startsWith('/api/me/subscription') ||
        pathname.startsWith('/api/me/billing') ||
        pathname.startsWith('/api/me/appointments') ||
        pathname.startsWith('/api/webhooks/')

      if (!isPaywallExempt) {
        const { data: patientRecord } = await adminClient
          .from('patients')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (patientRecord) {
          const { data: subscription } = await adminClient
            .from('patient_subscriptions')
            .select('status')
            .eq('patient_id', patientRecord.id)
            .single()

          const hasActiveSub = !!subscription && ['trial', 'active'].includes(subscription.status)
          // PROJ-34: Via Buchung provisionierte Konten ("Termine-only") sind ohne
          // aktives Abo gesperrt → Self-Upsell. Bestandspatienten OHNE Abo-Datensatz
          // bleiben unberührt (kein account_origin-Marker).
          const isBookingOrigin =
            (user.app_metadata as { account_origin?: string } | null | undefined)?.account_origin ===
            'booking'

          if (!hasActiveSub && (subscription || isBookingOrigin)) {
            url.pathname = '/app/abo'
            url.searchParams.set('reason', isBookingOrigin ? 'subscription_required' : 'subscription_expired')
            return NextResponse.redirect(url)
          }
        }
      }
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
    // - Cannot access therapy tools (exercises, training plans, etc.)
    // - Cannot access Funktionsuntersuchung or Trainingsdokumentation
    const isTherapyToolRoute =
      pathname.startsWith('/os/exercises') ||
      pathname.startsWith('/os/training-plans') ||
      pathname.startsWith('/os/hausaufgaben') ||
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

    // Force password change on first login (staff created with temp password)
    const mustChangePassword = user.user_metadata?.must_change_password === true
    const isUpdatePasswordPage = pathname === '/login/update-password'
    const isSignOutApi = pathname === '/api/auth/signout'

    if (mustChangePassword && !isUpdatePasswordPage && !isSignOutApi && !isPublicRoute) {
      url.pathname = '/login/update-password'
      return NextResponse.redirect(url)
    }

    // Redirect authenticated users away from login page
    if (isPublicRoute && pathname === '/login') {
      if (role === 'admin') {
        url.pathname = '/os/admin/dashboard'
      } else if (role === 'externer_kaeufer') {
        url.pathname = '/shop/dashboard'
      } else if (role === 'patient') {
        // Check if this patient is actually an HR admin
        const { data: orgAdmin } = await adminClient
          .from('organization_admins')
          .select('organization_id')
          .eq('user_id', user.id)
          .maybeSingle()
        url.pathname = orgAdmin ? '/hr/dashboard' : '/app/dashboard'
      } else {
        url.pathname = '/os/dashboard'
      }
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
