export interface Contact {
  id: number;
  contact_name: string;
  fb_page?: string | null;
  email?: string | null;
}

export interface CreateContact {
  contact_name: string;
  fb_page?: string | null;
  email?: string | null;
}

export interface UpdateContact {
  contact_name?: string;
  fb_page?: string | null;
  email?: string | null;
}
