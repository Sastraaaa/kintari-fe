"use client";

import { useStats, useMembers, useDocuments } from "@/lib/hooks";
import { AppLayout } from "@/components/AppLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FileText,
  Users,
  MessageSquare,
  TrendingUp,
  Loader2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function StatisticsPage() {
  const { data: statsData, isLoading: statsLoading } = useStats();
  const { data: membersData, isLoading: membersLoading } = useMembers();
  const { data: documentsData, isLoading: documentsLoading } = useDocuments();

  const isLoading = statsLoading || membersLoading || documentsLoading;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-[#155dfc]" />
            <p className="mt-4 text-lg text-gray-600">Memuat statistik...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const stats = statsData?.data;

  // Transform data for charts (using dummy data since stats may not have all fields)
  const departmentData = Object.entries(
    stats?.anggota_per_department || {
      IT: 10,
      HR: 8,
      Finance: 12,
      Marketing: 15,
    }
  ).map(([name, value]) => ({ name, value: value as number }));

  const departmentPieData = departmentData.map((item) => ({
    name: item.name,
    value: item.value,
    percentage: (
      (item.value / departmentData.reduce((sum, d) => sum + d.value, 0)) *
      100
    ).toFixed(1),
  }));

  return (
    <AppLayout>
      <div className="space-y-12">
        {/* Header */}
        <div>
          <h1 className="bg-gradient-to-r from-[#155dfc] to-[#009689] bg-clip-text text-5xl font-bold text-transparent">
            Dashboard Statistik
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Visualisasi data anggota dan grafik statistik sistem secara
            real-time
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-2 border-gray-200 bg-gradient-to-br from-white to-blue-50/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-semibold text-gray-700">
                Total Anggota
              </CardTitle>
              <div className="rounded-lg bg-gradient-to-br from-teal-50 to-teal-100 p-3">
                <Users className="h-6 w-6 text-teal-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-gray-900">
                {membersData?.total?.toLocaleString() || 0}
              </div>
              <p className="mt-2 flex items-center gap-1 text-sm font-medium text-gray-500">
                <Users className="h-4 w-4" />
                <span>Total member tersimpan</span>
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200 bg-gradient-to-br from-white to-purple-50/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-semibold text-gray-700">
                Total Dokumen
              </CardTitle>
              <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-3">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-gray-900">
                {documentsData?.total?.toLocaleString() || 0}
              </div>
              <p className="mt-2 flex items-center gap-1 text-sm font-medium text-gray-500">
                <FileText className="h-4 w-4" />
                <span>Dokumen tersimpan</span>
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200 bg-gradient-to-br from-white to-green-50/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-semibold text-gray-700">
                Data Organisasi
              </CardTitle>
              <div className="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 p-3">
                <MessageSquare className="h-6 w-6 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-gray-900">
                {stats?.total_organizations?.toLocaleString() || 0}
              </div>
              <p className="mt-2 flex items-center gap-1 text-sm font-medium text-gray-500">
                <MessageSquare className="h-4 w-4" />
                <span>Data HIPMI tersimpan</span>
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200 bg-gradient-to-br from-white to-orange-50/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-semibold text-gray-700">
                Latest Update
              </CardTitle>
              <div className="rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 p-3">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-gray-900">
                {stats?.latest_organization || "N/A"}
              </div>
              <p className="mt-2 flex items-center gap-1 text-sm font-medium text-gray-500">
                <TrendingUp className="h-4 w-4" />
                <span>
                  {stats?.last_updated
                    ? new Date(stats.last_updated).toLocaleDateString("id-ID")
                    : "Belum ada data"}
                </span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-2 border-gray-200">
            <CardHeader className="bg-gradient-to-r from-blue-50/50 to-teal-50/50">
              <CardTitle className="text-xl text-gray-800">
                📊 Anggota per Department
              </CardTitle>
              <CardDescription className="text-sm">
                Distribusi anggota berdasarkan departemen
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={departmentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "2px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="value"
                    fill="url(#colorGradient)"
                    name="Jumlah Anggota"
                    radius={[8, 8, 0, 0]}
                  />
                  <defs>
                    <linearGradient
                      id="colorGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#155dfc" />
                      <stop offset="100%" stopColor="#009689" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200">
            <CardHeader className="bg-gradient-to-r from-blue-50/50 to-teal-50/50">
              <CardTitle className="text-xl text-gray-800">
                🥧 Distribusi Anggota
              </CardTitle>
              <CardDescription className="text-sm">
                Persentase anggota per department
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={departmentPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name} (${entry.percentage}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {departmentPieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "2px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-2 border-gray-200">
            <CardHeader className="bg-gradient-to-r from-blue-50/50 to-teal-50/50">
              <CardTitle className="text-xl text-gray-800">
                📈 Pertumbuhan Dokumen
              </CardTitle>
              <CardDescription className="text-sm">
                Jumlah dokumen yang diupload per bulan
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={stats?.dokumen_per_bulan}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="bulan" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "2px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="jumlah"
                    stroke="#155dfc"
                    strokeWidth={3}
                    name="Jumlah Dokumen"
                    dot={{ fill: "#155dfc", r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200">
            <CardHeader className="bg-gradient-to-r from-blue-50/50 to-teal-50/50">
              <CardTitle className="text-xl text-gray-800">
                💬 Interaksi Chatbot
              </CardTitle>
              <CardDescription className="text-sm">
                Jumlah interaksi AI chatbot per bulan
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={stats?.chat_per_bulan}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="bulan" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "2px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="jumlah"
                    stroke="#009689"
                    strokeWidth={3}
                    name="Interaksi Chat"
                    dot={{ fill: "#009689", r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
