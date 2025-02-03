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
import { invoke } from "@tauri-apps/api/core";
import CopilotWindow from "@/components/CopilotWindow";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleToggleSidebar = () => {
    const webView = new WebviewWindow("opilot_sidebar", {
      url: "http://localhost:3000/opilot",
      width: 400, 
      height: 900,
      decorations: false,
    });
    window.console.log("hi")
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <>
      <div className="bg-background ">
        <div className="px-4 flex justify-between">
          <div className="flex py-1 gap-x-4 justify-self-center items-center">
            <Win11 className="w-4 h-4" />
            <Winbar toggleSidebar={handleToggleSidebar} />
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
    </>
  );
}
