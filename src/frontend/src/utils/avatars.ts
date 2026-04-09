// Avatar images and helpers
export const AVATAR_IMAGES = [
  "/assets/images_10-019d595b-5b56-730d-8310-c616443ac9d4.jpeg",
  "/assets/images_11-019d595b-5b75-747d-b227-d97efd033eed.jpeg",
  "/assets/images_12-019d595b-5baf-7054-a266-0a562060ca2b.jpeg",
  "/assets/pngtree-cute-anime-characters-png-image_16575021-019d595b-5d0b-755a-9c41-47f3d5a185d4.png",
  "/assets/pngtree-a-cute-anime-girl-with-cat-ear-png-image_20314943-019d595b-693f-713d-98c5-f5b29564eb28.png",
];

export const AVATAR_NAMES = ["Yuki", "Sakura", "Hana", "Miko", "Neko"];

export function getAvatarUrl(index: number): string {
  const i = Math.max(0, Math.min(index, AVATAR_IMAGES.length - 1));
  return AVATAR_IMAGES[i];
}

export const AVATAR_STORAGE_KEY = "conectarcar_avatar_index";

export function getStoredAvatarIndex(): number {
  const stored = localStorage.getItem(AVATAR_STORAGE_KEY);
  return stored ? Number.parseInt(stored, 10) : 0;
}

export function setStoredAvatarIndex(index: number): void {
  localStorage.setItem(AVATAR_STORAGE_KEY, String(index));
}
