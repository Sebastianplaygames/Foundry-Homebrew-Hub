import { useEffect, useState } from "react";
import type {HomebrewCharacter, HomebrewClass, HomebrewFeature} from "@foundry-homebrew-hub/shared";
import { CharacterSheet } from "./components/sheets/CharacterSheet";
import { ClassSheet } from "./components/sheets/ClassSheet";
import { FeatureSheet } from "./components/sheets/FeatureSheet";
import { FoundryWorkspace } from "./components/workspace/FoundryWorkspace";
import { ItemTypePicker } from "./components/workspace/ItemTypePicker";
import type { ItemCreationType, SidebarTab, WorkspaceWindow } from "./types/workspace";
import "./App.css";

type Page = "library" | "create" | "create-character";

type ExportableCharacter = HomebrewCharacter & {
  proficiencies?: {
    saves?: Record<string, boolean>;
    skills?: Record<string, number>;
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

type ExportableFeature = HomebrewFeature & {
  img?: string;
  chatDescription?: string;

  foundryType?:
    | "background"
    | "class"
    | "monster"
    | "race"
    | "enchantment"
    | "feat"
    | "supernatural"
    | "vehicle";

  requiredLevel?: number | null;
  requiredItems?: string;
  repeatable?: boolean;

  properties?: {
    magical?: boolean;
    passiveTrait?: boolean;
  };

  uses?: {
    spent?: number;
    max?: string;
    recovery?: "none" | "sr" | "lr" | "srOrLr";
  };

  activity?: {
    type?: "utility" | "damage" | "heal" | "save";
    activation?: "none" | "action" | "bonus" | "reaction" | "special";
    rangeUnits?: "self" | "touch" | "ft" | "spec";
    rangeValue?: string;
    targetType?:
      | "self"
      | "creature"
      | "ally"
      | "enemy"
      | "object"
      | "space"
      | "area"
      | "special"
      | "";
    targetValue?: string;

    damageFormula?: string;
    damageType?: string;

    healingFormula?: string;

    saveAbility?: "str" | "dex" | "con" | "int" | "wis" | "cha" | "";
    saveDc?: string;
    saveEffect?: string;
  };
};

function App() {
  const [page, setPage] = useState<Page>("library");

  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTab>("actors");
  const [workspaceWindows, setWorkspaceWindows] = useState<WorkspaceWindow[]>([]);
  const [nextWindowZIndex, setNextWindowZIndex] = useState(10);

  const [features, setFeatures] = useState<HomebrewFeature[]>([]);
  const [classes, setClasses] = useState<HomebrewClass[]>([]);
  const [characters, setCharacters] = useState<HomebrewCharacter[]>([]);

  async function loadFeatures() {
    const response = await fetch("http://localhost:3000/features");
    const data = await response.json();
    setFeatures(data);
  }

  async function loadClasses() {
    const response = await fetch("http://localhost:3000/classes");
    const data = await response.json();
    setClasses(data);
  }

  async function loadCharacters() {
    const response = await fetch("http://localhost:3000/characters");
    const data = await response.json();
    setCharacters(data);
  }

  async function saveFeatureDocument(feature: HomebrewFeature) {
    const alreadyExists = features.some((entry) => entry.id === feature.id);

    const response = await fetch(
      alreadyExists
        ? `http://localhost:3000/features/${feature.id}`
        : "http://localhost:3000/features",
      {
        method: alreadyExists ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(feature)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Feature save failed:", response.status, errorText);
      alert(`Failed to save feature: ${response.status}`);
      return;
    }

    await loadFeatures();
    setActiveSidebarTab("items");
  }

  async function saveClassDocument(homebrewClass: HomebrewClass) {
    const alreadyExists = classes.some((entry) => entry.id === homebrewClass.id);

    const response = await fetch(
      alreadyExists
        ? `http://localhost:3000/classes/${homebrewClass.id}`
        : "http://localhost:3000/classes",
      {
        method: alreadyExists ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(homebrewClass)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Class save failed:", response.status, errorText);
      alert(`Failed to save class: ${response.status}`);
      return;
    }

    await loadClasses();
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
    setPage("library");
    setActiveSidebarTab("actors");

    openWorkspaceWindow({
      type: "character",
      title: "New Character",
      x: 90,
      y: 60,
      width: 1180,
      height: 760
    });
  }

  function openNewFeatureWindow() {
    setPage("library");
    setActiveSidebarTab("items");

    openWorkspaceWindow({
      type: "feature",
      title: "New Feature",
      x: 180,
      y: 120,
      width: 720,
      height: 640
    });
  }

  function itemCreationTitle(itemType: ItemCreationType) {
    const labels: Record<ItemCreationType, string> = {
      background: "Background",
      class: "Class",
      consumable: "Consumable",
      container: "Container",
      equipment: "Equipment",
      facility: "Facility",
      feature: "Feature",
      loot: "Loot",
      species: "Species",
      spell: "Spell",
      subclass: "Subclass",
      tool: "Tool",
      weapon: "Weapon"
    };

    return labels[itemType];
  }

  function openItemTypePickerWindow() {
    setPage("library");
    setActiveSidebarTab("items");

    openWorkspaceWindow({
      type: "item-type-picker",
      title: "Create Item",
      x: 220,
      y: 80,
      width: 360,
      height: 650
    });
  }

  function createItemFromPicker(pickerWindowId: string, itemType: ItemCreationType) {
    closeWorkspaceWindow(pickerWindowId);

    if (itemType === "feature") {
      openWorkspaceWindow({
        type: "feature",
        title: "New Feature",
        x: 180,
        y: 120,
        width: 720,
        height: 640
      });

      return;
    }

    openWorkspaceWindow({
      type: itemType,
      title: `New ${itemCreationTitle(itemType)}`,
      x: 180,
      y: 120,
      width: 720,
      height: 640
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
      width: 720,
      height: 640
    });
  }

  function renderWorkspaceWindow(window: WorkspaceWindow) {
    if (window.type === "item-type-picker") {
      return (
        <ItemTypePicker
          onSelect={(itemType) => createItemFromPicker(window.id, itemType)}
          onClose={() => closeWorkspaceWindow(window.id)}
        />
      );
    }

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
        <FeatureSheet
          initialFeature={feature}
          onSave={saveFeatureDocument}
          onExport={exportFeatureItem}
          onClose={() => closeWorkspaceWindow(window.id)}
          windowed
        />
      );
    }

    if (window.type === "class") {
      const homebrewClass = classes.find((entry) => entry.id === window.documentId);

      return (
        <ClassSheet
          initialClass={homebrewClass}
          onSave={saveClassDocument}
          onExport={exportClassItem}
          onClose={() => closeWorkspaceWindow(window.id)}
          windowed
        />
      );
    }

    return (
      <div className="fh-window-placeholder">
        <h3>{window.title}</h3>
        <p>
          The {window.type} sheet is not built yet. Feature items work now; this
          sheet comes later.
        </p>
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

  function escapeHtml(text: string) {
    return text
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function textToFoundryHtml(text: string) {
    const trimmed = text.trim();

    if (!trimmed) {
      return "";
    }

    if (trimmed.startsWith("<")) {
      return trimmed;
    }

    return trimmed
      .split(/\n+/)
      .map((paragraph) => `<p>${escapeHtml(paragraph.trim())}</p>`)
      .join("");
  }

  function exportFeatureItem(feature: HomebrewFeature) {
    const fullFeature = feature as ExportableFeature;

    const propertyValues = [
      fullFeature.properties?.magical ? "mgc" : null,
      fullFeature.properties?.passiveTrait ? "trait" : null
    ].filter((value): value is string => Boolean(value));

    const recovery =
      fullFeature.uses?.recovery === "srOrLr"
        ? [
            { period: "sr", type: "recoverAll" },
            { period: "lr", type: "recoverAll" }
          ]
        : fullFeature.uses?.recovery === "sr" || fullFeature.uses?.recovery === "lr"
          ? [{ period: fullFeature.uses.recovery, type: "recoverAll" }]
          : [];

    const activityType = fullFeature.activity?.type ?? "utility";

    const hasActivity =
      fullFeature.activity?.activation !== undefined &&
      fullFeature.activity.activation !== "none";

    const activityId = crypto.randomUUID().replaceAll("-", "").slice(0, 16);

    function baseActivity() {
      return {
        _id: activityId,
        img: "",
        sort: 0,

        activation: {
          type: fullFeature.activity?.activation ?? "",
          override: true,
          condition: ""
        },

        consumption: {
          scaling: {
            allowed: false
          },
          spellSlot: true,
          targets: fullFeature.uses?.max
            ? [
                {
                  type: "itemUses",
                  value: "1",
                  scaling: {}
                }
              ]
            : []
        },

        description: {
          chatFlavor: fullFeature.chatDescription ?? ""
        },

        duration: {
          units: "inst",
          concentration: false,
          override: false
        },

        effects: [],
        flags: {},

        range: {
          units: fullFeature.activity?.rangeUnits ?? "self",
          override: false,
          special: fullFeature.activity?.rangeValue ?? ""
        },

        target: {
          template: {
            contiguous: false,
            stationary: false,
            units: "ft",
            type: fullFeature.activity?.targetType === "area" ? "circle" : ""
          },
          affects: {
            choice: false,
            type: fullFeature.activity?.targetType ?? "",
            count: fullFeature.activity?.targetValue ?? ""
          },
          override: false,
          prompt: true
        },

        uses: {
          spent: 0,
          recovery: [],
          max: ""
        },

        visibility: {
          level: {
            min: null,
            max: null
          },
          requireAttunement: false,
          requireIdentification: false,
          requireMagic: false,
          identifier: ""
        },

        useConditionText: "",
        useConditionReason: "",
        effectConditionText: fullFeature.activity?.saveEffect ?? "",

        macroData: {
          name: "",
          command: ""
        },

        ignoreTraits: {
          idi: false,
          idr: false,
          idv: false,
          ida: false,
          idm: false
        },

        name: ""
      };
    }

    function buildActivity() {
      const base = baseActivity();

      if (activityType === "heal") {
        return {
          ...base,
          type: "heal",
          healing: {
            types: ["healing"],
            custom: {
              enabled: true,
              formula: fullFeature.activity?.healingFormula ?? "0"
            },
            scaling: {
              number: 1
            },
            number: null,
            denomination: null,
            bonus: ""
          }
        };
      }

      if (activityType === "damage") {
        return {
          ...base,
          type: "damage",
          damage: {
            critical: {
              allow: true,
              bonus: ""
            },
            parts: [
              {
                custom: {
                  enabled: true,
                  formula: fullFeature.activity?.damageFormula ?? "0"
                },
                number: null,
                denomination: null,
                bonus: "",
                types: [fullFeature.activity?.damageType ?? ""],
                scaling: {
                  mode: "",
                  number: null,
                  formula: ""
                }
              }
            ]
          }
        };
      }

      if (activityType === "save") {
        return {
          ...base,
          type: "save",
          save: {
            ability: fullFeature.activity?.saveAbility
              ? [fullFeature.activity.saveAbility]
              : [],
            dc: {
              calculation: "",
              formula: fullFeature.activity?.saveDc ?? ""
            }
          },
          roll: {
            prompt: false,
            visible: false,
            name: "Effect",
            formula: ""
          }
        };
      }

      return {
        ...base,
        type: "utility",
        roll: {
          prompt: false,
          visible: false,
          name: "",
          formula: ""
        }
      };
    }

    const item = {
      name: fullFeature.name,
      type: "feat",
      img: fullFeature.img ?? "icons/svg/item-bag.svg",

      system: {
        activities: hasActivity
          ? {
              [activityId]: buildActivity()
            }
          : {},

        uses: {
          spent: fullFeature.uses?.spent ?? 0,
          recovery,
          max: fullFeature.uses?.max ?? ""
        },

        advancement: {},

        description: {
          value: textToFoundryHtml(fullFeature.description),
          chat: fullFeature.chatDescription ?? ""
        },

        identifier: "feature",

        source: {
          revision: 1,
          rules: "2024"
        },

        crewed: false,
        enchant: {},

        prerequisites: {
          items: fullFeature.requiredItems
            ? fullFeature.requiredItems
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean)
            : [],
          repeatable: fullFeature.repeatable ?? false,
          level: fullFeature.requiredLevel ?? null
        },

        properties: propertyValues,
        requirements: "",

        type: {
          value: fullFeature.foundryType ?? "",
          subtype: ""
        }
      },

      effects: [],
      flags: {},

      ownership: {
        default: 0
      }
    };

    const file = new Blob([JSON.stringify(item, null, 2)], {
      type: "application/json"
    });

    const url = URL.createObjectURL(file);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${slugify(fullFeature.name)}-item.json`;
    link.click();

    URL.revokeObjectURL(url);
  }

  function parseJsonForExport(text: string, fallback: unknown, label: string) {
    const trimmed = text.trim();

    if (!trimmed) {
      return fallback;
    }

    try {
      return JSON.parse(trimmed);
    } catch {
      alert(`${label} is not valid JSON.`);
      return null;
    }
  }

  function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }

  function scaleValueForExport(scaleType: string, value: string) {
    if (scaleType === "number") {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : value;
    }

    return value;
  }

  function classRestrictionForExport(classRestriction: string) {
    if (classRestriction === "primary") {
      return { classRestriction: "primary" };
    }

    if (classRestriction === "secondary") {
      return { classRestriction: "secondary" };
    }

    return {};
  }

  function spellAdvancementDefaults() {
    return {
      ability: [],
      uses: {
        max: "",
        per: "",
        requireSlot: false
      },
      prepared: 0
    };
  }

  function buildClassAdvancement(homebrewClass: HomebrewClass) {
    const advancement: Record<string, unknown> = {};

    for (const entry of homebrewClass.advancements ?? []) {
      if (entry.type === "hitPoints") {
        advancement[entry.id] = {
          _id: entry.id,
          type: "HitPoints",
          configuration: {},
          value: {},
          title: entry.title || "Hit Points",
          icon: entry.icon || "systems/dnd5e/icons/svg/hit-points.svg",
          flags: {},
          hint: entry.hint ?? ""
        };
      }

      if (entry.type === "abilityScoreImprovement") {
        advancement[entry.id] = {
          _id: entry.id,
          type: "AbilityScoreImprovement",
          configuration: {
            points: entry.points,
            fixed: entry.fixed,
            cap: entry.pointCap,
            locked: entry.locked,
            recommendation: null
          },
          value: {},
          level: entry.level,
          title: entry.title || "Ability Score Improvement",
          flags: {},
          hint: entry.hint ?? "",
          ...classRestrictionForExport(entry.classRestriction)
        };
      }

      if (entry.type === "itemChoice") {
        advancement[entry.id] = {
          _id: entry.id,
          type: "ItemChoice",
          configuration: {
            choices: Object.fromEntries(
              entry.choices
                .filter((choice) => choice.count > 0)
                .map((choice) => [
                  String(choice.level),
                  {
                    count: choice.count,
                    replacement: choice.replacement
                  }
                ])
            ),
            allowDrops: entry.allowDrops,
            type: entry.itemType,
            pool: entry.pool,
            spell: spellAdvancementDefaults(),
            restriction: {
              type: entry.restrictionType,
              subtype: entry.restrictionSubtype,
              level: entry.restrictionLevel,
              list: []
            }
          },
          value: {
            added: {},
            replaced: {}
          },
          level: entry.level,
          title: entry.title || "Choose Items",
          flags: {},
          hint: entry.hint ?? "",
          ...classRestrictionForExport(entry.classRestriction)
        };
      }

      if (entry.type === "itemGrant") {
        advancement[entry.id] = {
          _id: entry.id,
          type: "ItemGrant",
          configuration: {
            items: entry.items,
            optional: entry.optional,
            spell: spellAdvancementDefaults()
          },
          value: {},
          level: entry.level,
          title: entry.title || "Features",
          flags: {},
          hint: entry.hint ?? "",
          ...classRestrictionForExport(entry.classRestriction)
        };
      }

      if (entry.type === "scaleValue") {
        advancement[entry.id] = {
          _id: entry.id,
          type: "ScaleValue",
          configuration: {
            identifier: entry.identifier,
            type: entry.scaleType,
            distance: {
              units: entry.distanceUnits
            },
            scale: Object.fromEntries(
              entry.scale
                .filter((scaleEntry) => scaleEntry.value !== "")
                .map((scaleEntry) => [
                  String(scaleEntry.level),
                  {
                    value: scaleValueForExport(entry.scaleType, scaleEntry.value)
                  }
                ])
            )
          },
          value: {},
          level: entry.level,
          title: entry.title || "Scale Value",
          flags: {},
          hint: entry.hint ?? "",
          ...classRestrictionForExport(entry.classRestriction)
        };
      }

      if (entry.type === "subclass") {
        advancement[entry.id] = {
          _id: entry.id,
          type: "Subclass",
          configuration: {},
          value: {
            document: null,
            uuid: null
          },
          level: entry.level,
          title: entry.title || "Subclass",
          flags: {},
          hint: entry.hint ?? "",
          ...classRestrictionForExport(entry.classRestriction)
        };
      }

      if (entry.type === "trait") {
        advancement[entry.id] = {
          _id: entry.id,
          type: "Trait",
          configuration: {
            mode: entry.mode,
            allowReplacements: entry.allowReplacements,
            grants: entry.grants,
            choices: entry.choices.map((choice) => ({
              count: 1,
              pool: [choice]
            }))
          },
          value: {
            chosen: []
          },
          level: entry.level,
          title: entry.title || "Traits",
          flags: {},
          hint: entry.hint ?? "",
          ...classRestrictionForExport(entry.classRestriction)
        };
      }
    }

    return advancement;
  }

  function exportClassItem(homebrewClass: HomebrewClass) {
    const rawAdvancement = parseJsonForExport(
      homebrewClass.advancementJson,
      {},
      "Advancement JSON"
    );

    if (rawAdvancement === null) {
      return;
    }

    if (!isRecord(rawAdvancement)) {
      alert("Advancement JSON must be an object, like {}.");
      return;
    }

    const generatedAdvancement = buildClassAdvancement(homebrewClass);
    const advancement = {
      ...rawAdvancement,
      ...generatedAdvancement
    };

    const startingEquipment = parseJsonForExport(
      homebrewClass.startingEquipment,
      [],
      "Starting Equipment JSON"
    );

    if (startingEquipment === null) {
      return;
    }

    const item = {
      name: homebrewClass.name,
      type: "class",
      img: homebrewClass.img || "icons/svg/book.svg",

      system: {
        description: {
          value: textToFoundryHtml(homebrewClass.description),
          chat: ""
        },

        source: {
          custom: "",
          book: "",
          page: "",
          license: "",
          rules: "2024",
          revision: 1
        },

        identifier: homebrewClass.identifier || slugify(homebrewClass.name),
        levels: homebrewClass.levels,

        advancement,

        spellcasting: {
          progression: homebrewClass.spellcasting.progression,
          ability: homebrewClass.spellcasting.ability,
          preparation: {}
        },

        startingEquipment,
        wealth: homebrewClass.wealth,

        primaryAbility: {
          value: homebrewClass.primaryAbility,
          all: homebrewClass.primaryAbility.length === 0
        },

        hd: {
          denomination: homebrewClass.hitDie,
          spent: 0,
          additional: ""
        },

        properties: []
      },

      effects: [],
      flags: {},

      ownership: {
        default: 0
      }
    };

    const file = new Blob([JSON.stringify(item, null, 2)], {
      type: "application/json"
    });

    const url = URL.createObjectURL(file);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${slugify(homebrewClass.name)}-class.json`;
    link.click();

    URL.revokeObjectURL(url);
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
      return proficiencies.skills?.[skill] ?? 0;
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
              blindsight: proficiencies.senses.includes("Blindsight") ? 30 : null,
              darkvision: proficiencies.senses.includes("Darkvision") ? 60 : null,
              tremorsense: proficiencies.senses.includes("Tremorsense") ? 30 : null,
              truesight: proficiencies.senses.includes("Truesight") ? 30 : null
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

  useEffect(() => {
    loadFeatures();
    loadClasses();
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
          onCreateFeature={openItemTypePickerWindow}
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
            <button className="create-card" onClick={openItemTypePickerWindow}>
              <span>✨</span>
              <h3>Feature / Item</h3>
              <p>Create a feat, class feature, species feature, or item-like ability.</p>
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