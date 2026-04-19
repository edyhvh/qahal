interface MapBottomNavProps {
  visible: boolean;
  onGoHome: () => void;
  onTogglePeople: () => void;
  onGoProfile: () => void;
}

const HomeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.552 5.448 21 6 21H9M19 10L21 12M19 10V20C19 20.552 18.552 21 18 21H15M9 21C9.552 21 10 20.552 10 20V16C10 15.448 10.448 15 11 15H13C13.552 15 14 15.448 14 16V20C14 20.552 14.448 21 15 21M9 21H15" stroke="#1E5C5A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MapIconActive = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M9 20L3 17V4L9 7M9 20L15 17M9 20V7M15 17L21 20V7L15 4M15 17V4M9 7L15 4" stroke="#F5F0E8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ProfileIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M16 7C16 9.209 14.209 11 12 11C9.791 11 8 9.209 8 7C8 4.791 9.791 3 12 3C14.209 3 16 4.791 16 7Z" stroke="#1E5C5A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 14C8.134 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="#1E5C5A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const MapBottomNav = ({ visible, onGoHome, onTogglePeople, onGoProfile }: MapBottomNavProps) => {
  if (!visible) {
    return null;
  }

  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-10 flex flex-col items-center"
      style={{
        backgroundImage:
          "linear-gradient(0deg, rgba(237,233,225,0.95) 0%, rgba(237,233,225,0.85) 60%, rgba(237,233,225,0) 100%)",
        paddingBottom: 24,
        paddingTop: 20,
      }}
    >
      <div className="flex w-[327px] items-center justify-around py-[12px]">
        <button type="button" className="flex flex-col items-center gap-[4px]" onClick={onGoHome}>
          <HomeIcon />
          <span style={{ fontSize: 11, color: "#1E5C5A" }}>Home</span>
        </button>

        <button type="button" className="flex flex-col items-center gap-[4px]" onClick={onTogglePeople}>
          <div
            className="flex items-center justify-center rounded-full"
            style={{ width: 48, height: 48, background: "#1E5C5A", boxShadow: "#1E5C5A4D 0px 4px 12px" }}
          >
            <MapIconActive />
          </div>
        </button>

        <button type="button" className="flex flex-col items-center gap-[4px]" onClick={onGoProfile}>
          <ProfileIcon />
          <span style={{ fontSize: 11, color: "#1E5C5A" }}>Profile</span>
        </button>
      </div>
      <div style={{ width: 134, height: 5, borderRadius: 100, background: "#1C2526", opacity: 0.2 }} />
    </div>
  );
};
