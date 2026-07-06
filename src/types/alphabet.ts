export type AlphabetDate = {
  id: string;
  letter: string;
  title: string;
  description?: string | null;
  scheduled_at?: string | null;
  completed_at?: string | null;
  created_at?: string;
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
