export interface Office {
  id: number;
  office_name: string;
  description?: string | null;
  location_building?: string | null;
  operation_hours?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  fb_page?: string | null;
  office_url?: string | null;
  map_url?: string | null;
}

export interface CreateOffice {
  office_name: string;
  description?: string | null;
  location_building?: string | null;
  operation_hours?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  fb_page?: string | null;
  office_url?: string | null;
  map_url?: string | null;
}

export interface UpdateOffice {
  office_name?: string;
  description?: string | null;
  location_building?: string | null;
  operation_hours?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  fb_page?: string | null;
  office_url?: string | null;
  map_url?: string | null;
}
