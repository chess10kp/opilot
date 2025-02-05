"use client";

import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Input } from "@/components/ui/input";
import CopilotWindow from "@/components/CopilotWindow";

export default function Copilot() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res: string = await invoke("query_gemini", { prompt: query });
      setResponse(res);
    } catch (err) {
      console.error("Error querying Gemini:", err);
      setResponse("Error occurred while querying the model.");
    }
  };

  return (
    <CopilotWindow />
  );
}
