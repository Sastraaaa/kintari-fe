"use client";

import { useState } from "react";
import { useMembers, useUploadMembers, useAPIError } from "@/lib/hooks";
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
import { Upload, FileText, Loader2 } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

export default function MembersPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: membersData, isLoading } = useMembers();
  const uploadMutation = useUploadMembers();
  const { handleError } = useAPIError();

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (!file.name.endsWith(".csv")) {
        toast.error("Hanya file CSV yang diperbolehkan!");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 5MB!");
        return;
      }
      setSelectedFile(file);
      toast.success(`File "${file.name}" siap diupload`);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
    },
    maxFiles: 1,
    disabled: uploadMutation.isPending,
  });

  const handleImport = async () => {
    if (!selectedFile) return;

    try {
      const result = await uploadMutation.mutateAsync(selectedFile);
      toast.success(`Berhasil import ${result.imported} anggota!`);
      setSelectedFile(null);
    } catch (error) {
      handleError(error);
    }
  };

  const members = membersData?.data || [];

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="bg-gradient-to-r from-[#155dfc] to-[#009689] bg-clip-text text-5xl font-bold text-transparent">
            Upload Data Anggota
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Import data anggota menggunakan file CSV dengan mudah
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Upload Section */}
          <Card className="border-2 border-gray-200 lg:col-span-2">
            <CardHeader className="bg-gradient-to-r from-blue-50/50 to-teal-50/50">
              <CardTitle className="text-xl text-gray-800">
                📊 Upload CSV Anggota
              </CardTitle>
              <CardDescription className="text-sm">
                Format: name, email, phone, position, organization,
                membership_type, status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
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
                  <FileText className="h-10 w-10 text-[#155dfc]" />
                </div>
                {isDragActive ? (
                  <p className="mt-4 text-center text-lg font-medium text-[#155dfc]">
                    Drop file CSV di sini...
                  </p>
                ) : selectedFile ? (
                  <div className="mt-4 text-center">
                    <p className="text-lg font-semibold text-green-700">
                      ✓ {selectedFile.name}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      {(selectedFile.size / 1024).toFixed(2)} KB - Siap diimport
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 text-center">
                    <p className="mb-2 text-base font-medium text-gray-700">
                      Klik untuk upload file CSV atau drag & drop
                    </p>
                    <p className="text-sm text-gray-500">
                      Format CSV (Max. 5MB)
                    </p>
                  </div>
                )}
              </div>

              {selectedFile && (
                <div className="flex gap-3">
                  <Button
                    onClick={handleImport}
                    disabled={uploadMutation.isPending}
                    className="h-14 flex-1 bg-gradient-to-r from-[#155dfc] via-[#009689] to-[#0092b8] text-base shadow-lg hover:shadow-xl"
                  >
                    {uploadMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Mengimport...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-5 w-5" />
                        Import Data Anggota
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => setSelectedFile(null)}
                    disabled={uploadMutation.isPending}
                    variant="outline"
                    className="h-14 px-6"
                  >
                    Batal
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Format Info */}
          <Card className="border-2 border-gray-200">
            <CardHeader className="bg-gradient-to-r from-blue-50/50 to-teal-50/50">
              <CardTitle className="text-lg text-gray-800">
                📝 Format CSV
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="rounded-lg border-2 border-gray-200 bg-gray-50 p-4">
                <pre className="overflow-x-auto text-xs font-mono text-gray-800">
                  {`name,email,phone,position,organization,membership_type,status
John Doe,john@hipmi.com,081234567890,Ketua,HIPMI Pusat,Regular,active
Jane Smith,jane@hipmi.com,081234567891,Sekretaris,HIPMI Jakarta,Regular,active`}
                </pre>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800">Ketentuan:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-[#155dfc]">•</span>
                    <span>Gunakan koma (,) sebagai delimiter</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#155dfc]">•</span>
                    <span>Baris pertama wajib header</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#155dfc]">•</span>
                    <span>Encoding file: UTF-8</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#155dfc]">•</span>
                    <span>Maksimal ukuran 5MB</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Members Table */}
        <Card className="border-2 border-gray-200">
          <CardHeader className="bg-gradient-to-r from-blue-50/50 to-teal-50/50">
            <CardTitle className="text-xl text-gray-800">
              👥 Data Anggota Terkini{" "}
              {membersData?.total ? `(${membersData.total})` : ""}
            </CardTitle>
            <CardDescription>
              Menampilkan data anggota yang telah tersimpan di sistem
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="py-12 text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#155dfc]" />
                <p className="mt-4 text-gray-500">Memuat data anggota...</p>
              </div>
            ) : members.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <p className="text-lg font-medium">Belum ada data anggota</p>
                <p className="mt-2 text-sm">
                  Upload file CSV untuk menambahkan data
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b-2 border-gray-200 bg-gray-50">
                      <TableHead className="font-semibold text-gray-700">
                        ID
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Nama
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Email
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Jabatan
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Organisasi
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow
                        key={member.id}
                        className="border-b border-gray-200 hover:bg-blue-50/30"
                      >
                        <TableCell className="font-mono text-sm text-gray-600">
                          {member.id}
                        </TableCell>
                        <TableCell className="font-medium text-gray-900">
                          {member.name}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {member.email}
                        </TableCell>
                        <TableCell className="text-sm text-gray-700">
                          {member.position || "-"}
                        </TableCell>
                        <TableCell className="text-sm text-gray-700">
                          {member.organization || "-"}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                              member.status === "active"
                                ? "bg-gradient-to-r from-green-100 to-teal-100 text-green-700"
                                : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700"
                            }`}
                          >
                            {member.status}
                          </span>
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
