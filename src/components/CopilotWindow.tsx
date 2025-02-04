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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { SidebarProvider } from "./ui/sidebar";
import ChatMessage from "@/components/chat-message";

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
            <ChatMessage key={index} isBot={false} message={message} />
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

const ChatWindow = ({ model }: { model: any }) => {
  const [chatPrompt, setChatPrompt] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<string[]>([]);
  const [chatStarted, setChatStarted] = useState(false);

  const handleSubmitChat = async (e: React.FormEvent) => {
    e.preventDefault();
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "Hello" }],
        },
        {
          role: "model",
          parts: [{ text: "Great to meet you. What would you like to do?" }],
        },
      ],
    });

    // TODO: make this async
    let result = await chat.sendMessageStream("I have 2 dogs in my house.");
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      process.stdout.write(chunkText);
    }
    let result2 = await chat.sendMessageStream(
      "How many paws are in my house?",
    );
    for await (const chunk of result2.stream) {
      const chunkText = chunk.text();
      process.stdout.write(chunkText);
    }
  };

  return (
    <div className="flex-1 border-0  h-full w-full">
      {chatStarted ? (
        <ScrollArea className="w-full h-[70%] border-0">
          {chatHistory.map((message: string, index: number) => (
            <ChatMessage key={index} isBot={false} message={message} />
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
    </div>
  );
};

const StartChat = async ({ model }) => {
  const startChat = async () => {
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "Hello" }],
        },
        {
          role: "model",
          parts: [{ text: "Great to meet you. What would you like to do?" }],
        },
      ],
    });

    // TODO: make this async
    let result = await chat.sendMessageStream("I have 2 dogs in my house.");
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      process.stdout.write(chunkText);
    }
    let result2 = await chat.sendMessageStream(
      "How many paws are in my house?",
    );
    for await (const chunk of result2.stream) {
      const chunkText = chunk.text();
      process.stdout.write(chunkText);
    }
  };
};

export default function CopilotWindow() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_GEMINI || "");
  // TODO: add system instruction based on DE
  // TODO: scrape screen for meeting information
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction:
      'You are an assistant on a sidebar of a Wayland Linux desktop.\
    Please always use a casual tone when answering your questions, unlees requested otherwise or making writing suggestions.\
    When making a suggestion, please use the following format: {message: "<your response>", type: <number that I tell you to include>}\n\
    These are the steps you should take to respond to the user\'s queries:\n\
    1. If it\'s a writing- or grammar-related question or a sentence in quotation marks, Please point out errors and correct when necessary using underlines, and make the writing more natural where appropriate without making too major changes.\
    return the response type as {message: "<response>", type: 1}\
    2. If the query is asking you to schedule something return { message: "", type: 2}. This tells the system to return to you more information about the meeting.\
    3. If you are required to schedule something, get the link of the meeting from the information provided if there is one, \
    4. If the user is asking to reply to an email or just mentions they want you to reply to something, Then return { message: \"\", type: 3}. This tells the system to return to you more information about the meeting. \
    5. If the user is asking you to open an application, return the shell command to open the  desired application, with the format {message: \"command\", type: 3}. \
    6. If the user is asking you to execute a command, refuse in this format {message: \"command\", type: 1}. \
    8. If the user is asking you to open a website, return the shell command to open the desired website in Firefox, with the format {message: \"command\", type: 4}. \
    9. If it\'s a question about system tasks, give a bash command in a code block with no explanation, in the format {message: \"command\", type: 5}. \
    10. For mathematics expressions, you *have to* use LaTeX within a code block with the language set as "latex". \n\
    11. Otherwise, when asked to summarize information or explaining concepts, you are should use bullet points and headings.\
    Note: Use casual language, be short, while ensuring the factual correctness of your response. \
    If you are unsure or don’t have enough information to provide a confident answer, simply say “I don’t know” or “I’m not sure.”. \n',
  });

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

  const createChat = () => {};

  return (
    <div
      className={`fixed top-0 left-0 h-full w-64 flex text-xs items-center flex-col bg-background text-foreground p-4 transition-transform duration-300 -translate-x-0`}
    >
      <Tabs
        defaultValue="chat"
        className="h-[100%] bg-background flex flex-col rounded-none p-0"
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
          <ChatWindow model={model} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
