"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { documentsAPI } from "@/lib/api";
import { AppLayout } from "@/components/AppLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText } from "lucide-react";
import { useDropzone } from "react-dropzone";

export default function DocumentsPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  const { data: documents, isLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: documentsAPI.getAll,
  });

  const uploadMutation = useMutation({
    mutationFn: documentsAPI.upload,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      setTitle("");
      setDescription("");
      setFile(null);
    },
  });

  const onDrop = (acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "text/plain": [".txt"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleUpload = () => {
    if (title && file) {
      const formData = new FormData();
      formData.append("judul", title);
      formData.append("deskripsi", description);
      formData.append("file", file);
      uploadMutation.mutate(formData);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="bg-gradient-to-r from-[#155dfc] to-[#009689] bg-clip-text text-5xl font-bold text-transparent">
            Upload Dokumen
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Upload dokumen yang akan diproses oleh AI untuk summarization dan
            retrieval
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Upload Form */}
          <Card className="border-2 border-gray-200 lg:col-span-2">
            <CardHeader className="bg-gradient-to-r from-blue-50/50 to-teal-50/50">
              <CardTitle className="text-xl text-gray-800">
                📄 Form Upload Dokumen
              </CardTitle>
              <CardDescription className="text-sm">
                Dokumen akan otomatis diproses menggunakan AI Service
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="space-y-2">
                <Label
                  htmlFor="title"
                  className="text-sm font-semibold text-gray-700"
                >
                  Judul Dokumen
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Masukkan judul dokumen"
                  className="h-12 border-gray-300 bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="text-sm font-semibold text-gray-700"
                >
                  Deskripsi
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Masukkan deskripsi dokumen"
                  rows={3}
                  className="border-gray-300 bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">
                  File Dokumen
                </Label>
                <div
                  {...getRootProps()}
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-all ${
                    isDragActive
                      ? "border-[#155dfc] bg-blue-50"
                      : file
                      ? "border-green-500 bg-green-50"
                      : "border-gray-300 bg-gray-50 hover:border-[#155dfc] hover:bg-blue-50/50"
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-teal-100">
                    <FileText className="h-8 w-8 text-[#155dfc]" />
                  </div>
                  {file ? (
                    <div className="mt-4 text-center">
                      <p className="text-base font-semibold text-gray-800">
                        {file.name}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  ) : isDragActive ? (
                    <p className="mt-4 text-center font-medium text-[#155dfc]">
                      Drop file di sini...
                    </p>
                  ) : (
                    <div className="mt-4 text-center">
                      <p className="mb-2 text-base font-medium text-gray-700">
                        Klik untuk upload atau drag & drop
                      </p>
                      <p className="text-sm text-gray-500">
                        PDF, DOC, DOCX, TXT (Max. 10MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <Button
                onClick={handleUpload}
                disabled={!title || !file || uploadMutation.isPending}
                className="h-14 w-full bg-gradient-to-r from-[#155dfc] via-[#009689] to-[#0092b8] text-base shadow-lg hover:shadow-xl"
              >
                <Upload className="mr-2 h-5 w-5" />
                {uploadMutation.isPending ? "Mengupload..." : "Upload Dokumen"}
              </Button>
            </CardContent>
          </Card>

          {/* Process Info */}
          <div className="space-y-6">
            <Card className="border-2 border-gray-200">
              <CardHeader className="bg-gradient-to-r from-blue-50/50 to-teal-50/50">
                <CardTitle className="text-lg text-gray-800">
                  🤖 Proses AI
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#155dfc] to-[#009689] text-sm font-bold text-white shadow-md">
                    1
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="font-medium text-gray-800">Upload Dokumen</p>
                    <p className="text-xs text-gray-500">
                      Dokumen dikirim ke server
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#155dfc] to-[#009689] text-sm font-bold text-white shadow-md">
                    2
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="font-medium text-gray-800">
                      AI Summarization
                    </p>
                    <p className="text-xs text-gray-500">
                      OpenAI membuat ringkasan
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#155dfc] to-[#009689] text-sm font-bold text-white shadow-md">
                    3
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="font-medium text-gray-800">
                      Embedding & Retrieval
                    </p>
                    <p className="text-xs text-gray-500">
                      LangChain membuat vektor
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#155dfc] to-[#009689] text-sm font-bold text-white shadow-md">
                    4
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="font-medium text-gray-800">Simpan Database</p>
                    <p className="text-xs text-gray-500">
                      Data tersimpan permanen
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200">
              <CardHeader className="bg-gradient-to-r from-blue-50/50 to-teal-50/50">
                <CardTitle className="text-lg text-gray-800">
                  ⚙️ Backend API
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-6 text-sm">
                <p className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  <span className="text-gray-700">FastAPI / Express</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
                  <span className="text-gray-700">JSON Server Mock API</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                  <span className="text-gray-700">MongoDB/PostgreSQL</span>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Documents List */}
        <Card className="border-2 border-gray-200">
          <CardHeader className="bg-gradient-to-r from-blue-50/50 to-teal-50/50">
            <CardTitle className="text-xl text-gray-800">
              📚 Dokumen Tersimpan
            </CardTitle>
            <CardDescription>
              Daftar dokumen yang telah diupload dan diproses
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="py-12 text-center text-gray-500">Loading...</div>
            ) : (
              <div className="space-y-4">
                {documents?.map((doc) => (
                  <div
                    key={doc.id}
                    className="group rounded-xl border-2 border-gray-200 p-5 transition-all hover:border-[#155dfc] hover:shadow-lg"
                  >
                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-teal-50">
                        <FileText className="h-6 w-6 text-[#155dfc]" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#155dfc]">
                          {doc.judul}
                        </h3>
                        <p className="mt-1 text-sm text-gray-600">
                          {doc.deskripsi}
                        </p>
                        <div className="mt-3 flex items-center gap-3">
                          <span className="rounded-full bg-gradient-to-r from-blue-100 to-teal-100 px-3 py-1 text-xs font-medium text-gray-800">
                            {doc.kategori}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(doc.tanggal).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
