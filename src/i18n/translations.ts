export const languages = [
  { code: "en", name: "English", flag: "🇬🇧" },
];

export type TranslationKey = keyof typeof en;

const en = {
  hero_title_1: "Buy & Sell",
  hero_title_2: "Anything",
  hero_title_3: "Instantly",
  hero_subtitle: "The fastest marketplace to list products and find great deals.",
  list_product: "List Your Product",
  fast_listing: "Fast Listing",
  fast_listing_desc: "List items in seconds",
  secure_transactions: "Secure Transactions",
  secure_transactions_desc: "Guaranteed purchases",
  global_reach: "Global Reach",
  global_reach_desc: "Connect with buyers everywhere",
  discover_products: "Discover Products",
  products_available: "products available",
  no_products: "No products yet",
  no_products_desc: "Be the first to list a product!",
  post_first_product: "Post Your First Product",
  filters: "Filters",
  reset: "Reset",
  categories: "Categories",
  all_categories: "All Categories",
  electronics: "Electronics",
  clothing: "Clothing",
  home_garden: "Home & Garden",
  furniture: "Furniture",
  vehicles: "Vehicles",
  art_crafts: "Art & Crafts",
  music: "Music",
  sports: "Sports",
  books: "Books",
  other: "Other",
  settings: "Settings",
  profile: "Profile",
  sign_out: "Sign Out",
  appearance: "Appearance",
  customize_look: "Customize the look of the app",
  dark_mode: "Dark Mode",
  using_dark: "Currently using dark theme",
  using_light: "Currently using light theme",
  language: "Language",
  select_language: "Select your preferred language",
  preferred_country: "Preferred Country",
  select_country: "Filter products by country",
  all_countries: "All Countries (No filter)",
  search_country: "Search country...",
  search_language: "Search language...",
  search_products: "Search products...",
  post_product: "Post Product",
  sign_in_required: "Sign In Required",
  sign_in_desc: "You need to sign in to post products.",
  sign_in_google: "Sign in with Google",
  maybe_later: "Maybe Later",
};

export const translations: Record<string, typeof en> = { en };

export const getTranslation = (_lang: string, key: TranslationKey): string => {
  return en[key] ?? key;
};
