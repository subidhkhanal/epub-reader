/** @format */

// data/books.ts
import { Book } from "../types/book";

export const books: Book[] = [
  {
    id: "1",
    title: "The Diary of a Nobody",
    author: "Weedon Grossmith",
    coverImage: "/images/diary-of-a-nobody.jpg",
  },
  {
    id: "2",
    title: "The Complete Guide to Self-Control",
    author: "Jakub Jílek",
    coverImage: "/images/self-control.jpg",
  },
  {
    id: "3",
    title: "Fast This Way",
    author: "Dave Asprey",
    coverImage:
      "https://m.media-amazon.com/images/I/71dt+f08SFL._AC_UF894,1000_QL80_.jpg",
  },
  {
    id: "4",
    title: "Ten Mental Models for Learning Anything",
    author: "Scott h. Young",
    coverImage: "/images/mental-models.jpg",
  },
  {
    id: "5",
    title: "The Complete Guide to Memory",
    author: "Scott Young & Jakub Jílek",
    coverImage: "/images/memory.jpg",
  },
  {
    id: "6",
    title: "The Complete Guide to Motivation",
    author: "Scott Young",
    coverImage: "/images/motivation.jpg",
  },
];
