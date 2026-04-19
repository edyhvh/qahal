const QUESTIONS: {
  text: string;
  references: string[];
}[] = [
  {
    text: "We'll ask you a couple of questions to get you started",
    references: [],
  },
  {
    text: "Do you believe that Yeshua is the Messiah of Israel?",
    references: ["Isaiah 53:5", "John 20:31"],
  },
  {
    text: "Do you believe that we're called to keep the Torah and Yeshua's testimony?",
    references: ["Isaiah 8:20", "Revelation 14:12"],
  },
  {
    text: "Do you believe that Yeshua is The Prophet?",
    references: ["Deuteronomy 18:18", "Acts 7:37"],
  },
  {
    text: "Do you believe that Elohim is one?",
    references: ["Deuteronomy 6:4", "John 17:3"],
  },
  {
    text: "Do you believe that Yeshua is YHWH?",
    references: ["Psalm 110:1", "Philippians 2:11"],
  },
  {
    text: "Do you believe that Adonai has made one single people out of Jews and Gentiles?",
    references: ["Zechariah 2:11", "John 10:16"],
  },
  {
    text: "From now on, will you abstain from what is offered to idols, blood, what is strangled, and sexual inmorality?",
    references: ["Acts 15:29"],
  },
  {
    text: "You don't agree with some of the statements",
    references: [],
  },
];

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
  const question = QUESTIONS[step] ?? QUESTIONS[0];
  const isIntro = step === 0;
  const isResult = step === QUESTIONS.length - 1;
  const stepLabel = String(step + 1).padStart(2, "0");

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
        {/* Top bar: language + step number */}
        <div className="flex items-center justify-between px-[4px] opacity-50">
          <span
            style={{
              color: "#C9A46F",
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: "0.18em",
              textTransform: "uppercase" as const,
              opacity: 0.7,
            }}
          >
            English
          </span>
          <span
            style={{
              color: "#E8DDD0",
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: "0.12em",
              opacity: 0.35,
            }}
          >
            {stepLabel}
          </span>
        </div>

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
            {question.text}
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
                These questions help us understand your walk in Emunah. Answer
                honestly — there are no tricks, just honest reflection.
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
                You can always ask Adonai about it. Do your own research. Come
                back when you&apos;re ready.
              </p>
            </div>
          ) : question.references.length > 0 ? (
            <div
              className="flex w-full flex-col gap-[14px]"
              style={{
                borderRadius: 16,
                padding: "18px 16px",
              }}
            >
              {question.references.map((ref) => (
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
              Understood
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
              Ok
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
                Yes
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
                No
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