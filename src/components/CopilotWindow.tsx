"use client";

import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GeminiIcon } from "@/components/GeminiIcon";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Markdown from "react-markdown";
import { Search } from "@geist-ui/icons";
import { Textarea } from "@/components/ui/textarea";
import { CopilotWindowToggleBar } from "./CopilotWindowToggleBar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { SidebarProvider } from "./ui/sidebar";
import ChatMessageType from "@/components/chat-message";

// TODO: move this to node.js backend while also figuring out streaming
const dotenv = require("dotenv");

const QueryOutput = ({ response }: { response: string }) => {
  return (
    <div className="flex-1 border-0 h-full">
      {response ? (
        <ScrollArea className="w-full h-[70%] border-0">
          <Markdown>{response}</Markdown>
        </ScrollArea>
      ) : (
        <div className="flex border-0 items-center h-full justify-center">
          <h1 className="text-lg font-bold mb-4">
            <div className="flex items-center gap-2">
              Opilot, powered by
              <GeminiIcon />
            </div>
          </h1>
        </div>
      )}
    </div>
  );
};

const ChatOutput = ({ chatHistory }: { chatHistory: string[] }) => {
  return (
    <div className="flex-1 border-0  h-full w-full">
      {chatHistory.length > 0 ? (
        <ScrollArea className="w-full h-[70%] border-0">
          {chatHistory.map((message, index) => (
            <ChatMessageType key={index} isBot={false} message={message} />
          ))}
        </ScrollArea>
      ) : (
        <div className="flex border-0 items-center h-full justify-center">
          <h1 className="text-lg font-bold mb-4">
            <div className="flex items-center gap-2">
              Opilot Chat
              <GeminiIcon />
            </div>
          </h1>
        </div>
      )}
    </div>
  );
};

const ChatInput = ({
  query,
  handleSubmit,
  setQuery,
}: {
  query: string;
  handleSubmit: any;
  setQuery: any;
}) => {
  return (
    <form onSubmit={handleSubmit} className="m-0 p-0 gap-2 flex items-center">
      <Button className="" onClick={handleSubmit}>
        <Search className="w-4 h-4" />
      </Button>
      <Textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ask me anything!"
        className="px-1 text-xs  my-4 shadow-none focus-visible:ring-0 border-b-black border-2 focus-visible:border-b-black focus-visible:border-2 rounded-none w-full focus:ring-0 focus:border-0"
      />
    </form>
  );
};

type ChatMessageType = {
  role: "user" | "model";
  parts: { text: string }[];
};

type ChatSessionResponse = {
  error?: string;
  sessionId?: string;
};

type ChatMessageResponse = {
  error?: string;
  response?: string;
};

const ChatWindow = () => {
  const [chatPrompt, setChatPrompt] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<ChatMessageType[]>([
    {
      role: "user",
      parts: [{ text: "Hello" }],
    },
    {
      role: "model",
      parts: [{ text: "Great to meet you. What would you like to do?" }],
    },
  ]);
  const [chatStarted, setChatStarted] = useState(false);
  const [chatSession, setChatSession] = useState<any>(null);
  // TODO: add system instruction based on DE
  const [isSending, setIsSending] = useState<boolean>(false);

  const addMessage = (message: ChatMessageType) => {
    setChatHistory((prev) => [...prev, message]);
  };

  const handleSubmitChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatPrompt.trim()) return;

    let session = chatSession;
    if (!chatStarted || !session) {
      const chat: ChatSessionResponse = await invoke("start_chat", {
        jsonInput: JSON.stringify({ history: history }),
      });

      if (!chat || chat.error !== undefined) {
        console.log(
          "Error starting chat.",
          chat,
          { history: history }.toString(),
        );
        return;
      }
      setChatStarted(true);
    }

    addMessage({
      role: "user",
      parts: [{ text: chatPrompt }],
    });

    const currentPrompt = chatPrompt;
    setChatPrompt("");

    setIsSending(true);

    let result: ChatMessageResponse = await invoke("chat_message", {
      jsonInput: JSON.stringify({
        message: currentPrompt,
      }),
    });

    if (!result || result.error) {
      console.log("failed sending message");
    }

    setChatHistory((prev) => [
      ...prev,
      { role: "model", parts: [{ text: result.response?.toString() || "" }] },
    ]);
    setIsSending(false);
  };

  return (
    <div className="flex-1 border-0  h-full w-full">
      {chatStarted ? (
        <ScrollArea className="w-full h-[70%] border-0">
          {chatHistory.map((message: ChatMessageType, index: number) => (
            <ChatMessageType
              key={index}
              isBot={false}
              message={message.parts[0].text}
            />
          ))}
        </ScrollArea>
      ) : (
        <div className="flex border-0 items-center h-full justify-center">
          <h1 className="text-lg font-bold mb-4">
            <div className="flex items-center gap-2">
              Opilot, powered by
              <GeminiIcon />
            </div>
          </h1>
        </div>
      )}
      <ChatInput
        query={chatPrompt}
        handleSubmit={handleSubmitChat}
        setQuery={setChatPrompt}
      />
    </div>
  );
};

export default function CopilotWindow() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");

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

  const handleSubmitChat = async (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: unbloat string manipulation
      const res: any = await invoke("query_gemini", { prompt: query });
      console.log("response: ", res.slice(0))
      const parsed = JSON.parse(res.slice(0)); 
      if (parsed.error) {
        setResponse(parsed.error);
        return;
      }

      setResponse(parsed.response);
    } catch (err) {
      console.error("Error querying Gemini:", err);
      setResponse("Error occurred while querying the model.");
    }
  };

  return (
    <div
      className={`fixed top-0 left-0 h-full w-64 flex text-xs flex-col bg-background text-foreground p-4 transition-transform duration-300 -translate-x-0`}
    >
      <Tabs
        defaultValue="query"
        className="h-[100%] bg-background rounded-none p-0"
      >
        <CopilotWindowToggleBar />

        <TabsContent
          className={`flex flex-col bg-background text-foreground border-0 data-[state=active]:outline-none text-xs`}
          value="query"
        >
          <QueryOutput response={response} />
          <ChatInput
            query={query}
            handleSubmit={handleSubmit}
            setQuery={setQuery}
          />
        </TabsContent>

        <TabsContent
          className={`flex border-0 data-[state=active]:outline-none text-xs items-stretch flex-col bg-background text-foreground p-4 transition-transform duration-300 -translate-x-0`}
          value="chat"
        >
          <ChatWindow />
        </TabsContent>
      </Tabs>
    </div>
  );
}
