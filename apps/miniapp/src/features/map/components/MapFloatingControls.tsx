interface MapFloatingControlsProps {
  visible: boolean;
  peopleCount: number;
  locating: boolean;
  onTogglePeople: () => void;
  onLocate: () => void;
  locationError?: string | null;
}

const CrosshairIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 2V5M12 19V22M2 12H5M19 12H22" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    <circle cx="12" cy="12" r="6.2" stroke="currentColor" strokeWidth="1.7" />
    <circle cx="12" cy="12" r="2.2" fill="currentColor" />
  </svg>
);

export const MapFloatingControls = ({
  visible,
  peopleCount,
  locating,
  onTogglePeople,
  onLocate,
  locationError
}: MapFloatingControlsProps) => {
  if (!visible) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={onTogglePeople}
        className="absolute right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full border border-[#d1c7b8] bg-white text-[14px] font-semibold text-[#334155] shadow-md"
        style={{ bottom: 182 }}
        aria-label="Toggle people list"
        title="Show people list"
      >
        {peopleCount}
      </button>

      <button
        type="button"
        onClick={onLocate}
        disabled={locating}
        className="absolute right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full border border-[#d1c7b8] bg-white text-[#334155] shadow-md disabled:opacity-60"
        style={{ bottom: 118 }}
        aria-label="Center map on my location"
        title="Center map on my location"
      >
        <CrosshairIcon />
      </button>

      {locationError ? (
        <div className="absolute left-3 right-3 top-3 z-30 rounded-xl border border-[#f59e0b66] bg-white/95 px-3 py-2 text-xs text-[#92400e] shadow-sm">
          {locationError}
        </div>
      ) : null}
    </>
  );
};
