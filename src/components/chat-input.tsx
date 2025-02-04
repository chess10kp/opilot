import { useEffect, useState, useRef } from "react";
import { SendHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps extends React.HTMLAttributes<HTMLFormElement> {
  onSubmit: (e: any) => void;
  isLoading?: boolean;
}

export function ChatInput({
  onSubmit,
  isLoading,
  className,
  ...props
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSubmit(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "inherit";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [textareaRef]);

  return (
    <form onSubmit={handleSubmit} {...props}>
      <div className="relative flex items-end gap-2">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything..."
          className="min-h-[56px] w-full resize-none bg-background px-4 py-4 focus-visible:ring-1"
          rows={1}
        />
        <Button
          type="submit"
          size="icon"
          disabled={isLoading || !message.trim()}
          className="absolute bottom-3 right-3"
        >
          <SendHorizontal className="size-4" />
          <span className="sr-only">Send message</span>
        </Button>
      </div>
    </form>
  );
}
