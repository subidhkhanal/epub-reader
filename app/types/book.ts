/** @format */

// types/book.ts
export interface Book {
  //@ts-ignore
  id: string;
  title: string;
  author?: string; // Optional if not available during upload
  coverImage?: string; // You might want to allow custom cover images later
  fileUrl: string;
}
