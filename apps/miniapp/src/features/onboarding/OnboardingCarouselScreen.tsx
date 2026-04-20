import { useState, useRef, useCallback } from "react";

interface OnboardingCarouselScreenProps {
  onStart: () => void;
}

const TOTAL_SLIDES = 3;

export const OnboardingCarouselScreen = ({
  onStart,
}: OnboardingCarouselScreenProps) => {
  const [slide, setSlide] = useState(0);
  const touchRef = useRef({ startX: 0, delta: 0, active: false });
  const [dragDelta, setDragDelta] = useState(0);

  const goTo = useCallback((i: number) => {
    setSlide(Math.max(0, Math.min(TOTAL_SLIDES - 1, i)));
    setDragDelta(0);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchRef.current = {
      startX: e.touches[0].clientX,
      delta: 0,
      active: true,
    };
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchRef.current.active) return;
    const delta = e.touches[0].clientX - touchRef.current.startX;
    touchRef.current.delta = delta;
    setDragDelta(delta);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchRef.current.active) return;
    touchRef.current.active = false;
    const d = touchRef.current.delta;
    if (d < -60 && slide < TOTAL_SLIDES - 1) {
      goTo(slide + 1);
    } else if (d > 60 && slide > 0) {
      goTo(slide - 1);
    } else {
      setDragDelta(0);
    }
  }, [slide, goTo]);

  const delta = touchRef.current.active ? dragDelta : 0;
  const transition = touchRef.current.active
    ? "none"
    : "transform 0.3s ease-out";

  /* Progress dots — fills up as you advance (Paper XQ/XR/XS pattern) */
  const dots = (
    <div className="flex items-center justify-center gap-[6px]">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-[3px] w-[28px] rounded-[2px]"
          style={{
            backgroundColor: i <= slide ? "#1E5C5A" : "#1C2525",
            opacity: i <= slide ? 1 : 0.15,
          }}
        />
      ))}
    </div>
  );

  return (
    <section
      className="relative h-[100dvh] overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Paper KS-0: background gradient (shared) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(165deg, #f3efe8 0%, #ece5d8 35%, #e8e0d2 60%, #ede7db 100%)",
        }}
      />
      {/* Paper 206-0: radial overlays (shared) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 20% 15%, rgba(160,148,130,0.15) 0%, transparent 45%), radial-gradient(circle at 75% 25%, rgba(140,155,148,0.12) 0%, transparent 40%), radial-gradient(circle at 50% 80%, rgba(170,155,130,0.10) 0%, transparent 50%)",
        }}
      />

      {/* ─── Slide 1 — Paper KR-0 ─── */}
      <div
        className="absolute inset-0 z-10 flex flex-col px-[20px] pb-[36px] pt-[56px]"
        style={{
          transform: `translateX(calc(${(0 - slide) * 100}% + ${delta}px))`,
          transition,
        }}
      >
        {/* QAHAL title — Paper XD-0 */}
        <div className="mt-[48px] text-center">
          <h1
            className="qahal-display"
            style={{
              fontSize: 62,
              fontWeight: 700,
              letterSpacing: "0.08em",
              lineHeight: "76px",
              color: "#1C2525",
              textShadow: "#F5EDE499 0px 1px 3px",
            }}
          >
            QAHAL
          </h1>
          {/* Paper XE-0: Hebrew subtitle */}
          <p
            className="qahal-display"
            style={{
              fontSize: 18,
              letterSpacing: "0.15em",
              color: "#1C2525",
              opacity: 0.45,
            }}
          >
            קהל
          </p>
        </div>

        <div className="flex-1" />

        {/* Content card — Paper XF-0 */}
        <div
          className="text-center"
          style={{
            borderRadius: 16,
            padding: "28px 24px",
            background: "#F5EDE4D1",
            border: "1px solid #1C25251F",
            backdropFilter: "blur(8px)",
            boxShadow: "#1C252514 0px 2px 12px",
          }}
        >
          {/* Card heading — Paper XG-0 */}
          <h2
            className="qahal-display"
            style={{
              fontSize: 26,
              lineHeight: "32px",
              fontWeight: 600,
              color: "#1C2525",
              marginBottom: 14,
            }}
          >
            Did you receive the Emunah?
          </h2>

          {/* Card body — Paper XH-0 */}
          <p
            style={{
              fontSize: 15,
              lineHeight: "22px",
              color: "#1C2525",
              opacity: 0.72,
            }}
          >
            Find brothers and congregations near to you.
          </p>

          {/* Button — single Go! */}
          <div className="mt-[20px]">
            <button
              type="button"
              onClick={() => goTo(1)}
              style={{
                width: "100%",
                height: 52,
                borderRadius: 14,
                background: "#1E5C5A",
                border: "2px solid #C9A46F",
                boxShadow: "#1E5C5A40 0px 2px 8px",
                fontSize: 16,
                letterSpacing: "0.04em",
                color: "#FFFFFF",
              }}
            >
              Go!
            </button>
          </div>

          <div className="mt-[20px]">{dots}</div>
        </div>
      </div>

      {/* ─── Slide 2 — Paper XT-0 ─── */}
      <div
        className="absolute inset-0 z-10 flex flex-col px-[20px] pb-[36px] pt-[56px]"
        style={{
          transform: `translateX(calc(${(1 - slide) * 100}% + ${delta}px))`,
          transition,
        }}
      >
        {/* Title — Paper 17C-0 */}
        <h1
          className="qahal-display mt-[24px] text-center"
          style={{
            fontSize: 40,
            lineHeight: "46px",
            fontWeight: 700,
            color: "#1C2525",
            textShadow: "#F5EDE499 0px 1px 3px",
          }}
        >
          Encuentra tu gente
        </h1>

        <div className="flex-1" />

        {/* Content card — Paper 17D-0 */}
        <div
          className="text-center"
          style={{
            borderRadius: 16,
            padding: "24px 22px",
            background: "#F5EDE4D1",
            border: "1px solid #1C25251F",
            backdropFilter: "blur(8px)",
            boxShadow: "#1C252514 0px 2px 12px",
          }}
        >
          {/* Body — Paper 17E-0 */}
          <p
            style={{
              fontSize: 15,
              lineHeight: "23px",
              color: "#1C2525",
              opacity: 0.78,
              textAlign: "center",
            }}
          >
            Personas reales, congregaciones reales en tu ciudad y en tu barrio.
            Gente que camina en Emunah y quiere conocerte.
          </p>
        </div>

        {/* Button + dots — Paper 17F-0 */}
        <div className="mt-[16px]">
          {/* Button — Paper 17G-0 */}
          <button
            type="button"
            onClick={() => goTo(2)}
            style={{
              width: "100%",
              height: 52,
              borderRadius: 14,
              background: "#1E5C5A",
              border: "2px solid #C9A46F",
              boxShadow: "#1E5C5A40 0px 2px 8px",
              fontSize: 16,
              letterSpacing: "0.04em",
              color: "#FFFFFF",
            }}
          >
            Agree
          </button>
          <div className="mt-[16px]">{dots}</div>
        </div>
      </div>

      {/* ─── Slide 3 — Paper 17M-0 ─── */}
      <div
        className="absolute inset-0 z-10 flex flex-col px-[20px] pb-[36px] pt-[56px]"
        style={{
          transform: `translateX(calc(${(2 - slide) * 100}% + ${delta}px))`,
          transition,
        }}
      >
        {/* Title — Paper 1IW-0 */}
        <h1
          className="qahal-display mt-[24px] text-center"
          style={{
            fontSize: 38,
            lineHeight: "44px",
            fontWeight: 700,
            color: "#1C2525",
            textShadow: "#F5EDE499 0px 1px 3px",
          }}
        >
          Reúnete donde estás
        </h1>

        <div className="flex-1" />

        {/* Content card — Paper 1IX-0 */}
        <div
          className="text-center"
          style={{
            borderRadius: 16,
            padding: "24px 22px",
            background: "#F5EDE4D1",
            border: "1px solid #1C25251F",
            backdropFilter: "blur(8px)",
            boxShadow: "#1C252514 0px 2px 12px",
          }}
        >
          {/* Body — Paper 1IY-0 */}
          <p
            style={{
              fontSize: 15,
              lineHeight: "23px",
              color: "#1C2525",
              opacity: 0.78,
              textAlign: "center",
            }}
          >
            Comparte tu ubicación para ver quién camina en Emunah cerca de ti.
            Tu localización sólo se usa para conectarte — nunca se comparte
            públicamente.
          </p>
        </div>

        {/* Button + dots — Paper 1IZ-0 */}
        <div className="mt-[16px]">
          {/* Button — Paper 1J0-0 */}
          <button
            type="button"
            onClick={onStart}
            style={{
              width: "100%",
              height: 56,
              borderRadius: 14,
              background: "#1E5C5A",
              border: "2px solid #C9A46F",
              boxShadow: "#1E5C5A4D 0px 3px 12px",
              fontSize: 17,
              letterSpacing: "0.05em",
              color: "#FFFFFF",
            }}
          >
            Comenzar
          </button>
          <div className="mt-[16px]">{dots}</div>
        </div>
      </div>
    </section>
  );
};
