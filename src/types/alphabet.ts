export type AlphabetDate = {
  id: string;
  letter: string;
  title: string;
  description?: string | null;
  scheduled_at?: string | null;
  completed_at?: string | null;
  created_at?: string;
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
