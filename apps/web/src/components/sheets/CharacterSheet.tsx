import { useState } from "react";
import type { AbilityKey, HomebrewCharacter } from "@foundry-homebrew-hub/shared";

type CharacterTab =
  | "details"
  | "inventory"
  | "features"
  | "spells"
  | "effects"
  | "biography"
  | "specialTraits";

type CharacterSheetProps = {
  initialCharacter?: HomebrewCharacter;
  onSave: (character: HomebrewCharacter) => Promise<void> | void;
  onExport: (character: HomebrewCharacter) => void;
  onClose?: () => void;
  windowed?: boolean;
};

const abilityKeys: AbilityKey[] = ["str", "dex", "con", "int", "wis", "cha"];

const skills: [AbilityKey, string][] = [
  ["dex", "Acrobatics"],
  ["wis", "Animal Handling"],
  ["int", "Arcana"],
  ["str", "Athletics"],
  ["cha", "Deception"],
  ["int", "History"],
  ["wis", "Insight"],
  ["cha", "Intimidation"],
  ["int", "Investigation"],
  ["wis", "Medicine"],
  ["int", "Nature"],
  ["wis", "Perception"],
  ["cha", "Performance"],
  ["cha", "Persuasion"],
  ["int", "Religion"],
  ["dex", "Sleight of Hand"],
  ["dex", "Stealth"],
  ["wis", "Survival"]
];

