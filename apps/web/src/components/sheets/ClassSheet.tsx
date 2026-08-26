import { useMemo, useState } from "react";
import type {
  AbilityKey,
  ClassAdvancementType,
  ClassRestriction,
  ClassTraitMode,
  ClassTraitType,
  HomebrewClass,
  HomebrewClassAdvancement
} from "@foundry-homebrew-hub/shared";

type ClassSheetProps = {
  initialClass?: HomebrewClass;
  onSave: (homebrewClass: HomebrewClass) => Promise<void> | void;
  onExport: (homebrewClass: HomebrewClass) => void;
  onClose?: () => void;
  windowed?: boolean;
};

type ClassTab = "description" | "details" | "advancement";

type TraitOption = {
  label: string;
  value: string;
};

const abilityOptions: { value: AbilityKey; label: string }[] = [
  { value: "str", label: "Strength" },
  { value: "dex", label: "Dexterity" },
  { value: "con", label: "Constitution" },
  { value: "int", label: "Intelligence" },
  { value: "wis", label: "Wisdom" },
  { value: "cha", label: "Charisma" }
];

const advancementTypeOptions: {
  value: ClassAdvancementType;
  label: string;
  icon: string;
  unique?: boolean;
}[] = [
  { value: "abilityScoreImprovement", label: "Ability Score Improvement", icon: "✴" },
  { value: "itemChoice", label: "Choose Items", icon: "⚔" },
  { value: "itemGrant", label: "Grant Items", icon: "▰" },
  { value: "hitPoints", label: "Hit Points", icon: "✚", unique: true },
  { value: "scaleValue", label: "Scale Value", icon: "⬡" },
  { value: "subclass", label: "Subclass", icon: "♛", unique: true },
  { value: "trait", label: "Traits", icon: "☞" }
];

const classRestrictionOptions: { value: ClassRestriction; label: string }[] = [
  { value: "all", label: "All Classes" },
  { value: "primary", label: "Original Class Only" },
  { value: "secondary", label: "Multiclass Only" }
];

const traitModeOptions: { value: ClassTraitMode; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "expertise", label: "Expertise" },
  { value: "forcedExpertise", label: "Forced Expertise" },
  { value: "upgrade", label: "Upgrade" },
  { value: "mastery", label: "Mastery" }
];

const traitTypeOptions: { value: ClassTraitType; label: string }[] = [
  { value: "savingThrows", label: "Saving Throws" },
  { value: "skills", label: "Skills" },
  { value: "languages", label: "Languages" },
  { value: "armor", label: "Armor Training" },
  { value: "weapon", label: "Weapon Proficiencies" },
  { value: "tool", label: "Tool Proficiencies" },
  { value: "damageImmunities", label: "Damage Immunities" },
  { value: "damageResistances", label: "Damage Resistances" },
  { value: "damageVulnerabilities", label: "Damage Vulnerabilities" },
  { value: "conditionImmunities", label: "Condition Immunities" }
];

const skillTraitOptions: TraitOption[] = [
  { label: "Acrobatics", value: "skills:acr" },
  { label: "Animal Handling", value: "skills:ani" },
  { label: "Arcana", value: "skills:arc" },
  { label: "Athletics", value: "skills:ath" },
  { label: "Deception", value: "skills:dec" },
  { label: "History", value: "skills:his" },
  { label: "Insight", value: "skills:ins" },
  { label: "Intimidation", value: "skills:itm" },
  { label: "Investigation", value: "skills:inv" },
  { label: "Medicine", value: "skills:med" },
  { label: "Nature", value: "skills:nat" },
  { label: "Perception", value: "skills:prc" },
  { label: "Performance", value: "skills:prf" },
  { label: "Persuasion", value: "skills:per" },
  { label: "Religion", value: "skills:rel" },
  { label: "Sleight of Hand", value: "skills:slt" },
  { label: "Stealth", value: "skills:ste" },
  { label: "Survival", value: "skills:sur" }
];

const savingThrowTraitOptions: TraitOption[] = abilityOptions.map((ability) => ({
  label: ability.label,
  value: `saves:${ability.value}`
}));

const armorTraitOptions: TraitOption[] = [
  { label: "Light Armor", value: "armor:lgt" },
  { label: "Medium Armor", value: "armor:med" },
  { label: "Heavy Armor", value: "armor:hvy" },
  { label: "Shields", value: "armor:shl" }
];

