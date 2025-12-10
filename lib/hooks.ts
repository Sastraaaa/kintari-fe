/**
 * React Query Hooks untuk Kintari API
 * Menggunakan TanStack Query untuk state management & caching
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  membersAPI,
  documentsAPI,
  organizationAPI,
  chatAPI,
  statsAPI,
} from "./api";
import { formatErrorMessage } from "./error-handler";
import { toast } from "sonner";

// ============= QUERY KEYS =============
export const queryKeys = {
  members: ["members"] as const,
  documents: ["documents"] as const,
  organization: ["organization"] as const,
  organizationLatest: ["organization", "latest"] as const,
  organizationById: (id: number) => ["organization", id] as const,
  stats: ["stats"] as const,
  chatContext: ["chat", "context"] as const,
  // Analytics keys for statistics page
  analytics: ["analytics"] as const,
  analyticsMembers: ["analytics", "members"] as const,
  analyticsDocuments: ["analytics", "documents"] as const,
  analyticsOverview: ["analytics", "overview"] as const,
};

// ============= MEMBERS HOOKS =============

/**
 * Hook untuk fetch semua anggota
 */
export function useMembers() {
  return useQuery({
    queryKey: queryKeys.members,
    queryFn: membersAPI.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook untuk upload CSV anggota
 */
export function useUploadMembers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => membersAPI.uploadCSV(file),
    onSuccess: () => {
      // Invalidate all related queries untuk auto-refresh
      queryClient.invalidateQueries({ queryKey: queryKeys.members });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats });
      // Auto-refresh statistics page
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics });
      queryClient.invalidateQueries({ queryKey: queryKeys.analyticsMembers });
      queryClient.invalidateQueries({ queryKey: queryKeys.analyticsOverview });
      queryClient.invalidateQueries({ queryKey: queryKeys.chatContext });
    },
  });
}

/**
 * Hook untuk delete member by ID
 */
export function useDeleteMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => membersAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.members });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics });
      queryClient.invalidateQueries({ queryKey: queryKeys.analyticsMembers });
    },
  });
}

/**
 * Hook untuk delete all members
 */
export function useDeleteAllMembers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => membersAPI.deleteAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.members });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics });
      queryClient.invalidateQueries({ queryKey: queryKeys.analyticsMembers });
    },
  });
}

// ============= DOCUMENTS HOOKS =============

/**
 * Hook untuk fetch semua dokumen dari Universal Knowledge Base
 * Supports filtering by document_type, category, and search
 */
export function useDocuments(params?: {
  skip?: number;
  limit?: number;
  document_type?: string;
  category?: string;
  search?: string;
  sort_by?: string;
}) {
  return useQuery({
    queryKey: params ? [...queryKeys.documents, params] : queryKeys.documents,
    queryFn: () => documentsAPI.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook untuk upload dokumen ke Universal Knowledge Base
 * Mendukung ANY type of PDF document dengan auto-detection
 */
export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      category,
      tags,
      generate_ai_summary = true,
    }: {
      file: File;
      category?: string;
      tags?: string;
      generate_ai_summary?: boolean;
    }) => documentsAPI.upload(file, { category, tags, generate_ai_summary }),
    onSuccess: () => {
      // Invalidate all related queries untuk auto-refresh
      queryClient.invalidateQueries({ queryKey: queryKeys.documents });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats });
      queryClient.invalidateQueries({ queryKey: queryKeys.chatContext });
      // Auto-refresh statistics page
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics });
      queryClient.invalidateQueries({ queryKey: queryKeys.analyticsDocuments });
      queryClient.invalidateQueries({ queryKey: queryKeys.analyticsOverview });
    },
  });
}

/**
 * Hook untuk delete document by ID
 */
export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => documentsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics });
      queryClient.invalidateQueries({ queryKey: queryKeys.analyticsDocuments });
      queryClient.invalidateQueries({ queryKey: queryKeys.chatContext });
    },
  });
}

/**
 * Hook untuk delete all documents
 */
export function useDeleteAllDocuments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => documentsAPI.deleteAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics });
      queryClient.invalidateQueries({ queryKey: queryKeys.analyticsDocuments });
      queryClient.invalidateQueries({ queryKey: queryKeys.chatContext });
    },
  });
}

// ============= ORGANIZATION HOOKS =============

/**
 * Hook untuk upload PDF HIPMI
 */
export function useUploadOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => organizationAPI.uploadPDF(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organization });
      queryClient.invalidateQueries({ queryKey: queryKeys.organizationLatest });
      queryClient.invalidateQueries({ queryKey: queryKeys.chatContext });
    },
  });
}

/**
 * Hook untuk fetch data organisasi terbaru
 */
export function useLatestOrganization() {
  return useQuery({
    queryKey: queryKeys.organizationLatest,
    queryFn: organizationAPI.getLatest,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook untuk fetch semua data organisasi
 */
export function useOrganizations() {
  return useQuery({
    queryKey: queryKeys.organization,
    queryFn: organizationAPI.getAll,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook untuk fetch data organisasi by ID
 */
export function useOrganization(id: number) {
  return useQuery({
    queryKey: queryKeys.organizationById(id),
    queryFn: () => organizationAPI.getById(id),
    enabled: !!id, // Only run if id exists
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// ============= CHAT HOOKS =============

/**
 * Hook untuk send message ke AI
 */
export function useSendMessage() {
  return useMutation({
    mutationFn: ({
      query,
      context,
      conversation_history,
    }: {
      query: string;
      context?: string;
      conversation_history?: Array<{ role: string; content: string }>;
    }) => chatAPI.sendMessage(query, context, conversation_history),
  });
}

/**
 * Hook untuk fetch chat context
 */
export function useChatContext() {
  return useQuery({
    queryKey: queryKeys.chatContext,
    queryFn: chatAPI.getContext,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

// ============= STATS HOOKS =============

/**
 * Hook untuk fetch statistik overview
 */
export function useStats() {
  return useQuery({
    queryKey: queryKeys.stats,
    queryFn: statsAPI.getStats,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// ============= HELPER HOOKS =============

/**
 * Hook untuk handle error dengan toast notification
 */
export function useAPIError() {
  return {
    handleError: (error: unknown) => {
      const message = formatErrorMessage(error);
      console.error("API Error:", message);
      toast.error(message);
      return message;
    },
  };
}
