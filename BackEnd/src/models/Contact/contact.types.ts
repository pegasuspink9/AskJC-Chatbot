export interface Contact {
  id: number;
  school_detail_id: number;
  info?: string | null;
  website?: string | null;
  number?: string | null;
}

export interface CreateContact {
  school_detail_id: number;
  info?: string;
  website?: string;
  number?: string;
}

export interface UpdateContact extends Partial<CreateContact> {}
