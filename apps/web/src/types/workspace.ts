export type SidebarTab = "actors" | "items";

export type WorkspaceWindowType =
  | "character"
  | "feature"
  | "spell"
  | "item"
  | "class"
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