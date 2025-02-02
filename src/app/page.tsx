// nextjs-app/pages/index.tsx
"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button"; // shadcn UI button (or you can create your own)
import { Logo, Wifi, Battery, Volume } from "@/components/Icons";
import { Win11 } from "@/components/Win11";
import { Winbar } from "@/components/Winbar";

export default function Home() {
  const [time, setTime] = useState(new Date());

  // <div className="flex bg-[#E1E6F2] h-screen justify-center items-center font-[family-name:var(--font-geist-sans)]">
  //   <div className="flex items-center justify-self-center">
  //     <Win11 height={30} width={30} />
  //   </div>
  //   <Winbar />
  // </div>

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-[#E1E6F2] ">
      <div className="px-4 flex items-center justify-between">
        <Win11 className="w-4 h-4" />
        <div className="flex items-center">
          <Winbar />
        </div>
        <div className="flex items-center gap-4">
          <Wifi className="w-5 h-5 text-black" />
          <Battery className="w-5 h-5 text-black" />
          <Volume className="w-5 h-5 text-black" />
          <div className="text-sm text-black">
            {time.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
