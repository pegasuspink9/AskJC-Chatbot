export interface CreateSchoolOfficial {
  official_name: string;
  title: string;
  department?: string;
  category: string;
}

export interface UpdateSchoolOfficial {
  official_name?: string;
  title?: string;
  department?: string;
  category?: string;
}
