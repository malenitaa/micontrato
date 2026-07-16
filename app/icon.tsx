import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#c9922f",
          borderRadius: 7,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M6 2.5H15L19 6.5V21.5H6V2.5Z"
            fill="#fdf8ee"
            stroke="#1f2320"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path
            d="M15 2.5V6.5H19"
            fill="none"
            stroke="#1f2320"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path
            d="M8.7 13.2L10.8 15.4L15.6 10.3"
            fill="none"
            stroke="#1f2320"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
