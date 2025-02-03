"use client";

import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Button } from "@/components/ui/button";

export default function Copilot() {
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
      const res: string = await invoke("query_gemini", { query });
      setResponse(res);
    } catch (err) {
      console.error("Error querying Gemini:", err);
      setResponse("Error occurred while querying the model.");
    }
  };

  return (
    <div
      className={`fixed top-0 left-0 h-full w-64 bg-gray-800 text-white p-4 transition-transform duration-300 -translate-x-0`}
    >
      <h1 className="text-xl font-bold mb-4">Copilot Assistant</h1>
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type your query..."
          className="border border-gray-300 rounded px-3 py-2 w-full"
        />
        <Button
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
          onClick={sendPrompt}
        >
          Ask
        </Button>
      </form>
      <div className="p-4 border border-gray-200 rounded">
        <h2 className="font-semibold">Response:</h2>
        <pre>{response}</pre>
      </div>
    </div>
  );
}
