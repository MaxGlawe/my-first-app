/**
 * PROJ-23: Clinical spine illustration (HWS / BWS / LWS).
 * `focusRegion` highlights the relevant section in amber (default "lumbar" so
 * the landing page keeps its original look). Decorative SVG.
 */
type Section = "cervical" | "thoracic" | "lumbar" | (string & {})

export function SpineDiagram({ focusRegion = "lumbar" }: { focusRegion?: Section }) {
  const active = (s: string) => focusRegion === s
  const fill = (s: string) => (active(s) ? "#fef3c7" : "#ffffff")
  const stroke = (s: string) => (active(s) ? "#d97706" : "#065f46")
  const width = (s: string) => (active(s) ? "1.4" : "1.2")
  const labelColor = (s: string) => (active(s) ? "#d97706" : "#065f46")

  return (
    <div className="relative flex h-[360px] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 to-[#fbfaf6] sm:h-[480px]">
      <div className="sc-diamond-fill absolute inset-0" />
      <div className="relative z-[1] w-4/5 max-w-[360px]">
        <svg viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg" className="h-auto w-full">
          <defs>
            <linearGradient id="sc-bg-soft" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ecfdf5" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>

          <rect
            x="46" y="24" width="208" height="340" rx="14"
            fill="url(#sc-bg-soft)" stroke="#065f46" strokeWidth="0.6"
            strokeDasharray="3 5" opacity="0.5"
          />

          <line x1="60" y1="118" x2="240" y2="118" stroke="#065f46" strokeWidth="0.4" strokeDasharray="1 3" opacity="0.25" />
          <line x1="60" y1="222" x2="240" y2="222" stroke="#065f46" strokeWidth="0.4" strokeDasharray="1 3" opacity="0.25" />

          <path
            d="M 150 56 C 158 78, 158 95, 154 115 C 148 140, 140 170, 142 195 C 144 215, 152 240, 158 265 C 162 285, 162 305, 156 325"
            stroke="#065f46" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.18"
          />

          {/* Cervical (HWS) */}
          <g>
            <ellipse cx="151" cy="62" rx="11" ry="5" fill={fill("cervical")} stroke={stroke("cervical")} strokeWidth={width("cervical")} />
            <ellipse cx="153" cy="74" rx="11" ry="5" fill={fill("cervical")} stroke={stroke("cervical")} strokeWidth={width("cervical")} />
            <ellipse cx="155" cy="86" rx="11" ry="5" fill={fill("cervical")} stroke={stroke("cervical")} strokeWidth={width("cervical")} />
            <ellipse cx="156" cy="98" rx="11" ry="5" fill={fill("cervical")} stroke={stroke("cervical")} strokeWidth={width("cervical")} />
            <ellipse cx="155" cy="110" rx="11" ry="5" fill={fill("cervical")} stroke={stroke("cervical")} strokeWidth={width("cervical")} />
          </g>

          {/* Thoracic (BWS) */}
          <g>
            <ellipse cx="153" cy="124" rx="13" ry="5.5" fill={fill("thoracic")} stroke={stroke("thoracic")} strokeWidth={width("thoracic")} />
            <ellipse cx="149" cy="137" rx="13" ry="5.5" fill={fill("thoracic")} stroke={stroke("thoracic")} strokeWidth={width("thoracic")} />
            <ellipse cx="145" cy="150" rx="13" ry="5.5" fill={fill("thoracic")} stroke={stroke("thoracic")} strokeWidth={width("thoracic")} />
            <ellipse cx="142" cy="163" rx="13" ry="5.5" fill={fill("thoracic")} stroke={stroke("thoracic")} strokeWidth={width("thoracic")} />
            <ellipse cx="142" cy="176" rx="13" ry="5.5" fill={fill("thoracic")} stroke={stroke("thoracic")} strokeWidth={width("thoracic")} />
            <ellipse cx="143" cy="189" rx="13" ry="5.5" fill={fill("thoracic")} stroke={stroke("thoracic")} strokeWidth={width("thoracic")} />
            <ellipse cx="146" cy="202" rx="13" ry="5.5" fill={fill("thoracic")} stroke={stroke("thoracic")} strokeWidth={width("thoracic")} />
            <ellipse cx="150" cy="215" rx="13" ry="5.5" fill={fill("thoracic")} stroke={stroke("thoracic")} strokeWidth={width("thoracic")} />
          </g>

          {/* Lumbar (LWS) */}
          <g>
            <ellipse cx="154" cy="230" rx="15" ry="6.5" fill={fill("lumbar")} stroke={stroke("lumbar")} strokeWidth={width("lumbar")} />
            <ellipse cx="157" cy="246" rx="15" ry="6.5" fill={fill("lumbar")} stroke={stroke("lumbar")} strokeWidth={width("lumbar")} />
            <ellipse cx="159" cy="262" rx="15" ry="6.5" fill={fill("lumbar")} stroke={stroke("lumbar")} strokeWidth={width("lumbar")} />
            <ellipse cx="158" cy="278" rx="15" ry="6.5" fill={fill("lumbar")} stroke={stroke("lumbar")} strokeWidth={width("lumbar")} />
            <ellipse cx="156" cy="294" rx="15" ry="6.5" fill={fill("lumbar")} stroke={stroke("lumbar")} strokeWidth={width("lumbar")} />
          </g>

          {/* Sacrum */}
          <path
            d="M 142 306 L 170 306 L 168 328 L 150 334 L 144 328 Z"
            fill="#ffffff" stroke="#065f46" strokeWidth="1.2" strokeLinejoin="round"
          />

          {/* Labels + leader lines */}
          <g fontFamily="Inter, sans-serif" fontSize="10" fontWeight="700" letterSpacing="0.2em">
            <text x="225" y="89" fill={labelColor("cervical")}>HWS</text>
            <line x1="222" y1="86" x2="170" y2="86" stroke={labelColor("cervical")} strokeWidth="0.7" opacity="0.5" />
            <text x="75" y="172" fill={labelColor("thoracic")} textAnchor="end">BWS</text>
            <line x1="78" y1="169" x2="128" y2="169" stroke={labelColor("thoracic")} strokeWidth="0.7" opacity="0.5" />
            <text x="225" y="265" fill={labelColor("lumbar")}>LWS</text>
            <line x1="222" y1="262" x2="176" y2="263" stroke={labelColor("lumbar")} strokeWidth="0.8" opacity="0.55" />
          </g>

          <g fontFamily="Inter, sans-serif" fontSize="7" fontWeight="600" letterSpacing="0.12em" fill="#94a3b8">
            <text x="225" y="102">Halswirbel</text>
            <text x="75" y="185" textAnchor="end">Brustwirbel</text>
            <text x="225" y="278" fill={labelColor("lumbar")} opacity="0.8">Lendenwirbel</text>
          </g>

          <text
            x="150" y="383" textAnchor="middle"
            fontFamily="Cormorant Garamond, serif" fontStyle="italic" fontSize="13" fill="#475569"
          >
            deine Bewegungs-Standortbestimmung
          </text>
        </svg>
      </div>
    </div>
  )
}
