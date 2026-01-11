export interface Contact {
  name: string;
  address: string;
  avatar?: string; // Optional visual helper
}

// Available avatar images for contact selection
export const AVAILABLE_AVATARS = [
  "/images/profiles-mockup/profile-1.jpg",
  "/images/profiles-mockup/profile-2.jpg",
  "/images/profiles-mockup/profile-3.jpg",
  "/images/profiles-mockup/profile-4.jpg",
  "/images/profiles-mockup/profile-5.jpg",
  "/images/profiles-mockup/profile-6.jpg",
  "/images/profiles-mockup/profile-7.jpg",
  "/images/profiles-mockup/profile-8.jpg",
  "/images/profiles-mockup/profile-9.jpg",
  "/images/profiles-mockup/profile-10.jpg",
  "/images/profiles-mockup/profile-11.jpg",
  "/images/profiles-mockup/profile-12.jpg",
];

// You can expand this later to load from LocalStorage or an API
export const PRELOADED_CONTACTS: Contact[] = [
  {
    name: "John Claimer",
    address: "0xa2a3523faed7d26fe8cc791c7077a99c96ef2edd",
    avatar: "/images/profiles-mockup/profile-1.jpg",
  },
  {
    name: "Jane Defender",
    address: "0xfe26c7555707e7353958447cf72c628552c0abb2",
    avatar: "/images/profiles-mockup/profile-2.jpg",
  },
  {
    name: "Bob Claimer",
    address: "0x3AE66a6DB20fCC27F3DB3DE5Fe74C108A52d6F29",
    avatar: "/images/profiles-mockup/profile-3.jpg",
  },
  {
    name: "Alice Defender",
    address: "0x58609c13942F56e17d36bcB926C413EBbD10e477",
    avatar: "/images/profiles-mockup/profile-4.jpg",
  },
];
