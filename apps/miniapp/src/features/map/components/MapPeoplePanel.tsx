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
    <div className="absolute bottom-[246px] right-4 z-30 w-[250px] overflow-hidden rounded-2xl border border-[#d1c7b8] bg-white/95 shadow-lg">
      <div className="border-b border-[#e5e0d8] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
        {t.map.peopleNearby}
      </div>
      <div className="max-h-[220px] overflow-y-auto px-2 py-2">
        {people.length === 0 ? (
          <div className="px-2 py-2 text-xs text-[#6b7280]">{t.map.noPeopleNearby}</div>
        ) : (
          people.map((person) => {
            const isLeader = person.badges.some((badge) => badge.kind === "messenger");
            return (
              <div
                key={person.id}
                className="mb-2 cursor-pointer rounded-xl border border-[#ece7df] bg-white px-2 py-2 text-sm text-[#1f2937] last:mb-0"
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
                <div className="mt-1 text-xs text-[#6b7280]">{person.city}</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
