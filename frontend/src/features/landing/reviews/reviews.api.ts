"use client";

import { api } from "@/shared/utils/apiClient";

export type LandingReview = {
  reviewid: number;
  name: string;
  role?: string | null;
  company?: string | null;
  city?: string | null;
  rating: number;
  comment: string;
  source?: string | null;
  createdat: string;
};

export type ReviewSummary = {
  count: number;
  average: number;
};

export type CreateReviewPayload = {
  name: string;
  role?: string;
  company?: string;
  city?: string;
  email?: string;
  rating: number;
  comment: string;
};

export async function fetchLandingReviews(limit = 8) {
  const { data } = await api.get<LandingReview[]>("/reviews", {
    params: { limit },
  });

  return Array.isArray(data) ? data : [];
}

export async function fetchReviewSummary() {
  const { data } = await api.get<ReviewSummary>("/reviews/summary");
  return data;
}

export async function createLandingReview(payload: CreateReviewPayload) {
  const { data } = await api.post<LandingReview>("/reviews", payload);
  return data;
}
