'use client';

import { useEffect, useRef } from 'react';

/**
 * HorseMascot — the dashboard mascot with hover-triggered micro-animations.
 *
 * Drop-in replacement for a plain <img src="/mascot.png" /> tag. Pure CSS
 * keyframes + a single JS class toggle (.is-hovered) — no animation libraries.
 *
 * The wrapper is responsive (fills its container, capped width, square aspect)
 * and every overlay is positioned/sized in % of the box, so the coordinates —
 * tuned to the current /mascot.png artwork — hold at any rendered size.
 *
 * Visible effects: wink (eye), blush pulse (cheek), sparkles, slight zoom.
 * The ear/headphone/finger layers are invisible animation targets the flat PNG
 * can't actually move; they're kept as positioned anchors for future tuning.
 */

type HorseMascotProps = {
  src?: string;
  alt?: string;
  /** Re-trigger the animation loop while the pointer stays on the mascot. */
  loop?: boolean;
};

export default function HorseMascot({
  src = '/mascot.png',
  alt = 'Маскот English Base',
  loop = true,
}: HorseMascotProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    let timer: ReturnType<typeof setTimeout> | undefined;

    const scheduleReplay = () => {
      if (!loop) return;
      timer = setTimeout(() => {
        // Removing then re-adding the class restarts every keyframe animation.
        wrapper.classList.remove('is-hovered');
        requestAnimationFrame(() => {
          wrapper.classList.add('is-hovered');
          scheduleReplay();
        });
      }, 1500);
    };

    const handleEnter = () => {
      wrapper.classList.add('is-hovered');
      scheduleReplay();
    };

    const handleLeave = () => {
      wrapper.classList.remove('is-hovered');
      if (timer) {
        clearTimeout(timer);
        timer = undefined;
      }
    };

    wrapper.addEventListener('mouseenter', handleEnter);
    wrapper.addEventListener('mouseleave', handleLeave);

    return () => {
      wrapper.removeEventListener('mouseenter', handleEnter);
      wrapper.removeEventListener('mouseleave', handleLeave);
      if (timer) clearTimeout(timer);
    };
  }, [loop]);

  return (
    <div ref={wrapperRef} className="horse-mascot">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="horse-img" src={src} alt={alt} width={1024} height={1024} />

      {/* 1. Wink lid (visible eye, viewer's right of the muzzle) */}
      <div className="wink-lid" aria-hidden="true" />

      {/* 2. Ear wiggle target (left ear) — invisible anchor */}
      <div className="ear-wiggle" aria-hidden="true" />

      {/* 3. Headphones bounce overlay — invisible anchor */}
      <div className="hp-bounce" aria-hidden="true" />

      {/* 4. Finger point target — invisible anchor */}
      <div className="finger" aria-hidden="true" />

      {/* 5. Blush */}
      <div className="blush" aria-hidden="true" />

      {/* 6. Sparkles */}
      <div className="sparkle sparkle-1" aria-hidden="true">✦</div>
      <div className="sparkle sparkle-2" aria-hidden="true">✧</div>
      <div className="sparkle sparkle-3" aria-hidden="true">✦</div>

      <style>{`
        .horse-mascot {
          position: relative;
          display: block;
          cursor: pointer;
          width: 100%;
          max-width: 300px;
          margin-inline: auto;
          aspect-ratio: 1 / 1;
          line-height: 0;
        }

        .horse-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
          transition: transform 0.15s ease;
        }

        /* All animated layers sit on top of the image and never steal hover. */
        .wink-lid,
        .ear-wiggle,
        .hp-bounce,
        .finger,
        .blush,
        .sparkle {
          position: absolute;
          pointer-events: none;
        }

        /* 1. WINK ------------------------------------------------------ */
        .wink-lid {
          width: 8%;
          height: 7%;
          left: 46.5%;
          top: 27%;
          background: #3a2a3a;
          border-radius: 50% 50% 0 0 / 100% 100% 0 0;
          transform-origin: top center;
          transform: scaleY(0.05); /* nearly invisible by default */
        }

        @keyframes wink {
          0%   { transform: scaleY(1); }
          10%  { transform: scaleY(0.05); }
          30%  { transform: scaleY(0.05); }
          45%  { transform: scaleY(1); }
          100% { transform: scaleY(1); }
        }

        .is-hovered .wink-lid {
          animation: wink 1.4s ease-in-out 0.2s both;
        }

        /* 2. EAR WIGGLE (invisible anchor) ----------------------------- */
        .ear-wiggle {
          top: 6%;
          left: 33%;
          width: 8.5%;
          height: 11%;
          transform-origin: bottom center;
        }

        @keyframes ear-wiggle {
          0%, 100% { transform: rotate(0deg); }
          20%      { transform: rotate(-8deg); }
          40%      { transform: rotate(6deg); }
          60%      { transform: rotate(-4deg); }
          80%      { transform: rotate(3deg); }
        }

        .is-hovered .ear-wiggle {
          animation: ear-wiggle 0.8s ease-in-out 0.1s both;
        }

        /* 3. HEADPHONES BOUNCE (invisible anchor) ---------------------- */
        .hp-bounce {
          top: 12%;
          left: 28%;
          width: 50%;
          height: 30%;
          transform-origin: center;
        }

        @keyframes hp-bounce {
          0%, 100% { transform: translateY(0) rotate(-1deg); }
          50%      { transform: translateY(-4px) rotate(1deg); }
        }

        .is-hovered .hp-bounce {
          animation: hp-bounce 0.6s ease-in-out infinite;
        }

        /* 4. FINGER POINT (invisible anchor) --------------------------- */
        .finger {
          left: 28%;
          top: 26%;
          width: 10%;
          height: 18%;
          transform-origin: bottom center;
        }

        @keyframes finger-point {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25%      { transform: translateY(-6px) rotate(-5deg); }
          75%      { transform: translateY(-3px) rotate(3deg); }
        }

        .is-hovered .finger {
          animation: finger-point 1s ease-in-out 0.3s infinite;
        }

        /* 5. BLUSH ----------------------------------------------------- */
        .blush {
          width: 12%;
          height: 7%;
          left: 54%;
          top: 35%;
          background: rgba(235, 120, 110, 0.55);
          border-radius: 50%;
          filter: blur(3px);
          opacity: 0;
        }

        @keyframes blush-pulse {
          0%, 100%   { opacity: 0; }
          20%, 80%   { opacity: 1; }
        }

        .is-hovered .blush {
          animation: blush-pulse 1.4s ease-in-out 0.2s both;
        }

        /* 6. SPARKLES -------------------------------------------------- */
        .sparkle {
          font-size: 16px;
          color: #E8A838;
          opacity: 0;
          line-height: 1;
          user-select: none;
        }

        .sparkle-1 { top: 11%; left: 68%; }
        .sparkle-2 { top: 15%; left: 80%; }
        .sparkle-3 { top: 6%;  left: 56%; }

        @keyframes sparkle-pop {
          0%   { transform: scale(0)   rotate(0deg);   opacity: 0; }
          40%  { transform: scale(1.2) rotate(180deg); opacity: 1; }
          70%  { transform: scale(0.9) rotate(270deg); opacity: 1; }
          100% { transform: scale(0)   rotate(360deg); opacity: 0; }
        }

        .is-hovered .sparkle-1 { animation: sparkle-pop 0.7s ease-out 0.25s forwards; }
        .is-hovered .sparkle-2 { animation: sparkle-pop 0.7s ease-out 0.45s forwards; }
        .is-hovered .sparkle-3 { animation: sparkle-pop 0.7s ease-out 0.35s forwards; }

        /* BONUS — image scale on hover -------------------------------- */
        .is-hovered .horse-img {
          transform: scale(1.02);
        }

        /* Respect reduced-motion preferences. */
        @media (prefers-reduced-motion: reduce) {
          .horse-img,
          .is-hovered .wink-lid,
          .is-hovered .ear-wiggle,
          .is-hovered .hp-bounce,
          .is-hovered .finger,
          .is-hovered .blush,
          .is-hovered .sparkle-1,
          .is-hovered .sparkle-2,
          .is-hovered .sparkle-3 {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}
