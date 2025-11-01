"use client";

import { useState } from "react";

import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  Users,
  BarChart3,
  Shield,
  ArrowRight,
  User,
  Lock,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Manajemen Dokumen Cerdas",
  },
  {
    icon: Users,
    title: "Kelola Data Anggota",
  },
  {
    icon: BarChart3,
    title: "Statistik & Analytics",
  },
  {
    icon: Shield,
    title: "Keamanan Terjamin",
  },
];

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Dummy authentication - accept any username/password
    setTimeout(() => {
      // Store auth in both localStorage and cookie
      localStorage.setItem("isAuthenticated", "true");

      // Set cookie for middleware
      document.cookie = "isAuthenticated=true; path=/; max-age=86400"; // 24 hours

      // Force page reload to trigger middleware
      window.location.href = "/home";
    }, 1000);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white">
      {/* Gradient Blobs Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-48 -top-48 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-[-100px] right-[-100px] h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="absolute left-[35%] top-[25%] h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      {/* Logo Image - Top Right */}
      <div className="absolute right-20 top-8 z-10 h-56 w-[350px]">
        <Image
          src="/Image (Kintari).png"
          alt="Kintari Logo"
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen">
        {/* Left Side - Features */}
        <div className="flex w-full max-w-md flex-col justify-center px-12 lg:px-24">
          <div className="space-y-8">
            <div>
              <h1 className="bg-gradient-to-r from-[#155dfc] via-[#009689] to-[#0092b8] bg-clip-text text-5xl font-normal leading-tight text-transparent">
                Sistem Manajemen Dokumen & Anggota
              </h1>
            </div>

            <p className="text-base leading-relaxed text-gray-600">
              Platform terintegrasi dengan AI untuk mengelola dokumen, data
              anggota, dan mendapatkan insight melalui chatbot cerdas.
            </p>

            {/* Features List */}
            <div className="space-y-4 pt-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center gap-4 rounded-lg border border-white/60 bg-white/40 p-4 backdrop-blur-sm"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg">
                      <Icon className="h-5 w-5 text-gray-700" />
                    </div>
                    <p className="text-base text-gray-800">{feature.title}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex flex-1 items-center justify-center px-8 py-12">
          <Card className="w-full max-w-md border-white/60 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
              {/* Header */}
              <div className="mb-8 text-center">
                <h2 className="mb-2 bg-gradient-to-r from-[#155dfc] to-[#009689] bg-clip-text text-3xl font-normal text-transparent">
                  Selamat Datang
                </h2>
                <p className="text-base text-gray-600">
                  Masuk ke dashboard admin Kintari
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-5">
                {/* Username Field */}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm text-gray-800">
                    Username
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Masukkan username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="h-12 border-gray-200 bg-white/50 pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm text-gray-800">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Masukkan password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 border-gray-200 bg-white/50 pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-12 w-full bg-gradient-to-r from-[#155dfc] via-[#009689] to-[#0092b8] text-white shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    "Loading..."
                  ) : (
                    <>
                      Masuk ke Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              {/* Footer */}
              <div className="mt-6 border-t border-gray-200 pt-6 text-center">
                <p className="text-sm text-gray-500">
                  © 2025 Kintari. Platform Manajemen Terpadu
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
