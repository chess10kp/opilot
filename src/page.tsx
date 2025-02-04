"use client"

import { Copilot } from "./components/copilot"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export default function Page() {
  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
          <SidebarTrigger className="ml-auto rotate-180" />
        </header>
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-4xl space-y-4">
            <h1 className="text-2xl font-bold">Welcome to Windows 11</h1>
            <p className="text-muted-foreground">
              This is a demo of the Microsoft Copilot sidebar. Click the button in the top right corner to toggle the
              sidebar.
            </p>
          </div>
        </main>
      </div>
      <Copilot />
    </SidebarProvider>
  )
}

