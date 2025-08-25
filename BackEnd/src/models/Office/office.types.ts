export interface Office {
  id: number;
  name: string;
  description?: string | null;
  location_building?: string | null;
  operation_hours?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  fb_page?: string | null;
}

export interface CreateOffice {
  name: string;
  description?: string | null;
  location_building?: string | null;
  operation_hours?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  fb_page?: string | null;
}

export interface UpdateOffice {
  name?: string;
  description?: string | null;
  location_building?: string | null;
  operation_hours?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  fb_page?: string | null;
}
