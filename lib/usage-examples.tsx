/**
 * Example: Cara Menggunakan React Query Hooks
 * File ini menunjukkan best practices integrasi FE-BE
 */

"use client";

import { useState } from "react";
import {
  useMembers,
  useUploadMembers,
  useDocuments,
  useUploadDocument,
  useUploadOrganization,
  useSendMessage,
  useStats,
  useAPIError,
} from "@/lib/hooks";
import { Button } from "@/components/ui/button";

// ============= EXAMPLE 1: Fetch & Display Members =============
export function MembersListExample() {
  const { data, isLoading, error } = useMembers();
  const { handleError } = useAPIError();

  if (isLoading) return <div>Loading members...</div>;

  if (error) {
    return <div>Error: {handleError(error)}</div>;
  }

  if (!data || !data.data) {
    return <div>No members found</div>;
  }

  return (
    <div>
      <h2>Total Members: {data.total}</h2>
      <ul>
        {data.data.map((member) => (
          <li key={member.id}>
            {member.name} - {member.email} - {member.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============= EXAMPLE 2: Upload CSV Members =============
export function UploadMembersExample() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const uploadMutation = useUploadMembers();
  const { handleError } = useAPIError();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      const result = await uploadMutation.mutateAsync(selectedFile);
      console.log("Upload success:", result);
      alert(`Berhasil import ${result.imported} anggota!`);
      setSelectedFile(null);
    } catch (error) {
      alert(handleError(error));
    }
  };

  return (
    <div>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        disabled={uploadMutation.isPending}
      />

      <Button
        onClick={handleUpload}
        disabled={!selectedFile || uploadMutation.isPending}
      >
        {uploadMutation.isPending ? "Uploading..." : "Upload CSV"}
      </Button>

      {uploadMutation.isSuccess && (
        <p className="text-green-600">Upload berhasil!</p>
      )}
    </div>
  );
}

// ============= EXAMPLE 3: Upload Document =============
export function UploadDocumentExample() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<string>("OTHER");
  const uploadMutation = useUploadDocument();
  const { handleError } = useAPIError();

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      const result = await uploadMutation.mutateAsync({
        file: selectedFile,
        docType,
      });
      console.log("Document uploaded:", result);
      alert(`Dokumen berhasil diupload! ID: ${result.document_id}`);
      setSelectedFile(null);
    } catch (error) {
      alert(handleError(error));
    }
  };

  return (
    <div>
      <select
        value={docType}
        onChange={(e) => setDocType(e.target.value)}
        disabled={uploadMutation.isPending}
      >
        <option value="OTHER">Other</option>
        <option value="PO">Pedoman Organisasi</option>
        <option value="SK">Surat Keputusan</option>
        <option value="AD_ART">AD/ART</option>
      </select>

      <input
        type="file"
        accept=".pdf,.docx"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
          }
        }}
        disabled={uploadMutation.isPending}
      />

      <Button
        onClick={handleUpload}
        disabled={!selectedFile || uploadMutation.isPending}
      >
        {uploadMutation.isPending ? "Uploading..." : "Upload Document"}
      </Button>
    </div>
  );
}

// ============= EXAMPLE 4: Upload HIPMI PDF (Organization) =============
export function UploadHIPMIPDFExample() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const uploadMutation = useUploadOrganization();
  const { handleError } = useAPIError();

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      const result = await uploadMutation.mutateAsync(selectedFile);
      console.log("HIPMI PDF uploaded:", result);
      alert(
        `PDF HIPMI berhasil diekstrak!\n` +
          `Organization ID: ${result.organization_id}\n` +
          `${result.message}`
      );
      setSelectedFile(null);
    } catch (error) {
      alert(handleError(error));
    }
  };

  return (
    <div>
      <h3>Upload PDF HIPMI untuk Ekstraksi Otomatis</h3>
      <input
        type="file"
        accept=".pdf"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
          }
        }}
        disabled={uploadMutation.isPending}
      />

      <Button
        onClick={handleUpload}
        disabled={!selectedFile || uploadMutation.isPending}
      >
        {uploadMutation.isPending ? "Processing..." : "Upload & Extract"}
      </Button>

      {uploadMutation.isPending && (
        <p>Sedang mengekstrak data HIPMI dari PDF...</p>
      )}
    </div>
  );
}

// ============= EXAMPLE 5: AI Chatbot =============
export function ChatbotExample() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<
    Array<{ role: string; text: string }>
  >([]);
  const sendMutation = useSendMessage();
  const { handleError } = useAPIError();

  const handleSend = async () => {
    if (!query.trim()) return;

    // Tambah user message
    setMessages((prev) => [...prev, { role: "user", text: query }]);

    try {
      const result = await sendMutation.mutateAsync({ query });

      // Tambah AI response
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: result.response },
      ]);

      setQuery("");
    } catch (error) {
      alert(handleError(error));
      // Remove user message jika error
      setMessages((prev) => prev.slice(0, -1));
    }
  };

  return (
    <div>
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <strong>{msg.role === "user" ? "You" : "AI"}:</strong> {msg.text}
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          placeholder="Tanya tentang HIPMI..."
          disabled={sendMutation.isPending}
        />
        <Button onClick={handleSend} disabled={sendMutation.isPending}>
          {sendMutation.isPending ? "Sending..." : "Send"}
        </Button>
      </div>
    </div>
  );
}

// ============= EXAMPLE 6: Statistics Dashboard =============
export function StatsDashboardExample() {
  const { data, isLoading, error } = useStats();
  const { handleError } = useAPIError();

  if (isLoading) return <div>Loading stats...</div>;

  if (error) {
    return <div>Error: {handleError(error)}</div>;
  }

  const stats = data?.data;

  return (
    <div>
      <h2>Dashboard Statistik</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Organizations</h3>
          <p>{stats?.total_organizations || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Latest Organization</h3>
          <p>{stats?.latest_organization || "N/A"}</p>
        </div>
        <div className="stat-card">
          <h3>Last Updated</h3>
          <p>{stats?.last_updated || "N/A"}</p>
        </div>
      </div>
    </div>
  );
}

// ============= EXAMPLE 7: Documents List =============
export function DocumentsListExample() {
  const { data, isLoading, error, refetch } = useDocuments();
  const { handleError } = useAPIError();

  if (isLoading) return <div>Loading documents...</div>;

  if (error) {
    return (
      <div>
        <p>Error: {handleError(error)}</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  if (!data || !data.data) {
    return <div>No documents found</div>;
  }

  return (
    <div>
      <h2>Documents ({data.total})</h2>
      <table>
        <thead>
          <tr>
            <th>Filename</th>
            <th>Type</th>
            <th>Size</th>
            <th>Upload Date</th>
            <th>Processed</th>
          </tr>
        </thead>
        <tbody>
          {data.data.map((doc) => (
            <tr key={doc.id}>
              <td>{doc.filename}</td>
              <td>{doc.document_type}</td>
              <td>{(doc.file_size / 1024).toFixed(2)} KB</td>
              <td>{new Date(doc.upload_date).toLocaleDateString()}</td>
              <td>{doc.processed ? "✅" : "❌"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
