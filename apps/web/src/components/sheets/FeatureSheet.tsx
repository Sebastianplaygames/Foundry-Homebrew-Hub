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

type FeatureSheetProps = {
  initialFeature?: HomebrewFeature;
  onSave: (feature: HomebrewFeature) => Promise<void> | void;
  onExport: (feature: HomebrewFeature) => void;
  onClose?: () => void;
  windowed?: boolean;
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
  const [featureId] = useState(() => initialFeature?.id ?? crypto.randomUUID());
  const [featureTab, setFeatureTab] = useState<FeatureTab>("description");

  const [name, setName] = useState(initialFeature?.name ?? "New Feature");
  const [img, setImg] = useState(
    initialFeature?.img ?? "icons/svg/item-bag.svg"
  );

  const [description, setDescription] = useState(initialFeature?.description ?? "");
  const [chatDescription, setChatDescription] = useState(
    initialFeature?.chatDescription ?? ""
  );

  const [foundryType, setFoundryType] = useState<FoundryFeatureType>(
    (initialFeature?.foundryType as FoundryFeatureType | undefined) ?? "feat"
  );

  const [requiredLevel, setRequiredLevel] = useState(
    initialFeature?.requiredLevel?.toString() ?? ""
  );

  const [requiredItems, setRequiredItems] = useState(initialFeature?.requiredItems ?? "");
  const [repeatable, setRepeatable] = useState(initialFeature?.repeatable ?? false);

  const [magical, setMagical] = useState(initialFeature?.properties?.magical ?? false);
  const [passiveTrait, setPassiveTrait] = useState(
    initialFeature?.properties?.passiveTrait ?? false
  );

  const [usesSpent, setUsesSpent] = useState(
    initialFeature?.uses?.spent?.toString() ?? "0"
  );
  const [usesMax, setUsesMax] = useState(initialFeature?.uses?.max ?? "");
  const [recovery, setRecovery] = useState<"none" | "sr" | "lr" | "srOrLr">(
    initialFeature?.uses?.recovery ?? "none"
  );

  const [activation, setActivation] = useState<
    "none" | "action" | "bonus" | "reaction" | "special"
  >(initialFeature?.activity?.activation ?? "none");

  const [rangeUnits, setRangeUnits] = useState<"self" | "touch" | "ft" | "spec">(
    initialFeature?.activity?.rangeUnits ?? "self"
  );

  const [rangeValue, setRangeValue] = useState(initialFeature?.activity?.rangeValue ?? "");

  const [targetType, setTargetType] = useState<
    "self" | "creature" | "ally" | "enemy" | "object" | "space" | "area" | "special" | ""
  >(initialFeature?.activity?.targetType ?? "self");

  const [targetValue, setTargetValue] = useState(initialFeature?.activity?.targetValue ?? "");

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
        activation,
        rangeUnits,
        rangeValue,
        targetType,
        targetValue
      }
    };
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
    <section className={windowed ? "foundry-feature-sheet foundry-feature-sheet--window" : "foundry-feature-sheet"}>
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