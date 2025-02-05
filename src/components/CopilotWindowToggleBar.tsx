"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, Calendar, Search } from "@geist-ui/icons";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MenuBarProps {
  className?: string;
}

// TODO: pass in callbacks to the statusbar from the main sidebar
const menuItems = [
  {
    icon: (props: React.SVGProps<SVGSVGElement>) => (
      <MessageSquare {...props} />
    ),
    value: "query",
    callback: () => {},
  },
  {
    icon: (props: React.SVGProps<SVGSVGElement>) => <Calendar {...props} />,
    value: "agenda",
    callback: () => {},
  },
  {
    icon: (props: React.SVGProps<SVGSVGElement>) => <Search {...props} />,
    value: "chat",
    callback: () => {},
  },
];

export function CopilotWindowToggleBar({ className }: MenuBarProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <TabsList className="bg-black px-0 rounded-none justify-center items-center inline-flex ">
      {menuItems.map((item, index) => (
        <TabsTrigger
          key={index}
          className="rounded-none w-fit h-fit data-[state=active]:bg-slate-300 data-[state=active]:text-background shadow-none"
          value={item.value || ""}
        >
          <div
            className="w-8 h-8 py-1 rounded-none justify-center items-center gap-2 flex  transition-colors"
            onClick={item.callback}
          >
            <div className="justify-center items-center flex">
              <div className="w-[18px] h-[18px] flex justify-center items-center overflow-hidden">
                <item.icon
                  color="white"
                  className="w-full h-full"
                />
              </div>
            </div>
            <span className="sr-only">{item.value}</span>
          </div>
        </TabsTrigger>
      ))}
    </TabsList>
  );
}
