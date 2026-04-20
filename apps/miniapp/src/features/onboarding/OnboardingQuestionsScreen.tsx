import { useI18n } from "../../app/i18n";

const TOTAL_DOTS = 9;

interface OnboardingQuestionsScreenProps {
  step: number;
  progressLabel: string;
  selectedValue?: string;
  onSelect: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
  onExit: () => void;
}

export const OnboardingQuestionsScreen = ({
  step,
  progressLabel,
  selectedValue,
  onSelect,
  onNext,
  onBack,
  onExit,
}: OnboardingQuestionsScreenProps) => {
  const { t } = useI18n();
  const questions = [
    t.onboardingQuestions.introQuestion,
    ...t.onboardingQuestions.questions,
    t.onboardingQuestions.resultQuestion,
  ];
  const questionText = questions[step] ?? questions[0];
  const questionReferences =
    t.onboardingQuestions.references[step] ??
    t.onboardingQuestions.references[0] ??
    [];
  const isIntro = step === 0;
  const isResult = step === questions.length - 1;

  return (
    <section className="relative flex min-h-[100dvh] flex-col overflow-hidden">
      {/* Paper 3E5-0: dark background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 30% 20%, #2a241e 0%, #1a1612 60%), radial-gradient(circle at 70% 80%, #22201a 0%, #1a1612 50%)",
        }}
      />
      {/* Paper 3ER-0: vignette overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 40%, transparent 35%, rgba(10,8,6,0.45) 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col justify-between px-[28px] pb-[36px] pt-[56px]">
        <div className="h-[14px]" />

        {/* Center content */}
        <div className="flex flex-col items-center gap-[24px] px-[8px]">
          {/* Question text — Paper 3QY-0 */}
          <h2
            className="qahal-display w-full text-center"
            style={{
              fontSize: 34,
              lineHeight: "120%",
              fontWeight: 600,
              color: "#E8DDD0",
            }}
          >
            {questionText}
          </h2>

          {/* Intro explanation card or scripture references */}
          {isIntro ? (
            <div
              style={{
                backdropFilter: "blur(12px)",
                background: "#2A241EA6",
                border: "1px solid #C9A46F1F",
                borderRadius: 20,
                padding: "24px 20px",
                width: "100%",
              }}
            >
              <p
                className="text-center"
                style={{
                  fontSize: 15,
                  lineHeight: "155%",
                  color: "#E8DDD0",
                  opacity: 0.8,
                }}
              >
                {t.onboardingQuestions.introBody}
              </p>
            </div>
          ) : isResult ? (
            <div
              style={{
                backdropFilter: "blur(12px)",
                background: "#2A241EA6",
                border: "1px solid #C9A46F1F",
                borderRadius: 20,
                padding: "24px 20px",
                width: "100%",
              }}
            >
              <p
                className="text-center"
                style={{
                  fontSize: 15,
                  lineHeight: "155%",
                  color: "#E8DDD0",
                  opacity: 0.8,
                }}
              >
                {t.onboardingQuestions.resultBody}
              </p>
            </div>
          ) : questionReferences.length > 0 ? (
            <div
              className="flex w-full flex-col gap-[14px]"
              style={{
                borderRadius: 16,
                padding: "18px 16px",
              }}
            >
              {questionReferences.map((ref) => (
                <span
                  key={ref}
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.08em",
                    color: "#C9A46F",
                    fontWeight: 600,
                    opacity: 0.8,
                    textAlign: "center",
                  }}
                >
                  {ref}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {/* Bottom buttons + dots */}
        <div className="flex flex-col gap-[16px]">
          {isIntro ? (
            /* Intro: single "Understood" button */
            <button
              type="button"
              onClick={onNext}
              className="flex shrink-0 items-center justify-center"
              style={{
                height: 52,
                borderRadius: 14,
                background: "#1E5C5A",
                border: "1.5px solid #C9A46F",
                boxShadow: "#1E5C5A40 0px 8px 24px",
                fontSize: 16,
                fontWeight: 600,
                letterSpacing: "0.02em",
                color: "#E8DDD0",
              }}
            >
              {t.onboardingQuestions.understood}
            </button>
          ) : isResult ? (
            /* Result: single "Ok" button — returns to carousel */
            <button
              type="button"
              onClick={onExit}
              className="flex shrink-0 items-center justify-center"
              style={{
                height: 52,
                borderRadius: 14,
                background: "#2A241E80",
                border: "1.5px solid #C9A46F33",
                fontSize: 16,
                fontWeight: 600,
                color: "#E8DDD0",
                opacity: 0.7,
              }}
            >
              {t.onboardingQuestions.ok}
            </button>
          ) : (
            /* Question: Yes / No buttons */
            <div className="grid grid-cols-2 gap-[12px]">
              {/* Yes button — Paper 3FC-0 */}
              <button
                type="button"
                onClick={() => {
                  onSelect("yes");
                  onNext();
                }}
                className={`flex shrink-0 items-center justify-center ${selectedValue === "yes" ? "ring-2 ring-white/30" : ""}`}
                style={{
                  height: 52,
                  borderRadius: 14,
                  background: "#1E5C5A",
                  border: "1.5px solid #C9A46F",
                  boxShadow: "#1E5C5A40 0px 8px 24px",
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#E8DDD0",
                }}
              >
                {t.onboardingQuestions.yes}
              </button>
              {/* No button — Paper 3FE-0 */}
              <button
                type="button"
                onClick={() => {
                  onSelect("no");
                  onNext();
                }}
                className={`flex shrink-0 items-center justify-center ${selectedValue === "no" ? "ring-2 ring-white/30" : ""}`}
                style={{
                  height: 52,
                  borderRadius: 14,
                  background: "#2A241E80",
                  border: "1.5px solid #C9A46F33",
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#E8DDD0",
                  opacity: 0.7,
                }}
              >
                {t.onboardingQuestions.no}
              </button>
            </div>
          )}

          {/* Progress dots — Paper 3FI-0, 3FH-0 */}
          <div className="flex items-center justify-center gap-[6px] py-[4px]">
            {Array.from({ length: TOTAL_DOTS }).map((_, i) => (
              <span
                key={i}
                className="shrink-0 rounded-[99px]"
                style={{
                  width: i === step ? 24 : 12,
                  height: 3,
                  background: i === step ? "#C9A46F" : "#E8DDD026",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
