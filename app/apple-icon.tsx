import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#134e4a",
          color: "#6ee7b7",
          fontSize: 76,
          fontWeight: 600,
          letterSpacing: -2,
        }}
      >
        BR
      </div>
    ),
    size
  );
}
