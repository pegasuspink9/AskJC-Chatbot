export interface Greeting {
  id: number;
  message?: string | null;
}

export interface CreateGreeting {
  message?: string;
}

export interface UpdateGreeting {
  message?: string;
}
