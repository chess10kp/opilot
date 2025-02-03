"use client";

import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GeminiIcon } from "@/components/GeminiIcon";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Markdown from "react-markdown";
import { Search } from "@geist-ui/icons";
import { Textarea } from "@/components/ui/textarea";
import { CopilotWindowToggleBar } from "./CopilotWindowToggleBar";

export default function CopilotWindow() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_GEMINI || "");
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // TODO: figure out streaming responses
  // const sendPrompt = async () => {
  //   if (!query) return;
  //   setResponse("");
  //   window.console.log("query", query);
  //
  //   const result = await model.generateContentStream(query);
  //
  //   for await (const chunk of result.stream) {
  //     setResponse((prev) => prev + chunk.text);
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: unbloat string manipulation
      const res: string = await invoke("query_gemini", { prompt: query });
      const newres = res
        .replaceAll("`", "")
        .replaceAll("\\n", "\n")
        .slice(1, -1)
        .replaceAll("\\", "");
      setResponse(newres);
    } catch (err) {
      console.error("Error querying Gemini:", err);
      setResponse("Error occurred while querying the model.");
    }
  };

  return (
    <div
      className={`fixed top-0 left-0 h-full w-64 flex text-xs items-stretch flex-col bg-background text-foreground p-4 transition-transform duration-300 -translate-x-0`}
    >
      <CopilotWindowToggleBar />
      <div className="flex-1 h-full w-full">
        {response ? (
          <ScrollArea className="w-full ">
            <Markdown>{response}</Markdown>
          </ScrollArea>
        ) : (
          <div className="flex items-center h-full justify-center">
            <h1 className="text-lg font-bold mb-4">
              <div className="flex items-center gap-2">
                Opilot, powered by
                <GeminiIcon />
              </div>
            </h1>
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="m-0 p-0 gap-2 flex items-center">
        <Button className="" onClick={handleSubmit}>
          <Search className="w-4 h-4" />
        </Button>
        <Textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask me anything!"
          className="border px-1  py-2 shadow-none focus-visible:ring-0 border-b-black border-2 focus-visible:border-b-black focus-visible:border-2 rounded-none w-full focus:ring-0 focus:border-0"
        />
      </form>
    </div>
  );
}
