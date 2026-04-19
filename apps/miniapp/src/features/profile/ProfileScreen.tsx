import { useMemo, useRef, useState } from "react";
import {
  LOCAL_PROFILE_ROLE_OPTIONS,
  getLocalProfileRoleOption,
} from "../../app/types";
import type { LocalProfileRole } from "../../app/types";

interface ProfileScreenProps {
  profileTestingEnabled: boolean;
  localProfileRole: LocalProfileRole;
  onRoleChange: (role: LocalProfileRole) => void;
  profileName: string;
  onProfileNameChange: (name: string) => void;
  confirmedBirthDate: string | null;
  onConfirmBirthDate: (birthDate: string | null) => void;
  onGoHome: () => void;
  onGoMap: () => void;
}

const formatDateLong = (birthDate: string): string => {
  const parsed = new Date(`${birthDate}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return birthDate;
  }

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(parsed);
};

const getAgeFromBirthDate = (birthDate: string): number => {
  const parsed = new Date(`${birthDate}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return 0;
  }

  const today = new Date();
  let age = today.getFullYear() - parsed.getFullYear();
  const hasNotHadBirthdayThisYear =
    today.getMonth() < parsed.getMonth() ||
    (today.getMonth() === parsed.getMonth() &&
      today.getDate() < parsed.getDate());

  if (hasNotHadBirthdayThisYear) {
    age -= 1;
  }

  return Math.max(0, age);
};

const HomeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.552 5.448 21 6 21H9M19 10L21 12M19 10V20C19 20.552 18.552 21 18 21H15M9 21C9.552 21 10 20.552 10 20V16C10 15.448 10.448 15 11 15H13C13.552 15 14 15.448 14 16V20C14 20.552 14.448 21 15 21M9 21H15"
      stroke="#1E5C5A"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MapIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M9 20L3 17V4L9 7M9 20L15 17M9 20V7M15 17L21 20V7L15 4M15 17V4M9 7L15 4"
      stroke="#1E5C5A"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ProfileIconActive = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path
      d="M16 7C16 9.209 14.209 11 12 11C9.791 11 8 9.209 8 7C8 4.791 9.791 3 12 3C14.209 3 16 4.791 16 7Z"
      stroke="#F5F0E8"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 14C8.134 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z"
      stroke="#F5F0E8"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const ProfileScreen = ({
  profileTestingEnabled,
  localProfileRole,
  onRoleChange,
  profileName,
  onProfileNameChange,
  confirmedBirthDate,
  onConfirmBirthDate,
  onGoHome,
  onGoMap,
}: ProfileScreenProps) => {
  const [birthDateDraft, setBirthDateDraft] = useState(
    confirmedBirthDate ?? "",
  );
  const [showAgeConfirmation, setShowAgeConfirmation] = useState(false);
  const birthDateInputRef = useRef<HTMLInputElement | null>(null);

  const roleOption = useMemo(
    () => getLocalProfileRoleOption(localProfileRole),
    [localProfileRole],
  );
  const computedAge = useMemo(
    () => getAgeFromBirthDate(birthDateDraft),
    [birthDateDraft],
  );
  const canEditAge = confirmedBirthDate === null;

  const openAgeConfirmation = () => {
    if (!birthDateDraft) {
      return;
    }

    setShowAgeConfirmation(true);
  };

  const confirmAgeSelection = () => {
    onConfirmBirthDate(birthDateDraft);
    setShowAgeConfirmation(false);
  };

  const triggerBirthDatePicker = () => {
    birthDateInputRef.current?.showPicker?.();
    birthDateInputRef.current?.click();
  };

  return (
    <section className="relative flex min-h-[100dvh] flex-col overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(165deg, #f3efe8 0%, #ece5d8 35%, #e8e0d2 60%, #ede7db 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 20% 18%, rgba(30,92,90,0.08) 0%, transparent 45%), radial-gradient(circle at 80% 65%, rgba(160,98,45,0.08) 0%, transparent 50%)",
        }}
      />

      <div className="relative z-10 flex flex-1 flex-col overflow-y-auto pb-[120px]">
        <header
          className="flex items-center justify-between"
          style={{ padding: "8px 24px 16px 24px" }}
        >
          <h1
            className="qahal-display"
            style={{
              fontSize: 32,
              lineHeight: "38px",
              fontWeight: 700,
              color: "#1C2526",
            }}
          >
            Profile
          </h1>
          <span
            className="qahal-display"
            style={{
              fontSize: 14,
              letterSpacing: "0.15em",
              color: "#C9A46F",
              fontWeight: 600,
            }}
          >
            QAHAL
          </span>
        </header>

        <div className="flex flex-col gap-[18px] px-[24px]">
          <div className="flex items-center justify-between border-b border-[#C9A46F52] pb-[10px]">
            <span
              className="qahal-display"
              style={{
                fontSize: 14,
                letterSpacing: "0.06em",
                color: "#A0622D",
              }}
            >
              Name
            </span>
            <div className="flex items-center gap-[10px]">
              <span style={{ fontSize: 20, fontWeight: 700, color: "#1C2526" }}>
                {profileName}
              </span>
              <button
                type="button"
                onClick={() => {
                  const nextName = window.prompt(
                    "Update your name",
                    profileName,
                  );
                  if (typeof nextName === "string" && nextName.trim()) {
                    onProfileNameChange(nextName.trim());
                  }
                }}
                style={{ fontSize: 12, color: "#1E5C5A", fontWeight: 700 }}
              >
                Edit
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between border-b border-[#C9A46F52] pb-[10px]">
            <span
              className="qahal-display"
              style={{
                fontSize: 14,
                letterSpacing: "0.06em",
                color: "#A0622D",
              }}
            >
              Qahal
            </span>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#1C2526" }}>
              {roleOption.qahalName}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-[#C9A46F52] pb-[10px]">
            <span
              className="qahal-display"
              style={{
                fontSize: 14,
                letterSpacing: "0.06em",
                color: "#A0622D",
              }}
            >
              Age
            </span>
            {canEditAge ? (
              <div className="flex items-center gap-[8px]">
                <input
                  ref={birthDateInputRef}
                  type="date"
                  value={birthDateDraft}
                  onChange={(event) => setBirthDateDraft(event.target.value)}
                  max={new Date().toISOString().slice(0, 10)}
                  style={{
                    position: "absolute",
                    opacity: 0,
                    width: 1,
                    height: 1,
                    pointerEvents: "none",
                  }}
                  aria-hidden
                />
                <button
                  type="button"
                  onClick={triggerBirthDatePicker}
                  style={{ fontSize: 13, color: "#1E5C5A", fontWeight: 700 }}
                >
                  Select Birth Date
                </button>
                <button
                  type="button"
                  onClick={openAgeConfirmation}
                  disabled={!birthDateDraft}
                  style={{
                    fontSize: 13,
                    color: birthDateDraft ? "#A0622D" : "#9CA3AF",
                    fontWeight: 700,
                  }}
                >
                  Confirm
                </button>
              </div>
            ) : (
              <span style={{ fontSize: 16, fontWeight: 700, color: "#1C2526" }}>
                {getAgeFromBirthDate(confirmedBirthDate)} (
                {formatDateLong(confirmedBirthDate)})
              </span>
            )}
          </div>

          <div className="pt-[2px]">
            <div
              className="qahal-display"
              style={{
                fontSize: 14,
                letterSpacing: "0.06em",
                color: "#A0622D",
                marginBottom: 8,
              }}
            >
              Badges
            </div>
            <div className="flex flex-wrap gap-[8px]">
              {roleOption.badges.map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center rounded-full"
                  style={{
                    padding: "6px 12px",
                    background: "#1E5C5A1A",
                    border: "1px solid #1E5C5A40",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#1E5C5A",
                  }}
                >
                  * {badge}
                </span>
              ))}
            </div>
          </div>

          {profileTestingEnabled ? (
            <div className="flex flex-col gap-[8px] border-t border-[#C9A46F52] pt-[12px]">
              <div
                className="qahal-display"
                style={{ fontSize: 20, color: "#1C2526", fontWeight: 600 }}
              >
                Testing Profile Role
              </div>
              <p style={{ fontSize: 13, color: "#5A5A52" }}>
                Testing environment only. Choose how profile membership should
                behave.
              </p>
              <select
                value={localProfileRole}
                onChange={(event) =>
                  onRoleChange(event.target.value as LocalProfileRole)
                }
                className="w-full"
                style={{
                  height: 44,
                  border: "none",
                  borderBottom: "1px solid #D5C8B6",
                  background: "transparent",
                  padding: "0 0",
                  fontSize: 14,
                  color: "#1C2526",
                  fontWeight: 600,
                }}
              >
                {LOCAL_PROFILE_ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p style={{ fontSize: 12, color: "#6B7280" }}>
                {roleOption.description}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {showAgeConfirmation ? (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/30 px-[24px]">
          <div
            className="flex w-full max-w-[320px] flex-col gap-[12px]"
            style={{
              borderRadius: 20,
              padding: 20,
              background: "#F5F0E8",
              border: "1px solid #C9A46F4D",
              boxShadow: "#1C252526 0px 16px 36px",
            }}
          >
            <div
              className="qahal-display"
              style={{ fontSize: 20, color: "#1C2526", fontWeight: 700 }}
            >
              Confirm Age
            </div>
            <p style={{ fontSize: 13, color: "#5A5A52" }}>
              Birth date selected: {formatDateLong(birthDateDraft)}
            </p>
            <p style={{ fontSize: 15, color: "#1C2526", fontWeight: 700 }}>
              Age to save: {computedAge}
            </p>
            <p style={{ fontSize: 12, color: "#A0622D" }}>
              After confirming, this age setting cannot be edited.
            </p>

            <div className="flex gap-[8px] pt-[4px]">
              <button
                type="button"
                onClick={() => setShowAgeConfirmation(false)}
                className="flex flex-1 items-center justify-center"
                style={{
                  height: 42,
                  borderRadius: 12,
                  border: "1px solid #D5C8B6",
                  background: "#FFFFFF",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#1C2526",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmAgeSelection}
                className="flex flex-1 items-center justify-center"
                style={{
                  height: 42,
                  borderRadius: 12,
                  background: "#1E5C5A",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#FFFFFF",
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div
        className="absolute bottom-0 left-0 right-0 z-20 flex flex-col items-center"
        style={{
          backgroundImage:
            "linear-gradient(0deg, rgba(237,233,225,0.95) 0%, rgba(237,233,225,0.85) 60%, rgba(237,233,225,0) 100%)",
          paddingBottom: 24,
          paddingTop: 20,
        }}
      >
        <div className="flex w-[327px] items-center justify-around py-[12px]">
          <button
            type="button"
            className="flex flex-col items-center gap-[4px]"
            onClick={onGoHome}
          >
            <HomeIcon />
            <span style={{ fontSize: 11, color: "#1E5C5A" }}>Home</span>
          </button>

          <button
            type="button"
            className="flex flex-col items-center gap-[4px]"
            onClick={onGoMap}
          >
            <MapIcon />
            <span style={{ fontSize: 11, color: "#1E5C5A" }}>Map</span>
          </button>

          <button
            type="button"
            className="flex flex-col items-center gap-[4px]"
          >
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                width: 48,
                height: 48,
                background: "#1E5C5A",
                boxShadow: "#1E5C5A4D 0px 4px 12px",
              }}
            >
              <ProfileIconActive />
            </div>
          </button>
        </div>
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
    </section>
  );
};
