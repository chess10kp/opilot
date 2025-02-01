import { Menubar } from "./ui/menubar";
import { Win11 } from "./Win11";
import { useState } from "react";

export const Winbar = () => {
  return (
    <Menubar>
      <div className="bg-[#E1E6F2] h-screen items-center font-[family-name:var(--font-geist-sans)]">
        <Win11 height={30} width={30} />
      </div>
    </Menubar>
  );
};
