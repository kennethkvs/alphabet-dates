export type AlphabetDate = {
  id: string;
  letter: string;
  title: string;
  status: DateStatus | null;
  location: string | null;
  note: string | null;
};

export type AlphabetDateRow = AlphabetDate & {
  description?: string | null;
  scheduled_at?: string | null;
  completed_at?: string | null;
  created_at?: string | null;
};

export type Photo = {
  id: string;
  date_id: string;
  filename: string;
  variant_urls: {
    thumb: string;
    medium: string;
    original: string;
  };
  caption?: string | null;
  created_at?: string;
};

export type PhotoRow = {
  id: string;
  date_id: string;
  filename: string;
  thumb_path: string;
  medium_path: string;
  original_path: string;
  image_url: string;
  caption?: string | null;
  created_at?: string | null;
};

export type InviteRow = {
  id: string;
  token: string;
  email: string;
  invited_by: string | null;
  auth_user_id: string | null;
  used: boolean | null;
  expires_at: string | null;
  created_at?: string | null;
};

export type ApiMessage = {
  error?: string;
  ok?: boolean;
  url?: string;
};

export type Filter = "all" | DateStatus | "empty";

export type DateStatus = "completed" | "planned";

export const dateOptions: Intl.DateTimeFormatOptions = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
};
