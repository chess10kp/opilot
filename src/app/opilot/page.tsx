"use client";

import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Input } from "@/components/ui/input";

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
    <div className="min-h-screen bg-background p-4">
      <div className="p-4 border border-gray-200 rounded">
        <h2 className="font-semibold">Response</h2>
        <pre>{response}</pre>
      </div>
      <button
        onClick={handleSubmit}
        className="mt-2 bg-black text-white px-2 py-1 rounded"
      >
        Ask
      </button>

      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Type your query..."
        className="border border-gray-300 rounded px-3 w-full"
      />
    </div>
  );
}
