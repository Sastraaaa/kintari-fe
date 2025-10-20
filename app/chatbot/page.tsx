"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { chatAPI } from "@/lib/api";
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
import { MessageSquare, Bot, Send, Check } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const exampleQuestions = [
  "Apa isi laporan keuangan Q3 2024?",
  "Bagaimana strategi marketing 2025?",
  "Berapa total dokumen yang tersimpan?",
];

const aiCapabilities = [
  "Retrieval QA - Tanya jawab dari dokumen",
  "Document Summary - Ringkasan otomatis",
  "Semantic Search - Pencarian cerdas",
  "Context-Aware - Memahami konteks",
];

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Halo! Saya adalah AI Assistant Kintari. Saya dapat membantu Anda mencari informasi dari dokumen organisasi, menjawab pertanyaan, dan memberikan insight berdasarkan data yang tersimpan. Ada yang bisa saya bantu?",
    },
  ]);
  const [input, setInput] = useState("");

  const chatMutation = useMutation({
    mutationFn: chatAPI.sendMessage,
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer },
      ]);
    },
  });

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { role: "user", content: input }]);
    chatMutation.mutate(input);
    setInput("");
  };

  const handleExampleClick = (question: string) => {
    setInput(question);
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
            Berinteraksi dengan AI untuk mendapatkan informasi dari dokumen
            organisasi
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Chat Area */}
          <Card className="border-2 border-gray-200 lg:col-span-2">
            <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-blue-50/50 to-teal-50/50">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#155dfc] to-[#009689] shadow-lg">
                  <Bot className="h-7 w-7 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl text-gray-800">
                    Kintari AI Assistant
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Powered by OpenAI & LangChain
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              {/* Messages */}
              <div
                className="space-y-4 rounded-lg bg-gray-50 p-6"
                style={{
                  minHeight: "450px",
                  maxHeight: "550px",
                  overflowY: "auto",
                }}
              >
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#155dfc] to-[#009689] shadow-md">
                        <Bot className="h-5 w-5 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-sm ${
                        message.role === "user"
                          ? "bg-gradient-to-r from-[#155dfc] via-[#009689] to-[#0092b8] text-white"
                          : "border border-gray-200 bg-white text-gray-800"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">
                        {message.content}
                      </p>
                    </div>
                    {message.role === "user" && (
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-700 shadow-md">
                        <MessageSquare className="h-5 w-5 text-white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="flex gap-3">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ketik pertanyaan Anda di sini..."
                  className="h-14 flex-1 border-gray-300 bg-white text-base"
                />
                <Button
                  onClick={handleSend}
                  disabled={chatMutation.isPending}
                  className="h-14 bg-gradient-to-r from-[#155dfc] via-[#009689] to-[#0092b8] px-6 shadow-lg hover:shadow-xl"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="border-2 border-gray-200">
              <CardHeader className="bg-gradient-to-r from-blue-50/50 to-teal-50/50">
                <CardTitle className="text-lg text-gray-800">
                  💡 Contoh Pertanyaan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-6">
                {exampleQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-auto w-full justify-start whitespace-normal border-2 border-gray-200 p-4 text-left text-sm hover:border-[#155dfc] hover:bg-blue-50"
                    onClick={() => handleExampleClick(question)}
                  >
                    {question}
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200">
              <CardHeader className="bg-gradient-to-r from-blue-50/50 to-teal-50/50">
                <CardTitle className="text-lg text-gray-800">
                  ✨ AI Capabilities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-6">
                {aiCapabilities.map((capability, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#155dfc] to-[#009689]">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    <p className="text-sm text-gray-700">{capability}</p>
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
