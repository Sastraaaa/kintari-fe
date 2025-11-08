"use client";

import { useState } from "react";
import { useDocuments, useUploadDocument, useAPIError } from "@/lib/hooks";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Upload,
  FileText,
  Loader2,
  File,
  CheckCircle2,
  Tag,
  Search,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

export default function DocumentsPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState<string>("");
  const [tags, setTags] = useState<string>("");

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { data: documentsData, isLoading } = useDocuments({
    search: searchQuery || undefined,
  });
  const uploadMutation = useUploadDocument();
  const { handleError } = useAPIError();

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const validExtensions = [".pdf"];
      const fileExt = file.name
        .substring(file.name.lastIndexOf("."))
        .toLowerCase();

      if (!validExtensions.includes(fileExt)) {
        toast.error("Hanya file PDF yang diperbolehkan!");
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 50MB!");
        return;
      }
      setSelectedFile(file);
      toast.success(`File "${file.name}" siap diupload`);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    disabled: uploadMutation.isPending,
  });

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      const result = await uploadMutation.mutateAsync({
        file: selectedFile,
        category: category || undefined,
        tags: tags || undefined,
        generate_ai_summary: false, // Always false - no AI summary
      });

      toast.success(
        <div>
          <p className="font-semibold">✓ Dokumen berhasil diupload!</p>
          <p className="text-sm text-gray-600">
            {result.document.filename} ({result.document.file_size_mb} MB)
          </p>
          <p className="text-sm text-gray-600">
            Type: {result.document.document_type} | Pages:{" "}
            {result.document.page_count}
          </p>
        </div>
      );

      setSelectedFile(null);
      setCategory("");
      setTags("");
    } catch (error) {
      handleError(error);
    }
  };

  const documents = documentsData?.documents || [];
  const total = documentsData?.total || 0;

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2">
            <div className="text-5xl font-bold">📚</div>
            <h1 className="bg-gradient-to-r from-[#155dfc] to-[#009689] bg-clip-text text-5xl font-bold text-transparent">
              Dokumen HIPMI
            </h1>
          </div>
          <p className="mt-3 text-lg text-gray-600">
            Upload dan kelola dokumen organisasi HIPMI (SK, PO, Laporan, Surat,
            dll) - AI akan otomatis mengekstrak konten
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Upload Section */}
          <Card className="border-2 border-gray-200 lg:col-span-2">
            <CardHeader className="bg-gradient-to-r from-blue-50/50 to-teal-50/50">
              <CardTitle className="text-xl text-gray-800">
                🚀 Upload Dokumen HIPMI
              </CardTitle>
              <CardDescription className="text-sm">
                Sistem akan otomatis: ekstrak teks, detect file type, indexing
                untuk AI chatbot
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {/* Category & Tags Input */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Kategori Dokumen (Opsional)
                  </label>
                  <Input
                    placeholder="e.g., PO HIPMI, SK Pengurus, Kontrak Kerjasama, Laporan Kegiatan"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={uploadMutation.isPending}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Tag (Opsional, pisahkan dengan koma)
                  </label>
                  <Input
                    placeholder="e.g., penting, 2024, pengurus, keuangan"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    disabled={uploadMutation.isPending}
                  />
                </div>
              </div>

              {/* File Dropzone */}
              <div
                {...getRootProps()}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-16 transition-all ${
                  isDragActive
                    ? "border-[#155dfc] bg-blue-50"
                    : selectedFile
                    ? "border-green-500 bg-green-50"
                    : "border-gray-300 bg-gray-50 hover:border-[#155dfc] hover:bg-blue-50/50"
                } ${
                  uploadMutation.isPending
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-teal-100">
                  {selectedFile ? (
                    <File className="h-10 w-10 text-green-600" />
                  ) : (
                    <FileText className="h-10 w-10 text-[#155dfc]" />
                  )}
                </div>
                {isDragActive ? (
                  <p className="mt-4 text-center text-lg font-medium text-[#155dfc]">
                    Drop file di sini...
                  </p>
                ) : selectedFile ? (
                  <div className="mt-4 text-center">
                    <p className="text-lg font-semibold text-green-700">
                      ✓ {selectedFile.name}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      {formatFileSize(selectedFile.size)} - Siap diupload
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 text-center">
                    <p className="mb-2 text-base font-medium text-gray-700">
                      Klik untuk upload atau drag & drop
                    </p>
                    <p className="text-sm text-gray-500">PDF (Max. 50MB)</p>
                    <p className="mt-2 text-xs text-gray-400">
                      Supports: SK, PO, Laporan, Surat, Kontrak HIPMI, etc.
                    </p>
                  </div>
                )}
              </div>

              {selectedFile && (
                <div className="flex gap-3">
                  <Button
                    onClick={handleUpload}
                    disabled={uploadMutation.isPending}
                    className="h-14 flex-1 bg-gradient-to-r from-[#155dfc] via-[#009689] to-[#0092b8] text-base shadow-lg hover:shadow-xl"
                  >
                    {uploadMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-5 w-5" />
                        Upload & Proses
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => setSelectedFile(null)}
                    disabled={uploadMutation.isPending}
                    variant="outline"
                    className="h-14 px-8"
                  >
                    Batal
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-teal-50">
            <CardHeader>
              <CardTitle className="text-lg text-[#155dfc]">
                💡 Cara Kerja Sistem
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-2">
                <p className="font-semibold text-gray-800">
                  1. Upload Dokumen HIPMI
                </p>
                <p className="text-gray-600">Sistem menerima file PDF</p>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-gray-800">
                  2. Ekstraksi Otomatis
                </p>
                <p className="text-gray-600">
                  Mengekstrak teks, tabel, email, tanggal, dan nomor telepon
                </p>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-gray-800">
                  3. Deteksi Tipe File
                </p>
                <p className="text-gray-600">
                  AI mendeteksi jenis dokumen (SK, PO, Laporan, dll) secara
                  otomatis
                </p>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-gray-800">
                  4. Indexing AI Chatbot
                </p>
                <p className="text-gray-600">
                  Semua dokumen menjadi bagian dari knowledge base untuk AI
                  chatbot
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Documents List */}
        <Card className="border-2 border-gray-200">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-xl text-gray-800">
                  📂 Daftar Dokumen HIPMI
                </CardTitle>
                <CardDescription className="mt-1">
                  {total} dokumen tersimpan dalam sistem
                </CardDescription>
              </div>

              {/* Search & Filters */}
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Cari dokumen..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-48"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-[#155dfc]" />
              </div>
            ) : documents.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center text-gray-500">
                <FileText className="mb-4 h-16 w-16 text-gray-300" />
                <p className="text-lg font-medium">Belum ada dokumen</p>
                <p className="text-sm">Upload dokumen pertama Anda!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-bold">Nama File</TableHead>
                      <TableHead className="font-bold">Tipe File</TableHead>
                      <TableHead className="font-bold">Kategori</TableHead>
                      <TableHead className="font-bold">Tag</TableHead>
                      <TableHead className="font-bold">Ukuran</TableHead>
                      <TableHead className="font-bold">Halaman</TableHead>
                      <TableHead className="font-bold">Status</TableHead>
                      <TableHead className="font-bold">
                        Tanggal Upload
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow key={doc.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-[#155dfc]" />
                            {doc.filename}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                            {doc.document_type?.toUpperCase() || "PDF"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {doc.category ? (
                            <span className="text-sm text-gray-700">
                              {doc.category}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">
                              Tidak ada kategori
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {doc.tags && doc.tags.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {doc.tags.slice(0, 2).map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                                >
                                  <Tag className="h-3 w-3" />
                                  {tag}
                                </span>
                              ))}
                              {doc.tags.length > 2 && (
                                <span className="text-xs text-gray-400">
                                  +{doc.tags.length - 2}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {formatFileSize(doc.file_size)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {doc.page_count || "-"}
                        </TableCell>
                        <TableCell>
                          {doc.processed ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                              <CheckCircle2 className="h-4 w-4" />
                              Processed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Processing
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {formatDate(doc.uploaded_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
