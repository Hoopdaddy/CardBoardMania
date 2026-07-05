/** Usernames that would collide with app routes or look official. */
export const RESERVED_USERNAMES = new Set([
  "admin",
  "administrator",
  "api",
  "app",
  "about",
  "account",
  "billing",
  "blog",
  "cards",
  "cardboardmania",
  "contact",
  "dashboard",
  "discover",
  "help",
  "login",
  "logout",
  "mail",
  "marketplace",
  "official",
  "privacy",
  "search",
  "settings",
  "shop",
  "signup",
  "support",
  "terms",
  "www",
]);

export const USERNAME_REGEX = /^[a-z0-9-]{3,20}$/;

export function validateUsername(username: string): string | null {
  const u = username.toLowerCase().trim();
  if (!USERNAME_REGEX.test(u)) {
    return "Username must be 3-20 characters: lowercase letters, numbers, and hyphens only.";
  }
  if (RESERVED_USERNAMES.has(u)) {
    return "That username is reserved.";
  }
  return null;
}