const weaponTraitOptions: TraitOption[] = [
  { label: "Simple Weapons", value: "weapon:sim" },
  { label: "Martial Weapons", value: "weapon:mar" },
  { label: "Clubs", value: "weapon:club" },
  { label: "Daggers", value: "weapon:dagger" },
  { label: "Greatclubs", value: "weapon:greatclub" },
  { label: "Handaxes", value: "weapon:handaxe" },
  { label: "Javelins", value: "weapon:javelin" },
  { label: "Light Hammers", value: "weapon:lighthammer" },
  { label: "Maces", value: "weapon:mace" },
  { label: "Quarterstaffs", value: "weapon:quarterstaff" },
  { label: "Sickles", value: "weapon:sickle" },
  { label: "Spears", value: "weapon:spear" },
  { label: "Light Crossbows", value: "weapon:lightcrossbow" },
  { label: "Darts", value: "weapon:dart" },
  { label: "Shortbows", value: "weapon:shortbow" },
  { label: "Slings", value: "weapon:sling" },
  { label: "Battleaxes", value: "weapon:battleaxe" },
  { label: "Flails", value: "weapon:flail" },
  { label: "Glaives", value: "weapon:glaive" },
  { label: "Greataxes", value: "weapon:greataxe" },
  { label: "Greatswords", value: "weapon:greatsword" },
  { label: "Halberds", value: "weapon:halberd" },
  { label: "Lances", value: "weapon:lance" },
  { label: "Longswords", value: "weapon:longsword" },
  { label: "Mauls", value: "weapon:maul" },
  { label: "Morningstars", value: "weapon:morningstar" },
  { label: "Pikes", value: "weapon:pike" },
  { label: "Rapiers", value: "weapon:rapier" },
  { label: "Scimitars", value: "weapon:scimitar" },
  { label: "Shortswords", value: "weapon:shortsword" },
  { label: "Tridents", value: "weapon:trident" },
  { label: "War Picks", value: "weapon:warpick" },
  { label: "Warhammers", value: "weapon:warhammer" },
  { label: "Whips", value: "weapon:whip" },
  { label: "Blowguns", value: "weapon:blowgun" },
  { label: "Hand Crossbows", value: "weapon:handcrossbow" },
  { label: "Heavy Crossbows", value: "weapon:heavycrossbow" },
  { label: "Longbows", value: "weapon:longbow" },
  { label: "Nets", value: "weapon:net" }
];

const languageTraitOptions: TraitOption[] = [
  { label: "Common", value: "languages:common" },
  { label: "Dwarvish", value: "languages:dwarvish" },
  { label: "Elvish", value: "languages:elvish" },
  { label: "Giant", value: "languages:giant" },
  { label: "Gnomish", value: "languages:gnomish" },
  { label: "Goblin", value: "languages:goblin" },
  { label: "Halfling", value: "languages:halfling" },
  { label: "Orc", value: "languages:orc" },
  { label: "Abyssal", value: "languages:abyssal" },
  { label: "Celestial", value: "languages:celestial" },
  { label: "Draconic", value: "languages:draconic" },
  { label: "Deep Speech", value: "languages:deep" },
  { label: "Infernal", value: "languages:infernal" },
  { label: "Primordial", value: "languages:primordial" },
  { label: "Sylvan", value: "languages:sylvan" },
  { label: "Undercommon", value: "languages:undercommon" }
];

const damageTypes = [
  "acid",
  "bludgeoning",
  "cold",
  "fire",
  "force",
  "lightning",
  "necrotic",
  "piercing",
  "poison",
  "psychic",
  "radiant",
  "slashing",
  "thunder"
];

const conditionTraitOptions: TraitOption[] = [
  "blinded",
  "charmed",
  "deafened",
  "exhaustion",
  "frightened",
  "grappled",
  "incapacitated",
  "invisible",
  "paralyzed",
  "petrified",
  "poisoned",
  "prone",
  "restrained",
  "stunned",
  "unconscious"
].map((condition) => ({
  label: labelFromCode(condition),
  value: `ci:${condition}`
}));

const toolTraitOptions: TraitOption[] = [
  { label: "Thieves' Tools", value: "tool:thief" },
  { label: "Herbalism Kit", value: "tool:herb" },
  { label: "Disguise Kit", value: "tool:disg" },
  { label: "Forgery Kit", value: "tool:forg" },
  { label: "Alchemist's Supplies", value: "tool:alchemist" },
  { label: "Smith's Tools", value: "tool:smith" },
  { label: "Tinker's Tools", value: "tool:tinker" }
];

function labelFromCode(code: string) {
  return code
    .split(/[-_]/g)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function makeIdentifier(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replaceAll(" ", "-")
    .replace(/[^a-z0-9-]/g, "");
}

function createShortId() {
  return crypto.randomUUID().replaceAll("-", "").slice(0, 16);
}

function createDefaultClass(): HomebrewClass {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    name: "New Class",
    description: "",
    img: "icons/svg/book.svg",
    identifier: "new-class",
    levels: 1,
    hitDie: "d8",
    primaryAbility: [],
    savingThrows: [],
    armorProficiencies: [],
    weaponProficiencies: [],
    toolProficiencies: [],
    skillChoices: [],
    skillChoiceCount: 2,
    spellcasting: {
      progression: "none",
      ability: ""
    },
    startingEquipment: "[]",
    wealth: "",
    advancements: [],
    advancementJson: "{}",
    createdAt: now,
    updatedAt: now
  };
}

