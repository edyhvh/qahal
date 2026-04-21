import { useMemo, useRef, useState } from "react";
import {
  LOCAL_PROFILE_ROLE_OPTIONS,
  getLocalProfileRoleOption,
} from "../../app/types";
import type { LocalProfileRole } from "../../app/types";
import { getBadgeLocalized, useI18n } from "../../app/i18n";

interface ProfileScreenProps {
  profileTestingEnabled: boolean;
  localProfileRole: LocalProfileRole;
  onRoleChange: (role: LocalProfileRole) => void;
  profileName: string;
  profileQahalName: string;
  profileBadges: string[];
  onProfileNameChange: (name: string) => void;
  confirmedBirthDate: string | null;
  onConfirmBirthDate: (birthDate: string | null) => void;
  canResetLocalData: boolean;
  onResetLocalData: () => void;
  onGoHome: () => void;
  onGoMap: () => void;
}

const parseAgeValue = (value: string): number | null => {
  const numeric = Number(value);
  if (Number.isInteger(numeric) && numeric >= 0 && numeric <= 120) {
    return numeric;
  }

  // Backward compatibility for older stored date values.
  const parsedDate = new Date(`${value}T12:00:00`);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - parsedDate.getFullYear();
  const hasNotHadBirthdayThisYear =
    today.getMonth() < parsedDate.getMonth() ||
    (today.getMonth() === parsedDate.getMonth() &&
      today.getDate() < parsedDate.getDate());

  if (hasNotHadBirthdayThisYear) {
    age -= 1;
  }

  return Math.max(0, Math.min(120, age));
};

