import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { AbilityKey, HomebrewCharacter } from "@foundry-homebrew-hub/shared";

type CharacterTab =
  | "details"
  | "inventory"
  | "features"
  | "spells"
  | "effects"
  | "biography"
  | "specialTraits";

type SkillKey =
  | "acr"
  | "ani"
  | "arc"
  | "ath"
  | "dec"
  | "his"
  | "ins"
  | "itm"
  | "inv"
  | "med"
  | "nat"
  | "prc"
  | "prf"
  | "per"
  | "rel"
  | "slt"
  | "ste"
  | "sur";

type CharacterProficiencies = {
  saves: Partial<Record<AbilityKey, boolean>>;
  skills: Partial<Record<SkillKey, boolean>>;
  armor: string[];
  weapons: string[];
  languages: string[];
  senses: string[];
  resistances: string[];
  damageImmunities: string[];
  conditionImmunities: string[];
  vulnerabilities: string[];
};

type CharacterSheetCharacter = HomebrewCharacter & {
  proficiencies?: Partial<CharacterProficiencies>;
};

type CharacterSheetProps = {
  initialCharacter?: CharacterSheetCharacter;
  onSave: (character: CharacterSheetCharacter) => Promise<void> | void;
  onExport: (character: CharacterSheetCharacter) => void;
  onClose?: () => void;
  windowed?: boolean;
};

const abilityKeys: AbilityKey[] = ["str", "dex", "con", "int", "wis", "cha"];

const skills: { key: SkillKey; ability: AbilityKey; label: string }[] = [
  { key: "acr", ability: "dex", label: "Acrobatics" },
  { key: "ani", ability: "wis", label: "Animal Handling" },
  { key: "arc", ability: "int", label: "Arcana" },
  { key: "ath", ability: "str", label: "Athletics" },
  { key: "dec", ability: "cha", label: "Deception" },
  { key: "his", ability: "int", label: "History" },
  { key: "ins", ability: "wis", label: "Insight" },
  { key: "itm", ability: "cha", label: "Intimidation" },
  { key: "inv", ability: "int", label: "Investigation" },
  { key: "med", ability: "wis", label: "Medicine" },
  { key: "nat", ability: "int", label: "Nature" },
  { key: "prc", ability: "wis", label: "Perception" },
  { key: "prf", ability: "cha", label: "Performance" },
  { key: "per", ability: "cha", label: "Persuasion" },
  { key: "rel", ability: "int", label: "Religion" },
  { key: "slt", ability: "dex", label: "Sleight of Hand" },
  { key: "ste", ability: "dex", label: "Stealth" },
  { key: "sur", ability: "wis", label: "Survival" }
];

const armorOptions = ["Light Armor", "Medium Armor", "Heavy Armor", "Shields"];

const weaponOptions = [
  "Simple Weapons",
  "Martial Weapons",
  "Clubs",
  "Daggers",
  "Greatclubs",
  "Handaxes",
  "Javelins",
  "Light Hammers",
  "Maces",
  "Quarterstaffs",
  "Sickles",
  "Spears",
  "Light Crossbows",
  "Darts",
  "Shortbows",
  "Slings",
  "Battleaxes",
  "Flails",
  "Glaives",
  "Greataxes",
  "Greatswords",
  "Halberds",
  "Lances",
  "Longswords",
  "Mauls",
  "Morningstars",
  "Pikes",
  "Rapiers",
  "Scimitars",
  "Shortswords",
  "Tridents",
  "War Picks",
  "Warhammers",
  "Whips",
  "Blowguns",
  "Hand Crossbows",
  "Heavy Crossbows",
  "Longbows",
  "Nets"
];

const languageOptions = [
  "Common",
  "Dwarvish",
  "Elvish",
  "Giant",
  "Gnomish",
  "Goblin",
  "Halfling",
  "Orc",
  "Abyssal",
  "Celestial",
  "Draconic",
  "Deep Speech",
  "Infernal",
  "Primordial",
  "Sylvan",
  "Undercommon"
];

const senseOptions = ["Blindsight", "Darkvision", "Tremorsense", "Truesight"];

const damageTypeOptions = [
  "Acid",
  "Bludgeoning",
  "Cold",
  "Fire",
  "Force",
  "Lightning",
  "Necrotic",
  "Piercing",
  "Poison",
  "Psychic",
  "Radiant",
  "Slashing",
  "Thunder"
];

const conditionOptions = [
  "Blinded",
  "Charmed",
  "Deafened",
  "Exhaustion",
  "Frightened",
  "Grappled",
  "Incapacitated",
  "Invisible",
  "Paralyzed",
  "Petrified",
  "Poisoned",
  "Prone",
  "Restrained",
  "Stunned",
  "Unconscious"
];

function abilityModNumber(score: number) {
  return Math.floor((score - 10) / 2);
}

