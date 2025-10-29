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
  const [generateAISummary, setGenerateAISummary] = useState<boolean>(false); // Changed to FALSE for faster upload

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  // const [filterType, setFilterType] = useState<string>("");
  // const [filterCategory, setFilterCategory] = useState<string>("");

  const { data: documentsData, isLoading } = useDocuments({
    search: searchQuery || undefined,
    // document_type: filterType || undefined,
    // category: filterCategory || undefined,
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
        toast.error(
          "Hanya file PDF yang diperbolehkan untuk Universal Knowledge Base!"
        );
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
        generate_ai_summary: generateAISummary,
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
          <h1 className="bg-gradient-to-r from-[#155dfc] to-[#009689] bg-clip-text text-5xl font-bold text-transparent">
            📚 Universal Knowledge Base
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Upload dokumen apapun (PDF) - Sistem akan otomatis mengekstrak &
            membuat AI context
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Upload Section */}
          <Card className="border-2 border-gray-200 lg:col-span-2">
            <CardHeader className="bg-gradient-to-r from-blue-50/50 to-teal-50/50">
              <CardTitle className="text-xl text-gray-800">
                🚀 Upload Any Document
              </CardTitle>
              <CardDescription className="text-sm">
                AI akan otomatis: ekstrak teks, detect type, find entities,
                generate summary
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {/* Category & Tags Input */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Category (Optional)
                  </label>
                  <Input
                    placeholder="e.g., HIPMI, Contracts, Reports"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={uploadMutation.isPending}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Tags (Optional, comma-separated)
                  </label>
                  <Input
                    placeholder="e.g., important, 2024, legal"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    disabled={uploadMutation.isPending}
                  />
                </div>
              </div>

              {/* AI Summary Toggle */}
              <div className="flex items-center gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <input
                  type="checkbox"
                  id="ai-summary"
                  checked={generateAISummary}
                  onChange={(e) => setGenerateAISummary(e.target.checked)}
                  disabled={uploadMutation.isPending}
                  className="h-5 w-5 cursor-pointer rounded border-gray-300 text-[#155dfc] focus:ring-2 focus:ring-[#155dfc]"
                />
                <div className="flex-1">
                  <label
                    htmlFor="ai-summary"
                    className="cursor-pointer text-sm font-medium text-gray-700"
                  >
                    🤖 Generate AI Summary & Insights (Optional - Slower)
                  </label>
                  <p className="mt-1 text-xs text-gray-600">
                    ⚠️ Enable this will make upload MUCH slower (~30-60 seconds)
                    due to Gemini AI processing
                  </p>
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
                    <p className="text-sm text-gray-500">
                      PDF only (Max. 50MB)
                    </p>
                    <p className="mt-2 text-xs text-gray-400">
                      Supports: Contracts, Reports, HIPMI Docs, Presentations,
                      etc.
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
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-5 w-5" />
                        Upload & Process
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => setSelectedFile(null)}
                    disabled={uploadMutation.isPending}
                    variant="outline"
                    className="h-14 px-8"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-teal-50">
            <CardHeader>
              <CardTitle className="text-lg text-[#155dfc]">
                💡 How It Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-2">
                <p className="font-semibold text-gray-800">1. Upload Any PDF</p>
                <p className="text-gray-600">
                  System accepts all PDF documents
                </p>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-gray-800">
                  2. Auto Processing
                </p>
                <p className="text-gray-600">
                  Extracts text, tables, emails, dates, phones
                </p>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-gray-800">3. AI Analysis</p>
                <p className="text-gray-600">
                  Generates summary & insights using Gemini AI
                </p>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-gray-800">
                  4. Chatbot Context
                </p>
                <p className="text-gray-600">
                  All docs become part of AI knowledge base
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
                  📂 Knowledge Base Documents
                </CardTitle>
                <CardDescription className="mt-1">
                  {total} dokumen tersimpan
                </CardDescription>
              </div>

              {/* Search & Filters */}
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search..."
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
                      <TableHead className="font-bold">Filename</TableHead>
                      <TableHead className="font-bold">Type</TableHead>
                      <TableHead className="font-bold">Category</TableHead>
                      <TableHead className="font-bold">Tags</TableHead>
                      <TableHead className="font-bold">Size</TableHead>
                      <TableHead className="font-bold">Pages</TableHead>
                      <TableHead className="font-bold">Status</TableHead>
                      <TableHead className="font-bold">Uploaded</TableHead>
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
                            {doc.document_type}
                          </span>
                        </TableCell>
                        <TableCell>
                          {doc.category ? (
                            <span className="text-sm text-gray-700">
                              {doc.category}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
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
