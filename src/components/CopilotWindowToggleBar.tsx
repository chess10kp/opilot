"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, Calendar, Search } from "@geist-ui/icons";

interface MenuBarProps {
  className?: string;
}

// TODO: pass in callbacks to the statusbar from the main sidebar
const menuItems = [
  {
    icon: (props: React.SVGProps<SVGSVGElement>) => (
      <MessageSquare {...props} />
    ),
    label: "Chat",
    callback: () => {}
  },
  {
    icon: (props: React.SVGProps<SVGElement>) => <Calendar {...props} />,
    label: "Agenda",
    callback: () => {}
  },
  {
    icon: (props: React.SVGProps<SVGSVGElement>) => <Search {...props} />,
    callback: () => {}
  },
];

export function CopilotWindowToggleBar({ className }: MenuBarProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div className="relative">
      {activeIndex !== null && (
        <p className="text-white/80 text-[13px] font-medium font-['Geist'] leading-tight whitespace-nowrap">
          {menuItems[activeIndex].label}
        </p>
      )}

      <div className="bg-black justify-center items-center inline-flex ">
        {menuItems.map((item, index) => (
          <button
            key={index}
            className="w-8 h-8 px-3 py-1 rounded-[99px] justify-center items-center gap-2 flex hover:bg-[hsla(0,0%,100%,0.08)] transition-colors"
            onClick={item.callback}
          >
            <div className="justify-center items-center flex">
              <div className="w-[18px] h-[18px] flex justify-center items-center overflow-hidden">
                <item.icon
                  color="bg-background"
                  className="w-full h-full text-[#fafafb]"
                />
              </div>
            </div>
            <span className="sr-only">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
