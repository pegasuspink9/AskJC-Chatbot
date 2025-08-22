export interface Faq {
  id: number;
  department_id: number;
  question?: string | null;
  answer?: string | null;
  category?: string | null;
}

export interface CreateFaq {
  department_id: number;
  question?: string;
  answer?: string;
  category?: string;
}

export interface UpdateFaq {
  question?: string;
  answer?: string;
  category?: string;
}
