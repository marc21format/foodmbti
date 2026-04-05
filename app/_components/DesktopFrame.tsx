"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { VT323 } from "next/font/google";

type DesktopTab = "home" | "quiz" | "admin" | "login";

const vt323 = VT323({ weight: "400", subsets: ["latin"] });

type IconKey = "system" | "games" | "trash";

type IconPosition = {
  x: number;
  y: number;
};

const INITIAL_ICON_POSITIONS: Record<IconKey, IconPosition> = {
  system: { x: 887, y: 64 },
  games: { x: 913, y: 200 },
  trash: { x: 913, y: 558 },
};

export default function DesktopFrame({
  activeTab: _activeTab,
  children,
  onOpenAdminDashboard,
}: {
  activeTab: DesktopTab;
  children: ReactNode;
  onOpenAdminDashboard?: () => void;
}) {
  const router = useRouter();
  const [iconPositions, setIconPositions] = useState<Record<IconKey, IconPosition>>(INITIAL_ICON_POSITIONS);
  const [draggingIcon, setDraggingIcon] = useState<IconKey | null>(null);
  const [iconDragStarted, setIconDragStarted] = useState(false);
  const dragOffset = useRef<IconPosition>({ x: 0, y: 0 });
  const movedDuringDrag = useRef(false);
  const pointerDownAt = useRef<IconPosition>({ x: 0, y: 0 });
  const iconStartAt = useRef<IconPosition>({ x: 0, y: 0 });
  const iconDragBounds = useRef<IconPosition>({ x: 930, y: 560 });

  useEffect(() => {
    if (!draggingIcon) return;

    const handlePointerMove = (event: PointerEvent) => {
      const deltaX = event.clientX - pointerDownAt.current.x;
      const deltaY = event.clientY - pointerDownAt.current.y;
      const hasCrossedThreshold = Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4;

      if (!hasCrossedThreshold && !iconDragStarted) return;

      if (!iconDragStarted) setIconDragStarted(true);
      movedDuringDrag.current = true;

      const nextX = iconStartAt.current.x + deltaX;
      const nextY = iconStartAt.current.y + deltaY;
      setIconPositions((prev) => ({
        ...prev,
        [draggingIcon]: {
          x: Math.max(0, Math.min(iconDragBounds.current.x, nextX)),
          y: Math.max(0, Math.min(iconDragBounds.current.y, nextY)),
        },
      }));
    };

    const handlePointerUp = () => {
      setDraggingIcon(null);
      setIconDragStarted(false);
      window.setTimeout(() => {
        movedDuringDrag.current = false;
      }, 0);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [draggingIcon]);

  const startIconDrag = (icon: IconKey, event: ReactPointerEvent<HTMLButtonElement>) => {
    const iconsPane = event.currentTarget.closest(".desktop-icons") as HTMLElement | null;
    if (!iconsPane) return;

    const iconsRect = iconsPane.getBoundingClientRect();
    iconDragBounds.current = {
      x: Math.max(0, iconsRect.width - 88),
      y: Math.max(0, iconsRect.height - 96),
    };

    const iconPos = iconPositions[icon];
    const iconLeftInViewport = iconsRect.left + iconPos.x;
    const iconTopInViewport = iconsRect.top + iconPos.y;

    dragOffset.current = {
      x: event.clientX - iconLeftInViewport,
      y: event.clientY - iconTopInViewport,
    };

    pointerDownAt.current = { x: event.clientX, y: event.clientY };
    iconStartAt.current = { x: iconPos.x, y: iconPos.y };

    movedDuringDrag.current = false;
    setDraggingIcon(icon);
  };

  const handleIconClick = (icon: IconKey) => {
    if (movedDuringDrag.current) return;
    if (icon === "games") return;
  };

  const handleIconDoubleClick = (icon: IconKey) => {
    if (movedDuringDrag.current) return;
    if (icon === "games") router.push("/quiz");
  };

  return (
    <main className={`desktop-root ${vt323.className}`}>
      <div className="screen-frame">
        <header className="desktop-menu-bar">
          <div className="desktop-menu-left">
            <span className="apple-pixel" aria-hidden="true" />
            <span className="menu-item">File</span>
            <span className="menu-item">Edit</span>
            <span className="menu-item">View</span>
            <span className="menu-item special-menu">
              Special
              <ul className="drop-down" aria-label="Special menu">
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenAdminDashboard) {
                        onOpenAdminDashboard();
                        return;
                      }
                      router.push("/admin");
                    }}
                  >
                    Admin Dashboard
                  </button>
                </li>
              </ul>
            </span>
          </div>
        </header>

        <div className="desktop-wallpaper" aria-hidden="true" />

        <aside className="desktop-icons" aria-label="Desktop icons">
          <button
            className="desktop-item"
            id="system"
            type="button"
            aria-label="System Disk"
            style={{ left: `${iconPositions.system.x}px`, top: `${iconPositions.system.y}px` }}
            onPointerDown={(event) => startIconDrag("system", event)}
            onClick={() => handleIconClick("system")}
            onDoubleClick={() => handleIconDoubleClick("system")}
          >
            <span className="icon hard-disk-icon" aria-hidden="true" />
            <span className="desktop-icon-label">System Disk</span>
          </button>
          <button
            className="desktop-item"
            id="games"
            type="button"
            aria-label="Food"
            style={{ left: `${iconPositions.games.x}px`, top: `${iconPositions.games.y}px` }}
            onPointerDown={(event) => startIconDrag("games", event)}
            onClick={() => handleIconClick("games")}
            onDoubleClick={() => handleIconDoubleClick("games")}
          >
            <span className="icon disk-big" aria-hidden="true">
              <span className="shutter" />
              <span className="label" />
            </span>
            <span className="desktop-icon-label">FoodDecisionERin</span>
          </button>
          <button
            className="desktop-item"
            id="trash"
            type="button"
            aria-label="Trash"
            style={{ left: `${iconPositions.trash.x}px`, top: `${iconPositions.trash.y}px` }}
            onPointerDown={(event) => startIconDrag("trash", event)}
            onClick={() => handleIconClick("trash")}
            onDoubleClick={() => handleIconDoubleClick("trash")}
          >
            <span className="icon trash-icon" aria-hidden="true">
              <span className="cover" />
              <span className="can" />
            </span>
            <span className="desktop-icon-label">Trash</span>
          </button>
        </aside>

        <section className="desktop-content">{children}</section>
      </div>

      <style jsx>{`
        .desktop-root {
          min-height: 100vh;
          padding: 0;
          display: grid;
          place-items: center;
          background: #000;
          position: relative;
        }

        .screen-frame {
          position: relative;
          width: min(1024px, 100vw);
          height: min(680px, 100vh);
          overflow: hidden;
          border-radius: 10px;
          background: conic-gradient(#000 90deg, #fff 0, #fff 180deg, #000 0, #000 270deg, #fff 0);
          background-size: 2px 2px;
          padding: 40px 20px 20px;
        }

        .screen-frame::after {
          content: "";
          position: absolute;
          top: -200px;
          left: -25%;
          width: 150%;
          height: 200px;
          filter: blur(4px);
          background: #000;
          opacity: 0.08;
          z-index: 100;
          animation: screenLine 4s linear infinite;
          pointer-events: none;
        }

        .desktop-wallpaper {
          position: absolute;
          inset: 40px 0 0 0;
          background: #c9c9c9;
          background-image: conic-gradient(#777 90deg, #d8d8d8 0, #d8d8d8 180deg, #777 0, #777 270deg, #d8d8d8 0);
          background-size: 2px 2px;
          pointer-events: none;
        }

        .desktop-menu-bar {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 40px;
          background: #fff;
          border-top: 2px solid #fff;
          border-bottom: 2px solid #000;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 8px;
          z-index: 30;
          gap: 0.5rem;
        }

        .desktop-menu-left {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 30px;
          font-weight: 400;
          line-height: 34px;
        }

        .apple-pixel {
          position: relative;
          width: 38px;
          height: 36px;
          display: inline-block;
          margin-right: 0.1rem;
          cursor: default;
        }

        .apple-pixel::after {
          content: "";
          position: absolute;
          top: 4px;
          left: 10px;
          width: 2px;
          height: 2px;
          background: transparent;
          box-shadow:
            10px 0 0 #000,
            12px 0 0 #000,
            8px 2px 0 #000,
            10px 2px 0 #000,
            8px 4px 0 #000,
            2px 6px 0 #000,
            4px 6px 0 #000,
            6px 6px 0 #000,
            10px 6px 0 #000,
            12px 6px 0 #000,
            14px 6px 0 #000,
            0 8px 0 #000,
            2px 8px 0 #000,
            4px 8px 0 #000,
            6px 8px 0 #000,
            8px 8px 0 #000,
            10px 8px 0 #000,
            12px 8px 0 #000,
            14px 8px 0 #000,
            16px 8px 0 #000,
            0 10px 0 #000,
            2px 10px 0 #000,
            4px 10px 0 #000,
            6px 10px 0 #000,
            8px 10px 0 #000,
            10px 10px 0 #000,
            12px 10px 0 #000,
            0 12px 0 #000,
            2px 12px 0 #000,
            4px 12px 0 #000,
            6px 12px 0 #000,
            8px 12px 0 #000,
            10px 12px 0 #000,
            12px 12px 0 #000,
            0 14px 0 #000,
            2px 14px 0 #000,
            4px 14px 0 #000,
            6px 14px 0 #000,
            8px 14px 0 #000,
            10px 14px 0 #000,
            12px 14px 0 #000,
            14px 14px 0 #000,
            16px 14px 0 #000,
            0 16px 0 #000,
            2px 16px 0 #000,
            4px 16px 0 #000,
            6px 16px 0 #000,
            8px 16px 0 #000,
            10px 16px 0 #000,
            12px 16px 0 #000,
            14px 16px 0 #000,
            16px 16px 0 #000,
            2px 18px 0 #000,
            4px 18px 0 #000,
            6px 18px 0 #000,
            8px 18px 0 #000,
            10px 18px 0 #000,
            12px 18px 0 #000,
            14px 18px 0 #000,
            4px 20px 0 #000,
            6px 20px 0 #000,
            10px 20px 0 #000,
            12px 20px 0 #000;
        }

        .menu-item {
          display: inline-block;
          padding: 0 10px;
          position: relative;
        }

        .menu-item:hover,
        .apple-pixel:hover {
          color: #fff;
          background: #000;
        }

        .apple-pixel:hover::after {
          filter: invert(1);
        }

        .special-menu .drop-down {
          display: none;
          position: absolute;
          top: 30px;
          left: 0;
          min-width: 232px;
          background: #fff;
          border: 2px solid #000;
          box-shadow: 3px 3px 0 -2px #000;
          z-index: 40;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .special-menu:hover .drop-down {
          display: block;
        }

        .special-menu .drop-down li {
          height: 34px;
          padding: 0;
          font-size: 2.05rem;
          line-height: 34px;
          white-space: nowrap;
          color: #000;
          background: #fff;
        }

        .special-menu .drop-down li button {
          display: block;
          width: 100%;
          height: 100%;
          color: inherit;
          text-decoration: none;
          padding: 0 12px;
          border: 0;
          background: transparent;
          font: inherit;
          text-align: left;
          cursor: default;
        }

        .special-menu .drop-down li:hover {
          color: #fff;
          background: #000;
        }

        .desktop-icons {
          position: absolute;
          top: 40px;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 5;
          pointer-events: none;
        }

        .desktop-item {
          position: absolute;
          border: 0;
          background: transparent;
          display: grid;
          justify-items: center;
          gap: 0;
          cursor: pointer;
          padding: 0;
          color: #000;
          text-decoration: none;
          user-select: none;
          touch-action: none;
          pointer-events: auto;
        }

        .icon {
          position: relative;
          width: 60px;
          height: 58px;
          display: grid;
          place-items: center;
        }

        .hard-disk-icon {
          width: 56px;
          height: 24px;
          border-top: 2px solid #000;
          border-bottom: 2px solid #000;
          background: #fff;
        }

        .hard-disk-icon::before {
          content: "";
          position: absolute;
          top: 0;
          left: -2px;
          width: 56px;
          height: 20px;
          border-left: 2px solid #000;
          border-right: 2px solid #000;
          background: #fff;
        }

        .hard-disk-icon::after {
          content: "";
          position: absolute;
          top: 14px;
          left: 4px;
          width: 4px;
          height: 2px;
          background: #000;
          box-shadow: 4px 6px 0 #000, 42px 6px 0 #000;
        }

        .disk-big {
          width: 50px;
          height: 56px;
          border-top: 2px solid #000;
          border-bottom: 2px solid #000;
          background: #fff;
        }

        .disk-big::before {
          content: "";
          position: absolute;
          top: 4px;
          left: -2px;
          width: 50px;
          height: 48px;
          border-left: 2px solid #000;
          border-right: 2px solid #000;
          background: #fff;
        }

        .disk-big .shutter {
          position: absolute;
          top: 2px;
          left: 8px;
          width: 32px;
          height: 16px;
          border-left: 2px solid #000;
          border-right: 2px solid #000;
          background: #000;
        }

        .disk-big .shutter::before {
          content: "";
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 28px;
          height: 2px;
          background: #000;
        }

        .disk-big .label {
          position: absolute;
          bottom: 0;
          left: 5px;
          width: 42px;
          height: 22px;
          border-left: 2px solid #000;
          border-right: 2px solid #000;
          background: #fff;
        }

        .disk-big .label::before {
          content: "";
          position: absolute;
          top: -2px;
          left: 0;
          width: 38px;
          height: 2px;
          background: #000;
        }

        .trash-icon {
          width: 34px;
          height: 48px;
          border-left: 2px solid #000;
          border-right: 2px solid #000;
          border-top: 2px solid #000;
          background: #fff;
        }

        .trash-icon::after {
          content: "";
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 30px;
          height: 2px;
          background: #000;
        }

        .trash-icon .cover {
          position: absolute;
          top: 0;
          left: -4px;
          width: 38px;
          height: 4px;
          border-left: 2px solid #000;
          border-right: 2px solid #000;
          border-bottom: 2px solid #000;
          background: #fff;
        }

        .trash-icon .can {
          position: absolute;
          top: 8px;
          left: 4px;
          width: 22px;
          height: 32px;
          border-left: 2px solid #000;
          border-right: 2px solid #000;
          background: transparent;
        }

        .trash-icon .can::before {
          content: "";
          position: absolute;
          top: 0;
          left: 4px;
          width: 6px;
          height: 32px;
          border-left: 2px solid #000;
          border-right: 2px solid #000;
          background: transparent;
        }

        .desktop-icon-label {
          background: #fff;
          border: 1px solid #9a9a9a;
          max-width: 128px;
          padding: 0 4px;
          margin-top: -2px;
          font-size: 18px;
          line-height: 20px;
          font-family: "VT323", monospace;
          font-weight: 400;
          letter-spacing: 0;
          text-align: center;
          white-space: nowrap;
          pointer-events: none;
        }

        .desktop-content {
          position: absolute;
          top: 56px;
          left: 28px;
          right: 0;
          bottom: 20px;
          z-index: 8;
          overflow: hidden;
          padding-right: 8px;
        }

        @media screen and (max-width: 900px) {
          .desktop-menu-left {
            font-size: 1.5rem;
            gap: 0.4rem;
          }

          .desktop-content {
            left: 8px;
            right: 0;
          }

          .desktop-icons {
            right: 6px;
            width: 94px;
          }

          .desktop-icon-label {
            font-size: 1.35rem;
          }
        }

        @media screen and (max-width: 700px) {
          .screen-frame {
            height: 100vh;
            border-radius: 0;
          }

          .desktop-menu-left .menu-item:nth-child(n + 4) {
            display: none;
          }

          .desktop-content {
            right: 6px;
            left: 6px;
            top: 86px;
          }

          .desktop-icons {
            display: none;
          }
        }

        @keyframes screenLine {
          0% {
            top: -200px;
          }
          50% {
            height: 100px;
          }
          100% {
            top: 680px;
          }
        }
      `}</style>
    </main>
  );
}
