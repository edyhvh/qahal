import { useEffect, useRef, useState } from "react";
import type { CommunityPerson } from "../../../lib/api";
import { useI18n } from "../../../app/i18n";

interface MapPersonSheetProps {
  person: CommunityPerson | null;
  onClose: () => void;
  onMessage: () => void;
}

const TelegramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"
      fill="#F5F0E8"
    />
  </svg>
);

export const MapPersonSheet = ({
  person,
  onClose,
  onMessage,
}: MapPersonSheetProps) => {
  const { t } = useI18n();
  const [dragOffsetY, setDragOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartYRef = useRef<number | null>(null);
  const activePointerIdRef = useRef<number | null>(null);
  const closeThresholdPx = 96;

  useEffect(() => {
    if (!person) {
      setDragOffsetY(0);
      setIsDragging(false);
      dragStartYRef.current = null;
      activePointerIdRef.current = null;
    }
  }, [person]);

  if (!person) {
    return null;
  }

  const startDrag = (startY: number) => {
    dragStartYRef.current = startY;
    setIsDragging(true);
  };

  const moveDrag = (currentY: number) => {
    const startY = dragStartYRef.current;
    if (startY === null) {
      return;
    }

    const deltaY = currentY - startY;
    setDragOffsetY(deltaY > 0 ? deltaY : 0);
  };

  const finishDrag = () => {
    setIsDragging(false);
    dragStartYRef.current = null;
    activePointerIdRef.current = null;

    if (dragOffsetY >= closeThresholdPx) {
      onClose();
      setDragOffsetY(0);
      return;
    }

    setDragOffsetY(0);
  };

  const onTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const startY = event.touches[0]?.clientY;
    if (typeof startY === "number") {
      startDrag(startY);
    }
  };

  const onTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    const currentY = event.touches[0]?.clientY;
    if (typeof currentY === "number") {
      moveDrag(currentY);
    }
  };

  const onTouchEnd = () => {
    finishDrag();
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    activePointerIdRef.current = event.pointerId;
    startDrag(event.clientY);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerIdRef.current !== event.pointerId) {
      return;
    }
    moveDrag(event.clientY);
  };

  const onPointerUpOrCancel = (event: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerIdRef.current !== event.pointerId) {
      return;
    }
    finishDrag();
  };

  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-20 flex flex-col items-center"
      style={{
        transform: `translateY(${dragOffsetY}px)`,
        transition: isDragging ? "none" : "transform 180ms ease-out",
        touchAction: "pan-x",
        background: "#F5F0E8",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderBottomLeftRadius: 44,
        borderBottomRightRadius: 44,
        boxShadow: "#1C25261F 0px -4px 24px, #1C25260F 0px -1px 4px",
        gap: 16,
        paddingBottom: 20,
        paddingTop: 12,
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUpOrCancel}
      onPointerCancel={onPointerUpOrCancel}
    >
      <div
        style={{
          width: 36,
          height: 4,
          borderRadius: 100,
          background: "#1C252626",
        }}
      />

      <div className="flex w-full items-center gap-[16px] px-[24px] pt-[20px]">
        <div
          className="flex shrink-0 items-center justify-center rounded-full"
          style={{
            width: 56,
            height: 56,
            background: "#1E5C5A",
            border: "2px solid #C9A46F",
          }}
        >
          <span
            className="qahal-display"
            style={{ fontSize: 24, fontWeight: 600, color: "#F5F0E8" }}
          >
            {person.name.charAt(0)}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-[4px]">
          <span
            className="qahal-display"
            style={{ fontSize: 22, fontWeight: 600, color: "#1C2526" }}
          >
            {person.name}
          </span>
          <span style={{ fontSize: 13, color: "#8A8A7E" }}>{person.city}</span>
        </div>
      </div>

      <div className="flex w-full flex-wrap gap-[8px] px-[24px] pt-[16px]">
        {person.badges.map((badge) => (
          <span
            key={`${person.id}-${badge.kind}-${badge.label}`}
            className="flex items-center gap-[6px]"
            style={{
              borderRadius: 100,
              padding: "6px 12px",
              background:
                badge.kind === "messenger" ? "#C9A46F1A" : "#1E5C5A14",
              border:
                badge.kind === "messenger"
                  ? "1px solid #C9A46F40"
                  : "1px solid #1E5C5A26",
              fontSize: 13,
              fontWeight: 500,
              color: badge.kind === "messenger" ? "#9A7D4E" : "#1E5C5A",
            }}
          >
            {badge.kind === "years" && typeof badge.years === "number"
              ? t.map.yearsInEmunahShort(badge.years)
              : badge.label}
          </span>
        ))}
      </div>

      <button
        type="button"
        onClick={onMessage}
        className="flex items-center justify-center gap-[10px]"
        style={{
          width: 327,
          height: 52,
          borderRadius: 14,
          background: "#1E5C5A",
          border: "2px solid #C9A46F",
          boxShadow: "#1E5C5A4D 0px 2px 8px",
          fontSize: 16,
          fontWeight: 600,
          letterSpacing: "0.02em",
          color: "#F5F0E8",
        }}
      >
        <TelegramIcon />
        {t.map.telegramMessage}
      </button>

      <button
        type="button"
        onClick={onClose}
        style={{ fontSize: 13, fontWeight: 500, color: "#8A8A7E" }}
      >
        {t.common.close}
      </button>

      <div className="flex w-full justify-center pb-[8px] pt-[16px]">
        <div
          style={{
            width: 134,
            height: 5,
            borderRadius: 100,
            background: "#1C2526",
            opacity: 0.2,
          }}
        />
      </div>
    </div>
  );
};
