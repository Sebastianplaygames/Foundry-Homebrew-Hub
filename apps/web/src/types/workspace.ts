export type SidebarTab = "actors" | "items";

export type ItemCreationType =
  | "background"
  | "class"
  | "consumable"
  | "container"
  | "equipment"
  | "facility"
  | "feature"
  | "loot"
  | "species"
  | "spell"
  | "subclass"
  | "tool"
  | "weapon";

export type WorkspaceWindowType =
  | "item-type-picker"
  | "character"
  | "feature"
  | "spell"
  | "item"
  | "class"
  | "subclass"
  | "species"
  | "background"
  | "weapon"
  | "equipment"
  | "consumable"
  | "container"
  | "tool"
  | "loot"
  | "facility"
  | "folder";

export type WorkspaceWindow = {
  id: string;
  type: WorkspaceWindowType;
  title: string;
  documentId?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  isMinimized?: boolean;
};