import type { HomebrewCharacter, HomebrewFeature } from "@foundry-homebrew-hub/shared";
import type { ReactNode } from "react";
import type { SidebarTab, WorkspaceWindow } from "../../types/workspace";
import { FoundryWindow } from "./FoundryWindow";
import { RightSidebar } from "./RightSidebar";

type FoundryWorkspaceProps = {
  activeSidebarTab: SidebarTab;
  characters: HomebrewCharacter[];
  features: HomebrewFeature[];
  windows: WorkspaceWindow[];
  onSidebarTabChange: (tab: SidebarTab) => void;
  onCreateCharacter: () => void;
  onCreateFeature: () => void;
  onOpenCharacter: (character: HomebrewCharacter) => void;
  onOpenFeature: (feature: HomebrewFeature) => void;
  onCloseWindow: (id: string) => void;
  onFocusWindow: (id: string) => void;
  onMoveWindow: (id: string, x: number, y: number) => void;
  onResizeWindow: (id: string, width: number, height: number) => void;
  onToggleMinimizeWindow: (id: string) => void;
  renderWindow: (window: WorkspaceWindow) => ReactNode;
};

export function FoundryWorkspace({
  activeSidebarTab,
  characters,
  features,
  windows,
  onSidebarTabChange,
  onCreateCharacter,
  onCreateFeature,
  onOpenCharacter,
  onOpenFeature,
  onCloseWindow,
  onFocusWindow,
  onMoveWindow,
  onResizeWindow,
  onToggleMinimizeWindow,
  renderWindow
}: FoundryWorkspaceProps) {
  return (
    <section className="fh-workspace">
      <main className="fh-scene">
        <div className="fh-scene-logo">
          <div className="fh-dice-logo">20</div>
          <h1>Foundry Homebrew Hub</h1>
          <p>Homebrew workspace</p>
        </div>

        <div className="fh-window-layer">
          {windows.map((window) => (
            <FoundryWindow
              key={window.id}
              window={window}
              onClose={onCloseWindow}
              onFocus={onFocusWindow}
              onMove={onMoveWindow}
              onResize={onResizeWindow}
              onToggleMinimize={onToggleMinimizeWindow}
            >
              {renderWindow(window)}
            </FoundryWindow>
          ))}
        </div>
      </main>

      <RightSidebar
        activeTab={activeSidebarTab}
        characters={characters}
        features={features}
        onTabChange={onSidebarTabChange}
        onCreateCharacter={onCreateCharacter}
        onCreateFeature={onCreateFeature}
        onOpenCharacter={onOpenCharacter}
        onOpenFeature={onOpenFeature}
      />
    </section>
  );
}