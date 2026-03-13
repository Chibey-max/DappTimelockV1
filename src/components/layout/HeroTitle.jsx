"use client";
import { useEffect, useRef } from "react";

// Floating gold particles
function Particles() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const COUNT = 18;
    const particles = [];

    for (let i = 0; i < COUNT; i++) {
      const el = document.createElement("div");
      el.className = "particle";
      const size = Math.random() * 3 + 1.5;
      const left = Math.random() * 100;
      const delay = Math.random() * 8;
      const dur = Math.random() * 6 + 5;
      const drift = (Math.random() - 0.5) * 60;
      const bot = Math.random() * 60 - 10;
      el.style.cssText = `
        width:${size}px; height:${size}px;
        left:${left}%; bottom:${bot}%;
        --drift:${drift}px;
        animation-duration:${dur}s;
        animation-delay:${delay}s;
        opacity:0;
      `;
      container.appendChild(el);
      particles.push(el);
    }
    return () => particles.forEach((p) => p.remove());
  }, []);

  return <div className="hero-particles" ref={containerRef} aria-hidden />;
}

// Split text into word spans with staggered animation delays
function AnimatedTitle({ children }) {
  // children is an array: ['Lock ETH.', <br/>, <span>Unlock discipline.</span>]
  return (
    <h1 className="hero-title" aria-label="Lock ETH. Unlock discipline.">
      <AnimatedWord text="Lock" delay={0.12} />{" "}
      <AnimatedWord text="ETH." delay={0.22} />
      <br />
      <AnimatedWord text="Unlock" delay={0.34} gold />{" "}
      <AnimatedWord text="discipline." delay={0.44} gold />
    </h1>
  );
}

function AnimatedWord({ text, delay, gold }) {
  return (
    <span
      className={`hero-word${gold ? " hero-word-gold" : ""}`}
      style={{ animationDelay: `${delay}s` }}
    >
      {text}
    </span>
  );
}

export default function HeroTitle() {
  return (
    <>
      <Particles />
      <AnimatedTitle />
    </>
  );
}
