export interface SchoolFaq {
  id: number;
  school_detail_id: number;
  question?: string | null;
  answer?: string | null;
  category?: string | null;
  priority?: number | null;
  view_count?: number | null;
  is_active?: boolean | null;
  created_at?: Date | null;
  updated_at?: Date | null;
}

export interface CreateSchoolFaq {
  school_detail_id: number;
  question?: string;
  answer?: string;
  category?: string;
  priority?: number;
  view_count?: number;
  is_active?: boolean;
}

export interface UpdateSchoolFaq {
  id: number;
  school_detail_id: number;
  question?: string | null;
  answer?: string | null;
  category?: string | null;
  priority?: number | null;
  view_count?: number | null;
  is_active?: boolean | null;
  created_at?: Date | null;
  updated_at?: Date | null;
}
