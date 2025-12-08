"use client";

import { useQuery } from "@tanstack/react-query";
import { analyticsAPI } from "@/lib/api";
import { queryKeys } from "@/lib/hooks";
import { AppLayout } from "@/components/AppLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { useState } from "react";

const COLORS = ["#155dfc", "#009689", "#f59e0b", "#ef4444"];

// Types
interface ChartDataItem {
  rentang?: string;
  jumlah?: number;
  bidang?: string;
  name?: string;
  value?: number;
  [key: string]: string | number | undefined; // Index signature for Recharts compatibility
}

interface SortableAgeData {
  rentang: string;
  jumlah: number;
}

// Helper: Parse AI response JSON jadi readable text
const parseAIResponse = (text: string | unknown): string => {
  if (!text) return "";

  // Jika sudah string biasa, return
  if (typeof text === "string" && !text.trim().startsWith("{")) {
    return text;
  }

  // Try parse JSON
  try {
    const parsed = typeof text === "string" ? JSON.parse(text) : text;

    // Extract summary dari berbagai format
    if (typeof parsed === "object" && parsed !== null) {
      if ("summary" in parsed) return String(parsed.summary);
      if ("analysis" in parsed) return String(parsed.analysis);
      if ("message" in parsed) return String(parsed.message);

      // Jika JSON tapi tidak ada field yang dikenali, stringify dengan format bagus
      return JSON.stringify(parsed, null, 2);
    }

    return String(text);
  } catch {
    return String(text);
  }
};

// Helper: Generate AI insight berdasarkan tipe chart dan data
const generateChartInsight = (
  chartType: string,
  data: ChartDataItem[]
): string => {
  if (!data || data.length === 0) return "Data tidak tersedia untuk analisis.";

  switch (chartType) {
    case "age": {
      const total = data.reduce((sum, item) => sum + (item.jumlah || 0), 0);
      const dominant = data.reduce(
        (max, item) => ((item.jumlah || 0) > (max.jumlah || 0) ? item : max),
        data[0]
      );
      const percentage =
        total > 0 ? (((dominant.jumlah || 0) / total) * 100).toFixed(1) : 0;

      return `Berdasarkan analisis distribusi usia, mayoritas pengurus (${
        dominant.jumlah || 0
      } dari ${total} pengurus atau ${percentage}%) berada di rentang usia ${
        dominant.rentang || "tidak diketahui"
      } tahun. ${
        (dominant.rentang || "").includes("25-30") ||
        (dominant.rentang || "").includes("30-35")
          ? "Ini menunjukkan regenerasi yang baik dengan komposisi pengurus muda yang kuat, memberikan energi dan ide-ide segar untuk organisasi."
          : "Komposisi ini mencerminkan pengalaman matang dalam kepengurusan dengan pemahaman mendalam tentang dinamika organisasi."
      }`;
    }

    case "gender": {
      const male = data.find((d) => d.name?.includes("Pria"))?.value || 0;
      const female = data.find((d) => d.name?.includes("Wanita"))?.value || 0;
      const total = male + female;
      if (total === 0) return "Data gender tidak tersedia.";

      const malePct = ((male / total) * 100).toFixed(1);
      const femalePct = ((female / total) * 100).toFixed(1);
      const gap = Math.abs(male - female);
      const gapPct = ((gap / total) * 100).toFixed(1);

      return `Komposisi gender menunjukkan ${malePct}% pengurus pria (${male} orang) dan ${femalePct}% wanita (${female} orang). ${
        parseFloat(gapPct) < 30
          ? `Keseimbangan gender cukup baik dengan selisih hanya ${gapPct}%, mencerminkan inklusivitas organisasi.`
          : `Terdapat gap ${gapPct}% yang menunjukkan peluang untuk meningkatkan keberagaman gender di struktur kepengurusan.`
      }`;
    }

    case "business": {
      const total = data.reduce((sum, item) => sum + (item.jumlah || 0), 0);
      const top3 = data.slice(0, 3);
      const top3Total = top3.reduce((sum, item) => sum + (item.jumlah || 0), 0);
      const top3Pct = total > 0 ? ((top3Total / total) * 100).toFixed(1) : 0;

      return `Bidang usaha terdominasi oleh ${top3
        .map((c) => `"${c.bidang}" (${c.jumlah} pengurus)`)
        .join(
          ", "
        )} yang merepresentasikan ${top3Pct}% dari total kepengurusan. Diversifikasi bidang usaha ini mencerminkan keberagaman ekonomi dalam organisasi dan dapat menjadi kekuatan untuk kolaborasi lintas sektor serta networking yang lebih luas.`;
    }

    case "company": {
      const withCompany =
        data.find((d) => d.name?.includes("Memiliki"))?.value || 0;
      const withoutCompany =
        data.find((d) => d.name?.includes("Tidak"))?.value || 0;
      const total = withCompany + withoutCompany;
      if (total === 0) return "Data kepemilikan perusahaan tidak tersedia.";

      const pct = ((withCompany / total) * 100).toFixed(1);

      return `${pct}% pengurus (${withCompany} dari ${total} orang) memiliki perusahaan sendiri, menunjukkan ${
        parseFloat(pct) > 60
          ? `keterlibatan entrepreneur yang tinggi. Ini menciptakan ekosistem yang kuat untuk networking bisnis, mentoring, dan kolaborasi antar entrepreneur.`
          : `campuran seimbang antara entrepreneur dan profesional. Keberagaman ini memberikan perspektif yang komprehensif dalam pengambilan keputusan organisasi.`
      }`;
    }

    default:
      return "Analisis AI tidak tersedia untuk chart ini.";
  }
};

