import Link from "next/link"

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950" />

      {/* Dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,1) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Glow orbs */}
      <div className="absolute top-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-emerald-500/[0.07] blur-[120px]" />
      <div className="absolute bottom-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-teal-500/[0.05] blur-[100px]" />

      {/* Content */}
      <div className="relative z-10 w-full px-4 py-12 flex flex-col items-center gap-8">
        {/* Logo link back to landing */}
        <Link href="/" className="flex flex-col items-center gap-4 group">
          <img
            src="/images/Physio Logo_ausgeschnitten.png"
            alt="Physiotherapie Glawe"
            className="h-36 w-36 sm:h-40 sm:w-40 rounded-3xl object-contain drop-shadow-2xl"
          />
          <div className="flex flex-col items-center">
            <span className="font-bold text-2xl sm:text-3xl leading-tight text-white tracking-tight">
              Praxis OS
            </span>
            <span className="text-sm text-slate-400 leading-tight mt-1">
              by Physiotherapie Glawe
            </span>
          </div>
        </Link>

        {children}

        {/* Footer */}
        <p className="text-xs text-slate-600">
          &copy; {new Date().getFullYear()} Physiotherapie Glawe
        </p>
      </div>
    </div>
  )
}
