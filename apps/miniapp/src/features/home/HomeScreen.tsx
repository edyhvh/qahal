import { useEffect, useMemo, useState } from "react";
import type { CommunityCard } from "@qahal/shared";
import type { HomeVariant } from "../../app/types";
import { HomePopups } from "./components/HomePopups";
import { JoinRequestToast } from "./components/JoinRequestToast";
import { ProfileTestingPanel, type LocalProfileRole } from "./components/ProfileTestingPanel";

interface HomeScreenProps {
  variant: HomeVariant;
  communities: CommunityCard[];
  onVariantChange: (variant: HomeVariant) => void;
  onGoMap: () => void;
}

/* ── SVG icons extracted from Paper (4V3-0) ── */
const HomeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.552 5.448 21 6 21H9M19 10L21 12M19 10V20C19 20.552 18.552 21 18 21H15M9 21C9.552 21 10 20.552 10 20V16C10 15.448 10.448 15 11 15H13C13.552 15 14 15.448 14 16V20C14 20.552 14.448 21 15 21M9 21H15" stroke="#F5F0E8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const MapIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M9 20L3 17V4L9 7M9 20L15 17M9 20V7M15 17L21 20V7L15 4M15 17V4M9 7L15 4" stroke="#1E5C5A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const ProfileIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M16 7C16 9.209 14.209 11 12 11C9.791 11 8 9.209 8 7C8 4.791 9.791 3 12 3C14.209 3 16 4.791 16 7Z" stroke="#1E5C5A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 14C8.134 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="#1E5C5A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M12 5V19M5 12H19" stroke="#F5F0E8" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
export const HomeScreen = ({ variant, communities, onVariantChange, onGoMap }: HomeScreenProps) => {
  const showAlreadyRequestedPopup = variant === "already-requested";
  const showAlreadyMemberPopup = variant === "already-member";
  const [requestedCommunityIds, setRequestedCommunityIds] = useState<Set<number>>(new Set());
  const [memberCommunityIds, setMemberCommunityIds] = useState<Set<number>>(new Set());
  const [showToast, setShowToast] = useState(false);
  const isLocalTesting = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  const [profileTestingPanelOpen, setProfileTestingPanelOpen] = useState(false);
  const [localProfileRole, setLocalProfileRole] = useState<LocalProfileRole>("none");

  useEffect(() => {
    const initiallyRequested = new Set<number>();
    const initiallyMember = new Set<number>();
    for (const community of communities) {
      if (community.memberState === "requested") {
        initiallyRequested.add(community.id);
      }
      if (community.memberState === "member") {
        initiallyMember.add(community.id);
      }
    }

    setRequestedCommunityIds((prev) => {
      const next = new Set(prev);
      initiallyRequested.forEach((id) => next.add(id));
      return next;
    });

    setMemberCommunityIds(initiallyMember);
  }, [communities]);

  useEffect(() => {
    if (!showToast) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setShowToast(false);
      if (variant === "join-requested") {
        onVariantChange("default");
      }
    }, 2200);

    return () => window.clearTimeout(timeoutId);
  }, [showToast, variant, onVariantChange]);

  const displayedCommunities = useMemo(() => {
    return communities.map((community) => {
      if (memberCommunityIds.has(community.id)) {
        return {
          ...community,
          memberState: "member" as const
        };
      }

      const requested = requestedCommunityIds.has(community.id);
      if (!requested) {
        return community;
      }

      return {
        ...community,
        memberState: "requested" as const
      };
    });
  }, [communities, requestedCommunityIds, memberCommunityIds]);

  return (
    <section className="relative flex min-h-[100dvh] flex-col overflow-hidden">
      {/* Paper 4RR-0: light parchment gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(165deg, #f3efe8 0%, #ece5d8 35%, #e8e0d2 60%, #ede7db 100%)",
        }}
      />
      {/* Paper 4RS-0: warm radial overlays */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 25% 20%, rgba(200,164,111,0.08) 0%, transparent 50%), radial-gradient(circle at 75% 60%, rgba(200,164,111,0.06) 0%, transparent 45%)",
        }}
      />

      {/* Scrollable content */}
      <div className="relative z-10 flex flex-1 flex-col overflow-y-auto pb-[120px]">
        {/* Header — Paper 4S7-0 */}
        <header className="flex items-center justify-between" style={{ padding: "8px 24px 16px 24px" }}>
          {/* Paper 4S8-0 */}
          <h1 className="qahal-display" style={{ fontSize: 32, lineHeight: "38px", fontWeight: 700, color: "#1C2526" }}>
            Home
          </h1>
          {/* Paper 4S9-0 */}
          <span className="qahal-display" style={{ fontSize: 14, letterSpacing: "0.15em", color: "#C9A46F", fontWeight: 600 }}>
            QAHAL
          </span>
        </header>

        {/* Cards */}
        <div className="flex flex-col gap-[16px] px-[24px]">
          {/* Create Qahal Card — Paper 4SB-0 */}
          <div
            className="flex flex-col gap-[12px]"
            style={{
              borderRadius: 20,
              padding: 24,
              backgroundImage: "linear-gradient(135deg, #7a7a82 0%, #9a9aa0 40%, #b4b4b8 100%)",
              boxShadow: "#78788240 0px 4px 16px, #78788226 0px 1px 4px",
            }}
          >
            {/* Plus icon circle */}
            <div className="flex h-[44px] w-[44px] items-center justify-center rounded-full" style={{ background: "#FFFFFF26" }}>
              <PlusIcon />
            </div>
            <h2 className="qahal-display" style={{ fontSize: 22, fontWeight: 700, color: "#F5F0E8" }}>
              Create a Qahal
            </h2>
            <p style={{ fontSize: 13, color: "#F5F0E8BF" }}>Start a new congregation in your area</p>
            <button
              type="button"
              onClick={() => onVariantChange("qahal-exists")}
              className="flex items-center justify-center"
              style={{
                height: 44,
                borderRadius: 14,
                background: "#F5F0E826",
                border: "1px solid #F5F0E84D",
                fontSize: 15,
                fontWeight: 600,
                color: "#F5F0E8",
              }}
            >
              Start New Congregation
            </button>
          </div>

          {/* Near You Card — Paper 4SL-0 */}
          <div
            className="flex flex-col gap-[16px]"
            style={{
              borderRadius: 20,
              padding: 24,
              backgroundImage: "linear-gradient(135deg, #8a5a30 0%, #a06a3a 50%, #b87a44 100%)",
              boxShadow: "#A0622D40 0px 4px 16px, #A0622D26 0px 1px 4px",
            }}
          >
            <h2 className="qahal-display" style={{ fontSize: 22, fontWeight: 700, color: "#F5F0E8" }}>
              Near You
            </h2>
            <div className="flex flex-col gap-[8px]">
              {displayedCommunities.length === 0 ? (
                <p style={{ fontSize: 13, color: "#F5F0E8BF" }}>No congregations found nearby yet.</p>
              ) : (
                displayedCommunities.map((c) => (
                  <div
                    key={c.id}
                    className="flex flex-col gap-[10px]"
                    style={{
                      borderRadius: 14,
                      padding: "12px 14px",
                      background: "#F5F0E81F",
                      border: "1px solid #F5F0E833",
                    }}
                  >
                    <div className="flex items-center gap-[12px]">
                      {/* Avatar */}
                      <div
                        className="flex shrink-0 items-center justify-center rounded-[10px]"
                        style={{ width: 36, height: 36, background: "#F5F0E833", fontSize: 16, color: "#F5F0E8" }}
                      >
                        {c.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div
                          className="qahal-display overflow-hidden text-ellipsis whitespace-nowrap"
                          style={{ fontSize: 17, fontWeight: 600, color: "#F5F0E8" }}
                        >
                          {c.name}
                        </div>
                        <div style={{ fontSize: 12, color: "#F5F0E8A6" }}>
                          {c.city} · {c.distanceKm.toFixed(1)} km
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-[6px]">
                      <button
                        type="button"
                        className="flex items-center justify-center"
                        style={{
                          height: 38,
                          flex: 1,
                          borderRadius: 10,
                          padding: "0 12px",
                          background: "#F5F0E826",
                          border: "1px solid #F5F0E840",
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#F5F0E8",
                        }}
                      >
                        Contact
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (isLocalTesting && c.memberState === "requested") {
                            setRequestedCommunityIds((prev) => {
                              const next = new Set(prev);
                              next.delete(c.id);
                              return next;
                            });
                            onVariantChange("default");
                            return;
                          }

                          if (c.memberState !== "not_member") {
                            onVariantChange(c.memberState === "member" ? "already-member" : "already-requested");
                            return;
                          }

                          const hasActiveMembership = displayedCommunities.some((community) => community.memberState === "member");
                          if (hasActiveMembership || (isLocalTesting && (localProfileRole === "member" || localProfileRole === "leader"))) {
                            onVariantChange("already-member");
                            return;
                          }

                          const hasPendingRequest = displayedCommunities.some((community) => community.memberState === "requested");
                          if (hasPendingRequest) {
                            onVariantChange("already-requested");
                            return;
                          }

                          setRequestedCommunityIds((prev) => {
                            const next = new Set(prev);
                            next.add(c.id);
                            return next;
                          });
                          setShowToast(true);
                          onVariantChange("join-requested");
                        }}
                        disabled={c.memberState === "member"}
                        className="flex items-center justify-center"
                        style={{
                          height: 38,
                          flex: 1,
                          borderRadius: 10,
                          padding: "0 12px",
                          background: c.memberState === "not_member" || (isLocalTesting && c.memberState === "requested") ? "#F5F0E8" : "#F5F0E866",
                          fontSize: 12,
                          fontWeight: 600,
                          color: c.memberState === "not_member" || (isLocalTesting && c.memberState === "requested") ? "#A0622D" : "#6B7280",
                        }}
                      >
                        {c.memberState === "member"
                          ? "Member"
                          : c.memberState === "requested"
                            ? isLocalTesting
                              ? "Undo Request"
                              : "Requested"
                            : "Join"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Badges Card — Paper 4TH-0 */}
          <div
            className="flex flex-col gap-[16px]"
            style={{
              borderRadius: 20,
              padding: 24,
              backgroundImage: "linear-gradient(135deg, #1e4a48 0%, #266058 40%, #2e7a6e 100%)",
              boxShadow: "#1E5C5A40 0px 4px 16px, #1E5C5A26 0px 1px 4px",
            }}
          >
            <h2 className="qahal-display" style={{ fontSize: 22, fontWeight: 700, color: "#F5F0E8" }}>
              Badges
            </h2>
            {[
              { name: "Torah Student", desc: "Committed to learning and keeping Torah" },
              { name: "Community Leader", desc: "Leading a local Qahal" },
              { name: "Shabbat Host", desc: "Opens home for Shabbat fellowship" },
            ].map((badge) => (
              <div
                key={badge.name}
                className="flex items-center gap-[12px]"
                style={{
                  borderRadius: 14,
                  padding: "12px 14px",
                  background: "#F5F0E81F",
                  border: "1px solid #F5F0E833",
                }}
              >
                <div
                  className="flex shrink-0 items-center justify-center rounded-full"
                  style={{ width: 36, height: 36, background: "#F5F0E833" }}
                >
                  <span style={{ fontSize: 16 }}>✦</span>
                </div>
                <div className="flex-1">
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#F5F0E8" }}>{badge.name}</div>
                  <div style={{ fontSize: 12, color: "#F5F0E899" }}>{badge.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Nav — Paper 4V3-0 */}
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
          {/* Home — active */}
          <button type="button" className="flex flex-col items-center gap-[4px]" onClick={() => onVariantChange("default")}>
            <div
              className="flex items-center justify-center rounded-full"
              style={{ width: 48, height: 48, background: "#1E5C5A", boxShadow: "#1E5C5A4D 0px 4px 12px" }}
            >
              <HomeIcon />
            </div>
          </button>
          {/* Map */}
          <button type="button" className="flex flex-col items-center gap-[4px]" onClick={onGoMap}>
            <MapIcon />
            <span style={{ fontSize: 11, color: "#1E5C5A" }}>Map</span>
          </button>
          {/* Profile */}
          <button
            type="button"
            className="flex flex-col items-center gap-[4px]"
            onClick={() => {
              if (isLocalTesting) {
                setProfileTestingPanelOpen(true);
              }
            }}
          >
            <ProfileIcon />
            <span style={{ fontSize: 11, color: "#1E5C5A" }}>Profile</span>
          </button>
        </div>
        {/* Home indicator bar */}
        <div style={{ width: 134, height: 5, borderRadius: 100, background: "#1C2526", opacity: 0.2 }} />
      </div>

      <HomePopups variant={variant} onClose={() => onVariantChange("default")} />

      <JoinRequestToast visible={showToast} />

      {isLocalTesting ? (
        <ProfileTestingPanel
          visible={profileTestingPanelOpen}
          role={localProfileRole}
          onRoleChange={setLocalProfileRole}
          onClose={() => setProfileTestingPanelOpen(false)}
        />
      ) : null}
    </section>
  );
};