import { useMemo, useState } from "react";
import type { HomebrewCharacter, HomebrewFeature } from "@foundry-homebrew-hub/shared";
import type { SidebarTab } from "../../types/workspace";

type RightSidebarProps = {
  activeTab: SidebarTab;
  characters: HomebrewCharacter[];
  features: HomebrewFeature[];
  onTabChange: (tab: SidebarTab) => void;
  onCreateCharacter: () => void;
  onCreateFeature: () => void;
  onOpenCharacter: (character: HomebrewCharacter) => void;
  onOpenFeature: (feature: HomebrewFeature) => void;
};

function formatFeatureType(type: HomebrewFeature["type"]) {
  const labels: Record<HomebrewFeature["type"], string> = {
    feat: "Feat",
    spell: "Spell",
    classFeature: "Class Feature",
    item: "Item",
    raceFeature: "Race Feature"
  };

  return labels[type];
}

export function RightSidebar({
  activeTab,
  characters,
  features,
  onTabChange,
  onCreateCharacter,
  onCreateFeature,
  onOpenCharacter,
  onOpenFeature
}: RightSidebarProps) {
  const [search, setSearch] = useState("");

  const filteredCharacters = useMemo(() => {
    return characters.filter((character) =>
      character.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [characters, search]);

  const filteredFeatures = useMemo(() => {
    return features.filter((feature) =>
      feature.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [features, search]);

  return (
    <aside className="fh-sidebar">
      <div className="fh-sidebar-tabs">
        <button
          className={activeTab === "actors" ? "active" : ""}
          onClick={() => onTabChange("actors")}
        >
          Actors
        </button>

        <button
          className={activeTab === "items" ? "active" : ""}
          onClick={() => onTabChange("items")}
        >
          Items
        </button>
      </div>

      <div className="fh-sidebar-actions">
        {activeTab === "actors" ? (
          <button onClick={onCreateCharacter}>Create Actor</button>
        ) : (
          <button onClick={onCreateFeature}>Create Item</button>
        )}

        <button disabled>Create Folder</button>
      </div>

      <label className="fh-search">
        <span>Search {activeTab === "actors" ? "Actors" : "Items"}</span>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={activeTab === "actors" ? "Search Actors" : "Search Items"}
        />
      </label>

      {activeTab === "actors" && (
        <div className="fh-folder-tree">
          <div className="fh-folder">
            <div className="fh-folder-title">📁 Player Characters</div>

            {filteredCharacters.length === 0 ? (
              <p className="fh-empty">No actors yet.</p>
            ) : (
              filteredCharacters.map((character) => (
                <button
                  className="fh-document-row"
                  key={character.id}
                  onClick={() => onOpenCharacter(character)}
                >
                  <span className="fh-doc-icon">👤</span>
                  <span>{character.name}</span>
                  <small>Level {character.level}</small>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === "items" && (
        <div className="fh-folder-tree">
          <div className="fh-folder">
            <div className="fh-folder-title">📁 Homebrew Items</div>

            {filteredFeatures.length === 0 ? (
              <p className="fh-empty">No items yet.</p>
            ) : (
              filteredFeatures.map((feature) => (
                <button
                  className="fh-document-row"
                  key={feature.id}
                  onClick={() => onOpenFeature(feature)}
                >
                  <span className="fh-doc-icon">✦</span>
                  <span>{feature.name}</span>
                  <small>{formatFeatureType(feature.type)}</small>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </aside>
  );
}