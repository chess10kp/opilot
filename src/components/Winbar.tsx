"use client";

import { Input } from "./ui/input";
import { Menubar } from "./ui/menubar";
import { Win11 } from "./Win11";
import { invoke } from "@tauri-apps/api/core";

import { useEffect, useState } from "react";

export default function StatusBar() {
  const [icons, setIcons] = useState<string[]>([]);
  const [imagesLoading, setImagesLoading] = useState(false);

  useEffect(() => {
    invoke("get_desktop_icons")
      .then((result: string[]) => {
        Promise.all(
          result.map((iconPath) =>
            invoke<string>("get_image_data", { imagePath: iconPath }),
          ),
        )
          .then((images: any) => {
            images = images.filter(
              (image: any) => image !== null || image === undefined,
            );
            setIcons(images);
            setImagesLoading(true);
          })
          .catch((error) => window.console.error("Error fetching image data:", error));
      })
      .catch((error) => window.console.error("Error fetching icon paths:", error));
      window.console.log("Icons fetched : " + icons )
  }, []);

  return (
    <div className="status-bar">
      {icons.map((icon, index) => (
        <img
          key={index}
          src={icon}
          alt="icon"
          className="icon"
        />
      ))}
    </div>
  );
}

export const Winbar = () => {
  return (
    <div className="flex items-center justify-between bg-[#E1E6F2] h-10">
      <Input
        placeholder="Search"
        className="mx-1 rounded-lg px-3"
        style={{ width: "calc(100% - 60px)" }}
      />
      <StatusBar />
    </div>
  );
};
