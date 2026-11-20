export type Role = 'lid' | 'leiding';
export type GroupId = 'ribbels' | 'speelclub' | 'rakwi' | 'tito' | 'keti' | 'aspi';
export type ChannelId = 'community' | 'leiding' | GroupId;

export interface Profile {
  name: string;
  role: Role;
  group: GroupId | null;
}

export interface Message {
  id: string;
  channel: ChannelId;
  author: string;
  authorRole: Role;
  text: string;
  ts: number;
}

export interface EventItem {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  location: string;
  channel: ChannelId;
}

export interface FileItem {
  id: string;
  name: string;
  size?: number;
  uri: string;
  mime?: string;
  channel: ChannelId;
  uploader: string;
  ts: number;
}

export interface State {
  profile: Profile;
  messages: Message[];
  events: EventItem[];
  files: FileItem[];
}
