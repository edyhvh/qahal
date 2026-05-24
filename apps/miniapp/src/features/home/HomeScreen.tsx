import { useEffect, useMemo, useRef, useState } from 'react';
import type { CommunityCard } from '@qahal/shared';
import { resolveBadgeDefinition } from '../../app/types';
import type { EffectiveProfileSnapshot, HomeVariant } from '../../app/types';
import { getBadgeLocalized, useI18n } from '../../app/i18n';
import { HomePopups } from './components/HomePopups';
import { JoinRequestToast } from './components/JoinRequestToast';

interface HomeScreenProps {
  variant: HomeVariant;
  communities: CommunityCard[];
  onVariantChange: (variant: HomeVariant) => void;
  onGoMap: () => void;
  onGoProfile: () => void;
  onGoManageQahal: () => void;
  profileTestingEnabled: boolean;
  effectiveProfile: EffectiveProfileSnapshot;
}

/* ── SVG icons extracted from Paper (4V3-0) ── */
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
const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 15.5C13.933 15.5 15.5 13.933 15.5 12C15.5 10.067 13.933 8.5 12 8.5C10.067 8.5 8.5 10.067 8.5 12C8.5 13.933 10.067 15.5 12 15.5Z"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path
      d="M19.4 15A1.65 1.65 0 0 0 19.73 16.82L19.79 16.88A2 2 0 1 1 16.96 19.71L16.9 19.65A1.65 1.65 0 0 0 15.08 19.32A1.65 1.65 0 0 0 14 20.83V21A2 2 0 1 1 10 21V20.91A1.65 1.65 0 0 0 8.92 19.4A1.65 1.65 0 0 0 7.1 19.73L7.04 19.79A2 2 0 1 1 4.21 16.96L4.27 16.9A1.65 1.65 0 0 0 4.6 15.08A1.65 1.65 0 0 0 3.09 14H3A2 2 0 1 1 3 10H3.09A1.65 1.65 0 0 0 4.6 8.92A1.65 1.65 0 0 0 4.27 7.1L4.21 7.04A2 2 0 1 1 7.04 4.21L7.1 4.27A1.65 1.65 0 0 0 8.92 4.6H9A1.65 1.65 0 0 0 10 3.09V3A2 2 0 1 1 14 3V3.09A1.65 1.65 0 0 0 15.08 4.6A1.65 1.65 0 0 0 16.9 4.27L16.96 4.21A2 2 0 1 1 19.79 7.04L19.73 7.1A1.65 1.65 0 0 0 19.4 8.92V9A1.65 1.65 0 0 0 20.91 10H21A2 2 0 1 1 21 14H20.91A1.65 1.65 0 0 0 19.4 15Z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const HomeScreen = ({
  variant,
  communities,
  onVariantChange,
  onGoMap,
  onGoProfile,
  onGoManageQahal,
  profileTestingEnabled,
  effectiveProfile,
}: HomeScreenProps) => {
  const { t } = useI18n();
  const hasRequestedLocationPermission = useRef(false);
  const [requestedCommunityIds, setRequestedCommunityIds] = useState<Set<number>>(new Set());
  const [memberCommunityIds, setMemberCommunityIds] = useState<Set<number>>(new Set());
  const [showToast, setShowToast] = useState(false);
  useEffect(() => {
    if (hasRequestedLocationPermission.current) {
      return;
    }

    hasRequestedLocationPermission.current = true;

    if (!('geolocation' in navigator) || !window.isSecureContext) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      () => {
        // Permission prompt is intentional on Home; position is not needed here.
      },
      () => {
        // Permission can be denied; Home should remain fully usable.
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      },
    );
  }, []);

  useEffect(() => {
    const initiallyRequested = new Set<number>();
    const initiallyMember = new Set<number>();
    for (const community of communities) {
      if (community.memberState === 'requested') {
        initiallyRequested.add(community.id);
      }
      if (community.memberState === 'member') {
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
      if (variant === 'join-requested') {
        onVariantChange('default');
      }
    }, 2200);

    return () => window.clearTimeout(timeoutId);
  }, [showToast, variant, onVariantChange]);

  const displayedCommunities = useMemo(() => {
    return communities.map((community) => {
      if (memberCommunityIds.has(community.id)) {
        return {
          ...community,
          memberState: 'member' as const,
        };
      }

      const requested = requestedCommunityIds.has(community.id);
      if (!requested) {
        return community;
      }

      return {
        ...community,
        memberState: 'requested' as const,
      };
    });
  }, [communities, requestedCommunityIds, memberCommunityIds]);

  const badgeShowcase = useMemo(() => {
    return [
      'Emunah',
      'Kehilah',
      'Years in Emunah (0)',
      'Messenger',
      'Hebrew Teacher',
      'Hebrew Student',
    ].map((badgeName) => getBadgeLocalized(t, badgeName));
  }, [t]);

  const earnedBadgeKinds = useMemo(() => {
    const set = new Set<string>();
    for (const badgeName of effectiveProfile.badges) {
      set.add(resolveBadgeDefinition(badgeName).kind);
    }
    return set;
  }, [effectiveProfile.badges]);

  const showManageCard = effectiveProfile.canManageQahal;
  const showCreateCard = !showManageCard && effectiveProfile.canCreateQahal;
  const isStartingUser = effectiveProfile.emunahState === 'starting';
  const leaderApprovalPending =
    effectiveProfile.emunahState === 'leader' && !effectiveProfile.emunahLevelApproved;
  const homeCardTextColor = 'var(--theme-text-primary)';
  const homeCardMutedColor = 'var(--theme-text-secondary)';
  const compactCardStyle = (borderColor: string, background = 'var(--theme-card-bg)') => ({
    borderRadius: 18,
    padding: '18px',
    background,
    border: `1px solid ${borderColor}`,
    boxShadow: '0 4px 14px rgba(30, 24, 18, 0.04)',
  });
  const compactCreateCardStyle = compactCardStyle('rgba(125, 90, 242, 0.16)');
  const compactNearCardStyle = compactCardStyle(
    'rgba(9, 25, 77, 0.08)',
    'var(--theme-surface-warm-muted)',
  );
  const compactBadgeCardStyle = compactCardStyle('rgba(92, 77, 217, 0.14)');
  const homeCardPanelStyle = {
    background: 'var(--theme-bg-main)',
    border: '1px solid var(--theme-surface-warm-border)',
  };
  const homeCardPrimaryActionStyle = {
    background: 'var(--theme-button-primary-bg)',
    border: '1px solid var(--theme-button-primary-border)',
    color: 'var(--theme-button-primary-text)',
  };
  const homeCardSecondaryActionStyle = {
    background: 'transparent',
    border: '1px solid var(--theme-surface-warm-border)',
    color: 'var(--theme-text-primary)',
  };
  const homeCardTertiaryActionStyle = {
    background: 'rgba(125, 90, 242, 0.08)',
    border: '1px solid rgba(125, 90, 242, 0.14)',
    color: 'var(--brand-accent)',
  };

  return (
    <section className="relative flex h-[100dvh] flex-col overflow-hidden">
      {/* Solid warm background (pure, no radial overlays) */}
      <div
        className="absolute inset-0"
        style={{
          background: 'var(--theme-bg-main)',
        }}
      />

      {/* Scrollable content */}
      <div className="relative z-10 flex flex-1 flex-col overflow-y-auto pb-[120px]">
        {/* Header — Paper 4S7-0 */}

        {/* Subtle neutral notices — minimal, calm, monocolor */}
        {isStartingUser && (
          <div
            className="mx-5 mt-4 rounded-[18px] px-4 py-3 text-[13px] leading-snug"
            style={{
              background: 'var(--theme-card-bg)',
              border: '1px solid rgba(125, 90, 242, 0.12)',
              color: 'var(--theme-text-primary)',
            }}
          >
            {t.home.startingNotice}
          </div>
        )}

        {leaderApprovalPending && (
          <div
            className="mx-5 mt-4 rounded-[18px] px-4 py-3 text-[13px] leading-snug"
            style={{
              background: 'var(--theme-card-bg)',
              border: '1px solid rgba(9, 25, 77, 0.09)',
              color: 'var(--theme-text-primary)',
            }}
          >
            {t.home.leaderApprovalNotice}
          </div>
        )}
        <header className="flex items-center" style={{ padding: '64px 24px 16px 24px' }}>
          {/* Paper 4S8-0 */}
          <h1
            className="qahal-display"
            style={{
              fontSize: 32,
              lineHeight: '38px',
              fontWeight: 700,
              color: 'var(--theme-text-primary)',
            }}
          >
            {t.common.home}
          </h1>
        </header>

        {/* Action cards — neutral surfaces with accent outlines */}
        <div className="flex flex-col gap-[16px] px-[24px]">
          {/* Create Qahal */}
          {showCreateCard ? (
            <div
              className="flex flex-col gap-3"
              style={{
                ...compactCreateCardStyle,
              }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{
                  background: 'rgba(125, 90, 242, 0.08)',
                  color: 'var(--brand-accent)',
                }}
              >
                <PlusIcon />
              </div>
              <h2
                className="qahal-display"
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: homeCardTextColor,
                  lineHeight: 1.1,
                }}
              >
                {t.home.createQahalTitle}
              </h2>
              <p style={{ fontSize: 13, lineHeight: 1.4, color: homeCardMutedColor }}>
                {t.home.createQahalBody}
              </p>
              <button
                type="button"
                onClick={() => onVariantChange('qahal-exists')}
                className="mt-1 flex items-center justify-center"
                style={{
                  height: 42,
                  borderRadius: 14,
                  fontSize: 14,
                  fontWeight: 600,
                  ...homeCardPrimaryActionStyle,
                }}
              >
                {t.home.createQahalCta}
              </button>
            </div>
          ) : null}

          {/* Manage Qahal */}
          {showManageCard ? (
            <div
              className="flex flex-col gap-3"
              style={{
                ...compactCreateCardStyle,
              }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{
                  background: 'rgba(125, 90, 242, 0.08)',
                  color: 'var(--brand-accent)',
                }}
              >
                <SettingsIcon />
              </div>
              <h2
                className="qahal-display"
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: homeCardTextColor,
                  lineHeight: 1.1,
                }}
              >
                {t.home.manageQahalTitle}
              </h2>
              <p style={{ fontSize: 13, lineHeight: 1.4, color: homeCardMutedColor }}>
                {t.home.manageQahalBody}
              </p>
              <button
                type="button"
                onClick={onGoManageQahal}
                className="mt-1 flex items-center justify-center"
                style={{
                  height: 42,
                  borderRadius: 14,
                  fontSize: 14,
                  fontWeight: 600,
                  ...homeCardPrimaryActionStyle,
                }}
              >
                {t.home.manageQahalCta}
              </button>
            </div>
          ) : null}

          {/* Near You */}
          <div
            className="flex flex-col gap-3"
            style={{
              ...compactNearCardStyle,
            }}
          >
            <h2
              className="qahal-display"
              style={{ fontSize: 20, fontWeight: 700, color: homeCardTextColor, lineHeight: 1.1 }}
            >
              {t.home.nearYouTitle}
            </h2>
            <div className="flex flex-col gap-2.5">
              {displayedCommunities.length === 0 ? (
                <p style={{ fontSize: 13, color: homeCardMutedColor }}>{t.home.nearYouEmpty}</p>
              ) : (
                displayedCommunities.map((c) => (
                  <div
                    key={c.id}
                    className="flex flex-col gap-2.5"
                    style={{
                      borderRadius: 14,
                      padding: '12px 14px',
                      ...homeCardPanelStyle,
                    }}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className="flex shrink-0 items-center justify-center rounded-xl"
                        style={{
                          width: 34,
                          height: 34,
                          background: 'rgba(125, 90, 242, 0.08)',
                          border: '1px solid rgba(125, 90, 242, 0.12)',
                          fontSize: 15,
                          fontWeight: 700,
                          color: 'var(--brand-accent)',
                        }}
                      >
                        {c.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div
                          className="qahal-display overflow-hidden text-ellipsis whitespace-nowrap"
                          style={{
                            fontSize: 15,
                            fontWeight: 600,
                            color: homeCardTextColor,
                            letterSpacing: '-0.01em',
                          }}
                        >
                          {c.name}
                        </div>
                        <div style={{ fontSize: 12, color: homeCardMutedColor, marginTop: 1 }}>
                          {c.city} · {c.distanceKm.toFixed(1)} km
                        </div>
                      </div>
                    </div>

                    {c.memberState === 'member' ? (
                      <button
                        type="button"
                        className="flex items-center justify-center"
                        style={{
                          height: 34,
                          width: '100%',
                          borderRadius: 10,
                          padding: '0 14px',
                          fontSize: 12,
                          fontWeight: 700,
                          letterSpacing: '0.03em',
                          ...homeCardTertiaryActionStyle,
                        }}
                      >
                        {t.home.member.toUpperCase()}
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="flex items-center justify-center"
                          style={{
                            height: 34,
                            flex: 1,
                            borderRadius: 10,
                            padding: '0 12px',
                            fontSize: 12,
                            fontWeight: 600,
                            ...homeCardSecondaryActionStyle,
                          }}
                        >
                          {t.home.contact}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (profileTestingEnabled && c.memberState === 'requested') {
                              setRequestedCommunityIds((prev) => {
                                const next = new Set(prev);
                                next.delete(c.id);
                                return next;
                              });
                              onVariantChange('default');
                              return;
                            }

                            if (c.memberState !== 'not_member') {
                              onVariantChange(
                                c.memberState === 'member' ? 'already-member' : 'already-requested',
                              );
                              return;
                            }

                            const hasActiveMembership = displayedCommunities.some(
                              (community) => community.memberState === 'member',
                            );
                            if (hasActiveMembership || effectiveProfile.hasCongregation) {
                              onVariantChange('already-member');
                              return;
                            }

                            const hasPendingRequest = displayedCommunities.some(
                              (community) => community.memberState === 'requested',
                            );
                            if (hasPendingRequest) {
                              onVariantChange('already-requested');
                              return;
                            }

                            setRequestedCommunityIds((prev) => {
                              const next = new Set(prev);
                              next.add(c.id);
                              return next;
                            });
                            setShowToast(true);
                            onVariantChange('join-requested');
                          }}
                          disabled={isStartingUser && c.memberState === 'not_member'}
                          className="flex items-center justify-center"
                          style={{
                            height: 34,
                            flex: 1,
                            borderRadius: 10,
                            padding: '0 12px',
                            fontSize: 12,
                            fontWeight: 600,
                            border:
                              isStartingUser && c.memberState === 'not_member'
                                ? '1px solid var(--theme-surface-warm-border)'
                                : c.memberState === 'not_member'
                                  ? '1px solid var(--theme-button-primary-border)'
                                  : '1px solid rgba(125, 90, 242, 0.14)',
                            background:
                              isStartingUser && c.memberState === 'not_member'
                                ? 'transparent'
                                : c.memberState === 'not_member'
                                  ? 'var(--theme-button-primary-bg)'
                                  : 'rgba(125, 90, 242, 0.08)',
                            color:
                              isStartingUser && c.memberState === 'not_member'
                                ? homeCardMutedColor
                                : c.memberState === 'not_member'
                                  ? 'var(--theme-button-primary-text)'
                                  : 'var(--brand-accent)',
                          }}
                        >
                          {isStartingUser && c.memberState === 'not_member'
                            ? t.home.joinBlocked
                            : c.memberState === 'requested'
                              ? profileTestingEnabled
                                ? t.home.undoRequest
                                : t.home.requested
                              : t.home.join}
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Badges */}
          <div
            className="flex flex-col gap-3"
            style={{
              ...compactBadgeCardStyle,
            }}
          >
            <h2
              className="qahal-display"
              style={{ fontSize: 20, fontWeight: 700, color: homeCardTextColor, lineHeight: 1.1 }}
            >
              {t.home.badgesTitle}
            </h2>
            {badgeShowcase.map((badge) => {
              const earned = earnedBadgeKinds.has(badge.kind);
              return (
                <div
                  key={badge.name}
                  className="flex items-center justify-between gap-3"
                  style={{
                    borderRadius: 14,
                    padding: '11px 14px',
                    ...homeCardPanelStyle,
                  }}
                >
                  <div className="min-w-0 flex-1">
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: homeCardTextColor,
                      }}
                    >
                      {badge.name}
                    </div>
                    <div style={{ fontSize: 11.5, color: homeCardMutedColor, marginTop: 2 }}>
                      {badge.desc}
                    </div>
                  </div>
                  {earned && (
                    <div
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px]"
                      style={{
                        background: 'rgba(125, 90, 242, 0.08)',
                        color: 'var(--brand-accent)',
                        fontWeight: 700,
                      }}
                    >
                      ✓
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Nav — Paper 4V3-0 */}
      <div
        className="fixed bottom-0 left-1/2 z-20 flex w-full max-w-[375px] -translate-x-1/2 flex-col items-center"
        style={{
          background: 'var(--theme-nav-bg)',
          borderTop: '1px solid var(--theme-card-border)',
          boxShadow: 'var(--theme-nav-shadow)',
          paddingBottom: 24,
          paddingTop: 20,
        }}
      >
        <div className="flex w-[327px] items-center justify-around py-[12px]">
          {/* Home — active */}
          <button
            type="button"
            className="flex w-[84px] flex-col items-center gap-[4px]"
            onClick={() => onVariantChange('default')}
          >
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                width: 48,
                height: 48,
                background: 'var(--theme-accent)',
                boxShadow: 'var(--theme-button-primary-shadow)',
              }}
            >
              <HomeIcon color="#F5F0E8" />
            </div>
            <span
              style={{
                fontSize: 11,
                color: 'var(--theme-accent)',
                minHeight: 16,
                lineHeight: '16px',
                visibility: 'hidden',
              }}
            >
              {t.common.home}
            </span>
          </button>
          {/* Map */}
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
                color: 'var(--theme-accent)',
                minHeight: 16,
                lineHeight: '16px',
              }}
            >
              {t.common.map}
            </span>
          </button>
          {/* Profile */}
          <button
            type="button"
            className="flex w-[84px] flex-col items-center gap-[4px]"
            onClick={onGoProfile}
          >
            <div className="flex h-[48px] w-[48px] items-center justify-center rounded-full">
              <ProfileIcon color="var(--theme-accent)" />
            </div>
            <span
              style={{
                fontSize: 11,
                color: 'var(--theme-accent)',
                minHeight: 16,
                lineHeight: '16px',
              }}
            >
              {t.common.profile}
            </span>
          </button>
        </div>
        {/* Home indicator bar */}
        <div
          style={{
            width: 134,
            height: 5,
            borderRadius: 100,
            background: 'var(--theme-text-primary)',
            opacity: 0.2,
          }}
        />
      </div>

      <HomePopups variant={variant} onClose={() => onVariantChange('default')} />

      <JoinRequestToast visible={showToast} />
    </section>
  );
};
