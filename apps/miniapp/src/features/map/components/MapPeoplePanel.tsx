import type { CommunityPerson } from "../../../lib/api";
import { useI18n } from "../../../app/i18n";

interface MapPeoplePanelProps {
  visible: boolean;
  people: CommunityPerson[];
  onSelectPerson: (person: CommunityPerson) => void;
}

export const MapPeoplePanel = ({ visible, people, onSelectPerson }: MapPeoplePanelProps) => {
  const { t } = useI18n();

  if (!visible) {
    return null;
  }

  return (
    <div
      className="absolute bottom-[246px] right-4 z-30 w-[250px] overflow-hidden rounded-2xl border shadow-lg"
      style={{
        borderColor: "var(--theme-map-chip-border)",
        background: "var(--theme-map-chip-bg)",
      }}
    >
      <div
        className="border-b px-3 py-2 text-xs font-semibold uppercase tracking-wide"
        style={{
          borderColor: "var(--theme-map-chip-border)",
          color: "var(--theme-text-secondary)",
        }}
      >
        {t.map.peopleNearby}
      </div>
      <div className="max-h-[220px] overflow-y-auto px-2 py-2">
        {people.length === 0 ? (
          <div className="px-2 py-2 text-xs" style={{ color: "var(--theme-text-secondary)" }}>
            {t.map.noPeopleNearby}
          </div>
        ) : (
          people.map((person) => {
            const isLeader = person.badges.some((badge) => badge.kind === "messenger");
            return (
              <div
                key={person.id}
                className="mb-2 cursor-pointer rounded-xl border border-[#ece7df] bg-white px-2 py-2 text-sm text-[#1f2937] last:mb-0"
                style={{
                  borderColor: "var(--theme-map-chip-border)",
                  background: "var(--theme-card-bg)",
                  color: "var(--theme-text-primary)",
                }}
                onClick={() => onSelectPerson(person)}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{person.name}</span>
                  {isLeader ? (
                    <span className="rounded-full bg-[#1E5C5A1A] px-2 py-[2px] text-[10px] font-semibold uppercase text-[#1E5C5A]">
                      {t.map.leader}
                    </span>
                  ) : null}
                </div>
                <div className="mt-1 text-xs" style={{ color: "var(--theme-text-secondary)" }}>
                  {person.city}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
