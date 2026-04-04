// src/types/collections.d.ts
import type { CollectionEntry } from "astro:content";

export type Tournament = CollectionEntry<"tournaments">;
export type Match = CollectionEntry<"matches">;
export type Member = CollectionEntry<"members">;
export type Article = CollectionEntry<"articles">;
export type Achievement = CollectionEntry<"achievements">;
export type Sponsor = CollectionEntry<"sponsors">;
export type Stadium = CollectionEntry<"stadiums">;
export type EventEntry = CollectionEntry<"events">;
export type RoleplayEntry = CollectionEntry<"roleplays">;
export type BonusEntry = CollectionEntry<"bonuses">;

export type Event = EventEntry["data"];

export type Events = Event[];

export type Roleplay = RoleplayEntry["data"];

export type Roleplays = Roleplay[];

export type Bonus = BonusEntry["data"];

export type Bonuses = Bonus[];
