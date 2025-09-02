// src/types/collections.d.ts
import type { CollectionEntry } from "astro:content";

export type Tournament = CollectionEntry<"tournaments">;
export type Match = CollectionEntry<"matches">;
export type Member = CollectionEntry<"members">;
export type Article = CollectionEntry<"articles">;
export type Achievement = CollectionEntry<"achievements">;
export type Sponsor = CollectionEntry<"sponsors">;
export type Stadium = CollectionEntry<"stadiums">;

export type Event = {
  id: string;
  name: string;
  edition: number;
  description: string;
  code: string;
  enabled?: boolean;
  weight?: number;
  type: string;
  maxScore: number;
  participants: {
    [key: string]: number | undefined;
  };
  link?: string;
};

export type Events = Event[];

export type Roleplay = {
  id: string;
  name: string;
  edition: number;
  description: string;
  code: string;
  enabled?: boolean;
  weight?: number;
  maxScore?: number;
  participants: {
    [key: string]: number | undefined;
  };
};

export type Roleplays = Roleplay[];

export type Bonus = {
  id: string;
  name: string;
  edition: number;
  description: string;
  code: string;
  enabled?: boolean;
  weight?: number;
  maxScore?: number | string;
  participants: {
    [key: string]: number | undefined;
  };
};

export type Bonuses = Bonus[];
