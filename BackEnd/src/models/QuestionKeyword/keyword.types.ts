export interface QuestionKeyword {
  id: number;
  faq_id: number;
  keyword?: string | null;
  created_at?: Date | null;
}

export interface CreateQuestionKeyword {
  faq_id: number;
  keyword?: string;
  created_at?: Date;
}

export interface UpdateQuestionKeyword {
  keyword?: string;
}
