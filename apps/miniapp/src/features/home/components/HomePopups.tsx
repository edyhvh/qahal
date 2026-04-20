import type { HomeVariant } from "../../../app/types";
import { useI18n } from "../../../app/i18n";

interface HomePopupsProps {
  variant: HomeVariant;
  onClose: () => void;
}

const PopupShell = ({
  title,
  description,
  primaryAction,
  secondaryAction
}: {
  title: string;
  description: string;
  primaryAction: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/30 px-[24px]">
      <div
        className="flex w-[300px] flex-col items-center gap-[20px] text-center"
        style={{
          background: "#F5F0E8",
          borderRadius: 24,
          border: "1px solid #C9A46F4D",
          boxShadow: "#1C252526 0px 12px 40px, #1C252514 0px 4px 12px",
          padding: "32px 24px",
        }}
      >
        <div
          className="flex items-center justify-center rounded-full"
          style={{
            width: 56,
            height: 56,
            backgroundImage: "linear-gradient(135deg, #C9A46F, #D4B67E)",
          }}
        >
          <span style={{ fontSize: 24 }}>✦</span>
        </div>

        <h3 className="qahal-display" style={{ fontSize: 22, fontWeight: 600, color: "#1C2526" }}>
          {title}
        </h3>

        <p style={{ fontSize: 14, lineHeight: "20px", color: "#5A5A52" }}>{description}</p>

        <button
          type="button"
          onClick={primaryAction.onClick}
          className="flex w-full items-center justify-center"
          style={{
            height: 48,
            borderRadius: 14,
            background: "#1E5C5A",
            fontSize: 15,
            fontWeight: 600,
            color: "#FFFFFF",
          }}
        >
          {primaryAction.label}
        </button>

        {secondaryAction ? (
          <button
            type="button"
            onClick={secondaryAction.onClick}
            style={{ fontSize: 14, fontWeight: 500, color: "#8A8A7E" }}
          >
            {secondaryAction.label}
          </button>
        ) : null}
      </div>
    </div>
  );
};

export const HomePopups = ({ variant, onClose }: HomePopupsProps) => {
  const { t } = useI18n();

  if (variant === "qahal-exists") {
    return (
      <PopupShell
        title={t.home.popupQahalExistsTitle}
        description={t.home.popupQahalExistsBody}
        primaryAction={{ label: t.home.popupQahalExistsPrimary, onClick: onClose }}
        secondaryAction={{ label: t.home.popupQahalExistsSecondary, onClick: onClose }}
      />
    );
  }

  if (variant === "already-requested") {
    return (
      <PopupShell
        title={t.home.popupAlreadyRequestedTitle}
        description={t.home.popupAlreadyRequestedBody}
        primaryAction={{ label: t.home.popupUnderstood, onClick: onClose }}
      />
    );
  }

  if (variant === "already-member") {
    return (
      <PopupShell
        title={t.home.popupAlreadyMemberTitle}
        description={t.home.popupAlreadyMemberBody}
        primaryAction={{ label: t.home.popupUnderstood, onClick: onClose }}
      />
    );
  }

  return null;
};
