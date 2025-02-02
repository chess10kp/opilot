import { Win11 } from "@/components/Win11";
import Image from "next/image";
import { Winbar } from "@/components/Winbar";
import "./page.css";

export default function Home() {
  return (
    <div className="flex bg-[#E1E6F2] h-screen justify-center items-center font-[family-name:var(--font-geist-sans)]">
      <div className="flex items-center justify-self-center">
        <Win11 height={30} width={30} />
      </div>
      <Winbar />
    </div>
  );
}
