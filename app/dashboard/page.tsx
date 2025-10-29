"use client";

import { useQuery } from "@tanstack/react-query";
import { statsAPI } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AppLayout } from "@/components/AppLayout";
import {
  Search,
  MessageSquare,
  FileUp,
  Users,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

const quickAccessCards = [
  {
    title: "Pencarian Data Dokumen",
    description: "Cari dan temukan dokumen dengan mudah menggunakan AI search",
    icon: Search,
    href: "/search",
  },
  {
    title: "Chatbot Interaksi dengan AI",
    description:
      "Tanya jawab interaktif dengan AI assistant untuk informasi cepat",
    icon: MessageSquare,
    href: "/chatbot",
  },
  {
    title: "Upload Dokumen",
    description: "Upload dan kelola dokumen dengan ringkasan otomatis AI",
    icon: FileUp,
    href: "/documents",
  },
  {
    title: "Upload Data Anggota",
    description: "Import data anggota melalui file CSV",
    icon: Users,
    href: "/members",
  },
  {
    title: "Dashboard Statistik",
    description: "Lihat statistik dan grafik data anggota",
    icon: BarChart3,
    href: "/statistics",
  },
];

export default function DashboardPage() {
  const { data: response, isLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: statsAPI.getStats,
  });

  // Extract stats from APIResponse wrapper
  const stats = response?.data;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center">
          <div className="text-lg">Loading...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-12">
        {/* Header */}
        <div>
          <h1 className="bg-gradient-to-r from-[#155dfc] to-[#009689] bg-clip-text text-5xl font-bold text-transparent">
            Selamat Datang di Kintari
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Knowledge Intelligence Repository & Assistant - Sistem manajemen
            dokumen berbasis AI
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-2 border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-semibold text-gray-700">
                Total Dokumen
              </CardTitle>
              <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-3">
                <FileUp className="h-6 w-6 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-gray-900">
                {stats?.total_dokumen?.toLocaleString() ?? "0"}
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Dokumen tersimpan dalam sistem
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200">
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
                {stats?.total_anggota?.toLocaleString() ?? "0"}
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Anggota terdaftar aktif
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-semibold text-gray-700">
                Query AI
              </CardTitle>
              <div className="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 p-3">
                <MessageSquare className="h-6 w-6 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-gray-900">
                {stats?.chat_interactions?.toLocaleString() ?? "0"}
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Interaksi chatbot bulan ini
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Access Section */}
        <div>
          <h2 className="mb-6 text-2xl font-bold text-gray-800">Akses Cepat</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {quickAccessCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link key={card.href} href={card.href}>
                  <Card className="group h-full border-2 border-gray-200 transition-all hover:border-[#155dfc] hover:shadow-xl">
                    <CardHeader className="space-y-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#155dfc]/10 to-[#009689]/10 transition-all group-hover:from-[#155dfc]/20 group-hover:to-[#009689]/20">
                        <Icon className="h-7 w-7 text-[#155dfc] relative" />
                      </div>
                      <div>
                        <CardTitle className="mb-2 flex items-center justify-between text-lg">
                          <span>{card.title}</span>
                          <ArrowRight className="h-5 w-5 text-gray-400 transition-all group-hover:translate-x-1 group-hover:text-[#155dfc]" />
                        </CardTitle>
                        <CardDescription className="text-sm leading-relaxed">
                          {card.description}
                        </CardDescription>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
