"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { membersAPI } from "@/lib/api";
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
import { Upload, FileText } from "lucide-react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";

export default function MembersPage() {
  const [csvData, setCsvData] = useState<unknown[]>([]);
  const queryClient = useQueryClient();

  const { data: members, isLoading } = useQuery({
    queryKey: ["members"],
    queryFn: membersAPI.getAll,
  });

  const uploadMutation = useMutation({
    mutationFn: membersAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      setCsvData([]);
    },
  });

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      Papa.parse(file, {
        complete: (result) => {
          setCsvData(result.data);
        },
        header: true,
        skipEmptyLines: true,
      });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
    },
    maxFiles: 1,
  });

  const handleImport = () => {
    if (csvData.length > 0) {
      uploadMutation.mutate(csvData);
    }
  };

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
                Format: ID, Nama, Email, Department, Status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div
                {...getRootProps()}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-16 transition-all ${
                  isDragActive
                    ? "border-[#155dfc] bg-blue-50"
                    : csvData.length > 0
                    ? "border-green-500 bg-green-50"
                    : "border-gray-300 bg-gray-50 hover:border-[#155dfc] hover:bg-blue-50/50"
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
                ) : csvData.length > 0 ? (
                  <div className="mt-4 text-center">
                    <p className="text-lg font-semibold text-green-700">
                      ✓ File berhasil dibaca
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      {csvData.length} baris data siap diimport
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

              {csvData.length > 0 && (
                <Button
                  onClick={handleImport}
                  disabled={uploadMutation.isPending}
                  className="h-14 w-full bg-gradient-to-r from-[#155dfc] via-[#009689] to-[#0092b8] text-base shadow-lg hover:shadow-xl"
                >
                  <Upload className="mr-2 h-5 w-5" />
                  {uploadMutation.isPending
                    ? "Mengimport..."
                    : `Import ${csvData.length} Data Anggota`}
                </Button>
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
                  {`id,nama,email,department,status
001,John Doe,john@example.com,IT,Aktif
002,Jane Smith,jane@example.com,HR,Aktif`}
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
              👥 Data Anggota Terkini
            </CardTitle>
            <CardDescription>
              Menampilkan data anggota yang telah tersimpan di sistem
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="py-12 text-center text-gray-500">Loading...</div>
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
                        Department
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members?.map((member) => (
                      <TableRow
                        key={member.id}
                        className="border-b border-gray-200 hover:bg-blue-50/30"
                      >
                        <TableCell className="font-mono text-sm text-gray-600">
                          {member.id}
                        </TableCell>
                        <TableCell className="font-medium text-gray-900">
                          {member.nama}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {member.email}
                        </TableCell>
                        <TableCell className="text-sm text-gray-700">
                          {member.department}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full bg-gradient-to-r from-green-100 to-teal-100 px-3 py-1 text-xs font-semibold text-green-700">
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
