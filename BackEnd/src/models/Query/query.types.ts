export interface CreateQuery {
  id?: number;
  user_id: number;
  chatbot_session_id: number;
  query_text?: string;
  users_data_inputed?: string;
  chatbot_response?: string;
  created_at?: Date;
}
