"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User as UserIcon, LogOut } from "lucide-react";

type Msg = {
  role: "user" | "assistant";
  content: string;
  imageBase64?: string;
};

export default function ChatPage() {
  const router = useRouter();
  const [user, setUser] = useState<any | null>(null);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hey — I'm AURA. Tell me about the product or say **generate** when you want an image.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      if (!data.user) {
        router.push("/auth");
      } else {
        setUser(data.user);
      }
    });
    return () => {
      mounted = false;
    };
  }, [router]);

  const sendMessage = async () => {
    if (!input.trim() || !user) return;
    const text = input.trim();

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id, message: text }),
      });

      if (!res.ok) throw new Error(`Server returned ${res.status}`);

      const data = await res.json();
      const replyText = data.reply ?? "No reply.";

      setMessages((prev) => [
        ...prev,
        data.triggered && data.image_base64
          ? {
              role: "assistant",
              content: replyText,
              imageBase64: data.image_base64,
            }
          : { role: "assistant", content: replyText },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Error: could not reach server." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startNewChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "New chat started. Tell me about the product.",
      },
    ]);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      router.push("/auth");
    }
  };

  const downloadBase64 = (b64: string, filename = "aura_image.png") => {
    const link = document.createElement("a");
    link.href = `data:image/png;base64,${b64}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Sidebar */}
      <aside className="w-72 min-h-screen border-r bg-white p-6 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-purple-600">AURA</h1>
          <p className="text-xs text-gray-500">Creative Ad Assistant</p>
        </div>

        <div className="space-y-3 flex-1">
          <Button variant="outline" className="w-full justify-start" onClick={startNewChat}>
            + New Chat
          </Button>
        </div>

        {/* ✅ Email stays, logout removed */}
        <div className="mt-auto">
          <Separator />
          <div className="mt-3">
            <p className="text-sm font-medium text-gray-800">{user?.email ?? "Guest"}</p>
            <p className="text-xs text-gray-500">Logged in</p>
          </div>
        </div>
      </aside>

      {/* Chat area */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
          <div className="text-lg font-semibold text-gray-800">AURA Chat</div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600 hidden md:block">{user?.email}</div>

            {/* ✅ Only logout menu now */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition">
                  <UserIcon className="w-5 h-5 text-gray-700" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-40 mr-2">
                <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2">
                  <LogOut className="w-4 h-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-[calc(100vh-200px)] p-6 bg-white">
            <div className="space-y-4 max-w-3xl mx-auto">
              {messages.map((m, i) => {
                const isUser = m.role === "user";
                return (
                  <div
                    key={i}
                    className={`flex items-start gap-3 ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    {!isUser && (
                      <div className="flex-shrink-0">
                        <Avatar className="h-9 w-9 bg-purple-50 text-purple-600">
                          <AvatarFallback>A</AvatarFallback>
                        </Avatar>
                      </div>
                    )}

                    <div
                      className={`p-3 rounded-2xl max-w-[70%] ${
                        isUser
                          ? "bg-gradient-to-br from-purple-600 to-purple-500 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <div className="prose prose-sm break-words">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>

                      {m.imageBase64 && (
                        <div className="mt-3">
                          <div className="rounded-lg overflow-hidden shadow-sm bg-white border">
                            <img
                              src={`data:image/png;base64,${m.imageBase64}`}
                              alt="generated"
                              className="w-full object-contain"
                            />
                          </div>

                          <div className="mt-2 flex gap-2">
                            <Button size="sm" onClick={() => downloadBase64(m.imageBase64)}>
                              Download PNG
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {isUser && (
                      <div className="h-9 w-9 rounded-full bg-purple-600 text-white flex items-center justify-center font-medium">
                        {user?.email?.[0]?.toUpperCase() ?? "U"}
                      </div>
                    )}
                  </div>
                );
              })}

              {loading && (
                <div className="flex items-center gap-2 text-gray-500">
                  <div className="h-3 w-3 bg-gray-400 rounded-full animate-pulse" />
                  <div className="h-3 w-3 bg-gray-400 rounded-full animate-pulse delay-75" />
                  <div className="h-3 w-3 bg-gray-400 rounded-full animate-pulse delay-150" />
                  <span className="ml-2 text-sm text-gray-500">AURA is thinking...</span>
                </div>
              )}

              <div ref={scrollRef} />
            </div>
          </ScrollArea>
        </div>

        {/* Input */}
        <div className="p-4 border-t bg-white">
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            <Input
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Button onClick={sendMessage} disabled={loading}>
              Send
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
