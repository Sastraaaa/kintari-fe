"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Search,
  MessageSquare,
  FileUp,
  Users,
  BarChart3,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const navigationItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Pencarian Data",
    href: "/search",
    icon: Search,
  },
  {
    title: "Chatbot AI",
    href: "/chatbot",
    icon: MessageSquare,
  },
  {
    title: "Upload Dokumen",
    href: "/documents",
    icon: FileUp,
  },
  {
    title: "Upload Anggota",
    href: "/members",
    icon: Users,
  },
  {
    title: "Statistik",
    href: "/statistics",
    icon: BarChart3,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    // Remove from localStorage
    localStorage.removeItem("isAuthenticated");

    // Remove cookie
    document.cookie = "isAuthenticated=; path=/; max-age=0";

    // Redirect to login
    window.location.href = "/login";
  };

  return (
    <div
      className={cn(
        "flex h-screen flex-col border-r bg-background transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-64 items-center justify-center p-6 border-b relative">
        {!isCollapsed && (
          <div className="relative w-52 h-52">
            <Image
              src="/Image (Kintari).png"
              alt="Kintari Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        )}

        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute top-4 right-6 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <Menu className="h-5 w-5 text-gray-600" />
          ) : (
            <X className="h-5 w-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                isActive
                  ? "bg-gradient-to-r from-[#155dfc] to-[#009689] text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100",
                isCollapsed && "justify-center"
              )}
              title={isCollapsed ? item.title : undefined}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {!isCollapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t p-4">
        <button
          onClick={handleLogout}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50",
            isCollapsed && "justify-center"
          )}
          title={isCollapsed ? "Keluar" : undefined}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!isCollapsed && <span>Keluar</span>}
        </button>
      </div>
    </div>
  );
}
