import type * as React from "react"
import { Bot, User } from "lucide-react"

import { cn } from "@/lib/utils"

interface ChatMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  isBot?: boolean
  message: string
}

export default function ChatMessage({ isBot, message, className, ...props }: ChatMessageProps) {
  return (
    <div className={cn("flex gap-3 text-sm leading-relaxed", isBot && "bg-accent/50 px-4 py-6", className)} {...props}>
      <div className="relative flex size-6 shrink-0 items-center justify-center rounded-lg border bg-background shadow">
        {isBot ? <Bot className="size-4" /> : <User className="size-4" />}
      </div>
      <div className="flex-1 space-y-2">
        <p className="font-medium">{isBot ? "Copilot" : "You"}</p>
        <div className="prose prose-sm dark:prose-invert prose-p:leading-relaxed prose-pre:p-0">{message}</div>
      </div>
    </div>
  )
}

