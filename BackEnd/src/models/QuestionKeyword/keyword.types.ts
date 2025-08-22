export interface QuestionKeyword {
  id: number;
  faq_id: number;
  keyword?: string | null;
  created_at?: Date | null;
}

export interface CreateQuestionKeyword {
  faq_id: number;
  keyword?: string;
}

export interface UpdateQuestionKeyword {
  keyword?: string;
}
