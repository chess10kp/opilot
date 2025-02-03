"use client";

import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Markdown from "react-markdown";

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
      const res: string = await invoke("query_gemini", { prompt: query });
      const newres = res.replaceAll("`", "").replaceAll("\\n", "\n").slice(1, -1).replaceAll("\\", "")
      console.log(newres)
      setResponse(newres);
    } catch (err) {
      setResponse("Error occurred while querying the model.");
    }
  };

  return (
    <div
      className={`fixed top-0 left-0 h-full w-64 flex text-xs items-stretch flex-col bg-background text-foreground p-4 transition-transform duration-300 -translate-x-0`}
    >
      <h1 className="text-xl font-bold mb-4">Opilot, Powered by Gemini</h1>
      <div className="p-4 border border-gray-200 rounded">
        <ScrollArea className="h-[500px] w-full ">
          <Markdown>
            {response}
          </Markdown>
        </ScrollArea>
      </div>
      <form onSubmit={handleSubmit} className="m-0 p-0">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask me anything!"
          className="border border-gray-300 rounded px-3 py-2 w-full"
        />
        <Button className="mt-2  " onClick={handleSubmit}>
          Ask
        </Button>
      </form>
    </div>
  );
}
