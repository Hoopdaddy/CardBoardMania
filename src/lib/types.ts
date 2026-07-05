export type ComponentType =
  | "profile"
  | "gallery"
  | "want_list"
  | "have_list"
  | "shows"
  | "socials";

export const COMPONENT_LABELS: Record<ComponentType, string> = {
  profile: "Profile / Bio",
  gallery: "Image Gallery",
  want_list: "Want List",
  have_list: "Have List",
  shows: "Show Calendar",
  socials: "Social Links",
};

export interface Profile {
  id: string;
  username: string;
  tier: string;
  location: string | null;
  created_at: string;
}

export interface Page {
  id: string;
  user_id: string;
  slug: string;
  theme: string;
  created_at: string;
}

export interface PageComponent {
  id: string;
  page_id: string;
  type: ComponentType;
  config: Record<string, unknown>;
  position: number;
}

export interface Card {
  id: string;
  category: string;
  subcategory: string | null;
  set_name: string | null;
  year: string | null;
  card_number: string | null;
  name: string;
  variant: string | null;
  image_url: string | null;
  source_vendor: string | null;
}

export interface WantHaveItem {
  id: string;
  user_id: string;
  card_id: string;
  notes: string | null;
  grade_preference: string | null;
  created_at: string;
  cards?: Card;
}

export interface ShowEvent {
  id: string;
  user_id: string;
  name: string;
  date: string;
  location: string | null;
  notes: string | null;
}

export interface SocialLink {
  id: string;
  user_id: string;
  platform: string;
  url: string;
}

export interface GalleryImage {
  url: string;
  caption?: string;
}

export interface ProfileConfig {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
}

export const SOCIAL_PLATFORMS = [
  "Instagram",
  "X / Twitter",
  "Facebook",
  "TikTok",
  "YouTube",
  "eBay",
  "Whatnot",
  "Other",
] as const;
