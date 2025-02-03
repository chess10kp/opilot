"use client";

import Image from "next/image";
import { Input } from "./ui/input";
import { Menubar } from "./ui/menubar";
import { Win11 } from "./Win11";
import { Copilot } from "./Copilot";
import { invoke } from "@tauri-apps/api/core";

import { useEffect, useState } from "react";

export default function StatusBar() {
  // TODO: expose this as a hook or config option
  const favorites = ["firefox", "vscode", "emacs", "foot", "obs"];

  const [icons, setIcons] = useState();
  const [favoriteIcons, setFavoriteIcons] = useState<[string, string][]>();
  const [imagesLoading, setImagesLoading] = useState(false);

  useEffect(() => {
    const ic = invoke("get_desktop_icons")
      // @ts-ignore
      .then((result: Record<string, string>) => {
        return Promise.all(
          Object.entries(result).map(async ([k, v]) => {
            try {
              const image = await invoke<string>("get_image_data", {
                imagePath: v,
              });
              return [k, image];
            } catch (e) {
              console.log("Error fetching image: ", e);
              return [k, null];
            }
          }),
        );
      })
      .then((ic: any) => {
        const newMap = new Map(ic);
        setIcons(newMap);

        const filtered = ic.filter(([name, _]) =>
          favorites.some((fav) => name.toLowerCase().includes(fav)),
        );
        setFavoriteIcons(filtered);
        console.log(filtered);
        console.log(ic);
      })
      .catch((error) =>
        window.console.error("Error fetching icon paths:", error),
      );
  }, []);

  return (
    <div className="flex gap-x-2">
      {favoriteIcons &&
        favoriteIcons.map(([name, image]) => (
          <div key={name} className="gap-x-4">
            <Image
              className=""
              width={45}
              height={45}
              src={image || ""}
              alt={image[0]}
              unoptimized
            />
          </div>
        ))}
    </div>
  );
}

export const Winbar = () => {
  return (
    <>
      <Copilot />
      <StatusBar />
    </>
  );
};
