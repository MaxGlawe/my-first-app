import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Praxis OS — Online Physiotherapie"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #0f172a 0%, #064e3b 100%)",
          color: "white",
          padding: "60px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "16px",
                background: "linear-gradient(135deg, #10b981, #14b8a6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "32px",
                fontWeight: 700,
              }}
            >
              P
            </div>
            <span style={{ fontSize: "42px", fontWeight: 700 }}>Praxis OS</span>
          </div>
          <div
            style={{
              fontSize: "64px",
              fontWeight: 700,
              lineHeight: 1.15,
              textAlign: "center",
              maxWidth: "900px",
            }}
          >
            Online Physiotherapie
          </div>
          <div
            style={{
              fontSize: "28px",
              color: "#6ee7b7",
              fontWeight: 500,
              textAlign: "center",
            }}
          >
            Physiotherapie Glawe
          </div>
          <div
            style={{
              fontSize: "22px",
              color: "#94a3b8",
              maxWidth: "750px",
              textAlign: "center",
              lineHeight: 1.5,
              marginTop: "8px",
            }}
          >
            Professionelle Behandlung per Video — individuelle Trainingspläne und
            persönliche Betreuung per App
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
