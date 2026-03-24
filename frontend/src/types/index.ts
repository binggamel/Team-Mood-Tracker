export type User = {
  id: number;
  name: string;
  login_id: string;
  role: "admin" | "member";
};

export type MoodType = {
  id: number;
  key: string;
  label: string;
  emoji: string;
  color: string;
};

export type Entry = {
  id: number;
  user: number;
  user_name: string;
  date: string;
  mood_type: number;
  mood_emoji: string;
  mood_label: string;
  mood_color: string;
  comment: string;
};
