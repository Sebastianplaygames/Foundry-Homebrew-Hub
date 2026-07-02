import { z } from "zod";

export const FoundryItemTypeSchema = z.enum([
  "feat",
  "spell",
  "race",
  "class",
  "subclass",
  "background",
  "weapon",
  "equipment",
  "consumable",
  "tool",
  "loot",
  "container"
]);

export type FoundryItemType = z.infer<typeof FoundryItemTypeSchema>;

export const FoundryFeatSystemTypeSchema = z.enum([
  "feat",
  "class",
  "race",
  "monster"
]);

export type FoundryFeatSystemType = z.infer<typeof FoundryFeatSystemTypeSchema>;

export const FoundryVisibilitySchema = z.enum([
  "private",
  "public",
  "unlisted"
]);

export type FoundryVisibility = z.infer<typeof FoundryVisibilitySchema>;

export const FoundryItemSchema = z
  .object({
    name: z.string().min(1),
    type: FoundryItemTypeSchema,
    img: z.string().optional(),

    system: z.record(z.string(), z.unknown()),

    effects: z.array(z.unknown()).default([]),
    flags: z.record(z.string(), z.unknown()).default({}),
    ownership: z.record(z.string(), z.unknown()).optional(),

    folder: z.string().optional(),
    _stats: z.record(z.string(), z.unknown()).optional()
  })
  .passthrough();

export type FoundryItem = z.infer<typeof FoundryItemSchema>;

export const HomebrewCreationSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  visibility: FoundryVisibilitySchema.default("private"),

  documentType: z.literal("Item"),
  foundry: FoundryItemSchema,

  tags: z.array(z.string()).default([]),

  createdByUserId: z.string().nullable().default(null),
  copiedFromId: z.string().nullable().default(null),

  createdAt: z.string(),
  updatedAt: z.string()
});

export type HomebrewCreation = z.infer<typeof HomebrewCreationSchema>;

/**
 * TEMP LEGACY MODEL
 * Keep this for now so the current frontend/API does not fully explode
 * while we migrate one piece at a time.
 */
export const HomebrewFeatureSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["feat", "spell", "classFeature", "item", "raceFeature"]),
  description: z.string(),
  levelRequirement: z.number().optional()
});

export type HomebrewFeature = z.infer<typeof HomebrewFeatureSchema>;

export const AbilityKeySchema = z.enum(["str", "dex", "con", "int", "wis", "cha"]);

export type AbilityKey = z.infer<typeof AbilityKeySchema>;

export const AbilityScoresSchema = z.object({
  str: z.number().min(1).max(30),
  dex: z.number().min(1).max(30),
  con: z.number().min(1).max(30),
  int: z.number().min(1).max(30),
  wis: z.number().min(1).max(30),
  cha: z.number().min(1).max(30)
});

export type AbilityScores = z.infer<typeof AbilityScoresSchema>;

export const HomebrewCharacterSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  level: z.number().min(1).max(20),

  className: z.string().default(""),
  species: z.string().default(""),
  background: z.string().default(""),

  abilities: AbilityScoresSchema,

  hpMax: z.number().min(0).default(0),
  speed: z.number().min(0).default(30),

  img: z.string().default("icons/svg/mystery-man.svg")
});

export type HomebrewCharacter = z.infer<typeof HomebrewCharacterSchema>;