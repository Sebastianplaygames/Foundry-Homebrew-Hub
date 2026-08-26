import { useState } from "react";
import type { HomebrewFeature } from "@foundry-homebrew-hub/shared";

type FeatureTab = "description" | "details" | "activities" | "effects" | "advancement";

type FoundryFeatureType =
  | "background"
  | "class"
  | "monster"
  | "race"
  | "enchantment"
  | "feat"
  | "supernatural"
  | "vehicle";

type ActivityType = "utility" | "damage" | "heal" | "save";

type FeatureSheetProps = {
  initialFeature?: HomebrewFeature;
  onSave: (feature: HomebrewFeature) => Promise<void> | void;
  onExport: (feature: HomebrewFeature) => void;
  onClose?: () => void;
  windowed?: boolean;
};

type ExtendedFeature = HomebrewFeature & {
  img?: string;
  chatDescription?: string;
  foundryType?: FoundryFeatureType;
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
    type?: ActivityType;
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

const featureTypeOptions: { value: FoundryFeatureType; label: string }[] = [
  { value: "background", label: "Background Feature" },
  { value: "class", label: "Class Feature" },
  { value: "monster", label: "Monster Feature" },
  { value: "race", label: "Species Feature" },
  { value: "enchantment", label: "Enchantment" },
  { value: "feat", label: "Feat" },
  { value: "supernatural", label: "Supernatural Gift" },
  { value: "vehicle", label: "Vehicle Feature" }
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

function legacyTypeFromFoundryType(foundryType: FoundryFeatureType): HomebrewFeature["type"] {
  if (foundryType === "class") return "classFeature";
  if (foundryType === "race") return "raceFeature";
  if (foundryType === "enchantment") return "item";
  return "feat";
}

function labelForFoundryType(type: FoundryFeatureType) {
  return featureTypeOptions.find((option) => option.value === type)?.label ?? "Feature";
}

export function FeatureSheet({
  initialFeature,
  onSave,
  onExport,
  onClose,
  windowed = false
}: FeatureSheetProps) {
  const feature = initialFeature as ExtendedFeature | undefined;

  const [featureId] = useState(() => feature?.id ?? crypto.randomUUID());
  const [featureTab, setFeatureTab] = useState<FeatureTab>("description");

  const [name, setName] = useState(feature?.name ?? "New Feature");
  const [img, setImg] = useState(feature?.img ?? "icons/svg/item-bag.svg");

  const [description, setDescription] = useState(feature?.description ?? "");
  const [chatDescription, setChatDescription] = useState(feature?.chatDescription ?? "");

  const [foundryType, setFoundryType] = useState<FoundryFeatureType>(
    feature?.foundryType ?? "feat"
  );

  const [requiredLevel, setRequiredLevel] = useState(
    feature?.requiredLevel?.toString() ?? ""
  );

  const [requiredItems, setRequiredItems] = useState(feature?.requiredItems ?? "");
  const [repeatable, setRepeatable] = useState(feature?.repeatable ?? false);

  const [magical, setMagical] = useState(feature?.properties?.magical ?? false);
  const [passiveTrait, setPassiveTrait] = useState(
    feature?.properties?.passiveTrait ?? false
  );

  const [usesSpent, setUsesSpent] = useState(feature?.uses?.spent?.toString() ?? "0");
  const [usesMax, setUsesMax] = useState(feature?.uses?.max ?? "");
  const [recovery, setRecovery] = useState<"none" | "sr" | "lr" | "srOrLr">(
    feature?.uses?.recovery ?? "none"
  );

  const [activityType, setActivityType] = useState<ActivityType>(
    feature?.activity?.type ?? "utility"
  );

  const [activation, setActivation] = useState<
    "none" | "action" | "bonus" | "reaction" | "special"
  >(feature?.activity?.activation ?? "none");

  const [rangeUnits, setRangeUnits] = useState<"self" | "touch" | "ft" | "spec">(
    feature?.activity?.rangeUnits ?? "self"
  );

  const [rangeValue, setRangeValue] = useState(feature?.activity?.rangeValue ?? "");

  const [targetType, setTargetType] = useState<
    "self" | "creature" | "ally" | "enemy" | "object" | "space" | "area" | "special" | ""
  >(feature?.activity?.targetType ?? "self");

  const [targetValue, setTargetValue] = useState(feature?.activity?.targetValue ?? "");

  const [damageFormula, setDamageFormula] = useState(feature?.activity?.damageFormula ?? "");
  const [damageType, setDamageType] = useState(feature?.activity?.damageType ?? "fire");

  const [healingFormula, setHealingFormula] = useState(
    feature?.activity?.healingFormula ?? ""
  );

  const [saveAbility, setSaveAbility] = useState<
    "str" | "dex" | "con" | "int" | "wis" | "cha" | ""
  >(feature?.activity?.saveAbility ?? "");

  const [saveDc, setSaveDc] = useState(feature?.activity?.saveDc ?? "");
  const [saveEffect, setSaveEffect] = useState(feature?.activity?.saveEffect ?? "");

  function buildFeature(): HomebrewFeature {
    const numericRequiredLevel = requiredLevel.trim() ? Number(requiredLevel) : null;

    return {
      id: featureId,
      name,
      type: legacyTypeFromFoundryType(foundryType),
      description,

      img,
      chatDescription,
      foundryType,

      requiredLevel: Number.isNaN(numericRequiredLevel) ? null : numericRequiredLevel,
      requiredItems,
      repeatable,

      properties: {
        magical,
        passiveTrait
      },

      uses: {
        spent: Number(usesSpent) || 0,
        max: usesMax,
        recovery
      },

      activity: {
        type: activityType,
        activation,
        rangeUnits,
        rangeValue,
        targetType,
        targetValue,
        damageFormula,
        damageType,
        healingFormula,
        saveAbility,
        saveDc,
        saveEffect
      }
    } as HomebrewFeature;
  }

  async function handleSave() {
    if (!name.trim()) {
      alert("Feature needs a name.");
      return;
    }

    if (!description.trim()) {
      alert("Feature needs a description.");
      return;
    }

    await onSave(buildFeature());
  }

  return (
    <section
      className={
        windowed
          ? "foundry-feature-sheet foundry-feature-sheet--window"
          : "foundry-feature-sheet"
      }
    >
      <header className="feature-sheet-header">
        {onClose && (
          <button className="sheet-back-button" onClick={onClose}>
            Close
          </button>
        )}

        <div className="feature-icon-box">
          <input
            value={img}
            onChange={(event) => setImg(event.target.value)}
            title="Foundry image path"
          />
        </div>

        <div className="feature-title-block">
          <input
            className="feature-title-input"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />

          <p>{labelForFoundryType(foundryType)}</p>
        </div>
      </header>

      <nav className="foundry-tabs feature-tabs">
        {[
          ["description", "Description"],
          ["details", "Details"],
          ["activities", "Activities"],
          ["effects", "Effects"],
          ["advancement", "Advancement"]
        ].map(([tab, label]) => (
          <button
            key={tab}
            className={featureTab === tab ? "active" : ""}
            onClick={() => setFeatureTab(tab as FeatureTab)}
          >
            {label}
          </button>
        ))}
      </nav>

      <main className="feature-sheet-body">
        {featureTab === "description" && (
          <section className="foundry-card feature-description-tab">
            <h2>Description</h2>

            <label>
              Description
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Write the main feature description..."
              />
            </label>

            <label>
              Chat Description
              <textarea
                value={chatDescription}
                onChange={(event) => setChatDescription(event.target.value)}
                placeholder="Optional short chat text..."
              />
            </label>
          </section>
        )}

        {featureTab === "details" && (
          <section className="foundry-card feature-details-tab">
            <h2>Feature Details</h2>

            <label>
              Type
              <select
                value={foundryType}
                onChange={(event) => setFoundryType(event.target.value as FoundryFeatureType)}
              >
                {featureTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Required Level
              <input
                type="number"
                min={0}
                value={requiredLevel}
                onChange={(event) => setRequiredLevel(event.target.value)}
                placeholder="Optional"
              />
            </label>

            <label>
              Required Items
              <input
                value={requiredItems}
                onChange={(event) => setRequiredItems(event.target.value)}
                placeholder="Identifiers for required items"
              />
            </label>

            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={repeatable}
                onChange={(event) => setRepeatable(event.target.checked)}
              />
              Repeatable
            </label>

            <div className="feature-property-grid">
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={magical}
                  onChange={(event) => setMagical(event.target.checked)}
                />
                Magical
              </label>

              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={passiveTrait}
                  onChange={(event) => setPassiveTrait(event.target.checked)}
                />
                Passive Trait
              </label>
            </div>

            <fieldset className="feature-fieldset">
              <legend>Usage</legend>

              <label>
                Spent
                <input
                  type="number"
                  min={0}
                  value={usesSpent}
                  onChange={(event) => setUsesSpent(event.target.value)}
                />
              </label>

              <label>
                Max
                <input
                  value={usesMax}
                  onChange={(event) => setUsesMax(event.target.value)}
                  placeholder="@prof, 1, 2, 5 * @classes.psion.levels"
                />
              </label>

              <label>
                Recovery
                <select
                  value={recovery}
                  onChange={(event) => setRecovery(event.target.value as typeof recovery)}
                >
                  <option value="none">None</option>
                  <option value="sr">Short Rest</option>
                  <option value="lr">Long Rest</option>
                  <option value="srOrLr">Short or Long Rest</option>
                </select>
              </label>
            </fieldset>
          </section>
        )}

        {featureTab === "activities" && (
          <section className="foundry-card feature-activities-tab">
            <h2>Activity</h2>

            <label>
              Activity Type
              <select
                value={activityType}
                onChange={(event) => setActivityType(event.target.value as ActivityType)}
              >
                <option value="utility">Utility</option>
                <option value="damage">Damage</option>
                <option value="heal">Healing</option>
                <option value="save">Save</option>
              </select>
            </label>

            <label>
              Activation
              <select
                value={activation}
                onChange={(event) => setActivation(event.target.value as typeof activation)}
              >
                <option value="none">Passive / None</option>
                <option value="action">Action</option>
                <option value="bonus">Bonus Action</option>
                <option value="reaction">Reaction</option>
                <option value="special">Special</option>
              </select>
            </label>

            <label>
              Range Units
              <select
                value={rangeUnits}
                onChange={(event) => setRangeUnits(event.target.value as typeof rangeUnits)}
              >
                <option value="self">Self</option>
                <option value="touch">Touch</option>
                <option value="ft">Feet</option>
                <option value="spec">Special</option>
              </select>
            </label>

            <label>
              Range Value
              <input
                value={rangeValue}
                onChange={(event) => setRangeValue(event.target.value)}
                placeholder="30"
              />
            </label>

            <label>
              Target Type
              <select
                value={targetType}
                onChange={(event) => setTargetType(event.target.value as typeof targetType)}
              >
                <option value="">None</option>
                <option value="self">Self</option>
                <option value="creature">Creature</option>
                <option value="ally">Ally</option>
                <option value="enemy">Enemy</option>
                <option value="object">Object</option>
                <option value="space">Space</option>
                <option value="area">Area</option>
                <option value="special">Special</option>
              </select>
            </label>

            <label>
              Target Value
              <input
                value={targetValue}
                onChange={(event) => setTargetValue(event.target.value)}
                placeholder="1"
              />
            </label>

            {activityType === "damage" && (
              <div className="activity-extra-grid">
                <label>
                  Damage Formula
                  <input
                    value={damageFormula}
                    onChange={(event) => setDamageFormula(event.target.value)}
                    placeholder="2d6"
                  />
                </label>

                <label>
                  Damage Type
                  <select
                    value={damageType}
                    onChange={(event) => setDamageType(event.target.value)}
                  >
                    {damageTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}

            {activityType === "heal" && (
              <label>
                Healing Formula
                <input
                  value={healingFormula}
                  onChange={(event) => setHealingFormula(event.target.value)}
                  placeholder="1d8 + @mod"
                />
              </label>
            )}

            {activityType === "save" && (
              <div className="activity-extra-grid">
                <label>
                  Save Ability
                  <select
                    value={saveAbility}
                    onChange={(event) => setSaveAbility(event.target.value as typeof saveAbility)}
                  >
                    <option value="">None</option>
                    <option value="str">Strength</option>
                    <option value="dex">Dexterity</option>
                    <option value="con">Constitution</option>
                    <option value="int">Intelligence</option>
                    <option value="wis">Wisdom</option>
                    <option value="cha">Charisma</option>
                  </select>
                </label>

                <label>
                  Save DC
                  <input
                    value={saveDc}
                    onChange={(event) => setSaveDc(event.target.value)}
                    placeholder="16 or @attributes.spelldc"
                  />
                </label>

                <label className="activity-wide">
                  Failed Save Effect
                  <input
                    value={saveEffect}
                    onChange={(event) => setSaveEffect(event.target.value)}
                    placeholder="Blinded until the end of its next turn"
                  />
                </label>
              </div>
            )}
          </section>
        )}

        {featureTab === "effects" && (
          <section className="foundry-card tab-card">
            <h2>Effects</h2>
            <p className="muted-text">Active effects come later.</p>
          </section>
        )}

        {featureTab === "advancement" && (
          <section className="foundry-card tab-card">
            <h2>Advancement</h2>
            <p className="muted-text">Advancement comes later.</p>
          </section>
        )}
      </main>

      <footer className="sheet-footer-actions">
        <button className="primary-button" onClick={handleSave}>
          Save Feature
        </button>

        <button onClick={() => onExport(buildFeature())}>
          Export Item JSON
        </button>
      </footer>
    </section>
  );
}