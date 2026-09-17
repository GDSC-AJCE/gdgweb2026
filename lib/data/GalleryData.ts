export interface GalleryItem {
  id: string;
  src: string;
  caption: string;
  category?: string;
  originalName?: string;
}

export const PREVIOUS_GDSC_GALLERY: GalleryItem[] = [];