function formatMod(value: number) {
  return value >= 0 ? `+${value}` : `${value}`;
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
  const initialProficiencies: Partial<CharacterProficiencies> =
    initialCharacter?.proficiencies ?? {};

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

  const [proficientSaves, setProficientSaves] = useState<Partial<Record<AbilityKey, boolean>>>(
    initialProficiencies.saves ?? {}
  );

  const [proficientSkills, setProficientSkills] = useState<Partial<Record<SkillKey, boolean>>>(
    initialProficiencies.skills ?? {}
  );

  const [armorProficiencies, setArmorProficiencies] = useState<string[]>(
    initialProficiencies.armor ?? []
  );

  const [weaponProficiencies, setWeaponProficiencies] = useState<string[]>(
    initialProficiencies.weapons ?? []
  );

  const [languages, setLanguages] = useState<string[]>(initialProficiencies.languages ?? []);
  const [senses, setSenses] = useState<string[]>(initialProficiencies.senses ?? []);
  const [resistances, setResistances] = useState<string[]>(initialProficiencies.resistances ?? []);

  const [damageImmunities, setDamageImmunities] = useState<string[]>(
    initialProficiencies.damageImmunities ?? []
  );

  const [conditionImmunities, setConditionImmunities] = useState<string[]>(
    initialProficiencies.conditionImmunities ?? []
  );

  const [vulnerabilities, setVulnerabilities] = useState<string[]>(
    initialProficiencies.vulnerabilities ?? []
  );

  const profBonus = proficiencyBonus(characterLevel);

  function updateAbility(ability: AbilityKey, value: number) {
    setCharacterAbilities((current) => ({
      ...current,
      [ability]: value
    }));
  }

  function abilityScoreDisplay(ability: AbilityKey, proficient: boolean) {
    const base = abilityModNumber(characterAbilities[ability]);
    return formatMod(base + (proficient ? profBonus : 0));
  }

  function toggleSaveProficiency(ability: AbilityKey) {
    setProficientSaves((current) => ({
      ...current,
      [ability]: !current[ability]
    }));
  }

  function toggleSkillProficiency(skill: SkillKey) {
    setProficientSkills((current) => ({
      ...current,
      [skill]: !current[skill]
    }));
  }

  function addTraitValue(value: string, setter: Dispatch<SetStateAction<string[]>>) {
    if (!value) {
      return;
    }

    setter((current) => {
      if (current.includes(value)) {
        return current;
      }

      return [...current, value];
    });
  }

  function removeTraitValue(value: string, setter: Dispatch<SetStateAction<string[]>>) {
    setter((current) => current.filter((entry) => entry !== value));
  }

  function renderTraitPicker(
    label: string,
    values: string[],
    options: string[],
    setter: Dispatch<SetStateAction<string[]>>
  ) {
    const remainingOptions = options.filter((option) => !values.includes(option));

    return (
      <section className="foundry-card trait-picker-card">
        <h2>{label}</h2>

        <select
          value=""
          onChange={(event) => addTraitValue(event.target.value, setter)}
        >
          <option value="">Add {label}</option>
          {remainingOptions.map((option) => (
            <option value={option} key={option}>
              {option}
            </option>
          ))}
        </select>

        {values.length === 0 ? (
          <p className="muted-text">None selected.</p>
        ) : (
          <div className="foundry-trait-pills editable">
            {values.map((value) => (
              <button
                type="button"
                key={value}
                onClick={() => removeTraitValue(value, setter)}
                title={`Remove ${value}`}
              >
                {value} ×
              </button>
            ))}
          </div>
        )}
      </section>
    );
  }

  function buildCharacter(): CharacterSheetCharacter {
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
      img: initialCharacter?.img ?? "icons/svg/mystery-man.svg",
      proficiencies: {
        saves: proficientSaves,
        skills: proficientSkills,
        armor: armorProficiencies,
        weapons: weaponProficiencies,
        languages,
        senses,
        resistances,
        damageImmunities,
        conditionImmunities,
        vulnerabilities
      }
    };
  }

  async function handleSave() {
    if (!characterName.trim()) {
      alert("Character needs a name.");
      return;
    }

    await onSave(buildCharacter());
  }

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
              <strong>{abilityScoreDisplay("dex", false)}</strong>
            </div>

            <div className="stat-shield">
              <span>Prof</span>
              <strong>+{profBonus}</strong>
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
                <strong>{abilityScoreDisplay(ability, false)}</strong>
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

                {skills.map((skill) => (
                  <div className="foundry-row skill" key={skill.key}>
                    <button
                      type="button"
                      className={
                        proficientSkills[skill.key] ? "prof-circle active" : "prof-circle"
                      }
                      onClick={() => toggleSkillProficiency(skill.key)}
                      title={`Toggle ${skill.label} proficiency`}
                    />

                    <b>{skill.ability.toUpperCase()}</b>
                    <p>{skill.label}</p>
                    <strong>
                      {abilityScoreDisplay(skill.ability, Boolean(proficientSkills[skill.key]))}
                    </strong>
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
                        <button
                          type="button"
                          className={
                            proficientSaves[ability] ? "prof-circle active" : "prof-circle"
                          }
                          onClick={() => toggleSaveProficiency(ability)}
                          title={`Toggle ${label} save proficiency`}
                        />

                        <p>{label}</p>
                        <strong>
                          {abilityScoreDisplay(ability, Boolean(proficientSaves[ability]))}
                        </strong>
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

                {visibleTraitGroups.length > 0 && (
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
                )}
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
            <div className="traits-editor-grid">
              {renderTraitPicker(
                "Armor Proficiencies",
                armorProficiencies,
                armorOptions,
                setArmorProficiencies
              )}

              {renderTraitPicker(
                "Weapon Proficiencies",
                weaponProficiencies,
                weaponOptions,
                setWeaponProficiencies
              )}

              {renderTraitPicker("Languages", languages, languageOptions, setLanguages)}
              {renderTraitPicker("Senses", senses, senseOptions, setSenses)}

              {renderTraitPicker(
                "Resistances",
                resistances,
                damageTypeOptions,
                setResistances
              )}

              {renderTraitPicker(
                "Damage Immunities",
                damageImmunities,
                damageTypeOptions,
                setDamageImmunities
              )}

              {renderTraitPicker(
                "Condition Immunities",
                conditionImmunities,
                conditionOptions,
                setConditionImmunities
              )}

              {renderTraitPicker(
                "Vulnerabilities",
                vulnerabilities,
                damageTypeOptions,
                setVulnerabilities
              )}
            </div>
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