function normalizeClass(homebrewClass: HomebrewClass): HomebrewClass {
  return {
    ...homebrewClass,
    advancements: homebrewClass.advancements ?? [],
    advancementJson: homebrewClass.advancementJson ?? "{}",
    startingEquipment: homebrewClass.startingEquipment || "[]",
    spellcasting: homebrewClass.spellcasting ?? {
      progression: "none",
      ability: ""
    }
  };
}

function createAdvancement(type: ClassAdvancementType): HomebrewClassAdvancement {
  const id = createShortId();

  if (type === "hitPoints") {
    return {
      id,
      type,
      title: "Hit Points",
      icon: "systems/dnd5e/icons/svg/hit-points.svg",
      classRestriction: "all",
      level: 1,
      hint: ""
    };
  }

  if (type === "abilityScoreImprovement") {
    return {
      id,
      type,
      title: "Ability Score Improvement",
      icon: "icons/magic/symbols/star-solid-gold.webp",
      classRestriction: "all",
      level: 4,
      hint: "",
      points: 2,
      pointCap: 2,
      maximum: undefined,
      fixed: { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 },
      locked: []
    };
  }

  if (type === "itemChoice") {
    return {
      id,
      type,
      title: "Choose Items",
      icon: "icons/svg/item-bag.svg",
      classRestriction: "all",
      level: 1,
      hint: "",
      allowDrops: true,
      itemType: "feat",
      pool: [],
      choices: [{ level: 1, count: 1, replacement: false }],
      restrictionType: "",
      restrictionSubtype: "",
      restrictionLevel: ""
    };
  }

  if (type === "itemGrant") {
    return {
      id,
      type,
      title: "Features",
      icon: "icons/sundries/books/book-open-brown.webp",
      classRestriction: "all",
      level: 1,
      hint: "",
      optional: false,
      items: []
    };
  }

  if (type === "scaleValue") {
    return {
      id,
      type,
      title: "Scale Value",
      icon: "icons/sundries/gaming/dice-runed-brown.webp",
      classRestriction: "all",
      level: 1,
      hint: "",
      identifier: "scale-value",
      scaleType: "number",
      distanceUnits: "",
      scale: []
    };
  }

  if (type === "subclass") {
    return {
      id,
      type,
      title: "Subclass",
      icon: "systems/dnd5e/icons/svg/subclass.svg",
      classRestriction: "all",
      level: 3,
      hint: ""
    };
  }

  return {
    id,
    type: "trait",
    title: "Traits",
    icon: "icons/sundries/scrolls/scroll-symbol-eye-brown.webp",
    classRestriction: "all",
    level: 1,
    hint: "",
    traitType: "skills",
    mode: "default",
    allowReplacements: false,
    grants: [],
    choices: []
  };
}

function toggleArrayValue<T extends string>(values: T[], value: T) {
  return values.includes(value)
    ? values.filter((entry) => entry !== value)
    : [...values, value];
}

