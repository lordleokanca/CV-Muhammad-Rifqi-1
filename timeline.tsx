// Built using Hyperiux Vault: https://vault.hyperiux.com
// Adapted for the CV: items come in through props (chronological order, each
// marked "top" or "bottom"), dates are free-form labels instead of year + month,
// and the reveal positions are computed for any number of items.
"use client";

import {
  type CSSProperties,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

/* Inline stand-in for @gsap/react's useGSAP. One gsap.context lives for the
   component's lifetime and is reverted on unmount. To swap the data, remount
   the component with a new `key` (the CV page does this on language change). */
function useGSAP(
  callback: () => void | (() => void),
  options?: {
    dependencies?: unknown[];
    scope?: { current: Element | null } | Element | null;
  },
) {
  const deps = options?.dependencies ?? [];
  const scope = options?.scope;
  const ctxRef = useRef<gsap.Context | null>(null);
  const cleanupRef = useRef<(() => void) | undefined>(undefined);

  useLayoutEffect(() => {
    const el =
      scope && typeof scope === "object" && "current" in scope
        ? scope.current
        : (scope as Element | null);
    ctxRef.current = gsap.context(() => {}, el ?? undefined);
    return () => {
      cleanupRef.current?.();
      cleanupRef.current = undefined;
      ctxRef.current?.revert();
      ctxRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    if (!ctxRef.current) return;
    cleanupRef.current?.();
    const ret = ctxRef.current.add(callback);
    cleanupRef.current = typeof ret === "function" ? ret : undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export type JourneyItem = {
  id: string;
  position: "top" | "bottom";
  /** Shown as the item heading, e.g. "14 Dec 2023" or "2021". */
  label: string;
  content: string;
};

type SplitTextInstance = InstanceType<typeof SplitText>;

export type TimelineProps = {
  /** Chronological order. Reveal order follows this array. */
  items: JourneyItem[];
  title?: string;
  periodLabel?: string;
  textColor?: string;
  mutedTextColor?: string;
  activeColor?: string;
  backgroundColor?: string;
  imageUrl?: string;
  imageAlt?: string;
  /** Reveal animation duration, in seconds. */
  duration?: number;
  /** Fallback reveal duration when `duration` is omitted, in seconds. */
  scrollDuration?: number;
};

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mediaQueryList = window.matchMedia(REDUCED_MOTION_QUERY);
  mediaQueryList.addEventListener("change", callback);
  return () => mediaQueryList.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.(REDUCED_MOTION_QUERY)?.matches ?? false;
}

function getServerReducedMotionSnapshot() {
  return false;
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getServerReducedMotionSnapshot,
  );
}

/** Spreads reveal windows the way the original hard-coded table did (6→65% desktop, 22→69% mobile). */
function revealPositions(count: number, mobile: boolean): [number, number][] {
  const [first, last, span] = mobile ? [22, 69, 10] : [6, 65, 20];
  const step = count > 1 ? (last - first) / (count - 1) : 0;
  return Array.from({ length: count }, (_, i) => {
    const start = Math.round(first + step * i);
    return [start, start + span];
  });
}

export default function Timeline({
  items,
  title = "Storyline",
  periodLabel = "",
  textColor = "var(--foreground)",
  mutedTextColor = "var(--muted-foreground)",
  activeColor = "var(--primary)",
  backgroundColor = "var(--background)",
  imageUrl = "",
  imageAlt = "",
  duration,
  scrollDuration = 1.2,
}: TimelineProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const wholeSliderRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const normalizedDuration = Math.max(0.2, duration ?? scrollDuration);

  const topItems = items.filter((i) => i.position === "top");
  const bottomItems = items.filter((i) => i.position === "bottom");

  const sectionStyle: CSSProperties = { color: textColor, backgroundColor };
  const activeStyle: CSSProperties = { backgroundColor: activeColor };
  const mutedTextStyle: CSSProperties = { color: mutedTextColor };

  // Horizontal slide + main axis line
  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const isMobile = window.innerWidth < 600;
      const lineWidth = isMobile ? "65%" : "98%";

      gsap
        .timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: isMobile ? "82% 50%" : "92% bottom",
            scrub: true,
          },
          defaults: { ease: "none" },
        })
        .fromTo(wholeSliderRef.current, { xPercent: 0 }, { xPercent: isMobile ? -57 : -65 });

      if (reducedMotion) {
        gsap.set(".journey-line", { width: lineWidth });
        return;
      }

      gsap.to(".journey-line", {
        width: lineWidth,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: isMobile ? "top 30%" : "top 25%",
          end: isMobile ? "80% 50%" : "92% bottom",
          scrub: true,
        },
      });
    },
    { dependencies: [reducedMotion], scope: sectionRef },
  );

  // Per-item stem, dot and text reveal
  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      if (reducedMotion) {
        items.forEach((item) => {
          gsap.set(`.jl-${item.id}`, { scaleY: 1 });
          gsap.set(`.jd-${item.id}`, { scale: 1 });
        });
        return;
      }

      const splits: SplitTextInstance[] = [];
      const positions = revealPositions(items.length, window.innerWidth < 600);

      items.forEach((item, index) => {
        const isTop = item.position === "top";
        gsap.set(`.jl-${item.id}`, { scaleY: 0, transformOrigin: isTop ? "50% 100%" : "50% 0%" });
        gsap.set(`.jd-${item.id}`, { scale: 0 });

        const title = new SplitText(`.title-${item.id}`, { type: "lines", mask: "lines" });
        const desc = new SplitText(`.description-${item.id}`, { type: "lines", mask: "lines" });
        splits.push(title, desc);

        const [startPos, endPos] = positions[index];
        gsap
          .timeline({
            scrollTrigger: {
              trigger: section,
              start: `${startPos}% 30%`,
              end: `${endPos}% 50%`,
              scrub: true,
            },
          })
          .to(`.jl-${item.id}`, { scaleY: 1, duration: normalizedDuration * 0.4 })
          .to(`.jd-${item.id}`, { scale: 1, duration: normalizedDuration * 0.4 }, "<")
          .fromTo(
            title.lines,
            { yPercent: 110 },
            { yPercent: 0, delay: -0.8 * normalizedDuration, duration: normalizedDuration, stagger: 0.02, ease: "power2.out" },
          )
          .fromTo(
            desc.lines,
            { yPercent: 110 },
            { yPercent: 0, duration: normalizedDuration, stagger: 0.02, ease: "power2.out" },
            "<",
          );
      });

      const handleResize = () => ScrollTrigger.refresh();
      window.addEventListener("resize", handleResize);

      return () => {
        splits.forEach((s) => s.revert());
        window.removeEventListener("resize", handleResize);
      };
    },
    { dependencies: [normalizedDuration, reducedMotion], scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="journey"
      aria-label={title}
      className="relative h-[200vw] w-full max-[600px]:h-[400vh]"
      style={sectionStyle}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden pt-[8vw] max-[600px]:top-[5%] max-[600px]:pt-[6vh]">
        <div
          ref={wholeSliderRef}
          className="mr-[2vw] flex h-[30vw] w-[240vw] items-center gap-[5vw] px-[5vw] max-[600px]:h-[80vh] max-[600px]:w-[800vw] max-[600px]:px-[7vw]"
        >
          <div className="h-full w-[30vw] shrink-0 overflow-hidden rounded-[1vw] max-[600px]:h-[65vw] max-[600px]:w-[85vw] max-[600px]:rounded-[5vw]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt={imageAlt} draggable={false} className="h-full w-full object-cover" />
          </div>

          <div className="relative h-full w-full min-w-0">
            <div className="absolute left-0 top-[49%] flex h-fit w-full items-center">
              <div className="h-[.8vw] w-[.8vw] shrink-0 rounded-full max-[600px]:h-[2vw] max-[600px]:w-[2vw]" style={activeStyle} />
              <div className="journey-line h-px w-[0%] rounded-full" style={activeStyle} />
              <div className="h-[.8vw] w-[.8vw] shrink-0 rounded-full max-[600px]:h-[2vw] max-[600px]:w-[2vw]" style={activeStyle} />
            </div>

            <div className="flex h-1/2 w-full items-center justify-start gap-[.5vw]">
              <div className="h-full w-[20%] shrink-0 pt-[2vw] max-[600px]:h-fit max-[600px]:pt-[5vw]">
                <h2 className="font-display w-[70%] text-[3vw] font-bold leading-[0.95] tracking-tight max-[600px]:text-[8.5vw]">
                  {title}
                </h2>
              </div>

              <div className="flex h-full w-full gap-x-[15vw] max-[600px]:gap-x-[40vw]">
                {topItems.map((item) => (
                  <div
                    key={`top-${item.id}`}
                    className="relative h-full w-[30vw] px-[3vw] max-[600px]:flex max-[600px]:w-[70vw] max-[600px]:flex-col max-[600px]:px-[7vw]"
                  >
                    <div className="absolute bottom-0 left-0 top-0 h-full w-full">
                      <div
                        className={`relative -ml-[.5vw] aspect-square size-[1vw] rounded-full max-[600px]:-ml-[1.25vw] max-[600px]:size-[2.5vw] jd-${item.id}`}
                        style={activeStyle}
                      />
                      <div className={`h-[94%] w-px rounded-full jl-${item.id}`} style={activeStyle} />
                    </div>

                    <div className="mt-[-1vw] space-y-[1vw] max-[600px]:mt-[-2vw]">
                      <h4 className={`title-${item.id} font-mono text-[2vw] font-medium leading-none tracking-tight max-[600px]:text-[5.6vw]`}>
                        {item.label}
                      </h4>
                      <p
                        className={`description-${item.id} w-[92%] text-[1.35vw] leading-[1.2] max-[600px]:text-[4.4vw]`}
                        style={mutedTextStyle}
                      >
                        {item.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex h-1/2 w-full items-center justify-start">
              <div className="h-full w-[34%] shrink-0 pt-[2vw] max-[600px]:w-[30%] max-[600px]:pt-[5vw]">
                <p className="font-mono text-[1.5vw] leading-none max-[600px]:text-[4.2vw]" style={mutedTextStyle}>
                  {periodLabel}
                </p>
              </div>

              <div className="ml-[7vw] flex h-full w-full gap-x-[20vw] max-[600px]:ml-[7vw] max-[600px]:gap-x-[40vw]">
                {bottomItems.map((item) => (
                  <div
                    key={`bottom-${item.id}`}
                    className="relative h-full w-[25vw] px-[3vw] max-[600px]:w-[70vw] max-[600px]:px-[7vw]"
                  >
                    <div className="absolute bottom-[-1%] left-0 h-full w-full">
                      <div className={`h-[94%] w-px rounded-full max-[600px]:h-full jl-${item.id}`} style={activeStyle} />
                      <div
                        className={`relative -ml-[.5vw] aspect-square size-[1vw] rounded-full max-[600px]:-ml-[1.25vw] max-[600px]:size-[2.5vw] jd-${item.id}`}
                        style={activeStyle}
                      />
                    </div>

                    <div className="flex h-full w-full flex-col justify-end space-y-[1vw]">
                      <h4 className={`title-${item.id} font-mono text-[2vw] font-medium leading-none tracking-tight max-[600px]:text-[5.6vw]`}>
                        {item.label}
                      </h4>
                      <p
                        className={`description-${item.id} w-[92%] text-[1.35vw] leading-[1.2] max-[600px]:text-[4.4vw]`}
                        style={mutedTextStyle}
                      >
                        {item.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
