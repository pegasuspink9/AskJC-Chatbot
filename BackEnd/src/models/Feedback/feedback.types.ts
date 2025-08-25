export interface Feedback {
  id: number;
  query_id: number;
  user_id: number;
  rating?: number | null;
  comment?: string | null;
  resolved_issue?: boolean | null;
  created_at: Date;
}

export interface CreateFeedback {
  query_id: number;
  user_id: number;
  rating?: number | null;
  comment?: string | null;
  resolved_issue?: boolean | null;
}