function numberFromInput(value: string, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function splitLines(text: string) {
  return text
    .split("\n")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function traitOptionsForType(traitType: ClassTraitType): TraitOption[] {
  if (traitType === "savingThrows") return savingThrowTraitOptions;
  if (traitType === "skills") return skillTraitOptions;
  if (traitType === "languages") return languageTraitOptions;
  if (traitType === "armor") return armorTraitOptions;
  if (traitType === "weapon") return weaponTraitOptions;
  if (traitType === "tool") return toolTraitOptions;
  if (traitType === "conditionImmunities") return conditionTraitOptions;

  const prefixByType: Record<ClassTraitType, string> = {
    savingThrows: "saves",
    skills: "skills",
    languages: "languages",
    armor: "armor",
    weapon: "weapon",
    tool: "tool",
    damageImmunities: "di",
    damageResistances: "dr",
    damageVulnerabilities: "dv",
    conditionImmunities: "ci"
  };

  const prefix = prefixByType[traitType];

  return damageTypes.map((damageType) => ({
    label: labelFromCode(damageType),
    value: `${prefix}:${damageType}`
  }));
}

function advancementTypeLabel(type: ClassAdvancementType) {
  return advancementTypeOptions.find((option) => option.value === type)?.label ?? type;
}

function advancementLevelLabel(advancement: HomebrewClassAdvancement) {
  if (advancement.type === "hitPoints") return "All levels";
  return `Level ${advancement.level}`;
}

export function ClassSheet({
  initialClass,
  onSave,
  onExport,
  onClose,
  windowed = false
}: ClassSheetProps) {
  const [activeTab, setActiveTab] = useState<ClassTab>("description");
  const [homebrewClass, setHomebrewClass] = useState<HomebrewClass>(() =>
    normalizeClass(initialClass ?? createDefaultClass())
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editingAdvancementId, setEditingAdvancementId] = useState<string | null>(
    null
  );

  const identifierSuggestion = useMemo(
    () => makeIdentifier(homebrewClass.name),
    [homebrewClass.name]
  );

  const sortedAdvancements = useMemo(() => {
    return [...(homebrewClass.advancements ?? [])].sort((first, second) => {
      if (first.level !== second.level) return first.level - second.level;
      return advancementTypeLabel(first.type).localeCompare(advancementTypeLabel(second.type));
    });
  }, [homebrewClass.advancements]);

  const editingAdvancement = homebrewClass.advancements?.find(
    (advancement) => advancement.id === editingAdvancementId
  );

  function updateClass(patch: Partial<HomebrewClass>) {
    setHomebrewClass((current) => ({
      ...current,
      ...patch
    }));
  }

  function updateSpellcasting(patch: Partial<HomebrewClass["spellcasting"]>) {
    setHomebrewClass((current) => ({
      ...current,
      spellcasting: {
        ...current.spellcasting,
        ...patch
      }
    }));
  }

  function updateAdvancement(
    advancementId: string,
    updater: (advancement: HomebrewClassAdvancement) => HomebrewClassAdvancement
  ) {
    setHomebrewClass((current) => ({
      ...current,
      advancements: (current.advancements ?? []).map((advancement) =>
        advancement.id === advancementId ? updater(advancement) : advancement
      )
    }));
  }

  function removeAdvancement(advancementId: string) {
    setHomebrewClass((current) => ({
      ...current,
      advancements: (current.advancements ?? []).filter(
        (advancement) => advancement.id !== advancementId
      )
    }));

    if (editingAdvancementId === advancementId) {
      setEditingAdvancementId(null);
    }
  }

  function addAdvancement(type: ClassAdvancementType) {
    const advancement = createAdvancement(type);

    setHomebrewClass((current) => ({
      ...current,
      advancements: [...(current.advancements ?? []), advancement]
    }));

    setPickerOpen(false);
    setEditingAdvancementId(advancement.id);
  }

  function saveClass() {
    const now = new Date().toISOString();

    const classToSave: HomebrewClass = {
      ...homebrewClass,
      identifier: homebrewClass.identifier.trim() || identifierSuggestion,
      updatedAt: now,
      createdAt: homebrewClass.createdAt ?? now,
      advancements: homebrewClass.advancements ?? []
    };

    setHomebrewClass(classToSave);
    void onSave(classToSave);
  }

  function renderCommonAdvancementFields(advancement: HomebrewClassAdvancement) {
    return (
      <fieldset className="class-fieldset advancement-common-fields">
        <legend>Advancement Details</legend>

        <label>
          Custom Title
          <input
            value={advancement.title}
            onChange={(event) =>
              updateAdvancement(advancement.id, (current) => ({
                ...current,
                title: event.target.value
              }))
            }
          />
        </label>

        <label>
          Custom Icon
          <input
            value={advancement.icon}
            onChange={(event) =>
              updateAdvancement(advancement.id, (current) => ({
                ...current,
                icon: event.target.value
              }))
            }
          />
        </label>

        <label>
          Class Restriction
          <select
            value={advancement.classRestriction}
            onChange={(event) =>
              updateAdvancement(advancement.id, (current) => ({
                ...current,
                classRestriction: event.target.value as ClassRestriction
              }))
            }
          >
            {classRestrictionOptions.map((option) => (
              <option value={option.value} key={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        {advancement.type !== "hitPoints" && (
          <label>
            Level
            <select
              value={advancement.level}
              onChange={(event) =>
                updateAdvancement(advancement.id, (current) => ({
                  ...current,
                  level: numberFromInput(event.target.value, 1)
                }))
              }
            >
              {Array.from({ length: 20 }, (_, index) => index + 1).map((level) => (
                <option value={level} key={level}>
                  {level}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="activity-wide">
          Hint / Notes
          <textarea
            value={advancement.hint}
            onChange={(event) =>
              updateAdvancement(advancement.id, (current) => ({
                ...current,
                hint: event.target.value
              }))
            }
          />
        </label>
      </fieldset>
    );
  }

  function renderAdvancementEditor(advancement: HomebrewClassAdvancement) {
    return (
      <section className="advancement-editor-panel">
        <header className="advancement-editor-header">
          <h3>{advancementTypeLabel(advancement.type)}</h3>
          <div>
            <button
              type="button"
              className="secondary-button"
              onClick={() => setEditingAdvancementId(null)}
            >
              Done
            </button>
            <button
              type="button"
              className="danger-button"
              onClick={() => removeAdvancement(advancement.id)}
            >
              Delete
            </button>
          </div>
        </header>

        {renderCommonAdvancementFields(advancement)}

        {advancement.type === "abilityScoreImprovement" && (
          <fieldset className="class-fieldset advancement-specific-fields">
            <legend>Improvement Details</legend>

            <label>
              Point Cap
              <input
                type="number"
                min={0}
                value={advancement.pointCap}
                onChange={(event) =>
                  updateAdvancement(advancement.id, (current) =>
                    current.type === "abilityScoreImprovement"
                      ? {
                          ...current,
                          pointCap: numberFromInput(event.target.value, 2)
                        }
                      : current
                  )
                }
              />
            </label>

            <label>
              Points
              <input
                type="number"
                min={0}
                value={advancement.points}
                onChange={(event) =>
                  updateAdvancement(advancement.id, (current) =>
                    current.type === "abilityScoreImprovement"
                      ? {
                          ...current,
                          points: numberFromInput(event.target.value, 2)
                        }
                      : current
                  )
                }
              />
            </label>

            <label>
              Maximum
              <input
                type="number"
                min={0}
                value={advancement.maximum ?? ""}
                onChange={(event) =>
                  updateAdvancement(advancement.id, (current) =>
                    current.type === "abilityScoreImprovement"
                      ? {
                          ...current,
                          maximum: event.target.value
                            ? numberFromInput(event.target.value, 0)
                            : undefined
                        }
                      : current
                  )
                }
              />
            </label>

            <div className="asi-fixed-grid activity-wide">
              {abilityOptions.map((ability) => (
                <label key={ability.value}>
                  {ability.label}
                  <input
                    type="number"
                    value={advancement.fixed[ability.value]}
                    onChange={(event) =>
                      updateAdvancement(advancement.id, (current) =>
                        current.type === "abilityScoreImprovement"
                          ? {
                              ...current,
                              fixed: {
                                ...current.fixed,
                                [ability.value]: numberFromInput(event.target.value, 0)
                              }
                            }
                          : current
                      )
                    }
                  />
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {advancement.type === "itemChoice" && (
          <fieldset className="class-fieldset advancement-specific-fields">
            <legend>Choose Items</legend>

            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={advancement.allowDrops}
                onChange={() =>
                  updateAdvancement(advancement.id, (current) =>
                    current.type === "itemChoice"
                      ? { ...current, allowDrops: !current.allowDrops }
                      : current
                  )
                }
              />
              Allow Drops
            </label>

            <label>
              Item Type
              <input
                value={advancement.itemType}
                onChange={(event) =>
                  updateAdvancement(advancement.id, (current) =>
                    current.type === "itemChoice"
                      ? { ...current, itemType: event.target.value }
                      : current
                  )
                }
                placeholder="feat"
              />
            </label>

            <label>
              Restriction Type
              <input
                value={advancement.restrictionType}
                onChange={(event) =>
                  updateAdvancement(advancement.id, (current) =>
                    current.type === "itemChoice"
                      ? { ...current, restrictionType: event.target.value }
                      : current
                  )
                }
                placeholder="class"
              />
            </label>

            <label>
              Restriction Subtype
              <input
                value={advancement.restrictionSubtype}
                onChange={(event) =>
                  updateAdvancement(advancement.id, (current) =>
                    current.type === "itemChoice"
                      ? { ...current, restrictionSubtype: event.target.value }
                      : current
                  )
                }
                placeholder="fightingStyle"
              />
            </label>

            <label className="activity-wide">
              Item Pool UUIDs, one per line
              <textarea
                value={advancement.pool.map((entry) => entry.uuid).join("\n")}
                onChange={(event) =>
                  updateAdvancement(advancement.id, (current) =>
                    current.type === "itemChoice"
                      ? {
                          ...current,
                          pool: splitLines(event.target.value).map((uuid) => ({ uuid }))
                        }
                      : current
                  )
                }
                placeholder="Compendium.dnd5e.classfeatures.8YwPFv3UAPjWVDNf"
              />
            </label>

            <div className="choice-table activity-wide">
              <h4>Choices by Level</h4>
              {Array.from({ length: 20 }, (_, index) => index + 1).map((level) => {
                const choice = advancement.choices.find((entry) => entry.level === level);

                return (
                  <div className="choice-row" key={level}>
                    <span>{level}</span>
                    <input
                      type="number"
                      min={0}
                      value={choice?.count ?? 0}
                      onChange={(event) =>
                        updateAdvancement(advancement.id, (current) => {
                          if (current.type !== "itemChoice") return current;

                          const count = numberFromInput(event.target.value, 0);
                          const otherChoices = current.choices.filter(
                            (entry) => entry.level !== level
                          );

                          return {
                            ...current,
                            choices:
                              count > 0
                                ? [
                                    ...otherChoices,
                                    {
                                      level,
                                      count,
                                      replacement: choice?.replacement ?? false
                                    }
                                  ].sort((first, second) => first.level - second.level)
                                : otherChoices
                          };
                        })
                      }
                    />
                    <label className="checkbox-row">
                      <input
                        type="checkbox"
                        checked={choice?.replacement ?? false}
                        disabled={!choice}
                        onChange={() =>
                          updateAdvancement(advancement.id, (current) => {
                            if (current.type !== "itemChoice") return current;

                            return {
                              ...current,
                              choices: current.choices.map((entry) =>
                                entry.level === level
                                  ? { ...entry, replacement: !entry.replacement }
                                  : entry
                              )
                            };
                          })
                        }
                      />
                      Replacement
                    </label>
                  </div>
                );
              })}
            </div>
          </fieldset>
        )}

        {advancement.type === "itemGrant" && (
          <fieldset className="class-fieldset advancement-specific-fields">
            <legend>Grant Items</legend>

            <label className="checkbox-row activity-wide">
              <input
                type="checkbox"
                checked={advancement.optional}
                onChange={() =>
                  updateAdvancement(advancement.id, (current) =>
                    current.type === "itemGrant"
                      ? { ...current, optional: !current.optional }
                      : current
                  )
                }
              />
              Whole advancement is optional
            </label>

            <label className="activity-wide">
              Granted Item UUIDs, one per line. Add <code>| optional</code> after a UUID for optional items.
              <textarea
                value={advancement.items
                  .map((entry) => `${entry.uuid}${entry.optional ? " | optional" : ""}`)
                  .join("\n")}
                onChange={(event) =>
                  updateAdvancement(advancement.id, (current) => {
                    if (current.type !== "itemGrant") return current;

                    return {
                      ...current,
                      items: splitLines(event.target.value).map((line) => {
                        const [uuid, optionalText] = line.split("|").map((part) => part.trim());

                        return {
                          uuid,
                          optional: optionalText?.toLowerCase() === "optional"
                        };
                      })
                    };
                  })
                }
                placeholder="Compendium.dnd5e.classfeatures.fbExzwNwEAl2kW9c"
              />
            </label>
          </fieldset>
        )}

        {advancement.type === "scaleValue" && (
          <fieldset className="class-fieldset advancement-specific-fields">
            <legend>Scale Value</legend>

            <label>
              Identifier
              <input
                value={advancement.identifier}
                onChange={(event) =>
                  updateAdvancement(advancement.id, (current) =>
                    current.type === "scaleValue"
                      ? { ...current, identifier: event.target.value }
                      : current
                  )
                }
              />
            </label>

            <label>
              Scale Type
              <select
                value={advancement.scaleType}
                onChange={(event) =>
                  updateAdvancement(advancement.id, (current) =>
                    current.type === "scaleValue"
                      ? {
                          ...current,
                          scaleType: event.target.value as "number" | "string" | "distance" | "dice"
                        }
                      : current
                  )
                }
              >
                <option value="number">Number</option>
                <option value="string">String</option>
                <option value="distance">Distance</option>
                <option value="dice">Dice</option>
              </select>
            </label>

            <label>
              Distance Units
              <input
                value={advancement.distanceUnits}
                onChange={(event) =>
                  updateAdvancement(advancement.id, (current) =>
                    current.type === "scaleValue"
                      ? { ...current, distanceUnits: event.target.value }
                      : current
                  )
                }
                placeholder="ft"
              />
            </label>

            <div className="scale-table activity-wide">
              <h4>Scale by Level</h4>
              {Array.from({ length: 20 }, (_, index) => index + 1).map((level) => {
                const scaleEntry = advancement.scale.find((entry) => entry.level === level);

                return (
                  <label className="scale-row" key={level}>
                    <span>{level}</span>
                    <input
                      value={scaleEntry?.value ?? ""}
                      onChange={(event) =>
                        updateAdvancement(advancement.id, (current) => {
                          if (current.type !== "scaleValue") return current;

                          const value = event.target.value;
                          const otherScale = current.scale.filter((entry) => entry.level !== level);

                          return {
                            ...current,
                            scale: value
                              ? [...otherScale, { level, value }].sort(
                                  (first, second) => first.level - second.level
                                )
                              : otherScale
                          };
                        })
                      }
                    />
                  </label>
                );
              })}
            </div>
          </fieldset>
        )}

        {advancement.type === "subclass" && (
          <fieldset className="class-fieldset advancement-specific-fields">
            <legend>Subclass</legend>
            <p className="muted-text activity-wide">
              This creates the subclass advancement entry at the chosen level.
            </p>
          </fieldset>
        )}

        {advancement.type === "trait" && (
          <fieldset className="class-fieldset advancement-specific-fields">
            <legend>Traits</legend>

            <label>
              Trait Type
              <select
                value={advancement.traitType}
                onChange={(event) =>
                  updateAdvancement(advancement.id, (current) =>
                    current.type === "trait"
                      ? {
                          ...current,
                          traitType: event.target.value as ClassTraitType,
                          grants: []
                        }
                      : current
                  )
                }
              >
                {traitTypeOptions.map((option) => (
                  <option value={option.value} key={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Mode
              <select
                value={advancement.mode}
                onChange={(event) =>
                  updateAdvancement(advancement.id, (current) =>
                    current.type === "trait"
                      ? { ...current, mode: event.target.value as ClassTraitMode }
                      : current
                  )
                }
              >
                {traitModeOptions.map((option) => (
                  <option value={option.value} key={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="checkbox-row activity-wide">
              <input
                type="checkbox"
                checked={advancement.allowReplacements}
                onChange={() =>
                  updateAdvancement(advancement.id, (current) =>
                    current.type === "trait"
                      ? {
                          ...current,
                          allowReplacements: !current.allowReplacements
                        }
                      : current
                  )
                }
              />
              Allow replacements
            </label>

            <div className="trait-option-list activity-wide">
              {traitOptionsForType(advancement.traitType).map((option) => (
                <label className="checkbox-row" key={option.value}>
                  <input
                    type="checkbox"
                    checked={advancement.grants.includes(option.value)}
                    onChange={() =>
                      updateAdvancement(advancement.id, (current) =>
                        current.type === "trait"
                          ? {
                              ...current,
                              grants: toggleArrayValue(current.grants, option.value)
                            }
                          : current
                      )
                    }
                  />
                  {option.label}
                </label>
              ))}
            </div>

            <label className="activity-wide">
              Raw Choice Trait Keys, one per line
              <textarea
                value={advancement.choices.join("\n")}
                onChange={(event) =>
                  updateAdvancement(advancement.id, (current) =>
                    current.type === "trait"
                      ? { ...current, choices: splitLines(event.target.value) }
                      : current
                  )
                }
                placeholder="skills:ath"
              />
            </label>
          </fieldset>
        )}
      </section>
    );
  }

  return (
    <section
      className={
        windowed
          ? "foundry-class-sheet foundry-class-sheet--window"
          : "foundry-class-sheet"
      }
    >
      <header className="class-sheet-header">
        <label className="class-icon-box">
          <input
            value={homebrewClass.img}
            onChange={(event) => updateClass({ img: event.target.value })}
            placeholder="Image path"
            title="Image path"
          />
        </label>

        <div className="class-title-block">
          <input
            className="class-title-input"
            value={homebrewClass.name}
            onChange={(event) => {
              const name = event.target.value;

              updateClass({
                name,
                identifier:
                  homebrewClass.identifier === identifierSuggestion
                    ? makeIdentifier(name)
                    : homebrewClass.identifier
              });
            }}
            placeholder="Class Name"
          />

          <p>Class</p>
        </div>

        <div className="class-level-badge">
          <span>{homebrewClass.levels}</span>
        </div>
      </header>

      <nav className="sheet-tabs class-tabs">
        <button
          type="button"
          className={activeTab === "description" ? "active" : ""}
          onClick={() => setActiveTab("description")}
        >
          Description
        </button>

        <button
          type="button"
          className={activeTab === "details" ? "active" : ""}
          onClick={() => setActiveTab("details")}
        >
          Details
        </button>

        <button
          type="button"
          className={activeTab === "advancement" ? "active" : ""}
          onClick={() => setActiveTab("advancement")}
        >
          Advancement
        </button>
      </nav>

      <main className="class-sheet-body">
        {activeTab === "description" && (
          <section className="class-description-tab form-grid">
            <label>
              Description
              <textarea
                value={homebrewClass.description}
                onChange={(event) => updateClass({ description: event.target.value })}
                placeholder="Write the class description here. Plain text is fine; HTML also works."
              />
            </label>
          </section>
        )}

        {activeTab === "details" && (
          <section className="class-details-tab form-grid">
            <fieldset className="class-fieldset">
              <legend>Class Details</legend>

              <label>
                Identifier
                <input
                  value={homebrewClass.identifier}
                  onChange={(event) => updateClass({ identifier: event.target.value })}
                  placeholder={identifierSuggestion}
                />
              </label>

              <label>
                Hit Point Die
                <select
                  value={homebrewClass.hitDie}
                  onChange={(event) =>
                    updateClass({
                      hitDie: event.target.value as HomebrewClass["hitDie"]
                    })
                  }
                >
                  <option value="d6">d6</option>
                  <option value="d8">d8</option>
                  <option value="d10">d10</option>
                  <option value="d12">d12</option>
                </select>
              </label>

              <label>
                Starting Level
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={homebrewClass.levels}
                  onChange={(event) =>
                    updateClass({
                      levels: numberFromInput(event.target.value, 1)
                    })
                  }
                />
              </label>

              <label>
                Starting Wealth
                <input
                  value={homebrewClass.wealth}
                  onChange={(event) => updateClass({ wealth: event.target.value })}
                  placeholder="5d4 * 10"
                />
              </label>
            </fieldset>

            <fieldset className="class-fieldset">
              <legend>Spellcasting</legend>

              <label>
                Spell Progression
                <select
                  value={homebrewClass.spellcasting.progression}
                  onChange={(event) =>
                    updateSpellcasting({
                      progression: event.target
                        .value as HomebrewClass["spellcasting"]["progression"]
                    })
                  }
                >
                  <option value="none">None</option>
                  <option value="full">Full Caster</option>
                  <option value="half">Half Caster</option>
                  <option value="third">Third Caster</option>
                  <option value="pact">Pact Magic</option>
                  <option value="artificer">Artificer</option>
                </select>
              </label>

              <label>
                Spellcasting Ability
                <select
                  value={homebrewClass.spellcasting.ability}
                  onChange={(event) =>
                    updateSpellcasting({
                      ability: event.target.value as AbilityKey | ""
                    })
                  }
                >
                  <option value="">None</option>
                  {abilityOptions.map((ability) => (
                    <option value={ability.value} key={ability.value}>
                      {ability.label}
                    </option>
                  ))}
                </select>
              </label>
            </fieldset>

            <p className="muted-text">
              Saving throws, armor, weapons, skills, languages, and other proficiencies now belong in Advancement → Traits.
            </p>
          </section>
        )}

        {activeTab === "advancement" && (
          <section className="class-advancement-tab">
            <div className="advancement-toolbar">
              <div>
                <h3>Advancement</h3>
                <p className="muted-text">
                  Use the plus button to add Foundry-style advancement entries.
                  Raw JSON is still available below as an advanced fallback.
                </p>
              </div>

              <button
                type="button"
                className="advancement-add-button"
                onClick={() => setPickerOpen(true)}
                title="Add Advancement"
              >
                +
              </button>
            </div>

            <div className="advancement-list">
              {sortedAdvancements.length === 0 ? (
                <p className="fh-empty">No advancement entries yet.</p>
              ) : (
                sortedAdvancements.map((advancement) => (
                  <button
                    type="button"
                    className={
                      editingAdvancementId === advancement.id
                        ? "advancement-row active"
                        : "advancement-row"
                    }
                    key={advancement.id}
                    onClick={() => setEditingAdvancementId(advancement.id)}
                  >
                    <span className="advancement-row-icon">
                      {advancementTypeOptions.find((option) => option.value === advancement.type)?.icon ?? "◆"}
                    </span>
                    <strong>{advancement.title || advancementTypeLabel(advancement.type)}</strong>
                    <small>{advancementTypeLabel(advancement.type)}</small>
                    <span>{advancementLevelLabel(advancement)}</span>
                  </button>
                ))
              )}
            </div>

            {editingAdvancement && renderAdvancementEditor(editingAdvancement)}

            <details className="raw-advancement-details">
              <summary>Advanced Raw JSON Fallback</summary>

              <label>
                Advancement JSON
                <textarea
                  className="code-textarea"
                  value={homebrewClass.advancementJson}
                  onChange={(event) =>
                    updateClass({ advancementJson: event.target.value })
                  }
                  placeholder="{}"
                />
              </label>

              <label>
                Starting Equipment JSON
                <textarea
                  className="code-textarea"
                  value={homebrewClass.startingEquipment}
                  onChange={(event) =>
                    updateClass({ startingEquipment: event.target.value })
                  }
                  placeholder="[]"
                />
              </label>
            </details>

            {pickerOpen && (
              <div className="advancement-picker-backdrop">
                <section className="advancement-picker-modal">
                  <header>
                    <h2>Name</h2>
                    <button type="button" onClick={() => setPickerOpen(false)}>
                      ×
                    </button>
                  </header>

                  <div className="advancement-picker-list">
                    {advancementTypeOptions.map((option) => {
                      const disabled =
                        option.unique &&
                        homebrewClass.advancements?.some(
                          (advancement) => advancement.type === option.value
                        );

                      return (
                        <button
                          type="button"
                          key={option.value}
                          disabled={disabled}
                          className="advancement-picker-row"
                          onClick={() => addAdvancement(option.value)}
                        >
                          <span>{option.icon}</span>
                          <strong>{option.label}</strong>
                          <small>{disabled ? "Already added" : "○"}</small>
                        </button>
                      );
                    })}
                  </div>
                </section>
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="sheet-footer">
        <button type="button" className="secondary-button" onClick={onClose}>
          Close
        </button>

        <button
          type="button"
          className="secondary-button"
          onClick={() => onExport(homebrewClass)}
        >
          Export Class JSON
        </button>

        <button type="button" className="primary-button" onClick={saveClass}>
          Save Class
        </button>
      </footer>
    </section>
  );
}