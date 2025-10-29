"use client";

import { useState, useRef, useEffect } from "react";
import { useSendMessage, useChatContext, useAPIError } from "@/lib/hooks";
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

const initialMessage: Message = {
  role: "assistant",
  content:
    "Halo! Saya adalah AI Assistant Kintari dengan Universal Knowledge Base. Saya dapat membantu Anda mencari informasi dari SEMUA dokumen yang telah diupload (HIPMI docs, contracts, reports, etc.), menjawab pertanyaan, dan memberikan insight. Upload lebih banyak dokumen untuk membuat saya lebih pintar! Ada yang bisa saya bantu?",
};

const exampleQuestions = [
  "Kapan HIPMI berdiri?",
  "Apa isi dokumen yang sudah diupload?",
  "Berikan ringkasan dari semua dokumen",
  "Apa yang ada di dokumen terbaru?",
];

const aiCapabilities = [
  "📚 Pengetahuan Universal - Menggunakan SEMUA dokumen yang diupload",
  "🤖 Tanya Jawab Cerdas - Menjawab dari seluruh basis pengetahuan",
  "📄 Multi-Dokumen - Menggabungkan info dari berbagai dokumen",
  "✨ Didukung oleh Google Gemini AI",
];

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendMutation = useSendMessage();
  const { data: contextData } = useChatContext();
  const { handleError } = useAPIError();

  // Load chat history from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem(CHAT_STORAGE_KEY);
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      } catch (error) {
        console.error("Failed to load chat history:", error);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    if (isLoaded && messages.length > 0) {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages, isLoaded]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sendMutation.isPending) return;

    const userMessage = input.trim();
    setInput("");

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    try {
      const result = await sendMutation.mutateAsync({ query: userMessage });

      // Add AI response
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: result.response },
      ]);
    } catch (error) {
      handleError(error);
      // Remove user message if error
      setMessages((prev) => prev.slice(0, -1));
    }
  };

  const handleExampleClick = (question: string) => {
    setInput(question);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    if (confirm("Apakah Anda yakin ingin menghapus semua riwayat chat?")) {
      setMessages([initialMessage]);
      localStorage.removeItem(CHAT_STORAGE_KEY);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="bg-gradient-to-r from-[#155dfc] to-[#009689] bg-clip-text text-5xl font-bold text-transparent">
            Chatbot AI Assistant
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Tanya apapun tentang dokumen yang telah diupload - AI uses ALL
            documents as knowledge base
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Chat Area */}
          <Card className="border-2 border-gray-200 lg:col-span-2">
            <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-blue-50/50 to-teal-50/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#155dfc] to-[#009689] shadow-lg">
                    <Bot className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-gray-800">
                      Kintari AI Assistant
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Powered by Google Gemini AI
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearChat}
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                  title="Hapus semua riwayat chat"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Chat
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              {/* Messages */}
              <div className="h-[500px] space-y-4 overflow-y-auto rounded-lg bg-gray-50 p-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#155dfc] to-[#009689]">
                        <Bot className="h-5 w-5 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] rounded-2xl px-5 py-3 ${
                        message.role === "user"
                          ? "bg-gradient-to-r from-[#155dfc] to-[#009689] text-white shadow-md"
                          : "border-2 border-gray-200 bg-white text-gray-800 shadow-sm"
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                      </p>
                    </div>
                    {message.role === "user" && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300">
                        <MessageSquare className="h-5 w-5 text-gray-700" />
                      </div>
                    )}
                  </div>
                ))}

                {/* Loading indicator */}
                {sendMutation.isPending && (
                  <div className="flex gap-3 justify-start">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#155dfc] to-[#009689]">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                    <div className="max-w-[75%] rounded-2xl border-2 border-gray-200 bg-white px-5 py-3 shadow-sm">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-[#155dfc]" />
                        <p className="text-sm text-gray-600">
                          Sedang berpikir...
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="flex gap-3">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ketik pertanyaan Anda..."
                  disabled={sendMutation.isPending}
                  className="h-10 flex-1 border-2 border-gray-200 text-base focus:border-[#155dfc]"
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || sendMutation.isPending}
                  className="h-10 bg-gradient-to-r from-[#155dfc] to-[#009689] px-8 shadow-lg hover:shadow-xl"
                >
                  {sendMutation.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Example Questions */}
            <Card className="border-2 border-gray-200">
              <CardHeader className="bg-gradient-to-r from-blue-50/50 to-teal-50/50">
                <CardTitle className="flex items-center gap-2 text-lg text-gray-800">
                  <Sparkles className="h-5 w-5 text-[#155dfc]" />
                  Contoh Pertanyaan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-6">
                {exampleQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleClick(question)}
                    disabled={sendMutation.isPending}
                    className="w-full rounded-lg border-2 border-gray-200 bg-white p-3 text-left text-sm text-gray-700 transition-all hover:border-[#155dfc] hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {question}
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* AI Capabilities */}
            <Card className="border-2 border-gray-200">
              <CardHeader className="bg-gradient-to-r from-blue-50/50 to-teal-50/50">
                <CardTitle className="text-lg text-gray-800">
                  🤖 Kemampuan AI
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-6">
                {aiCapabilities.map((capability, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-[#155dfc]"></span>
                    <span className="text-sm text-gray-600">{capability}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Context Info */}
            {contextData?.data && (
              <Card className="border-2 border-gray-200">
                <CardHeader className="bg-gradient-to-r from-blue-50/50 to-teal-50/50">
                  <CardTitle className="text-lg text-gray-800">
                    📚 Context Active
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-6">
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-semibold text-gray-700">
                      Source:
                    </span>
                    <span className="text-sm text-gray-600">
                      {contextData.data.source}
                    </span>
                  </div>
                  {contextData.data.extracted_at && (
                    <div className="flex items-start gap-2">
                      <span className="text-sm font-semibold text-gray-700">
                        Updated:
                      </span>
                      <span className="text-sm text-gray-600">
                        {new Date(
                          contextData.data.extracted_at
                        ).toLocaleDateString("id-ID")}
                      </span>
                    </div>
                  )}
                  <p className="mt-3 text-xs text-gray-500">
                    AI menggunakan data HIPMI untuk menjawab pertanyaan Anda
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
