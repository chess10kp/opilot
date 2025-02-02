import { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="currentColor" viewBox="0 0 24 24">
      {/* A simple circular logo */}
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

export function Wifi(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="currentColor" viewBox="0 0 24 24">
      <path d="M2 12C2 7.58 5.58 4 10 4s8 3.58 8 8-3.58 8-8 8-8-3.58-8-8zM10 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z" />
    </svg>
  );
}

export function Battery(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="currentColor" viewBox="0 0 24 24">
      <path d="M16 4h-3V2h-2v2H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H8V6h8v14z" />
    </svg>
  );
}

export function Volume(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="currentColor" viewBox="0 0 24 24">
      <path d="M3 10v4h4l5 5V5l-5 5H3z" />
    </svg>
  );
}
