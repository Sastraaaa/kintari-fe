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
  BarChart3,
  PieChart,
  LineChart,
  Table,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart as RechartsPie,
  Pie,
  Cell,
  LineChart as RechartsLine,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";
import { ChatVisualization } from "@/lib/types";

interface Message {
  role: "user" | "assistant";
  content: string;
  visualization?: ChatVisualization;
}

const CHAT_STORAGE_KEY = "kintari-chat-history";
const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content:
    "Halo! Saya adalah Kintari AI Assistant untuk HIPMI. Saya dapat:\n\n📊 **Membuat visualisasi** - Coba: \"Buatkan chart distribusi usia\" atau \"Tampilkan pie chart gender\"\n📚 **Menjawab pertanyaan** - Tentang dokumen, pengurus, statistik HIPMI\n🔍 **Analisis data** - Insight dan rangkuman dari data yang ada\n\nAda yang bisa saya bantu?",
};

const EXAMPLE_QUESTIONS = [
  "Buatkan bar chart distribusi usia pengurus",
  "Tampilkan pie chart proporsi gender",
  "Visualisasi bidang usaha pengurus",
  "Berapa jumlah pengurus HIPMI?",
  "Siapa pengurus yang paling muda?",
  "Tampilkan tabel daftar pengurus",
];

// Chart colors
const CHART_COLORS = [
  "#155dfc",
  "#009689",
  "#0092b8",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#10b981",
  "#6366f1",
  "#14b8a6",
];

// Dynamic Chart Component
const DynamicChart = ({ visualization }: { visualization: ChatVisualization }) => {
  const { type, data } = visualization;

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500">
        Tidak ada data untuk ditampilkan
      </div>
    );
  }

  // Table visualization
  if (type === "table") {
    const columns = Object.keys(data[0] || {});
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              {columns.map((col) => (
                <th key={col} className="px-3 py-2 text-left font-medium text-gray-700 capitalize">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 15).map((row, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                {columns.map((col) => (
                  <td key={col} className="px-3 py-2 text-gray-600">
                    {String(row[col] || "-")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {data.length > 15 && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            Menampilkan 15 dari {data.length} data
          </p>
        )}
      </div>
    );
  }

  // Pie/Donut Chart
  if (type === "pie" || type === "donut") {
    return (
      <ResponsiveContainer width="100%" height={280}>
        <RechartsPie>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={type === "donut" ? 50 : 0}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
            label={({ name, value }) => `${name}: ${value}`}
            labelLine={false}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => [`${value} orang`, "Jumlah"]} />
          <Legend />
        </RechartsPie>
      </ResponsiveContainer>
    );
  }

  // Line Chart
  if (type === "line") {
    return (
      <ResponsiveContainer width="100%" height={280}>
        <RechartsLine data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#155dfc"
            strokeWidth={2}
            dot={{ fill: "#155dfc" }}
          />
        </RechartsLine>
      </ResponsiveContainer>
    );
  }

  // Bar Chart (default) & Histogram
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ left: 80 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" tick={{ fontSize: 11 }} />
        <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={75} />
        <Tooltip formatter={(value: number) => [`${value} orang`, "Jumlah"]} />
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

// Get chart icon based on type
const getChartIcon = (type: string) => {
  switch (type) {
    case "pie":
    case "donut":
      return <PieChart className="h-4 w-4" />;
    case "line":
      return <LineChart className="h-4 w-4" />;
    case "table":
      return <Table className="h-4 w-4" />;
    default:
      return <BarChart3 className="h-4 w-4" />;
  }
};

// Component: Message Bubble
const MessageBubble = ({ message }: { message: Message }) => {
  const isUser = message.role === "user";
  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} items-start gap-3 mb-6`}
    >
      {!isUser && (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-teal-100">
          <Bot className="h-5 w-5 text-[#155dfc]" />
        </div>
      )}
      <div
        className={`max-w-[85%] rounded-2xl px-5 py-3 ${
          isUser
            ? "bg-gradient-to-r from-[#155dfc] via-[#009689] to-[#0092b8] text-white"
            : "border-2 border-gray-200 bg-white text-gray-800"
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
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
  const [currentVisualization, setCurrentVisualization] = useState<ChatVisualization | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendMutation = useSendMessage();
  const { handleError } = useAPIError();

  // Load & save chat history
  useEffect(() => {
    const saved = localStorage.getItem(CHAT_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          // Find last visualization
          const lastViz = [...parsed].reverse().find((m: Message) => m.visualization);
          if (lastViz?.visualization) {
            setCurrentVisualization(lastViz.visualization);
          }
        }
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
      
      const assistantMessage: Message = {
        role: "assistant",
        content: result.response,
      };

      // Check for visualization in response
      if (result.visualization) {
        assistantMessage.visualization = result.visualization;
        setCurrentVisualization(result.visualization);
      }

      setMessages((prev) => [...prev, assistantMessage]);
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
      setCurrentVisualization(null);
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
            Tanya apapun tentang HIPMI - AI bisa membuat visualisasi, analisis data, dan menjawab pertanyaan
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
          {/* Chat Window */}
          <Card className="border-2 border-gray-200 lg:col-span-2 lg:sticky lg:top-8 flex flex-col h-[calc(100vh-12rem)]">
            <CardHeader className="bg-gradient-to-r from-blue-50/50 to-teal-50/50 shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl text-gray-800">💬 AI Assistant</CardTitle>
                  <CardDescription>Didukung oleh Google Gemini AI + Visualisasi</CardDescription>
                </div>
                <Button onClick={handleClearChat} variant="outline" size="sm" className="gap-2">
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
                    placeholder="Tanya atau minta visualisasi... (cth: buatkan chart usia)"
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
            {/* Dynamic Visualization Card */}
            <Card className="border-2 border-gray-200">
              <CardHeader className="bg-gradient-to-r from-blue-50/50 to-teal-50/50">
                <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                  {currentVisualization ? (
                    <>
                      {getChartIcon(currentVisualization.type)}
                      <span>Visualisasi AI</span>
                    </>
                  ) : (
                    <>
                      <BarChart3 className="h-5 w-5" />
                      <span>Visualisasi AI</span>
                    </>
                  )}
                </CardTitle>
                {currentVisualization && (
                  <CardDescription>{currentVisualization.title}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="pt-4">
                {currentVisualization ? (
                  <DynamicChart visualization={currentVisualization} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-center text-gray-500">
                    <Sparkles className="h-10 w-10 mb-3 text-gray-300" />
                    <p className="text-sm">
                      Visualisasi akan muncul di sini
                    </p>
                    <p className="text-xs mt-1 text-gray-400">
                      Coba: &quot;Buatkan bar chart distribusi usia&quot;
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Example Questions */}
            <Card className="border-2 border-gray-200">
              <CardHeader className="bg-gradient-to-r from-blue-50/50 to-teal-50/50">
                <CardTitle className="text-lg text-gray-800">💡 Contoh Prompt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-4">
                {EXAMPLE_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(q)}
                    className="w-full rounded-lg border-2 border-gray-200 bg-white p-2.5 text-left text-sm text-gray-700 transition-all hover:border-[#155dfc] hover:bg-blue-50"
                  >
                    {q}
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
