export interface Chat {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
}

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export type RootStackParamList = {
  Home: undefined;
};


export type RootTabParamList = {
  Home: undefined;
};

export type HomeStackParamList = {
  HomeScreen: undefined;
};

export type ChatStackParamList = {
  ChatList: undefined;
  ChatDetail: { chatId: string };
};