const HomeIcon = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.552 5.448 21 6 21H9M19 10L21 12M19 10V20C19 20.552 18.552 21 18 21H15M9 21C9.552 21 10 20.552 10 20V16C10 15.448 10.448 15 11 15H13C13.552 15 14 15.448 14 16V20C14 20.552 14.448 21 15 21M9 21H15"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MapIcon = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M9 20L3 17V4L9 7M9 20L15 17M9 20V7M15 17L21 20V7L15 4M15 17V4M9 7L15 4"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ProfileIcon = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M16 7C16 9.209 14.209 11 12 11C9.791 11 8 9.209 8 7C8 4.791 9.791 3 12 3C14.209 3 16 4.791 16 7Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 14C8.134 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z"
      stroke={color}
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
  profileQahalName,
  profileBadges,
  onProfileNameChange,
  confirmedBirthDate,
  onConfirmBirthDate,
  canResetLocalData,
  onResetLocalData,
  onGoHome,
  onGoMap,
}: ProfileScreenProps) => {
  const { t } = useI18n();
  const [birthDateDraft, setBirthDateDraft] = useState(() => {
    const parsed = confirmedBirthDate ? parseAgeValue(confirmedBirthDate) : null;
    return parsed === null ? "" : String(parsed);
  });
  const [showAgeConfirmation, setShowAgeConfirmation] = useState(false);
  const birthDateInputRef = useRef<HTMLSelectElement | null>(null);

  const roleOption = useMemo(
    () => getLocalProfileRoleOption(localProfileRole),
    [localProfileRole],
  );
  const roleDescriptions = useMemo(
    () => ({
      none: t.profile.roleNoneDesc,
      member: t.profile.roleMemberDesc,
      leader: t.profile.roleLeaderDesc,
    }),
    [t],
  );
  const computedAge = useMemo(
    () => parseAgeValue(birthDateDraft) ?? 0,
    [birthDateDraft],
  );
  const confirmedAge = useMemo(
    () => (confirmedBirthDate ? parseAgeValue(confirmedBirthDate) : null),
    [confirmedBirthDate],
  );
  const displayedQahalName = useMemo(() => {
    const fallbackQahal = getLocalProfileRoleOption("none").qahalName;
    if (profileQahalName === fallbackQahal) {
      return t.profile.roleNone;
    }
    return profileQahalName;
  }, [profileQahalName, t]);
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
    birthDateInputRef.current?.focus();
    birthDateInputRef.current?.click();
  };

  return (
    <section className="relative flex min-h-[100dvh] flex-col overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: "var(--theme-bg-main)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: "var(--theme-bg-overlay)",
        }}
      />

      <div className="relative z-10 flex flex-1 flex-col overflow-y-auto pb-[120px]">
        <header
          className="flex items-center"
          style={{ padding: "64px 24px 16px 24px" }}
        >
          <h1
            className="qahal-display"
            style={{
              fontSize: 32,
              lineHeight: "38px",
              fontWeight: 700,
              color: "var(--theme-text-primary)",
            }}
          >
            {t.profile.title}
          </h1>
        </header>

        <div className="flex flex-col gap-[18px] px-[24px]">
          <div className="flex items-center justify-between border-b border-[#C9A46F52] pb-[10px]">
            <span
              className="qahal-display"
              style={{
                fontSize: 14,
                letterSpacing: "0.06em",
                color: "var(--theme-text-secondary)",
              }}
            >
              {t.profile.name}
            </span>
            <div className="flex items-center gap-[10px]">
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: "var(--theme-text-primary)",
                }}
              >
                {profileName}
              </span>
              <button
                type="button"
                onClick={() => {
                  const nextName = window.prompt(
                    t.profile.editNamePrompt,
                    profileName,
                  );
                  if (typeof nextName === "string" && nextName.trim()) {
                    onProfileNameChange(nextName.trim());
                  }
                }}
                style={{
                  fontSize: 12,
                  color: "var(--theme-accent)",
                  fontWeight: 700,
                }}
              >
                {t.profile.edit}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between border-b border-[#C9A46F52] pb-[10px]">
            <span
              className="qahal-display"
              style={{
                fontSize: 14,
                letterSpacing: "0.06em",
                color: "var(--theme-text-secondary)",
              }}
            >
              {t.profile.qahal}
            </span>
            <span
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "var(--theme-text-primary)",
              }}
            >
              {displayedQahalName}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-[#C9A46F52] pb-[10px]">
            <span
              className="qahal-display"
              style={{
                fontSize: 14,
                letterSpacing: "0.06em",
                color: "var(--theme-text-secondary)",
              }}
            >
              {t.profile.age}
            </span>
            {canEditAge ? (
              <div className="flex items-center gap-[8px]">
                <select
                  ref={birthDateInputRef}
                  value={birthDateDraft}
                  onChange={(event) => setBirthDateDraft(event.target.value)}
                  style={{
                    width: 84,
                    height: 36,
                    borderRadius: 10,
                    border: "1px solid var(--theme-surface-warm-border)",
                    background: "var(--theme-surface-warm)",
                    fontSize: 13,
                    color: "var(--theme-surface-warm-text)",
                    fontWeight: 700,
                    padding: "0 8px",
                  }}
                >
                  <option value="">{t.profile.agePlaceholder}</option>
                  {Array.from({ length: 121 }).map((_, age) => (
                    <option key={age} value={String(age)}>
                      {age}
                    </option>
                  ))}
                </select>
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
                  {t.profile.confirmAge}
                </button>
              </div>
            ) : (
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "var(--theme-text-primary)",
                }}
              >
                {confirmedAge ?? 0}
              </span>
            )}
          </div>

          <div className="pt-[2px]">
            <div
              className="qahal-display"
              style={{
                fontSize: 14,
                letterSpacing: "0.06em",
                color: "var(--theme-text-secondary)",
                marginBottom: 8,
              }}
            >
              {t.profile.badges}
            </div>
            <div className="flex flex-wrap gap-[8px]">
              {profileBadges.map((badgeName) => {
                const badge = getBadgeLocalized(t, badgeName);
                return (
                <span
                  key={badge.name}
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
                  {badge.name}
                </span>
                );
              })}
            </div>
          </div>

          {profileTestingEnabled ? (
            <div className="flex flex-col gap-[8px] border-t border-[#C9A46F52] pt-[12px]">
              <div
                className="qahal-display"
                style={{ fontSize: 20, color: "#1C2526", fontWeight: 600 }}
              >
                {t.profile.testingRoleTitle}
              </div>
              <p style={{ fontSize: 13, color: "#5A5A52" }}>
                {t.profile.testingRoleBody}
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
                    {option.value === "none"
                      ? t.profile.roleNone
                      : option.value === "member"
                        ? t.profile.roleMember
                        : t.profile.roleLeader}
                  </option>
                ))}
              </select>
              <p style={{ fontSize: 12, color: "#6B7280" }}>
                {roleDescriptions[roleOption.value]}
              </p>
            </div>
          ) : null}

          {canResetLocalData ? (
            <div className="flex flex-col gap-[8px] border-t border-[#C9A46F52] pt-[12px]">
              <div
                className="qahal-display"
                style={{ fontSize: 16, color: "#1C2526", fontWeight: 600 }}
              >
                {t.profile.localDataTitle}
              </div>
              <p style={{ fontSize: 12, color: "#6B7280" }}>
                {t.profile.localDataBody}
              </p>
              <button
                type="button"
                onClick={onResetLocalData}
                className="flex items-center justify-center"
                style={{
                  height: 42,
                  borderRadius: 12,
                  border: "1px solid var(--theme-surface-warm-border)",
                  background: "var(--theme-surface-warm-muted)",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--theme-surface-warm-muted-text)",
                }}
              >
                {t.profile.localDataDelete}
              </button>
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
              background: "var(--theme-card-bg)",
              border: "1px solid var(--theme-card-border)",
              boxShadow: "#1C252526 0px 16px 36px",
            }}
          >
            <div
              className="qahal-display"
              style={{
                fontSize: 20,
                color: "var(--theme-text-primary)",
                fontWeight: 700,
              }}
            >
              {t.profile.confirmAgeTitle}
            </div>
            <p
              style={{
                fontSize: 15,
                color: "var(--theme-text-primary)",
                fontWeight: 700,
              }}
            >
              {t.profile.confirmAgeValue(computedAge)}
            </p>
            <p style={{ fontSize: 12, color: "var(--theme-surface-warm-muted-text)" }}>
              {t.profile.confirmAgeWarning}
            </p>

            <div className="flex gap-[8px] pt-[4px]">
              <button
                type="button"
                onClick={() => setShowAgeConfirmation(false)}
                className="flex flex-1 items-center justify-center"
                style={{
                  height: 42,
                  borderRadius: 12,
                  border: "1px solid var(--theme-surface-warm-border)",
                  background: "var(--theme-surface-warm)",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--theme-surface-warm-text)",
                }}
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={confirmAgeSelection}
                className="flex flex-1 items-center justify-center"
                style={{
                  height: 42,
                  borderRadius: 12,
                  background: "var(--theme-accent)",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#FFFFFF",
                }}
              >
                {t.common.confirm}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div
        className="absolute bottom-0 left-0 right-0 z-20 flex flex-col items-center"
        style={{
          backgroundImage: "var(--theme-nav-gradient)",
          paddingBottom: 24,
          paddingTop: 20,
        }}
      >
        <div className="flex w-[327px] items-center justify-around py-[12px]">
          <button
            type="button"
            className="flex w-[84px] flex-col items-center gap-[4px]"
            onClick={onGoHome}
          >
            <div className="flex h-[48px] w-[48px] items-center justify-center rounded-full">
              <HomeIcon color="var(--theme-accent)" />
            </div>
            <span
              style={{
                fontSize: 11,
                color: "var(--theme-accent)",
                minHeight: 16,
                lineHeight: "16px",
              }}
            >
              {t.common.home}
            </span>
          </button>

          <button
            type="button"
            className="flex w-[84px] flex-col items-center gap-[4px]"
            onClick={onGoMap}
          >
            <div className="flex h-[48px] w-[48px] items-center justify-center rounded-full">
              <MapIcon color="var(--theme-accent)" />
            </div>
            <span
              style={{
                fontSize: 11,
                color: "var(--theme-accent)",
                minHeight: 16,
                lineHeight: "16px",
              }}
            >
              {t.common.map}
            </span>
          </button>

          <button
            type="button"
            className="flex w-[84px] flex-col items-center gap-[4px]"
          >
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                width: 48,
                height: 48,
                background: "var(--theme-accent)",
                boxShadow: "#1E5C5A4D 0px 4px 12px",
              }}
            >
              <ProfileIcon color="#F5F0E8" />
            </div>
            <span
              style={{
                fontSize: 11,
                color: "var(--theme-accent)",
                minHeight: 16,
                lineHeight: "16px",
                visibility: "hidden",
              }}
            >
              {t.common.profile}
            </span>
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
