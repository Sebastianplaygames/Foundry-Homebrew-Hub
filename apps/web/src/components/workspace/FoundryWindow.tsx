import type { PointerEvent, ReactNode } from "react";
import type { WorkspaceWindow } from "../../types/workspace";

type FoundryWindowProps = {
  window: WorkspaceWindow;
  children: ReactNode;
  onClose: (id: string) => void;
  onFocus: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onResize: (id: string, width: number, height: number) => void;
  onToggleMinimize: (id: string) => void;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function FoundryWindow({
  window: workspaceWindow,
  children,
  onClose,
  onFocus,
  onMove,
  onResize,
  onToggleMinimize
}: FoundryWindowProps) {
  function startDragging(event: PointerEvent<HTMLElement>) {
    const target = event.target as HTMLElement;

    if (target.closest("button")) {
      return;
    }

    event.preventDefault();
    onFocus(workspaceWindow.id);

    const windowElement = event.currentTarget.closest(".fh-window") as HTMLElement | null;
    const layerElement = windowElement?.parentElement;

    if (!layerElement) {
      return;
    }

    const layerRect = layerElement.getBoundingClientRect();

    const startPointerX = event.clientX;
    const startPointerY = event.clientY;
    const startWindowX = workspaceWindow.x;
    const startWindowY = workspaceWindow.y;

    function handlePointerMove(moveEvent: globalThis.PointerEvent) {
      const deltaX = moveEvent.clientX - startPointerX;
      const deltaY = moveEvent.clientY - startPointerY;

      const nextX = clamp(startWindowX + deltaX, 0, layerRect.width - 160);
      const nextY = clamp(startWindowY + deltaY, 0, layerRect.height - 42);

      onMove(workspaceWindow.id, nextX, nextY);
    }

    function handlePointerUp() {
      globalThis.window.removeEventListener("pointermove", handlePointerMove);
      globalThis.window.removeEventListener("pointerup", handlePointerUp);
    }

    globalThis.window.addEventListener("pointermove", handlePointerMove);
    globalThis.window.addEventListener("pointerup", handlePointerUp);
  }

  function startResizing(event: PointerEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    onFocus(workspaceWindow.id);

    const startPointerX = event.clientX;
    const startPointerY = event.clientY;
    const startWidth = workspaceWindow.width;
    const startHeight = workspaceWindow.height;

    function handlePointerMove(moveEvent: globalThis.PointerEvent) {
      const deltaX = moveEvent.clientX - startPointerX;
      const deltaY = moveEvent.clientY - startPointerY;

      const minWidth = workspaceWindow.type === "character" ? 780 : 420;
      const minHeight = workspaceWindow.type === "character" ? 520 : 220;

      const nextWidth = Math.max(minWidth, startWidth + deltaX);
      const nextHeight = Math.max(minHeight, startHeight + deltaY);

      onResize(workspaceWindow.id, nextWidth, nextHeight);
    }

    function handlePointerUp() {
      globalThis.window.removeEventListener("pointermove", handlePointerMove);
      globalThis.window.removeEventListener("pointerup", handlePointerUp);
    }

    globalThis.window.addEventListener("pointermove", handlePointerMove);
    globalThis.window.addEventListener("pointerup", handlePointerUp);
  }

  return (
    <section
      className={workspaceWindow.isMinimized ? "fh-window is-minimized" : "fh-window"}
      style={{
        left: workspaceWindow.x,
        top: workspaceWindow.y,
        width: workspaceWindow.isMinimized
          ? Math.min(workspaceWindow.width, 360)
          : workspaceWindow.width,
        height: workspaceWindow.isMinimized ? 42 : workspaceWindow.height,
        zIndex: workspaceWindow.zIndex
      }}
      onMouseDown={() => onFocus(workspaceWindow.id)}
    >
      <header
        className="fh-window-header"
        onPointerDown={startDragging}
        onDoubleClick={() => onToggleMinimize(workspaceWindow.id)}
        title="Drag to move. Double-click to minimize."
      >
        <button
          className="fh-window-icon"
          onClick={(event) => {
            event.stopPropagation();
            onToggleMinimize(workspaceWindow.id);
          }}
          title={workspaceWindow.isMinimized ? "Restore" : "Minimize"}
        >
          {workspaceWindow.isMinimized ? "▣" : "—"}
        </button>

        <h2>{workspaceWindow.title}</h2>

        <div className="fh-window-controls">
          <button
            onClick={(event) => {
              event.stopPropagation();
              onClose(workspaceWindow.id);
            }}
            title="Close"
          >
            ×
          </button>
        </div>
      </header>

      {!workspaceWindow.isMinimized && <div className="fh-window-body">{children}</div>}

      {!workspaceWindow.isMinimized && (
        <div
          className="fh-window-resize-handle"
          onPointerDown={startResizing}
          title="Resize"
        />
      )}
    </section>
  );
}