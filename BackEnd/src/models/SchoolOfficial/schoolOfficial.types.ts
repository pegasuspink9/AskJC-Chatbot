export interface CreateSchoolOfficial {
  name: string;
  title: string;
  department?: string;
  category: string;
}

export interface UpdateSchoolOfficial {
  name?: string;
  title?: string;
  department?: string;
  category?: string;
}
