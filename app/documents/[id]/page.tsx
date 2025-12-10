"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Download,
  Trash2,
  ArrowLeft,
  Calendar,
  FileType,
  Tag,
  Hash,
  Loader2,
  AlertTriangle,
  Table2,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { documentsAPI } from "@/lib/api";
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

interface DocumentDetail {
  document: {
    id: number;
    filename: string;
    file_path: string;
    file_size: number;
    file_hash: string;
    document_type: string;
    category: string | null;
    tags: string[] | null;
    full_text: string;
    summary: string;
    extracted_entities: Record<string, any>;
    keywords: string[];
    tables_data: any[];
    page_count: number;
    pdf_metadata: Record<string, any>;
    ai_summary: string | null;
    ai_insights: Record<string, any> | null;
    processed: boolean;
    processed_at: string;
    uploaded_at: string;
    updated_at: string;
  };
  type_info: {
    name: string;
    description: string;
    icon: string;
  };
  content_stats: {
    text_length: number;
    keyword_count: number;
    table_count: number;
    entity_counts: Record<string, number>;
  };
}

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const documentId = params.id as string;

  // Fetch document detail
  const {
    data: documentData,
    isLoading,
    error,
  } = useQuery<DocumentDetail>({
    queryKey: ["document", documentId],
    queryFn: async () => {
      const response = await fetch(
        `http://localhost:8000/api/documents/${documentId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch document");
      }
      return response.json();
    },
  });

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
      router.push("/documents");
    },
    onError: (error) => {
      toast.error(`Gagal menghapus dokumen: ${error.message}`);
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate(parseInt(documentId));
  };

  const handleDownload = () => {
    // Create a download link for the file
    const link = document.createElement("a");
    link.href = `http://localhost:8000/${documentData?.document.file_path}`;
    link.download = documentData?.document.filename || "document.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Download dimulai...");
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (error || !documentData) {
    return (
      <AppLayout>
        <Card className="border-destructive">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <CardTitle>Dokumen Tidak Ditemukan</CardTitle>
            </div>
            <CardDescription>
              Dokumen dengan ID {documentId} tidak ditemukan atau terjadi
              kesalahan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/documents")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Daftar Dokumen
            </Button>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  const { document, type_info, content_stats } = documentData;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push("/documents")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleDownload}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="w-4 h-4" />
                  Hapus
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Hapus Dokumen?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Apakah Anda yakin ingin menghapus dokumen &quot;
                    {document.filename}
                    &quot;? Aksi ini tidak dapat dibatalkan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleteMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Menghapus...
                      </>
                    ) : (
                      "Ya, Hapus"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Document Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-6 h-6 text-primary" />
                  <CardTitle className="text-2xl">
                    {document.filename}
                  </CardTitle>
                </div>
                <CardDescription>{type_info.description}</CardDescription>
              </div>
              <Badge variant="secondary" className="text-sm">
                {type_info.name}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-start gap-3">
                <FileType className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Tipe Dokumen</p>
                  <p className="text-sm text-muted-foreground">
                    {document.document_type}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Hash className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Jumlah Halaman</p>
                  <p className="text-sm text-muted-foreground">
                    {document.page_count} halaman
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Tanggal Upload</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(document.uploaded_at).toLocaleDateString(
                      "id-ID",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Eye className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Ukuran File</p>
                  <p className="text-sm text-muted-foreground">
                    {(document.file_size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Category and Tags */}
            {(document.category ||
              (document.tags && document.tags.length > 0)) && (
              <>
                <div className="space-y-3">
                  {document.category && (
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Kategori:</span>
                      <Badge variant="outline">{document.category}</Badge>
                    </div>
                  )}

                  {document.tags && document.tags.length > 0 && (
                    <div className="flex items-start gap-2">
                      <Tag className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <span className="text-sm font-medium">Tags:</span>
                      <div className="flex flex-wrap gap-2">
                        {document.tags.map((tag, idx) => (
                          <Badge key={idx} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <Separator />
              </>
            )}

            {/* Content Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">
                      {content_stats.text_length.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Karakter Teks
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">
                      {content_stats.keyword_count}
                    </p>
                    <p className="text-xs text-muted-foreground">Keywords</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">
                      {content_stats.table_count}
                    </p>
                    <p className="text-xs text-muted-foreground">Tabel</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">
                      {Object.values(content_stats.entity_counts).reduce(
                        (a, b) => a + b,
                        0
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">Entities</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        {document.summary && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ringkasan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {document.summary}
              </p>
            </CardContent>
          </Card>
        )}

        {/* AI Summary */}
        {document.ai_summary && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🤖 Ringkasan AI</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {document.ai_summary}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Keywords */}
        {document.keywords && document.keywords.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Keywords</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {document.keywords.map((keyword, idx) => (
                  <Badge key={idx} variant="outline">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tables */}
        {document.tables_data && document.tables_data.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Table2 className="w-5 h-5" />
                <CardTitle className="text-lg">
                  Tabel Ekstraksi ({document.tables_data.length})
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {document.tables_data
                .slice(0, 3)
                .map((table: any, idx: number) => (
                  <div key={idx} className="space-y-2">
                    <p className="text-sm font-medium">
                      Tabel {idx + 1} (Halaman {table.page}) - {table.rows}{" "}
                      baris × {table.cols} kolom
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border">
                        <tbody>
                          {table.data
                            .slice(0, 5)
                            .map((row: any[], rowIdx: number) => (
                              <tr key={rowIdx} className="border-b">
                                {row.map((cell: any, cellIdx: number) => (
                                  <td
                                    key={cellIdx}
                                    className="border-r px-2 py-1 text-xs"
                                  >
                                    {cell || "-"}
                                  </td>
                                ))}
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                    {table.data.length > 5 && (
                      <p className="text-xs text-muted-foreground">
                        ... dan {table.data.length - 5} baris lainnya
                      </p>
                    )}
                  </div>
                ))}
              {document.tables_data.length > 3 && (
                <p className="text-sm text-muted-foreground">
                  ... dan {document.tables_data.length - 3} tabel lainnya
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Full Text Content */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Konten Lengkap</CardTitle>
            <CardDescription>
              Teks lengkap hasil ekstraksi dari dokumen PDF
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto bg-muted/30 p-4 rounded-md">
              <pre className="text-xs whitespace-pre-wrap font-mono">
                {document.full_text || "Tidak ada teks yang diekstrak"}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
