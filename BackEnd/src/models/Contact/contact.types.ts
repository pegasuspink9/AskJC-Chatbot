export interface Contact {
  id: number;
  name: string;
  fb_page?: string | null;
  email?: string | null;
}

export interface CreateContact {
  name: string;
  fb_page?: string | null;
  email?: string | null;
}

export interface UpdateContact {
  name?: string;
  fb_page?: string | null;
  email?: string | null;
}
