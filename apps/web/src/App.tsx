import { useEffect, useMemo, useState } from "react";
import type { AbilityKey, HomebrewCharacter, HomebrewFeature } from "@foundry-homebrew-hub/shared";
import "./App.css";

type Page = "library" | "create" | "create-feature" | "create-character";

function App() {
  const [page, setPage] = useState<Page>("library");

  const [features, setFeatures] = useState<HomebrewFeature[]>([]);
  const [characters, setCharacters] = useState<HomebrewCharacter[]>([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<HomebrewFeature["type"] | "all">("all");

  const [name, setName] = useState("");
  const [type, setType] = useState<HomebrewFeature["type"]>("feat");
  const [description, setDescription] = useState("");
  const [editingFeatureId, setEditingFeatureId] = useState<string | null>(null);

  const [characterName, setCharacterName] = useState("Player Character");
  const [characterLevel, setCharacterLevel] = useState(1);
  const [characterClassName, setCharacterClassName] = useState("");
  const [characterSpecies, setCharacterSpecies] = useState("");
  const [characterBackground, setCharacterBackground] = useState("");
  const [characterHpMax, setCharacterHpMax] = useState(0);
  const [characterSpeed, setCharacterSpeed] = useState(30);

  const [characterAbilities, setCharacterAbilities] = useState<Record<AbilityKey, number>>({
    str: 10,
    dex: 10,
    con: 10,
    int: 10,
    wis: 10,
    cha: 10
  });

  
  async function loadFeatures() {
    const response = await fetch("http://localhost:3000/features");
    const data = await response.json();
    setFeatures(data);
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

    console.log("SAVE REQUEST:", method, url, featureData);

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(featureData)
    });

    console.log("SAVE RESPONSE:", response.status);

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
  }

  async function loadCharacters() {
    const response = await fetch("http://localhost:3000/characters");
    const data = await response.json();
    setCharacters(data);
  }

  async function saveCharacter() {
    if (!characterName.trim()) {
      alert("Character needs a name.");
      return;
    }

    const newCharacter: HomebrewCharacter = {
      id: crypto.randomUUID(),
      name: characterName,
      level: characterLevel,
      className: characterClassName,
      species: characterSpecies,
      background: characterBackground,
      abilities: characterAbilities,
      hpMax: characterHpMax,
      speed: characterSpeed,
      img: "icons/svg/mystery-man.svg"
    };

    const response = await fetch("http://localhost:3000/characters", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newCharacter)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Character save failed:", response.status, errorText);
      alert(`Failed to save character: ${response.status}`);
      return;
    }

    await loadCharacters();
    setPage("library");
  }

  async function deleteCharacter(character: HomebrewCharacter) {
    const confirmed = confirm(`Delete "${character.name}"?`);

    if (!confirmed) {
      return;
    }

    const response = await fetch(`http://localhost:3000/characters/${character.id}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      alert("Failed to delete character");
      return;
    }

    await loadCharacters();
  }

  function abilityMod(score: number) {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  }

  function updateAbility(ability: AbilityKey, value: number) {
    setCharacterAbilities((current) => ({
      ...current,
      [ability]: value
    }));
  }

  function exportCharacterActor(character: HomebrewCharacter) {
    const actor = {
      name: character.name,
      type: "character",
      img: character.img,
      system: {
        abilities: {
          str: { value: character.abilities.str, proficient: 0 },
          dex: { value: character.abilities.dex, proficient: 0 },
          con: { value: character.abilities.con, proficient: 0 },
          int: { value: character.abilities.int, proficient: 0 },
          wis: { value: character.abilities.wis, proficient: 0 },
          cha: { value: character.abilities.cha, proficient: 0 }
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
            burrow: 0,
            climb: 0,
            fly: 0,
            swim: 0,
            walk: character.speed,
            units: "ft",
            hover: false
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
        traits: {},
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

  function startEditingFeature(feature: HomebrewFeature) {
    setEditingFeatureId(feature.id);
    setName(feature.name);
    setType(feature.type);
    setDescription(feature.description);
    setPage("create-feature");
  }

  async function deleteFeature(feature: HomebrewFeature) {
    const confirmed = confirm(`Delete "${feature.name}"?`);

    if (!confirmed) {
      return;
    }

    console.log("DELETE REQUEST:", `http://localhost:3000/features/${feature.id}`, feature);

    const response = await fetch(`http://localhost:3000/features/${feature.id}`, {
      method: "DELETE"
    });

    console.log("DELETE RESPONSE:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Delete failed:", response.status, errorText);
      alert(`Delete failed: ${response.status}`);
      return;
    }

    await loadFeatures();
  }

  function cancelFeatureForm() {
    setName("");
    setType("feat");
    setDescription("");
    setEditingFeatureId(null);
    setPage("library");
  }

  function slugify(text: string) {
    return text
      .toLowerCase()
      .trim()
      .replaceAll(" ", "-")
      .replace(/[^a-z0-9-]/g, "");
  }

  function wrapHtml(text: string) {
    if (text.trim().startsWith("<")) {
      return text;
    }

    return `<p>${text}</p>`;
  }

  function formatType(type: HomebrewFeature["type"]) {
    const labels: Record<HomebrewFeature["type"], string> = {
      feat: "Feat",
      spell: "Spell",
      classFeature: "Class Feature",
      item: "Item",
      raceFeature: "Race Feature"
    };

    return labels[type];
  }

  function exportFeature(feature: HomebrewFeature) {
    const identifier = slugify(feature.name);

    const foundryType = feature.type === "spell" ? "spell" : "feat";

    const foundrySystemType =
      feature.type === "classFeature"
        ? { value: "class", subtype: "" }
        : feature.type === "raceFeature"
          ? { value: "race", subtype: "" }
          : feature.type === "item"
            ? { value: "feat", subtype: "general" }
            : { value: "feat", subtype: "general" };

    const foundryItem =
      foundryType === "spell"
        ? {
            name: feature.name,
            type: "spell",
            img: "systems/dnd5e/icons/svg/items/spell.svg",
            system: {
              description: {
                value: wrapHtml(feature.description),
                chat: ""
              },
              source: {
                custom: "Foundry Homebrew Hub",
                book: "",
                page: "",
                license: "",
                rules: "2024",
                revision: 1
              },
              activation: {
                type: "action",
                condition: "",
                value: 1
              },
              duration: {
                value: "",
                units: "inst"
              },
              target: {
                affects: {
                  type: "",
                  count: "",
                  choice: false,
                  special: ""
                },
                template: {
                  units: "ft",
                  contiguous: false,
                  type: "",
                  stationary: false
                }
              },
              range: {
                value: "",
                units: "self",
                special: ""
              },
              uses: {
                max: "",
                recovery: [],
                spent: 0
              },
              level: 0,
              school: "evo",
              materials: {
                value: "",
                consumed: false,
                cost: 0,
                supply: 0
              },
              properties: [],
              activities: {},
              identifier,
              method: "spell",
              prepared: 0
            },
            effects: [],
            flags: {
              "foundry-homebrew-hub": {
                originalId: feature.id,
                featureType: feature.type
              }
            },
            ownership: {
              default: 0
            }
          }
        : {
            name: feature.name,
            type: "feat",
            img: "systems/dnd5e/icons/svg/items/feature.svg",
            system: {
              activities: {},
              uses: {
                spent: 0,
                recovery: [],
                max: ""
              },
              advancement: {},
              description: {
                value: wrapHtml(feature.description),
                chat: ""
              },
              identifier,
              source: {
                custom: "Foundry Homebrew Hub",
                book: "",
                page: "",
                license: "",
                rules: "2024",
                revision: 1
              },
              crewed: false,
              enchant: {},
              prerequisites: {
                items: [],
                repeatable: false,
                level: null
              },
              properties: [],
              requirements: "",
              type: foundrySystemType
            },
            effects: [],
            flags: {
              "foundry-homebrew-hub": {
                originalId: feature.id,
                featureType: feature.type
              }
            },
            ownership: {
              default: 0
            }
          };

    const file = new Blob([JSON.stringify(foundryItem, null, 2)], {
      type: "application/json"
    });

    const url = URL.createObjectURL(file);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${identifier}.json`;
    link.click();

    URL.revokeObjectURL(url);
  }

  const filteredFeatures = useMemo(() => {
    return features.filter((feature) => {
      const matchesSearch =
        feature.name.toLowerCase().includes(search.toLowerCase()) ||
        feature.description.toLowerCase().includes(search.toLowerCase());

      const matchesType = filterType === "all" || feature.type === filterType;

      return matchesSearch && matchesType;
    });
  }, [features, search, filterType]);

  useEffect(() => {
    loadFeatures();
    loadCharacters();
  }, []);

  return (
    <main className="app-shell">
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
            Library
          </button>

          <button
            className={page === "create" ? "nav-button active" : "nav-button primary"}
            onClick={() => setPage("create")}
          >
            Create New
          </button>
        </div>
      </nav>

      {page === "library" && (
        <>
          <section className="hero">
            <div>
              <p className="eyebrow">Foundry VTT · D&D 5e</p>
              <h1>Your homebrew vault and character forge.</h1>
              <p className="hero-text">
                Create characters, spells, features, and items. Save them to your library,
                reuse community creations, and export them into Foundry.
              </p>
            </div>

            <div className="hero-card">
              <p className="hero-card-label">Current prototype</p>
              <strong>{features.length + characters.length}</strong>
              <span>saved creations</span>
            </div>
          </section>

          <section className="library-grid">
            <div className="library-panel">
              <div className="section-header">
                <div>
                  <p className="eyebrow">Personal Library</p>
                  <h2>My Creations</h2>
                </div>

                <button className="small-button" onClick={() => setPage("create")}>
                  + Create
                </button>
              </div>

              {characters.length === 0 && features.length === 0 ? (
                <div className="empty-state">
                  <h3>No creations yet.</h3>
                  <p>Create your first feature, spell, item, or character.</p>
                  <button className="primary-button" onClick={() => setPage("create")}>
                    Create New
                  </button>
                </div>
              ) : (
                <>
                  {characters.length > 0 && (
                    <>
                      <h3 className="library-subheading">Characters</h3>

                      <div className="card-list">
                        {characters.map((character) => (
                          <article className="creation-card character-card" key={character.id}>
                            <div>
                              <span className="type-pill">Character</span>
                              <h3>{character.name}</h3>
                              <p>
                                Level {character.level}
                                {character.className ? ` ${character.className}` : ""}
                                {character.species ? ` · ${character.species}` : ""}
                                {character.background ? ` · ${character.background}` : ""}
                              </p>
                            </div>

                            <div className="card-actions">
                              <button onClick={() => exportCharacterActor(character)}>
                                Export Actor
                              </button>

                              <button className="danger-button" onClick={() => deleteCharacter(character)}>
                                Delete
                              </button>
                            </div>
                          </article>
                        ))}
                      </div>
                    </>
                  )}

                  {features.length > 0 && (
                    <>
                      <h3 className="library-subheading">Features</h3>

                      <div className="card-list">
                        {features.map((feature) => (
                          <article className="creation-card" key={feature.id}>
                            <div>
                              <span className="type-pill">{formatType(feature.type)}</span>
                              <h3>{feature.name}</h3>
                              <p>{feature.description}</p>
                            </div>

                            <div className="card-actions">
                              <button onClick={() => exportFeature(feature)}>
                                Export
                              </button>

                              <button onClick={() => startEditingFeature(feature)}>
                                Edit
                              </button>

                              <button className="danger-button" onClick={() => deleteFeature(feature)}>
                                Delete
                              </button>
                            </div>
                          </article>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            <div className="library-panel">
              <div className="section-header">
                <div>
                  <p className="eyebrow">Community Library</p>
                  <h2>Browse Public Homebrew</h2>
                </div>
              </div>

              <div className="filters">
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search spells, feats, features..."
                />

                <select
                  value={filterType}
                  onChange={(event) =>
                    setFilterType(event.target.value as HomebrewFeature["type"] | "all")
                  }
                >
                  <option value="all">All Types</option>
                  <option value="feat">Feats</option>
                  <option value="spell">Spells</option>
                  <option value="classFeature">Class Features</option>
                  <option value="item">Items</option>
                  <option value="raceFeature">Race Features</option>
                </select>
              </div>

              {filteredFeatures.length === 0 ? (
                <div className="empty-state muted">
                  <h3>No matching homebrew found.</h3>
                  <p>For now, community content is using your test API data.</p>
                </div>
              ) : (
                <div className="card-list">
                  {filteredFeatures.map((feature) => (
                    <article className="creation-card community" key={feature.id}>
                      <div>
                        <span className="type-pill">{formatType(feature.type)}</span>
                        <h3>{feature.name}</h3>
                        <p>{feature.description}</p>
                      </div>

                      <div className="card-actions">
                        <button onClick={() => exportFeature(feature)}>
                          Export
                        </button>
                        <button disabled>Copy Later</button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {page === "create" && (
        <section className="page-panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">Create New</p>
              <h1>What do you want to build?</h1>
            </div>

            <button className="small-button" onClick={() => setPage("library")}>
              Back to Library
            </button>
          </div>

          <div className="create-grid">
            <button className="create-card" onClick={() => setPage("create-feature")}>
              <span>✨</span>
              <h3>Feature</h3>
              <p>Make a feat, class feature, race feature, or monster-like ability.</p>
            </button>

            <button className="create-card disabled" disabled>
              <span>📜</span>
              <h3>Spell</h3>
              <p>Create a spell with level, school, range, damage, and saves. Later.</p>
            </button>

            <button className="create-card" onClick={() => setPage("create-character")}>
              <span>🧙</span>
              <h3>Character</h3>
              <p>Build a D&D character and export it as a Foundry Actor.</p>
            </button>

            <button className="create-card disabled" disabled>
              <span>⚔️</span>
              <h3>Item</h3>
              <p>Create weapons, armor, equipment, and magic items. Later.</p>
            </button>

            <button className="create-card disabled" disabled>
              <span>🏛️</span>
              <h3>Class / Subclass</h3>
              <p>Build full class and subclass progression. Later.</p>
            </button>

            <button className="create-card disabled" disabled>
              <span>🌙</span>
              <h3>Race / Background</h3>
              <p>Create races, species, backgrounds, and starting traits. Later.</p>
            </button>
          </div>
        </section>
      )}

      {page === "create-feature" && (
        <section className="page-panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">Create New</p>
              <h1>{editingFeatureId ? "Edit Feature" : "Create Feature"}</h1>
            </div>

            <button className="small-button" onClick={() => setPage("create")}>
              Back
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
                placeholder="Write what the feature does..."
              />
            </label>

            <div className="form-actions">
              <button className="primary-button" onClick={saveFeature}>
                {editingFeatureId ? "Save Changes" : "Save to Library"}
              </button>

              <button onClick={cancelFeatureForm}>
                Cancel
              </button>
            </div>
          </div>
        </section>
      )}
      
      {page === "create-character" && (
        <section className="character-builder">
          <div className="character-banner">
            <button className="small-button" onClick={() => setPage("create")}>
              Back
            </button>

            <div>
              <p className="eyebrow">Create New</p>
              <h1>{characterName || "Player Character"}</h1>
            </div>

            <div className="level-badge">
              <span>Level</span>
              <strong>{characterLevel}</strong>
            </div>
          </div>

          <div className="character-layout">
            <aside className="character-sidebar">
              <div className="portrait-box">
                <span></span>
              </div>

              <label>
                Name
                <input
                  value={characterName}
                  onChange={(event) => setCharacterName(event.target.value)}
                />
              </label>

              <label>
                Level
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={characterLevel}
                  onChange={(event) => setCharacterLevel(Number(event.target.value))}
                />
              </label>

              <div className="mini-stats">
                <label>
                  HP Max
                  <input
                    type="number"
                    min={0}
                    value={characterHpMax}
                    onChange={(event) => setCharacterHpMax(Number(event.target.value))}
                  />
                </label>

                <label>
                  Speed
                  <input
                    type="number"
                    min={0}
                    value={characterSpeed}
                    onChange={(event) => setCharacterSpeed(Number(event.target.value))}
                  />
                </label>
              </div>
            </aside>

            <section className="character-main">
              <div className="ability-row">
                {(["str", "dex", "con", "int", "wis", "cha"] as AbilityKey[]).map((ability) => (
                  <label className="ability-card" key={ability}>
                    <span>{ability.toUpperCase()}</span>
                    <strong>{abilityMod(characterAbilities[ability])}</strong>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={characterAbilities[ability]}
                      onChange={(event) => updateAbility(ability, Number(event.target.value))}
                    />
                  </label>
                ))}
              </div>

              <div className="character-columns">
                <section className="sheet-panel">
                  <h2>Identity</h2>

                  <label>
                    Class
                    <input
                      value={characterClassName}
                      onChange={(event) => setCharacterClassName(event.target.value)}
                      placeholder="Fighter"
                    />
                  </label>

                  <label>
                    Species
                    <input
                      value={characterSpecies}
                      onChange={(event) => setCharacterSpecies(event.target.value)}
                      placeholder="Human"
                    />
                  </label>

                  <label>
                    Background
                    <input
                      value={characterBackground}
                      onChange={(event) => setCharacterBackground(event.target.value)}
                      placeholder="Acolyte"
                    />
                  </label>
                </section>

                <section className="sheet-panel">
                  <h2>Saving Throws</h2>

                  <div className="save-grid">
                    {(["str", "dex", "con", "int", "wis", "cha"] as AbilityKey[]).map((ability) => (
                      <div className="save-row" key={ability}>
                        <span>{ability.toUpperCase()}</span>
                        <strong>{abilityMod(characterAbilities[ability])}</strong>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="sheet-panel skills-panel">
                  <h2>Skills Preview</h2>

                  {[
                    ["DEX", "Acrobatics"],
                    ["WIS", "Animal Handling"],
                    ["INT", "Arcana"],
                    ["STR", "Athletics"],
                    ["CHA", "Deception"],
                    ["INT", "History"],
                    ["WIS", "Insight"],
                    ["CHA", "Intimidation"],
                    ["INT", "Investigation"],
                    ["WIS", "Medicine"],
                    ["INT", "Nature"],
                    ["WIS", "Perception"],
                    ["CHA", "Performance"],
                    ["CHA", "Persuasion"],
                    ["INT", "Religion"],
                    ["DEX", "Sleight of Hand"],
                    ["DEX", "Stealth"],
                    ["WIS", "Survival"]
                  ].map(([ability, skill]) => (
                    <div className="skill-row" key={skill}>
                      <span>{ability}</span>
                      <p>{skill}</p>
                      <strong>+0</strong>
                    </div>
                  ))}
                </section>
              </div>

              <div className="form-actions">
                <button className="primary-button" onClick={saveCharacter}>
                  Save Character
                </button>

                <button
                  onClick={() =>
                    exportCharacterActor({
                      id: crypto.randomUUID(),
                      name: characterName,
                      level: characterLevel,
                      className: characterClassName,
                      species: characterSpecies,
                      background: characterBackground,
                      abilities: characterAbilities,
                      hpMax: characterHpMax,
                      speed: characterSpeed,
                      img: "icons/svg/mystery-man.svg"
                    })
                  }
                >
                  Export Without Saving
                </button>
              </div>
            </section>
          </div>
        </section>
      )}
    </main>
  );
}

export default App;