// nextjs-app/pages/index.tsx
"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button"; // shadcn UI button (or you can create your own)
import { Logo } from "@/components/Icons";
import { Win11 } from "@/components/Win11";
import { Winbar } from "@/components/Winbar";
import { Wifi, Battery, Volume } from "@geist-ui/icons";
import { ChevronUp } from "@geist-ui/icons";
import "./globals.css";
import { Clock } from "@/components/Clock";

export default function Home() {

  const onCopilotClick = () => {
      // TODO: invoke tauri command to open copilot window
  }
 
  return (
    <div className="bg-[#E1E6F2] ">
      <div className="px-4 flex justify-between">
        <div className="flex py-1 gap-x-4 justify-self-center items-center">
          <Win11 className="w-4 h-4" />
          <Winbar />
        </div>
        <div className="flex items-center gap-4">
          <ChevronUp className="text-black" />
          <Wifi className="w-5 h-5 text-black" />
          <Volume className="w-5 h-5 text-black" />
          <Battery className="w-5 h-5 text-black" />
          <Clock />
        </div>
      </div>
    </div>
  );
}
