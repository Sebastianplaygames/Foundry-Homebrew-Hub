import { useState } from "react";
import type { ItemCreationType } from "../../types/workspace";

type ItemTypePickerProps = {
  onSelect: (itemType: ItemCreationType) => void;
  onClose?: () => void;
};

const itemTypes: {
  value: ItemCreationType;
  label: string;
  icon: string;
}[] = [
  { value: "background", label: "Background", icon: "↱" },
  { value: "class", label: "Class", icon: "⚔" },
  { value: "consumable", label: "Consumable", icon: "◉" },
  { value: "container", label: "Container", icon: "▣" },
  { value: "equipment", label: "Equipment", icon: "◈" },
  { value: "facility", label: "Facility", icon: "▥" },
  { value: "feature", label: "Feature", icon: "★" },
  { value: "loot", label: "Loot", icon: "◫" },
  { value: "species", label: "Species", icon: "♞" },
  { value: "spell", label: "Spell", icon: "✴" },
  { value: "subclass", label: "Subclass", icon: "♜" },
  { value: "tool", label: "Tool", icon: "⚒" },
  { value: "weapon", label: "Weapon", icon: "⚔" }
];

export function ItemTypePicker({ onSelect, onClose }: ItemTypePickerProps) {
  const [selectedType, setSelectedType] = useState<ItemCreationType>("feature");

  return (
    <section className="item-type-picker">
      <header className="item-type-picker-header">
        <h2>Name</h2>

        {onClose && (
          <button type="button" onClick={onClose} title="Close">
            ×
          </button>
        )}
      </header>

      <main className="item-type-list">
        {itemTypes.map((itemType) => (
          <button
            key={itemType.value}
            type="button"
            className={
              selectedType === itemType.value
                ? "item-type-row selected"
                : "item-type-row"
            }
            onClick={() => setSelectedType(itemType.value)}
            onDoubleClick={() => onSelect(itemType.value)}
          >
            <span className="item-type-icon">{itemType.icon}</span>
            <strong>{itemType.label}</strong>
            <span className="item-type-radio" />
          </button>
        ))}
      </main>

      <footer className="item-type-picker-footer">
        <label>
          Folder
          <select value="" onChange={() => {}}>
            <option value="">None</option>
          </select>
        </label>

        <button
          type="button"
          className="primary-button create-item-confirm"
          onClick={() => onSelect(selectedType)}
        >
          ✓ Create Item
        </button>
      </footer>
    </section>
  );
}