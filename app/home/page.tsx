"use client";

import {
  Card,
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
    title: "Pencarian Dokumen HIPMI",
    description:
      "Temukan dokumen organisasi, SK, PO, dan file penting HIPMI dengan cepat menggunakan AI-powered search",
    icon: Search,
    href: "/search",
  },
  {
    title: "AI Assistant HIPMI",
    description:
      "Konsultasi dengan AI untuk informasi tentang data anggota, dokumen organisasi, dan insight dari database HIPMI",
    icon: MessageSquare,
    href: "/chatbot",
  },
  {
    title: "Kelola Dokumen",
    description:
      "Upload dan organize dokumen HIPMI (SK, PO, Laporan, dll) dengan analisis otomatis dari AI",
    icon: FileUp,
    href: "/documents",
  },
  {
    title: "Database Anggota",
    description:
      "Import dan kelola data anggota HIPMI melalui file CSV dengan analisis demografi otomatis",
    icon: Users,
    href: "/members",
  },
  {
    title: "Analytics & Insights",
    description:
      "Lihat statistik, tren keanggotaan, dan insight berbasis AI dari seluruh data HIPMI",
    icon: BarChart3,
    href: "/statistics",
  },
];

export default function HomePage() {
  return (
    <AppLayout>
      <div className="space-y-12">
        {/* Header */}
        <div>
          <h1 className="bg-gradient-to-r from-[#155dfc] to-[#009689] bg-clip-text text-5xl font-bold text-transparent">
            Selamat Datang di Kintari HIPMI
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Knowledge Intelligence Repository & Assistant - Platform manajemen
            data dan dokumen HIPMI berbasis AI
          </p>
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
                    <CardHeader className="space-y-0">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#155dfc]/10 to-[#009689]/10 transition-all group-hover:from-[#155dfc]/20 group-hover:to-[#009689]/20">
                          <Icon className="h-6 w-6 text-[#155dfc]" />
                        </div>
                        <div className="flex-1 pt-1">
                          <CardTitle className="mb-2 flex items-start justify-between text-base">
                            <span className="leading-tight">{card.title}</span>
                            <ArrowRight className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400 transition-all group-hover:translate-x-1 group-hover:text-[#155dfc]" />
                          </CardTitle>
                          <CardDescription className="text-xs leading-relaxed">
                            {card.description}
                          </CardDescription>
                        </div>
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
