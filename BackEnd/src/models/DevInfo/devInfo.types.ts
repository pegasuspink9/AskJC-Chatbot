export interface CreateDevInfo {
  dev_name: string;
  role: string;
  description?: string;
  image_url?: string;
}

export interface UpdateDevInfo {
  dev_name?: string;
  role?: string;
  description?: string;
  image_url?: string;
}
