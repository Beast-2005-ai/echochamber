// src/types.ts
export interface FeedItem {
  title: string;
  origin_title?: string;
  is_mutation: boolean;
  distance_score: number;
  timestamp: number;
}