function abilityMod(score: number) {
  const mod = Math.floor((score - 10) / 2);
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

function proficiencyBonus(level: number) {
  return Math.ceil(level / 4) + 1;
}

export function CharacterSheet({
  initialCharacter,
  onSave,
  onExport,
  onClose,
  windowed = false
}: CharacterSheetProps) {
  const [characterId] = useState(() => initialCharacter?.id ?? crypto.randomUUID());
  const [characterName, setCharacterName] = useState(initialCharacter?.name ?? "Player Character");
  const [characterLevel, setCharacterLevel] = useState(initialCharacter?.level ?? 1);
  const [characterClassName, setCharacterClassName] = useState(initialCharacter?.className ?? "");
  const [characterSpecies, setCharacterSpecies] = useState(initialCharacter?.species ?? "");
  const [characterBackground, setCharacterBackground] = useState(initialCharacter?.background ?? "");
  const [characterHpMax, setCharacterHpMax] = useState(initialCharacter?.hpMax ?? 0);
  const [characterSpeed, setCharacterSpeed] = useState(initialCharacter?.speed ?? 30);
  const [characterTab, setCharacterTab] = useState<CharacterTab>("details");

  const [characterAbilities, setCharacterAbilities] = useState<Record<AbilityKey, number>>(
    initialCharacter?.abilities ?? {
      str: 10,
      dex: 10,
      con: 10,
      int: 10,
      wis: 10,
      cha: 10
    }
  );

  function updateAbility(ability: AbilityKey, value: number) {
    setCharacterAbilities((current) => ({
      ...current,
      [ability]: value
    }));
  }

  function buildCharacter(): HomebrewCharacter {
    return {
      id: characterId,
      name: characterName,
      level: characterLevel,
      className: characterClassName,
      species: characterSpecies,
      background: characterBackground,
      abilities: characterAbilities,
      hpMax: characterHpMax,
      speed: characterSpeed,
      img: initialCharacter?.img ?? "icons/svg/mystery-man.svg"
    };
  }

  async function handleSave() {
    if (!characterName.trim()) {
      alert("Character needs a name.");
      return;
    }

    await onSave(buildCharacter());
  }

  return (
    <section
      className={
        windowed
          ? "foundry-character-sheet foundry-character-sheet--window"
          : "foundry-character-sheet"
      }
    >
      <header className="foundry-character-header">
        {onClose && (
          <button className="sheet-back-button" onClick={onClose}>
            Close
          </button>
        )}

        <div className="header-main">
          <p className="eyebrow">{initialCharacter ? "Actor" : "Create New"}</p>
          <h1>{characterName || "Player Character"}</h1>

          <div className="character-identity-pills">
            <span>{characterClassName || "Add Class"}</span>
            <span>{characterSpecies || "Add Species"}</span>
            <span>{characterBackground || "Add Background"}</span>
          </div>
        </div>

        <div className="level-badge">
          <span>Level</span>
          <strong>{characterLevel}</strong>
        </div>
      </header>

      <div className="foundry-sheet-body">
        <aside className="foundry-sidebar">
          <div className="portrait-box">
            <div className="portrait-placeholder">
              <span>?</span>
            </div>
          </div>

          <div className="sidebar-badges">
            <div className="stat-diamond">
              <span>Init</span>
              <strong>{abilityMod(characterAbilities.dex)}</strong>
            </div>

            <div className="stat-shield">
              <span>Prof</span>
              <strong>+{proficiencyBonus(characterLevel)}</strong>
            </div>

            <div className="stat-diamond">
              <span>Speed</span>
              <strong>{characterSpeed}</strong>
            </div>
          </div>

          <div className="sidebar-field">
            <label>Name</label>
            <input
              value={characterName}
              onChange={(event) => setCharacterName(event.target.value)}
            />
          </div>

          <div className="sidebar-field-row">
            <div className="sidebar-field">
              <label>Level</label>
              <input
                type="number"
                min={1}
                max={20}
                value={characterLevel}
                onChange={(event) => setCharacterLevel(Number(event.target.value))}
              />
            </div>

            <div className="sidebar-field">
              <label>HP Max</label>
              <input
                type="number"
                min={0}
                value={characterHpMax}
                onChange={(event) => setCharacterHpMax(Number(event.target.value))}
              />
            </div>
          </div>

          <div className="hp-box">
            <label>Hit Points</label>
            <div>
              <strong>{characterHpMax}</strong>
              <span>/ {characterHpMax}</span>
              <em>TMP</em>
            </div>
          </div>
        </aside>

        <main className="foundry-main-panel">
          <section className="foundry-abilities">
            {abilityKeys.map((ability) => (
              <label className="foundry-ability" key={ability}>
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
          </section>

          <nav className="foundry-tabs">
            {[
              ["details", "Details"],
              ["inventory", "Inventory"],
              ["features", "Features"],
              ["spells", "Spells"],
              ["effects", "Effects"],
              ["biography", "Biography"],
              ["specialTraits", "Special Traits"]
            ].map(([tab, label]) => (
              <button
                key={tab}
                className={characterTab === tab ? "active" : ""}
                onClick={() => setCharacterTab(tab as CharacterTab)}
              >
                {label}
              </button>
            ))}
          </nav>

          {characterTab === "details" && (
            <div className="foundry-dnd-layout">
              <section className="foundry-card skills-card foundry-skills-panel">
                <h2>Skills</h2>

                {skills.map(([ability, skill]) => (
                  <div className="foundry-row skill" key={skill}>
                    <span className="prof-circle" />
                    <b>{ability.toUpperCase()}</b>
                    <p>{skill}</p>
                    <strong>{abilityMod(characterAbilities[ability])}</strong>
                  </div>
                ))}
              </section>

              <div className="foundry-details-panel">
                <section className="foundry-card saves-card foundry-saves-panel">
                  <h2>Saving Throws</h2>

                  <div className="saving-throws-grid">
                    {([
                      ["str", "Strength"],
                      ["dex", "Dexterity"],
                      ["con", "Constitution"],
                      ["int", "Intelligence"],
                      ["wis", "Wisdom"],
                      ["cha", "Charisma"]
                    ] as [AbilityKey, string][]).map(([ability, label]) => (
                      <div className="foundry-row save" key={ability}>
                        <span className="prof-circle" />
                        <p>{label}</p>
                        <strong>{abilityMod(characterAbilities[ability])}</strong>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="foundry-card foundry-identity-panel">
                  <label className="foundry-class-pill">
                    <span>Class</span>
                    <input
                      value={characterClassName}
                      onChange={(event) => setCharacterClassName(event.target.value)}
                      placeholder="Warlock"
                    />
                    <strong>{characterLevel}</strong>
                  </label>

                  <label className="trait-banner">
                    <span className="trait-icon">👥</span>
                    <input
                      value={characterSpecies}
                      onChange={(event) => setCharacterSpecies(event.target.value)}
                      placeholder="Humanoid / Species"
                    />
                  </label>

                  <label className="trait-drop-input">
                    Species
                    <input
                      value={characterSpecies}
                      onChange={(event) => setCharacterSpecies(event.target.value)}
                      placeholder="Add Species"
                    />
                  </label>

                  <label className="trait-drop-input">
                    Background
                    <input
                      value={characterBackground}
                      onChange={(event) => setCharacterBackground(event.target.value)}
                      placeholder="Add Background"
                    />
                  </label>

                  <label className="trait-drop-input compact">
                    Speed
                    <input
                      type="number"
                      min={0}
                      value={characterSpeed}
                      onChange={(event) => setCharacterSpeed(Number(event.target.value))}
                    />
                  </label>
                </section>

                {(() => {
                  const armorProficiencies: string[] = [];
                  const weaponProficiencies: string[] = [];
                  const languages: string[] = [];
                  const senses: string[] = [];
                  const resistances: string[] = [];
                  const damageImmunities: string[] = [];
                  const conditionImmunities: string[] = [];
                  const vulnerabilities: string[] = [];

                  const traitGroups = [
                    ["Senses", senses],
                    ["Resistances", resistances],
                    ["Damage Immunities", damageImmunities],
                    ["Condition Immunities", conditionImmunities],
                    ["Vulnerabilities", vulnerabilities],
                    ["Armor", armorProficiencies],
                    ["Weapons", weaponProficiencies],
                    ["Languages", languages]
                  ] as const;

                  const visibleTraitGroups = traitGroups.filter(([, values]) => values.length > 0);

                  if (visibleTraitGroups.length === 0) {
                    return null;
                  }

                  return (
                    <section className="foundry-traits-list">
                      {visibleTraitGroups.map(([label, values]) => (
                        <div className="foundry-trait-row" key={label}>
                          <div className="foundry-trait-header">
                            <span>{label}</span>
                          </div>

                          <div className="foundry-trait-pills">
                            {values.map((value) => (
                              <button type="button" key={value}>
                                {value}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </section>
                  );
                })()}
              </div>
            </div>
          )}

          {characterTab === "inventory" && (
            <section className="foundry-card tab-card">
              <h2>Inventory</h2>
              <div className="drop-slot">Add Weapon</div>
              <div className="drop-slot">Add Armor</div>
              <div className="drop-slot">Add Equipment</div>
              <div className="drop-slot">Add Container</div>
            </section>
          )}

          {characterTab === "features" && (
            <section className="foundry-card tab-card">
              <h2>Features</h2>
              <div className="drop-slot">Add Class Feature</div>
              <div className="drop-slot">Add Species Feature</div>
              <div className="drop-slot">Add Background Feature</div>
              <div className="drop-slot">Add Feat</div>
            </section>
          )}

          {characterTab === "spells" && (
            <section className="foundry-card tab-card">
              <h2>Spells</h2>
              <div className="drop-slot">Add Spellcasting</div>
              <div className="drop-slot">Add Cantrip</div>
              <div className="drop-slot">Add Spell</div>
            </section>
          )}

          {characterTab === "effects" && (
            <section className="foundry-card tab-card">
              <h2>Effects</h2>
              <div className="drop-slot">Add Active Effect</div>
              <div className="drop-slot">Add Condition</div>
              <div className="drop-slot">Add Temporary Effect</div>
            </section>
          )}

          {characterTab === "biography" && (
            <section className="foundry-card tab-card">
              <h2>Biography</h2>

              <label>
                Backstory
                <textarea placeholder="Write character biography later..." />
              </label>

              <label>
                Notes
                <textarea placeholder="Private notes, ideals, bonds, flaws, allies, enemies..." />
              </label>
            </section>
          )}

          {characterTab === "specialTraits" && (
            <section className="foundry-card tab-card">
              <h2>Special Traits</h2>
              <div className="drop-slot">Add Language</div>
              <div className="drop-slot">Add Creature Type</div>
              <div className="drop-slot">Add Damage Resistance</div>
              <div className="drop-slot">Add Damage Immunity</div>
              <div className="drop-slot">Add Damage Vulnerability</div>
              <div className="drop-slot">Add Senses</div>
            </section>
          )}

          <div className="sheet-footer-actions">
            <button className="primary-button" onClick={handleSave}>
              Save Character
            </button>

            <button onClick={() => onExport(buildCharacter())}>
              Export Actor JSON
            </button>
          </div>
        </main>
      </div>
    </section>
  );
}