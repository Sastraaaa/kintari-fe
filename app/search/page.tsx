"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { searchAPI } from "@/lib/api";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search as SearchIcon,
  FileText,
  Calendar,
  FolderOpen,
} from "lucide-react";
import type { SearchResult } from "@/lib/types";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);

  const searchMutation = useMutation({
    mutationFn: searchAPI.search,
    onSuccess: (data: SearchResult[]) => {
      setResults(data);
    },
  });

  const handleSearch = () => {
    if (query.trim()) {
      searchMutation.mutate(query);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="bg-gradient-to-r from-[#155dfc] to-[#009689] bg-clip-text text-5xl font-bold text-transparent">
            Pencarian Data Dokumen
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Gunakan full-text search berbasis AI untuk menemukan dokumen yang
            Anda butuhkan
          </p>
        </div>

        {/* Search Box */}
        <Card className="border-2 border-gray-200">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Cari dokumen berdasarkan judul, konten, atau kategori..."
                  className="h-14 border-gray-300 bg-[#f3f3f5] pl-12 text-base"
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={searchMutation.isPending}
                className="h-14 bg-gradient-to-r from-[#155dfc] via-[#009689] to-[#0092b8] px-8 text-base text-white shadow-lg hover:shadow-xl"
              >
                <SearchIcon className="mr-2 h-5 w-5" />
                {searchMutation.isPending ? "Mencari..." : "Cari"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="border-2 border-gray-200">
          <CardContent className="pt-6">
            {results.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-teal-50">
                  <SearchIcon className="h-12 w-12 text-[#155dfc]" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-800">
                  Mulai Pencarian Dokumen
                </h3>
                <p className="text-center text-gray-500">
                  Ketik kata kunci di kotak pencarian di atas untuk menemukan
                  dokumen
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Hasil Pencarian ({results.length})
                  </h2>
                </div>
                {results.map((result, idx) => {
                  const isDocument = result.type === "document";
                  const data = result.data as any;

                  return (
                    <div
                      key={idx}
                      className="group rounded-xl border-2 border-gray-200 p-6 transition-all hover:border-[#155dfc] hover:shadow-lg"
                    >
                      <div className="flex gap-4">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-teal-50">
                          {isDocument ? (
                            <FileText className="h-6 w-6 text-[#155dfc]" />
                          ) : (
                            <SearchIcon className="h-6 w-6 text-[#009689]" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="mb-1 inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                            {isDocument ? "Dokumen" : "Anggota"}
                          </div>
                          <h3 className="mb-2 text-lg font-semibold text-gray-900 group-hover:text-[#155dfc]">
                            {isDocument ? data.judul : data.nama}
                          </h3>
                          {isDocument && data.ringkasan && (
                            <p className="mb-3 text-sm text-gray-600">
                              {data.ringkasan}
                            </p>
                          )}
                          <div className="flex gap-4 text-sm text-gray-500">
                            {isDocument ? (
                              <>
                                <div className="flex items-center gap-1">
                                  <FolderOpen className="h-4 w-4" />
                                  <span>{data.kategori}</span>
                                </div>
                                {data.tanggal_upload && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>
                                      {new Date(
                                        data.tanggal_upload
                                      ).toLocaleDateString("id-ID")}
                                    </span>
                                  </div>
                                )}
                              </>
                            ) : (
                              <>
                                <span>{data.jabatan}</span>
                                <span>•</span>
                                <span>{data.peminatan}</span>
                                <span>•</span>
                                <span>Tahun {data.tahun}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
