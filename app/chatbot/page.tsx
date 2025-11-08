"use client";

import { useState, useRef, useEffect } from "react";
import { useSendMessage, useAPIError } from "@/lib/hooks";
import { AppLayout } from "@/components/AppLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MessageSquare,
  Bot,
  Send,
  Loader2,
  Sparkles,
  Trash2,
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const CHAT_STORAGE_KEY = "kintari-chat-history";
const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content:
    "Halo! Saya adalah Kintari AI Assistant untuk HIPMI. Saya dapat membantu Anda mencari informasi dari dokumen HIPMI yang telah diupload (SK, PO, Laporan, Surat, dll), menjawab pertanyaan tentang data anggota, dan memberikan insight organisasi. Upload lebih banyak dokumen untuk memperkaya knowledge base saya! Ada yang bisa saya bantu?",
};

const EXAMPLE_QUESTIONS = [
  "Kapan HIPMI berdiri dan siapa pendirinya?",
  "Berapa jumlah anggota HIPMI tahun ini?",
  "Apa saja dokumen SK yang sudah diupload?",
  "Berikan ringkasan dari dokumen PO HIPMI",
];

const AI_CAPABILITIES = [
  "📚 Knowledge Base HIPMI - Menggunakan semua dokumen organisasi yang diupload",
  "👥 Data Anggota - Analisis dan insight tentang keanggotaan HIPMI",
  "📄 Multi-Dokumen - Menggabungkan info dari SK, PO, Laporan, dan dokumen lainnya",
  "✨ Didukung oleh Google Gemini AI",
];

// Component: Message Bubble
const MessageBubble = ({ message }: { message: Message }) => {
  const isUser = message.role === "user";
  return (
    <div
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      } items-start gap-3 mb-6`}
    >
      {!isUser && (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-teal-100">
          <Bot className="h-5 w-5 text-[#155dfc]" />
        </div>
      )}
      <div
        className={`max-w-[75%] rounded-2xl px-5 py-3 ${
          isUser
            ? "bg-gradient-to-r from-[#155dfc] via-[#009689] to-[#0092b8] text-white"
            : "border-2 border-gray-200 bg-white text-gray-800"
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
      </div>
      {isUser && (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-pink-100">
          <MessageSquare className="h-5 w-5 text-purple-600" />
        </div>
      )}
    </div>
  );
};

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendMutation = useSendMessage();
  const { handleError } = useAPIError();

  // Load & save chat history
  useEffect(() => {
    const saved = localStorage.getItem(CHAT_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) setMessages(parsed);
      } catch (error) {
        console.error("Failed to load chat history:", error);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded && messages.length > 0) {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages, isLoaded]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sendMutation.isPending) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    try {
      const result = await sendMutation.mutateAsync({ query: userMessage });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: result.response },
      ]);
    } catch (error) {
      handleError(error);
      setMessages((prev) => prev.slice(0, -1));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    if (confirm("Apakah Anda yakin ingin menghapus semua riwayat chat?")) {
      setMessages([INITIAL_MESSAGE]);
      localStorage.removeItem(CHAT_STORAGE_KEY);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2">
            <div className="text-5xl font-bold">🤖</div>
            <h1 className="bg-gradient-to-r from-[#155dfc] to-[#009689] bg-clip-text text-5xl font-bold text-transparent">
              Chatbot AI HIPMI
            </h1>
          </div>
          <p className="mt-3 text-lg text-gray-600">
            Tanya tentang dokumen organisasi dan data anggota HIPMI - AI
            menggunakan semua data yang telah diupload
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
          {/* Chat Window */}
          <Card className="border-2 border-gray-200 lg:col-span-2 lg:sticky lg:top-8 flex flex-col h-[calc(100vh-12rem)]">
            <CardHeader className="bg-gradient-to-r from-blue-50/50 to-teal-50/50 shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl text-gray-800">
                    💬 AI Assistant
                  </CardTitle>
                  <CardDescription>
                    Didukung oleh Google Gemini AI
                  </CardDescription>
                </div>
                <Button
                  onClick={handleClearChat}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear Chat
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg, idx) => (
                  <MessageBubble key={idx} message={msg} />
                ))}
                {sendMutation.isPending && (
                  <div className="flex justify-start items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-teal-100">
                      <Bot className="h-5 w-5 text-[#155dfc]" />
                    </div>
                    <div className="flex items-center gap-2 rounded-2xl border-2 border-gray-200 bg-white px-5 py-3">
                      <Loader2 className="h-4 w-4 animate-spin text-[#155dfc]" />
                      <span className="text-sm text-gray-600">Berpikir...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t-2 border-gray-200 bg-gray-50 p-4 shrink-0">
                <div className="flex gap-3">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Tanya sesuatu tentang HIPMI..."
                    className="flex-1 border-2 border-gray-300 bg-white"
                    disabled={sendMutation.isPending}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || sendMutation.isPending}
                    className="bg-gradient-to-r from-[#155dfc] via-[#009689] to-[#0092b8] px-6"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Example Questions */}
            <Card className="border-2 border-gray-200">
              <CardHeader className="bg-gradient-to-r from-blue-50/50 to-teal-50/50">
                <CardTitle className="text-lg text-gray-800">
                  💡 Contoh Pertanyaan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-6">
                {EXAMPLE_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(q)}
                    className="w-full rounded-lg border-2 border-gray-200 bg-white p-3 text-left text-sm text-gray-700 transition-all hover:border-[#155dfc] hover:bg-blue-50"
                  >
                    {q}
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* AI Capabilities */}
            <Card className="border-2 border-gray-200">
              <CardHeader className="bg-gradient-to-r from-blue-50/50 to-teal-50/50">
                <CardTitle className="text-lg text-gray-800">
                  ✨ Kemampuan AI
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-6">
                {AI_CAPABILITIES.map((cap, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 text-sm text-gray-700"
                  >
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#155dfc]" />
                    <span>{cap}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
