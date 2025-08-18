// src/types/collections.d.ts
import type { CollectionEntry } from "astro:content";

export type Tournament = CollectionEntry<"tournaments">;
export type Match = CollectionEntry<"matches">;
export type Member = CollectionEntry<"members">;
export type Article = CollectionEntry<"articles">;
export type Achievement = CollectionEntry<"achievements">;
export type Sponsor = CollectionEntry<"sponsors">;
