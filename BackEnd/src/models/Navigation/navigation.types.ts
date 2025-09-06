export interface CreateNavigation {
  nav_button: string;
  dropdown_menu: string;
  action: string;
  notes: string;
  link?: string;
}

export interface UpdateNavigation {
  nav_button?: string;
  dropdown_menu?: string;
  action?: string;
  notes?: string;
  link?: string;
}
