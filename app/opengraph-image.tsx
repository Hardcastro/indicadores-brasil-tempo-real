import { ImageResponse } from "next/og";
import { site } from "@/site.config";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(140deg, #ffffff 0%, #f3faf7 55%, #e9f6f0 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 96,
              height: 96,
              borderRadius: 26,
              background: "#134e4a",
              color: "#6ee7b7",
              fontSize: 40,
              fontWeight: 600,
              marginRight: 28,
              letterSpacing: -1,
            }}
          >
            BR
          </div>
          <div style={{ display: "flex", fontSize: 62, fontWeight: 600, color: "#0f172a" }}>{site.name}</div>
        </div>

        <div style={{ display: "flex", marginTop: 32, fontSize: 38, color: "#134e4a", maxWidth: 980 }}>
          {site.tagline}
        </div>

        <div style={{ display: "flex", marginTop: 40, gap: 20 }}>
          {["Selic", "IPCA", "Câmbio", "Desemprego"].map((label) => (
            <div
              key={label}
              style={{
                display: "flex",
                fontSize: 22,
                fontWeight: 500,
                color: "#022c22",
                background: "#10b981",
                padding: "10px 20px",
                borderRadius: 14,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    size
  );
}
