export interface CreateFacilities {
  office_name?: string;
  map_name?: string;
  map_overview_url?: string;
  building: string;
  room_number?: string;
  office_url?: string;
  facility_name?: string;
  facility_url?: string;
  office_id?: number;
}

export interface UpdateFacilities {
  office_name?: string;
  map_name?: string;
  map_overview_url?: string;
  building?: string;
  room_number?: string;
  office_url?: string;
  facility_name?: string;
  facility_url?: string;
  office_id?: number;
}
