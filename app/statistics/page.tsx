"use client";

import { useQuery } from "@tanstack/react-query";
import { analyticsAPI } from "@/lib/api";
import { AppLayout } from "@/components/AppLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  Loader2,
  Sparkles,
  TrendingUp,
  Building2,
  Activity,
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AnalyticsResponse } from "@/lib/types";

export default function StatisticsPage() {
  const { data: analyticsData, isLoading } = useQuery<AnalyticsResponse>({
    queryKey: ["analytics-members"],
    queryFn: () => analyticsAPI.getMembers(),
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-[#155dfc]" />
            <p className="mt-4 text-lg text-gray-600">
              Memuat statistik dan analisis AI...
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const visualizations = analyticsData?.data?.visualizations;
  const stats = analyticsData?.data?.statistics;
  const insights = analyticsData?.data;

  // Debug: Log data untuk troubleshooting
  if (analyticsData) {
    console.log("📊 Analytics Data Received:", {
      status: analyticsData.status,
      hasVisualizations: !!visualizations,
      hasStats: !!stats,
      visualizations,
      stats,
    });
  }

  // Chart 1: Distribusi Usia Pengurus (Histogram)
  const ageDistributionData = visualizations?.age_distribution
    ? Object.entries(visualizations.age_distribution)
        .map(([range, count]) => ({
          rentang: range,
          jumlah: count,
        }))
        .sort((a, b) => {
          // Sort by age range: 20-25, 25-30, etc
          const getFirstNumber = (str: string) => parseInt(str.split("-")[0]);
          return getFirstNumber(a.rentang) - getFirstNumber(b.rentang);
        })
    : [];

  // Chart 2: Proporsi Gender Pengurus (Pie Chart)
  const genderData = visualizations?.gender_proportion
    ? [
        {
          name: "Pria (Male)",
          value: visualizations.gender_proportion.Male || 0,
        },
        {
          name: "Wanita (Female)",
          value: visualizations.gender_proportion.Female || 0,
        },
      ]
    : [];

  // Chart 3: Jumlah Pengurus per Bidang Usaha (Bar Chart)
  const businessCategoryData = visualizations?.by_business_category
    ? Object.entries(visualizations.by_business_category).map(
        ([category, count]) => ({
          bidang: category,
          jumlah: count,
        })
      )
    : [];

  // Chart 4: Status Kepemilikan Perusahaan (Pie Chart)
  const companyOwnershipData = visualizations?.company_ownership
    ? [
        {
          name: "Memiliki Perusahaan",
          value: visualizations.company_ownership["Memiliki Perusahaan"] || 0,
        },
        {
          name: "Tidak Memiliki",
          value:
            visualizations.company_ownership["Tidak Memiliki Perusahaan"] || 0,
        },
      ]
    : [];

  // Debug: Log transformed data
  console.log("📈 Transformed Chart Data:", {
    ageDistributionData,
    genderData,
    businessCategoryData,
    companyOwnershipData,
  });

  const COLORS = ["#155dfc", "#009689", "#f59e0b", "#ef4444"];

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="bg-gradient-to-r from-[#155dfc] to-[#009689] bg-clip-text text-5xl font-bold text-transparent">
            Analytics & Insights HIPMI
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Statistik pengurus HIPMI dengan analisis berbasis AI
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-2 border-gray-200 bg-gradient-to-br from-white to-blue-50/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-semibold text-gray-700">
                Total Pengurus HIPMI
              </CardTitle>
              <div className="rounded-lg bg-gradient-to-br from-teal-50 to-teal-100 p-3">
                <Users className="h-6 w-6 text-teal-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-gray-900">
                {stats?.total_pengurus?.toLocaleString() || 0}
              </div>
              <p className="mt-2 flex items-center gap-1 text-sm font-medium text-gray-500">
                <Activity className="h-4 w-4" />
                <span>Pengurus terdaftar dalam kepengurusan HIPMI</span>
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200 bg-gradient-to-br from-white to-purple-50/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-semibold text-gray-700">
                Total Karyawan Perusahaan
              </CardTitle>
              <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-3">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-gray-900">
                {stats?.total_karyawan?.toLocaleString() || 0}
              </div>
              <p className="mt-2 flex items-center gap-1 text-sm font-medium text-gray-500">
                <Building2 className="h-4 w-4" />
                <span>Total karyawan dari semua perusahaan pengurus</span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 4 Visualisasi Utama */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* 1. Distribusi Usia Pengurus (Histogram) */}
          <Card className="border-2 border-gray-200">
            <CardHeader className="bg-gradient-to-r from-blue-50/50 to-teal-50/50">
              <CardTitle className="flex items-center gap-2 text-lg text-gray-800">
                <TrendingUp className="h-5 w-5 text-[#155dfc]" />
                Distribusi Usia Pengurus
              </CardTitle>
              <CardDescription className="text-xs">
                Sebaran rentang usia untuk melihat komposisi dan regenerasi
                pengurus
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {ageDistributionData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ageDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="rentang" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip />
                    <Bar
                      dataKey="jumlah"
                      fill="#155dfc"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[300px] items-center justify-center text-sm text-gray-500">
                  Belum ada data usia pengurus
                </div>
              )}
            </CardContent>
          </Card>

          {/* 2. Proporsi Gender Pengurus (Pie Chart) */}
          <Card className="border-2 border-gray-200">
            <CardHeader className="bg-gradient-to-r from-blue-50/50 to-teal-50/50">
              <CardTitle className="flex items-center gap-2 text-lg text-gray-800">
                <Users className="h-5 w-5 text-[#009689]" />
                Proporsi Gender Pengurus
              </CardTitle>
              <CardDescription className="text-xs">
                Komposisi gender (Pria vs Wanita) untuk melihat keseimbangan
                demografi
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {genderData.length > 0 && genderData.some((d) => d.value > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: any) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={100}
                      dataKey="value"
                    >
                      {genderData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[300px] items-center justify-center text-sm text-gray-500">
                  Belum ada data gender pengurus
                </div>
              )}
            </CardContent>
          </Card>

          {/* 3. Jumlah Pengurus per Bidang Usaha (Bar Chart) */}
          <Card className="border-2 border-gray-200">
            <CardHeader className="bg-gradient-to-r from-blue-50/50 to-teal-50/50">
              <CardTitle className="flex items-center gap-2 text-lg text-gray-800">
                <Building2 className="h-5 w-5 text-[#f59e0b]" />
                Pengurus per Bidang Usaha
              </CardTitle>
              <CardDescription className="text-xs">
                Dominasi bidang usaha untuk memetakan latar belakang industri
                kepengurusan
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {businessCategoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={businessCategoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="bidang"
                      stroke="#6b7280"
                      fontSize={10}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip />
                    <Bar
                      dataKey="jumlah"
                      fill="#f59e0b"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[300px] items-center justify-center text-sm text-gray-500">
                  Belum ada data bidang usaha
                </div>
              )}
            </CardContent>
          </Card>

          {/* 4. Status Kepemilikan Perusahaan Pengurus (Pie Chart) */}
          <Card className="border-2 border-gray-200">
            <CardHeader className="bg-gradient-to-r from-blue-50/50 to-teal-50/50">
              <CardTitle className="flex items-center gap-2 text-lg text-gray-800">
                <Sparkles className="h-5 w-5 text-[#ef4444]" />
                Status Kepemilikan Perusahaan
              </CardTitle>
              <CardDescription className="text-xs">
                Proporsi pengurus yang memiliki vs tidak memiliki perusahaan
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {companyOwnershipData.length > 0 &&
              companyOwnershipData.some((d) => d.value > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={companyOwnershipData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: any) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={100}
                      innerRadius={60}
                      dataKey="value"
                    >
                      {companyOwnershipData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[300px] items-center justify-center text-sm text-gray-500">
                  Belum ada data kepemilikan perusahaan
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI Insights */}
        <Card className="border-2 border-[#155dfc]/20 bg-gradient-to-br from-blue-50/50 to-teal-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
              <Sparkles className="h-6 w-6 text-[#155dfc]" />
              AI Insights & Analytics
            </CardTitle>
            <CardDescription className="text-sm">
              Analisis otomatis menggunakan Google Gemini AI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights?.summary ? (
              <div className="rounded-lg border-2 border-gray-200 bg-white p-4">
                <h4 className="mb-2 font-semibold text-gray-900">📊 Summary</h4>
                <p className="text-sm leading-relaxed text-gray-600">
                  {insights.summary}
                </p>
              </div>
            ) : (
              <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50/50 p-6 text-center">
                <Sparkles className="mx-auto mb-3 h-10 w-10 text-gray-400" />
                <h4 className="mb-2 font-semibold text-gray-700">
                  Upload Data untuk Analisis AI
                </h4>
                <p className="mx-auto max-w-2xl text-sm text-gray-500">
                  Upload data pengurus untuk mendapatkan analisis mendalam dan
                  rekomendasi strategis
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
