import { Win11 } from "@/components/Win11";
import Image from "next/image";

export default function Home() {
  return (
    <div className="grid items-center font-[family-name:var(--font-geist-sans)]">
      <main className="flex items-start">
        <Win11 />
      </main>
    </div>
  );
}