// Helper: Sorting untuk rentang usia
const sortAgeRange = (a: SortableAgeData, b: SortableAgeData) => {
  const getFirstNum = (str: string) => parseInt(str.split("-")[0]);
  return getFirstNum(a.rentang) - getFirstNum(b.rentang);
};

// Component: Wrapper untuk Chart dengan AI Insight
interface ChartWithInsightProps {
  title: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  children: React.ReactNode;
  chartType: string;
  chartData: ChartDataItem[];
}

const ChartWithInsight = ({
  title,
  description,
  icon: Icon,
  iconColor,
  children,
  chartType,
  chartData,
}: ChartWithInsightProps) => {
  const [showInsight, setShowInsight] = useState(false);
  const [insight, setInsight] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateInsight = async () => {
    if (insight && showInsight) {
      // Toggle jika sudah ada
      setShowInsight(!showInsight);
      return;
    }

    setIsGenerating(true);
    setShowInsight(true);

    try {
      const payload = {
        chart_type: chartType,
        chart_data: chartData,
        chart_title: title,
      };

      const res = await analyticsAPI.generateChartInsight(payload).catch((e) => {
        throw e;
      });

      // Backend may return insight in different shapes; prefer data.insight
      const insightText = (res as any)?.data?.insight || (res as any)?.insight || "";
      setInsight(parseAIResponse(insightText || "AI tidak mengembalikan insight."));
    } catch (err: any) {
      setInsight(
        typeof err === "string"
          ? err
          : err?.message || "Gagal menghasilkan insight AI."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="border-2 border-gray-200">
      <CardHeader className="bg-gradient-to-r from-blue-50/50 to-teal-50/50">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-lg text-gray-800">
              <Icon className={`h-5 w-5 ${iconColor}`} />
              {title}
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              {description}
            </CardDescription>
          </div>
          <Button
            onClick={handleGenerateInsight}
            disabled={isGenerating}
            size="sm"
            variant={showInsight && insight ? "secondary" : "outline"}
            className="gap-2 shrink-0"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {showInsight && insight ? "Hide" : "AI Insight"}
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {children}

        {showInsight && (
          <div className="mt-4 rounded-lg border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-teal-50 p-4 animate-in fade-in-50 slide-in-from-top-2 duration-300">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h5 className="text-sm font-semibold text-blue-900 mb-2">
                  💡 AI Analysis
                </h5>
                {isGenerating ? (
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Menganalisis data...</span>
                  </div>
                ) : (
                  <p className="text-sm text-blue-800 leading-relaxed">
                    {insight}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Component: Chart Distribusi Usia
const AgeDistributionChart = ({ data }: { data: SortableAgeData[] }) => {
  if (!data.length) {
    return (
      <div className="flex h-[300px] items-center justify-center text-sm text-gray-500">
        Belum ada data usia pengurus
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300} minWidth={280}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="rentang" 
          stroke="#6b7280" 
          fontSize={11}
          tick={{ fontSize: 10 }}
          interval={0}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis stroke="#6b7280" fontSize={11} width={35} />
        <Tooltip />
        <Bar dataKey="jumlah" fill="#155dfc" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

// Component: Chart Gender (Pie)
const GenderChart = ({ data }: { data: ChartDataItem[] }) => {
  if (!data.length || !data.some((d) => d.value && d.value > 0)) {
    return (
      <div className="flex h-[300px] items-center justify-center text-sm text-gray-500">
        Belum ada data gender pengurus
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300} minWidth={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={(props: { name?: string; percent?: number }) =>
            `${(props.name || "").split(" ")[0]}: ${((props.percent || 0) * 100).toFixed(0)}%`
          }
          outerRadius={80}
          dataKey="value"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
};

// Component: Chart Bidang Usaha (Bar)
const BusinessCategoryChart = ({ data }: { data: ChartDataItem[] }) => {
  if (!data.length) {
    return (
      <div className="flex h-[300px] items-center justify-center text-sm text-gray-500">
        Belum ada data bidang usaha
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300} minWidth={280}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="bidang"
          stroke="#6b7280"
          fontSize={9}
          angle={-45}
          textAnchor="end"
          height={80}
          interval={0}
          tick={{ fontSize: 9 }}
        />
        <YAxis stroke="#6b7280" fontSize={11} width={35} />
        <Tooltip />
        <Bar dataKey="jumlah" fill="#f59e0b" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

// Component: Chart Kepemilikan Perusahaan (Donut)
const CompanyOwnershipChart = ({ data }: { data: ChartDataItem[] }) => {
  if (!data.length || !data.some((d) => d.value && d.value > 0)) {
    return (
      <div className="flex h-[300px] items-center justify-center text-sm text-gray-500">
        Belum ada data kepemilikan perusahaan
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300} minWidth={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={(props: { name?: string; percent?: number }) =>
            `${((props.percent || 0) * 100).toFixed(0)}%`
          }
          outerRadius={80}
          innerRadius={50}
          dataKey="value"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
};

// Component: Summary Card
interface SummaryCardProps {
  title: string;
  value?: number;
  description: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  gradientFrom: string;
  gradientTo: string;
}

const SummaryCard = ({
  title,
  value,
  description,
  icon: Icon,
  iconBg,
  iconColor,
  gradientFrom,
  gradientTo,
}: SummaryCardProps) => (
  <Card
    className={`border-2 border-gray-200 bg-gradient-to-br from-white ${gradientFrom} ${gradientTo}`}
  >
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-base font-semibold text-gray-700">
        {title}
      </CardTitle>
      <div className={`rounded-lg bg-gradient-to-br ${iconBg} p-3`}>
        <Icon className={`h-6 w-6 ${iconColor}`} />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-4xl font-bold text-gray-900">
        {value?.toLocaleString() || 0}
      </div>
      <p className="mt-2 flex items-center gap-1 text-sm font-medium text-gray-500">
        <Activity className="h-4 w-4" />
        <span>{description}</span>
      </p>
    </CardContent>
  </Card>
);

export default function StatisticsPage() {
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: queryKeys.analyticsMembers,
    queryFn: () => analyticsAPI.getMembers(),
    staleTime: 2 * 60 * 1000, // 2 minutes - auto-refresh setelah upload
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

  // Fix: data wrapped in APIResponse<MembersAnalytics>
  const membersData = analyticsData?.data;
  const viz = membersData?.visualizations;
  const stats = membersData?.statistics;
  const insights = membersData;

  // Transform data untuk charts
  const ageData = viz?.age_distribution
    ? Object.entries(viz.age_distribution)
        .map(([range, count]) => ({ rentang: range, jumlah: count }))
        .sort(sortAgeRange)
    : [];

  const genderData = viz?.gender_proportion
    ? [
        { name: "Pria (Male)", value: viz.gender_proportion.Male || 0 },
        { name: "Wanita (Female)", value: viz.gender_proportion.Female || 0 },
      ]
    : [];

  const businessData = viz?.by_business_category
    ? Object.entries(viz.by_business_category).map(([category, count]) => ({
        bidang: category,
        jumlah: count,
      }))
    : [];

  const ownershipData = viz?.company_ownership
    ? [
        {
          name: "Memiliki Perusahaan",
          value: viz.company_ownership["Memiliki Perusahaan"] || 0,
        },
        {
          name: "Tidak Memiliki",
          value: viz.company_ownership["Tidak Memiliki Perusahaan"] || 0,
        },
      ]
    : [];

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
          <SummaryCard
            title="Total Pengurus HIPMI"
            value={stats?.total_pengurus}
            description="Pengurus terdaftar dalam kepengurusan HIPMI"
            icon={Users}
            iconBg="from-teal-50 to-teal-100"
            iconColor="text-teal-600"
            gradientFrom="to-blue-50/30"
            gradientTo=""
          />
          <SummaryCard
            title="Total Perusahaan"
            value={stats?.total_perusahaan}
            description="Jumlah perusahaan unik dari pengurus HIPMI"
            icon={Building2}
            iconBg="from-blue-50 to-blue-100"
            iconColor="text-blue-600"
            gradientFrom="to-purple-50/30"
            gradientTo=""
          />
        </div>

        {/* Visualisasi 4 Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartWithInsight
            title="Distribusi Usia Pengurus"
            description="Sebaran rentang usia untuk melihat komposisi dan regenerasi pengurus"
            icon={TrendingUp}
            iconColor="text-[#155dfc]"
            chartType="age"
            chartData={ageData}
          >
            <AgeDistributionChart data={ageData} />
          </ChartWithInsight>

          <ChartWithInsight
            title="Proporsi Gender Pengurus"
            description="Komposisi gender (Pria vs Wanita) untuk melihat keseimbangan demografi"
            icon={Users}
            iconColor="text-[#009689]"
            chartType="gender"
            chartData={genderData}
          >
            <GenderChart data={genderData} />
          </ChartWithInsight>

          <ChartWithInsight
            title="Pengurus per Bidang Usaha"
            description="Dominasi bidang usaha untuk memetakan latar belakang industri kepengurusan"
            icon={Building2}
            iconColor="text-[#f59e0b]"
            chartType="business"
            chartData={businessData}
          >
            <BusinessCategoryChart data={businessData} />
          </ChartWithInsight>

          <ChartWithInsight
            title="Status Kepemilikan Perusahaan"
            description="Proporsi pengurus yang memiliki vs tidak memiliki perusahaan"
            icon={Activity}
            iconColor="text-[#ef4444]"
            chartType="company"
            chartData={ownershipData}
          >
            <CompanyOwnershipChart data={ownershipData} />
          </ChartWithInsight>
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
                <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-wrap">
                  {parseAIResponse(insights.summary)}
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
