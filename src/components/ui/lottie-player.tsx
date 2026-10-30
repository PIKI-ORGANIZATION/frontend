"use client";

import React, { useEffect, useRef } from "react";
import type { AnimationItem } from "lottie-web";

export interface LottiePlayerProps {
  animationPath?: string;
  animationData?: object;
  loop?: boolean;
  autoplay?: boolean;
  speed?: number;
  className?: string;
  onHoverReplay?: boolean;
}

export function LottiePlayer({
  animationPath,
  animationData,
  loop = true,
  autoplay = true,
  speed = 1,
  className,
  onHoverReplay = false,
}: LottiePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<AnimationItem | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let isMounted = true;

    // Dynamically import lottie-web on client-side to prevent SSR window issues
    import("lottie-web").then((lottieModule) => {
      if (!isMounted || !containerRef.current) return;

      const lottie = lottieModule.default || lottieModule;

      if (animRef.current) {
        animRef.current.destroy();
        animRef.current = null;
      }

      try {
        const anim = lottie.loadAnimation({
          container: containerRef.current,
          renderer: "svg",
          loop,
          autoplay,
          path: animationPath,
          animationData,
        });

        if (speed !== 1) {
          anim.setSpeed(speed);
        }

        animRef.current = anim;
      } catch (err) {
        console.error("[LottiePlayer] Error initializing animation:", err);
      }
    });

    return () => {
      isMounted = false;
      if (animRef.current) {
        animRef.current.destroy();
        animRef.current = null;
      }
    };
  }, [animationPath, animationData, loop, autoplay, speed]);

  const handleMouseEnter = () => {
    if (onHoverReplay && animRef.current) {
      animRef.current.goToAndPlay(0, true);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      className={className}
      aria-hidden="true"
    />
  );
}

