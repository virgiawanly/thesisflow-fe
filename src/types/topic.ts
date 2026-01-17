import type { FieldTaxonomy } from "./field-taxonomy";

export const TopicOfferStatus = {
  ACTIVE: "ACTIVE",
  ARCHIVED: "ARCHIVED",
} as const;

export type TopicOfferStatus = (typeof TopicOfferStatus)[keyof typeof TopicOfferStatus];

export interface TopicOffer {
  id: number;
  lecturer_id: number;
  judul: string;
  deskripsi: string;
  keywords: string;
  prasyarat: string | null;
  kuota: number;
  bidang_id: number;
  field?: FieldTaxonomy;
  status: TopicOfferStatus;
  created_at?: string | null;
  updated_at?: string | null;
  pending_submissions_count?: number;
  assigned_submissions_count?: number;
}
