"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDocuments, useUploadDocument, useAPIError } from "@/lib/hooks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  FileText,
  Loader2,
  File,
  CheckCircle2,
  Tag,
  Search,
  Trash2,
  X,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { documentsAPI } from "@/lib/api";
import type { DocumentUploadResponse } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface FileWithProgress {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}

export default function DocumentsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedFiles, setSelectedFiles] = useState<FileWithProgress[]>([]);
  const [category, setCategory] = useState<string>("");
  const [tags, setTags] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>("");

  const {
    data: documentsData,
    isLoading,
    refetch,
  } = useDocuments({
    search: searchQuery || undefined,
  });
  // uploadMutation kept for query invalidation if needed
  useUploadDocument();
  const { handleError } = useAPIError();

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(
        `http://localhost:8000/api/documents/${id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete document");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("Dokumen berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      refetch();
      setDeletingId(null);
    },
    onError: (error) => {
      toast.error(`Gagal menghapus dokumen: ${error.message}`);
      setDeletingId(null);
    },
  });

  const handleDelete = (id: number) => {
    setDeletingId(id);
    deleteMutation.mutate(id);
  };

  const onDrop = (acceptedFiles: File[]) => {
    const validExtensions = [".pdf"];
    const maxSize = 50 * 1024 * 1024; // 50MB
    
    const validFiles: FileWithProgress[] = [];
    let invalidCount = 0;

    acceptedFiles.forEach((file) => {
      const fileExt = file.name
        .substring(file.name.lastIndexOf("."))
        .toLowerCase();

      if (!validExtensions.includes(fileExt)) {
        invalidCount++;
        return;
      }
      if (file.size > maxSize) {
        invalidCount++;
        toast.error(`File "${file.name}" melebihi batas 50MB!`);
        return;
      }

      validFiles.push({
        file,
        progress: 0,
        status: "pending",
      });
    });

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validFiles]);
      toast.success(
        `${validFiles.length} file ditambahkan ke antrian upload${
          invalidCount > 0 ? ` (${invalidCount} file ditolak)` : ""
        }`
      );
    } else if (invalidCount > 0) {
      toast.error("Hanya file PDF dengan ukuran maksimal 50MB yang diperbolehkan!");
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: true,
    disabled: isUploading,
  });

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const clearAll = () => {
    setSelectedFiles([]);
  };

  const handleUploadAll = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < selectedFiles.length; i++) {
      const fileItem = selectedFiles[i];
      
      // Skip if already processed
      if (fileItem.status === "success" || fileItem.status === "error") {
        continue;
      }

      // Update status to uploading
      setSelectedFiles((prev) =>
        prev.map((f, idx) =>
          idx === i ? { ...f, status: "uploading", progress: 0 } : f
        )
      );

      try {
        const result = (await documentsAPI.uploadWithProgress(
          fileItem.file,
          (percent) => {
            setSelectedFiles((prev) =>
              prev.map((f, idx) =>
                idx === i ? { ...f, progress: percent } : f
              )
            );
          },
          {
            category: category || undefined,
            tags: tags || undefined,
            generate_ai_summary: false,
          }
        )) as DocumentUploadResponse;

        // Update to success
        setSelectedFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, status: "success", progress: 100 } : f
          )
        );
        successCount++;
      } catch (error: any) {
        // Update to error
        setSelectedFiles((prev) =>
          prev.map((f, idx) =>
            idx === i
              ? {
                  ...f,
                  status: "error",
                  progress: 0,
                  error: error.message || "Upload gagal",
                }
              : f
          )
        );
        errorCount++;
      }
    }

    setIsUploading(false);

    // Show summary toast
    if (successCount > 0 && errorCount === 0) {
      toast.success(`✓ ${successCount} dokumen berhasil diupload!`);
    } else if (successCount > 0 && errorCount > 0) {
      toast.warning(
        `${successCount} dokumen berhasil, ${errorCount} gagal`
      );
    } else if (errorCount > 0) {
      toast.error(`${errorCount} dokumen gagal diupload`);
    }

    // Refresh document list
    refetch();

    // Auto-clear successful uploads after 2 seconds
    setTimeout(() => {
      setSelectedFiles((prev) => prev.filter((f) => f.status !== "success"));
    }, 2000);
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

  const getStatusIcon = (status: FileWithProgress["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-gray-400" />;
      case "uploading":
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
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
                    disabled={isUploading}
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
                    disabled={isUploading}
                  />
                </div>
              </div>

              {/* File Dropzone */}
              <div
                {...getRootProps()}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-all ${
                  isDragActive
                    ? "border-[#155dfc] bg-blue-50"
                    : selectedFiles.length > 0
                    ? "border-green-500 bg-green-50"
                    : "border-gray-300 bg-gray-50 hover:border-[#155dfc] hover:bg-blue-50/50"
                } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <input {...getInputProps()} />
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-teal-100">
                  {selectedFiles.length > 0 ? (
                    <File className="h-8 w-8 text-green-600" />
                  ) : (
                    <FileText className="h-8 w-8 text-[#155dfc]" />
                  )}
                </div>
                {isDragActive ? (
                  <p className="mt-4 text-center text-lg font-medium text-[#155dfc]">
                    Drop file di sini...
                  </p>
                ) : selectedFiles.length > 0 ? (
                  <div className="mt-4 text-center">
                    <p className="text-lg font-semibold text-green-700">
                      ✓ {selectedFiles.length} file dalam antrian
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      Klik atau drag & drop untuk menambah file lainnya
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 text-center">
                    <p className="mb-2 text-base font-medium text-gray-700">
                      Klik untuk upload atau drag & drop
                    </p>
                    <p className="text-sm text-gray-500">
                      PDF (Max. 50MB per file) - Multiple files allowed
                    </p>
                    <p className="mt-2 text-xs text-gray-400">
                      Supports: SK, PO, Laporan, Surat, Kontrak HIPMI, etc.
                    </p>
                  </div>
                )}
              </div>

              {/* File Queue List */}
              {selectedFiles.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-700">
                      Antrian Upload ({selectedFiles.length} file)
                    </h3>
                    {!isUploading && (
                      <Button
                        onClick={clearAll}
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-red-600 hover:text-red-700"
                      >
                        <X className="mr-1 h-3 w-3" />
                        Hapus Semua
                      </Button>
                    )}
                  </div>
                  <div className="max-h-80 space-y-2 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-3">
                    {selectedFiles.map((fileItem, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm"
                      >
                        <div className="flex-shrink-0">
                          {getStatusIcon(fileItem.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium text-gray-700">
                            {fileItem.file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(fileItem.file.size)}
                          </p>
                          {fileItem.status === "uploading" && (
                            <Progress
                              value={fileItem.progress}
                              className="mt-2 h-1"
                            />
                          )}
                          {fileItem.status === "error" && fileItem.error && (
                            <p className="mt-1 text-xs text-red-600">
                              {fileItem.error}
                            </p>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          {fileItem.status === "pending" && !isUploading && (
                            <Button
                              onClick={() => removeFile(index)}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                          {fileItem.status === "uploading" && (
                            <span className="text-xs font-medium text-blue-600">
                              {fileItem.progress}%
                            </span>
                          )}
                          {fileItem.status === "success" && (
                            <span className="text-xs font-medium text-green-600">
                              Selesai
                            </span>
                          )}
                          {fileItem.status === "error" && (
                            <Button
                              onClick={() => removeFile(index)}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedFiles.length > 0 && (
                <div className="flex gap-3">
                  <Button
                    onClick={handleUploadAll}
                    disabled={
                      isUploading ||
                      selectedFiles.every((f) => f.status === "success")
                    }
                    className="h-14 flex-1 bg-gradient-to-r from-[#155dfc] via-[#009689] to-[#0092b8] text-base shadow-lg hover:shadow-xl"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Mengupload...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-5 w-5" />
                        Upload Semua ({selectedFiles.filter((f) => f.status === "pending" || f.status === "error").length} file)
                      </>
                    )}
                  </Button>
                  {!isUploading && (
                    <Button
                      onClick={clearAll}
                      variant="outline"
                      className="h-14 px-8"
                    >
                      Batalkan
                    </Button>
                  )}
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
                <p className="text-gray-600">Sistem menerima file PDF (multiple files)</p>
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
                      <TableHead className="font-bold text-center">
                        Aksi
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow key={doc.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          <div 
                            className="flex items-center gap-2 cursor-pointer hover:text-[#155dfc] transition-colors"
                            onClick={() => router.push(`/documents/${doc.id}`)}
                          >
                            <FileText className="h-5 w-5 text-[#155dfc]" />
                            <span className="hover:underline">{doc.filename}</span>
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
                        <TableCell>
                          <div className="flex items-center justify-center">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  disabled={deletingId === doc.id}
                                  className="gap-1 cursor-pointer"
                                >
                                  {deletingId === doc.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <Trash2 className="h-4 w-4" />
                                      Hapus
                                    </>
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Hapus Dokumen?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Apakah Anda yakin ingin menghapus dokumen
                                    &quot;{doc.filename}&quot;? Aksi ini tidak
                                    dapat dibatalkan dan dokumen akan dihapus
                                    dari knowledge base AI.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(doc.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Ya, Hapus
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
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
