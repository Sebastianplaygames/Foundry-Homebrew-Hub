import { useEffect, useState } from "react";
import type { HomebrewCharacter, HomebrewFeature } from "@foundry-homebrew-hub/shared";
import { CharacterSheet } from "./components/sheets/CharacterSheet";
import { FoundryWorkspace } from "./components/workspace/FoundryWorkspace";
import type { SidebarTab, WorkspaceWindow } from "./types/workspace";
import "./App.css";

type Page = "library" | "create" | "create-feature" | "create-character";

type ExportableCharacter = HomebrewCharacter & {
  proficiencies?: {
    saves?: Record<string, boolean>;
    skills?: Record<string, boolean>;
    armor?: string[];
    weapons?: string[];
    languages?: string[];
    senses?: string[];
    resistances?: string[];
    damageImmunities?: string[];
    conditionImmunities?: string[];
    vulnerabilities?: string[];
  };
};

function App() {
  const [page, setPage] = useState<Page>("library");

  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTab>("actors");
  const [workspaceWindows, setWorkspaceWindows] = useState<WorkspaceWindow[]>([]);
  const [nextWindowZIndex, setNextWindowZIndex] = useState(10);

  const [features, setFeatures] = useState<HomebrewFeature[]>([]);
  const [characters, setCharacters] = useState<HomebrewCharacter[]>([]);

  const [name, setName] = useState("");
  const [type, setType] = useState<HomebrewFeature["type"]>("feat");
  const [description, setDescription] = useState("");
  const [editingFeatureId, setEditingFeatureId] = useState<string | null>(null);

  async function loadFeatures() {
    const response = await fetch("http://localhost:3000/features");
    const data = await response.json();
    setFeatures(data);
  }

  async function loadCharacters() {
    const response = await fetch("http://localhost:3000/characters");
    const data = await response.json();
    setCharacters(data);
  }

  async function saveFeature() {
    if (!name.trim()) {
      alert("Feature needs a name.");
      return;
    }

    if (!description.trim()) {
      alert("Feature needs a description.");
      return;
    }

    const featureData: HomebrewFeature = {
      id: editingFeatureId ?? crypto.randomUUID(),
      name,
      type,
      description
    };

    const url = editingFeatureId
      ? `http://localhost:3000/features/${editingFeatureId}`
      : "http://localhost:3000/features";

    const method = editingFeatureId ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(featureData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Save/update failed:", response.status, errorText);
      alert(`Save/update failed: ${response.status}`);
      return;
    }

    setName("");
    setType("feat");
    setDescription("");
    setEditingFeatureId(null);

    await loadFeatures();
    setPage("library");
    setActiveSidebarTab("items");
  }

  async function saveCharacterDocument(character: HomebrewCharacter) {
    const alreadyExists = characters.some((entry) => entry.id === character.id);

    const response = await fetch(
      alreadyExists
        ? `http://localhost:3000/characters/${character.id}`
        : "http://localhost:3000/characters",
      {
        method: alreadyExists ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(character)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Character save failed:", response.status, errorText);
      alert(`Failed to save character: ${response.status}`);
      return;
    }

    await loadCharacters();
    setActiveSidebarTab("actors");
  }

  function openWorkspaceWindow(window: Omit<WorkspaceWindow, "id" | "zIndex">) {
    const id = crypto.randomUUID();

    setWorkspaceWindows((current) => [
      ...current,
      {
        ...window,
        id,
        zIndex: nextWindowZIndex,
        isMinimized: false
      }
    ]);

    setNextWindowZIndex((current) => current + 1);
  }

  function closeWorkspaceWindow(id: string) {
    setWorkspaceWindows((current) => current.filter((window) => window.id !== id));
  }

  function focusWorkspaceWindow(id: string) {
    setWorkspaceWindows((current) =>
      current.map((window) =>
        window.id === id
          ? {
              ...window,
              zIndex: nextWindowZIndex
            }
          : window
      )
    );

    setNextWindowZIndex((current) => current + 1);
  }

  function moveWorkspaceWindow(id: string, x: number, y: number) {
    setWorkspaceWindows((current) =>
      current.map((window) =>
        window.id === id
          ? {
              ...window,
              x,
              y
            }
          : window
      )
    );
  }

  function resizeWorkspaceWindow(id: string, width: number, height: number) {
    setWorkspaceWindows((current) =>
      current.map((window) =>
        window.id === id
          ? {
              ...window,
              width,
              height
            }
          : window
      )
    );
  }

  function toggleMinimizeWorkspaceWindow(id: string) {
    setWorkspaceWindows((current) =>
      current.map((window) =>
        window.id === id
          ? {
              ...window,
              isMinimized: !window.isMinimized
            }
          : window
      )
    );
  }

  function openNewCharacterWindow() {
    openWorkspaceWindow({
      type: "character",
      title: "New Character",
      x: 90,
      y: 60,
      width: 1180,
      height: 760
    });
  }

  function openCharacterWindow(character: HomebrewCharacter) {
    const existingWindow = workspaceWindows.find(
      (window) => window.type === "character" && window.documentId === character.id
    );

    if (existingWindow) {
      focusWorkspaceWindow(existingWindow.id);
      return;
    }

    openWorkspaceWindow({
      type: "character",
      title: character.name,
      documentId: character.id,
      x: 90,
      y: 60,
      width: 1180,
      height: 760
    });
  }

  function openFeatureWindow(feature: HomebrewFeature) {
    const existingWindow = workspaceWindows.find(
      (window) => window.type === "feature" && window.documentId === feature.id
    );

    if (existingWindow) {
      focusWorkspaceWindow(existingWindow.id);
      return;
    }

    openWorkspaceWindow({
      type: "feature",
      title: feature.name,
      documentId: feature.id,
      x: 180,
      y: 120,
      width: 620,
      height: 560
    });
  }

  function renderWorkspaceWindow(window: WorkspaceWindow) {
    if (window.type === "character") {
      const character = characters.find((entry) => entry.id === window.documentId);

      return (
        <CharacterSheet
          initialCharacter={character}
          onSave={saveCharacterDocument}
          onExport={exportCharacterActor}
          onClose={() => closeWorkspaceWindow(window.id)}
          windowed
        />
      );
    }

    if (window.type === "feature") {
      const feature = features.find((entry) => entry.id === window.documentId);

      return (
        <div className="fh-window-placeholder">
          <h3>{feature?.name ?? "Feature"}</h3>
          <p>{feature?.description ?? "Feature sheet window goes here next."}</p>
        </div>
      );
    }

    return (
      <div className="fh-window-placeholder">
        <h3>{window.title}</h3>
        <p>Window content goes here.</p>
      </div>
    );
  }

  function slugify(text: string) {
    return text
      .toLowerCase()
      .trim()
      .replaceAll(" ", "-")
      .replace(/[^a-z0-9-]/g, "");
  }

  function exportCharacterActor(character: ExportableCharacter) {
    const proficiencies: Required<NonNullable<ExportableCharacter["proficiencies"]>> = {
      saves: character.proficiencies?.saves ?? {},
      skills: character.proficiencies?.skills ?? {},
      armor: character.proficiencies?.armor ?? [],
      weapons: character.proficiencies?.weapons ?? [],
      languages: character.proficiencies?.languages ?? [],
      senses: character.proficiencies?.senses ?? [],
      resistances: character.proficiencies?.resistances ?? [],
      damageImmunities: character.proficiencies?.damageImmunities ?? [],
      conditionImmunities: character.proficiencies?.conditionImmunities ?? [],
      vulnerabilities: character.proficiencies?.vulnerabilities ?? []
    };

    const armorCodeMap: Record<string, string> = {
      "Light Armor": "lgt",
      "Medium Armor": "med",
      "Heavy Armor": "hvy",
      Shields: "shl"
    };

    const weaponCodeMap: Record<string, string> = {
      "Simple Weapons": "sim",
      "Martial Weapons": "mar",
      Clubs: "club",
      Daggers: "dagger",
      Greatclubs: "greatclub",
      Handaxes: "handaxe",
      Javelins: "javelin",
      "Light Hammers": "lighthammer",
      Maces: "mace",
      Quarterstaffs: "quarterstaff",
      Sickles: "sickle",
      Spears: "spear",
      "Light Crossbows": "lightcrossbow",
      Darts: "dart",
      Shortbows: "shortbow",
      Slings: "sling",
      Battleaxes: "battleaxe",
      Flails: "flail",
      Glaives: "glaive",
      Greataxes: "greataxe",
      Greatswords: "greatsword",
      Halberds: "halberd",
      Lances: "lance",
      Longswords: "longsword",
      Mauls: "maul",
      Morningstars: "morningstar",
      Pikes: "pike",
      Rapiers: "rapier",
      Scimitars: "scimitar",
      Shortswords: "shortsword",
      Tridents: "trident",
      "War Picks": "warpick",
      Warhammers: "warhammer",
      Whips: "whip",
      Blowguns: "blowgun",
      "Hand Crossbows": "handcrossbow",
      "Heavy Crossbows": "heavycrossbow",
      Longbows: "longbow",
      Nets: "net"
    };

    const languageCodeMap: Record<string, string> = {
      Common: "common",
      Dwarvish: "dwarvish",
      Elvish: "elvish",
      Giant: "giant",
      Gnomish: "gnomish",
      Goblin: "goblin",
      Halfling: "halfling",
      Orc: "orc",
      Abyssal: "abyssal",
      Celestial: "celestial",
      Draconic: "draconic",
      "Deep Speech": "deep",
      Infernal: "infernal",
      Primordial: "primordial",
      Sylvan: "sylvan",
      Undercommon: "undercommon"
    };

    const damageCodeMap: Record<string, string> = {
      Acid: "acid",
      Bludgeoning: "bludgeoning",
      Cold: "cold",
      Fire: "fire",
      Force: "force",
      Lightning: "lightning",
      Necrotic: "necrotic",
      Piercing: "piercing",
      Poison: "poison",
      Psychic: "psychic",
      Radiant: "radiant",
      Slashing: "slashing",
      Thunder: "thunder"
    };

    const conditionCodeMap: Record<string, string> = {
      Blinded: "blinded",
      Charmed: "charmed",
      Deafened: "deafened",
      Exhaustion: "exhaustion",
      Frightened: "frightened",
      Grappled: "grappled",
      Incapacitated: "incapacitated",
      Invisible: "invisible",
      Paralyzed: "paralyzed",
      Petrified: "petrified",
      Poisoned: "poisoned",
      Prone: "prone",
      Restrained: "restrained",
      Stunned: "stunned",
      Unconscious: "unconscious"
    };

    function mapValues(values: string[] | undefined, map: Record<string, string>) {
      return (values ?? []).map((value) => map[value] ?? value);
    }

    function skillValue(skill: string) {
      return proficiencies.skills?.[skill] ? 1 : 0;
    }

    function saveValue(ability: string) {
      return proficiencies.saves?.[ability] ? 1 : 0;
    }

    const actor = {
      name: character.name,
      type: "character",
      img: character.img,
      system: {
        abilities: {
          str: { value: character.abilities.str, proficient: saveValue("str") },
          dex: { value: character.abilities.dex, proficient: saveValue("dex") },
          con: { value: character.abilities.con, proficient: saveValue("con") },
          int: { value: character.abilities.int, proficient: saveValue("int") },
          wis: { value: character.abilities.wis, proficient: saveValue("wis") },
          cha: { value: character.abilities.cha, proficient: saveValue("cha") }
        },

        skills: {
          acr: { ability: "dex", value: skillValue("acr") },
          ani: { ability: "wis", value: skillValue("ani") },
          arc: { ability: "int", value: skillValue("arc") },
          ath: { ability: "str", value: skillValue("ath") },
          dec: { ability: "cha", value: skillValue("dec") },
          his: { ability: "int", value: skillValue("his") },
          ins: { ability: "wis", value: skillValue("ins") },
          itm: { ability: "cha", value: skillValue("itm") },
          inv: { ability: "int", value: skillValue("inv") },
          med: { ability: "wis", value: skillValue("med") },
          nat: { ability: "int", value: skillValue("nat") },
          prc: { ability: "wis", value: skillValue("prc") },
          prf: { ability: "cha", value: skillValue("prf") },
          per: { ability: "cha", value: skillValue("per") },
          rel: { ability: "int", value: skillValue("rel") },
          slt: { ability: "dex", value: skillValue("slt") },
          ste: { ability: "dex", value: skillValue("ste") },
          sur: { ability: "wis", value: skillValue("sur") }
        },

        attributes: {
          hp: {
            value: character.hpMax,
            max: character.hpMax,
            temp: 0,
            tempmax: 0
          },
          ac: {
            flat: null,
            calc: "default"
          },
          init: {
            ability: "",
            bonus: ""
          },
          movement: {
            burrow: "",
            climb: "",
            fly: "",
            swim: "",
            walk: String(character.speed),
            units: "ft",
            hover: false
          },
          senses: {
            ranges: {
              blindsight: proficiencies.senses?.includes("Blindsight") ? 30 : null,
              darkvision: proficiencies.senses?.includes("Darkvision") ? 60 : null,
              tremorsense: proficiencies.senses?.includes("Tremorsense") ? 30 : null,
              truesight: proficiencies.senses?.includes("Truesight") ? 30 : null
            },
            units: "ft",
            special: ""
          }
        },

        details: {
          level: character.level,
          race: character.species,
          background: character.background,
          originalClass: character.className,
          xp: {
            value: 0
          }
        },

        traits: {
          size: "med",

          di: {
            value: mapValues(proficiencies.damageImmunities, damageCodeMap),
            custom: "",
            bypasses: []
          },

          dr: {
            value: mapValues(proficiencies.resistances, damageCodeMap),
            custom: "",
            bypasses: []
          },

          dv: {
            value: mapValues(proficiencies.vulnerabilities, damageCodeMap),
            custom: "",
            bypasses: []
          },

          dm: {
            amount: {},
            bypasses: []
          },

          ci: {
            value: mapValues(proficiencies.conditionImmunities, conditionCodeMap),
            custom: ""
          },

          languages: {
            value: mapValues(proficiencies.languages, languageCodeMap),
            custom: "",
            communication: {}
          },

          weaponProf: {
            value: mapValues(proficiencies.weapons, weaponCodeMap),
            custom: "",
            mastery: {
              value: [],
              bonus: []
            }
          },

          armorProf: {
            value: mapValues(proficiencies.armor, armorCodeMap),
            custom: ""
          }
        },

        currency: {
          pp: 0,
          gp: 0,
          ep: 0,
          sp: 0,
          cp: 0
        }
      },

      items: [],
      effects: [],
      flags: {
        "foundry-homebrew-hub": {
          originalId: character.id
        }
      },
      ownership: {
        default: 0
      }
    };

    const file = new Blob([JSON.stringify(actor, null, 2)], {
      type: "application/json"
    });

    const url = URL.createObjectURL(file);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${slugify(character.name)}-actor.json`;
    link.click();

    URL.revokeObjectURL(url);
  }

  function cancelFeatureForm() {
    setName("");
    setType("feat");
    setDescription("");
    setEditingFeatureId(null);
    setPage("library");
  }

  useEffect(() => {
    loadFeatures();
    loadCharacters();
  }, []);

  return (
    <main className="app-shell">
      {page !== "library" && (
        <nav className="topbar">
          <button className="brand-button" onClick={() => setPage("library")}>
            <span className="brand-mark">F</span>
            <span>Foundry Homebrew Hub</span>
          </button>

          <div className="nav-actions">
            <button
              className={page === "library" ? "nav-button active" : "nav-button"}
              onClick={() => setPage("library")}
            >
              Workspace
            </button>

            <button
              className={page === "create" ? "nav-button active" : "nav-button primary"}
              onClick={() => setPage("create")}
            >
              Create New
            </button>
          </div>
        </nav>
      )}

      {page === "library" && (
        <FoundryWorkspace
          activeSidebarTab={activeSidebarTab}
          characters={characters}
          features={features}
          windows={workspaceWindows}
          onSidebarTabChange={setActiveSidebarTab}
          onCreateCharacter={openNewCharacterWindow}
          onCreateFeature={() => setPage("create-feature")}
          onOpenCharacter={openCharacterWindow}
          onOpenFeature={openFeatureWindow}
          onCloseWindow={closeWorkspaceWindow}
          onFocusWindow={focusWorkspaceWindow}
          onMoveWindow={moveWorkspaceWindow}
          onResizeWindow={resizeWorkspaceWindow}
          onToggleMinimizeWindow={toggleMinimizeWorkspaceWindow}
          renderWindow={renderWorkspaceWindow}
        />
      )}

      {page === "create" && (
        <section className="page-panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">Create New</p>
              <h1>What do you want to build?</h1>
            </div>

            <button className="small-button" onClick={() => setPage("library")}>
              Back to Workspace
            </button>
          </div>

          <div className="create-grid">
            <button className="create-card" onClick={() => setPage("create-feature")}>
              <span>✨</span>
              <h3>Feature / Item</h3>
              <p>Create a feat, class feature, race feature, or item-like ability.</p>
            </button>

            <button className="create-card disabled" disabled>
              <span>📜</span>
              <h3>Spell</h3>
              <p>Create a spell with level, school, range, damage, and saves. Later.</p>
            </button>

            <button className="create-card" onClick={() => setPage("create-character")}>
              <span>🧙</span>
              <h3>Character / Actor</h3>
              <p>Build a D&D character and export it as a Foundry Actor.</p>
            </button>

            <button className="create-card disabled" disabled>
              <span>⚔️</span>
              <h3>Equipment</h3>
              <p>Create weapons, armor, equipment, and magic items. Later.</p>
            </button>

            <button className="create-card disabled" disabled>
              <span>🏛️</span>
              <h3>Class / Subclass</h3>
              <p>Build full class and subclass progression. Later.</p>
            </button>

            <button className="create-card disabled" disabled>
              <span>🌙</span>
              <h3>Species / Background</h3>
              <p>Create species, backgrounds, and starting traits. Later.</p>
            </button>
          </div>
        </section>
      )}

      {page === "create-feature" && (
        <section className="page-panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">Create New</p>
              <h1>{editingFeatureId ? "Edit Item" : "Create Item"}</h1>
            </div>

            <button className="small-button" onClick={() => setPage("library")}>
              Back to Workspace
            </button>
          </div>

          <div className="form-card">
            <label>
              Name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Divine Smite Variant"
              />
            </label>

            <label>
              Type
              <select
                value={type}
                onChange={(event) => setType(event.target.value as HomebrewFeature["type"])}
              >
                <option value="feat">Feat</option>
                <option value="spell">Spell</option>
                <option value="classFeature">Class Feature</option>
                <option value="item">Item</option>
                <option value="raceFeature">Race Feature</option>
              </select>
            </label>

            <label>
              Description
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Write what the item/feature does..."
              />
            </label>

            <div className="form-actions">
              <button className="primary-button" onClick={saveFeature}>
                {editingFeatureId ? "Save Changes" : "Save to Library"}
              </button>

              <button onClick={cancelFeatureForm}>Cancel</button>
            </div>
          </div>
        </section>
      )}

      {page === "create-character" && (
        <CharacterSheet
          onSave={async (character) => {
            await saveCharacterDocument(character);
            setPage("library");
          }}
          onExport={exportCharacterActor}
          onClose={() => setPage("library")}
        />
      )}
    </main>
  );
}

export default App;