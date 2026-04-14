"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";

function ShoppingParticle({ x, delay, duration, type }) {
  const icons = ["🛍️", "📦", "🏷️", "✨", "💎", "🛒"];
  return (
    <motion.div
      className="absolute text-lg pointer-events-none select-none"
      style={{ left: `${x}%`, bottom: "-5%" }}
      animate={{
        y: [0, -1100],
        x: [0, Math.sin(x) * 80],
        opacity: [0, 0.6, 0.4, 0],
        rotate: [0, 360],
        scale: [0, 1, 0.8, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeOut",
      }}
    >
      {icons[type % icons.length]}
    </motion.div>
  );
}

function FloatingProduct({ x, y, delay, size, emoji }) {
  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{ left: x, top: y }}
      animate={{
        y: [0, -18, 0],
        rotate: [-3, 3, -3],
        opacity: [0.4, 0.8, 0.4],
      }}
      transition={{
        duration: 5 + delay,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <div
        className="rounded-2xl bg-white/20 dark:bg-white/5 backdrop-blur-sm border border-white/30 dark:border-white/10 flex items-center justify-center shadow-lg"
        style={{ width: size, height: size }}
      >
        <span style={{ fontSize: size * 0.45 }}>{emoji}</span>
      </div>
    </motion.div>
  );
}

function MorphingOrb({ width, height, x, y, delay, color, borderRadius }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        width,
        height,
        left: x,
        top: y,
        background: color,
        filter: "blur(70px)",
        borderRadius: borderRadius || "50%",
      }}
      animate={{
        scale: [1, 1.25, 0.9, 1.1, 1],
        x: [0, 35, -25, 15, 0],
        y: [0, -25, 35, -12, 0],
        opacity: [0.35, 0.65, 0.25, 0.55, 0.35],
      }}
      transition={{
        duration: 14,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

function AnimatedGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(15,105,176,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15,105,176,0.05) 1px, transparent 1px)
          `,
          backgroundSize: "70px 70px",
        }}
        animate={{ backgroundPosition: ["0px 0px", "70px 70px"] }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

function PriceTag({ x, y, price, delay }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: x, top: y }}
      initial={{ opacity: 0, scale: 0.5, rotate: -15 }}
      animate={{
        opacity: [0, 0.7, 0.7, 0],
        scale: [0.5, 1, 1, 0.5],
        rotate: [-15, -8, -8, -15],
        y: [0, -10, -10, 0],
      }}
      transition={{
        duration: 6,
        delay,
        repeat: Infinity,
        repeatDelay: 4,
        ease: "easeInOut",
      }}
    >
      <div className="bg-[#0F69B0] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg shadow-[#0F69B0]/30 flex items-center gap-1">
        <span>$</span>
        <span>{price}</span>
      </div>
    </motion.div>
  );
}

function ScanLine() {
  return (
    <motion.div
      className="absolute left-0 right-0 h-px pointer-events-none z-0"
      style={{
        background:
          "linear-gradient(90deg, transparent, rgba(15,105,176,0.2), rgba(15,105,176,0.5), rgba(15,105,176,0.2), transparent)",
      }}
      animate={{ top: ["0%", "100%"] }}
      transition={{
        duration: 10,
        repeat: Infinity,
        ease: "linear",
        repeatDelay: 3,
      }}
    />
  );
}

function FloatingRing({ size, delay, speed, color }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        left: "50%",
        top: "50%",
        marginLeft: -size / 2,
        marginTop: -size / 2,
        border: `1px solid ${color}`,
      }}
      animate={{
        scale: [1, 1.06, 1],
        opacity: [0.15, 0.4, 0.15],
        rotate: [0, speed > 0 ? 360 : -360],
      }}
      transition={{
        duration: Math.abs(speed),
        delay,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
}

function StarBurst({ x, y, delay }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: x, top: y }}
      animate={{
        rotate: [0, 360],
        opacity: [0, 0.6, 0],
        scale: [0, 1, 0],
      }}
      transition={{
        duration: 4,
        delay,
        repeat: Infinity,
        repeatDelay: 6,
      }}
    >
      <div className="text-yellow-400 text-xl">✦</div>
    </motion.div>
  );
}

export default function AuthLayoutClient({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const particles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 12,
        duration: Math.random() * 10 + 12,
        type: i,
      })),
    []
  );

  const floatingProducts = useMemo(
    () => [
      { x: "6%", y: "12%", delay: 0, size: 56, emoji: "👜" },
      { x: "88%", y: "8%", delay: 1.5, size: 52, emoji: "💍" },
      { x: "4%", y: "55%", delay: 3, size: 48, emoji: "👟" },
      { x: "90%", y: "50%", delay: 0.8, size: 60, emoji: "🧴" },
      { x: "12%", y: "80%", delay: 2, size: 44, emoji: "🎁" },
      { x: "82%", y: "78%", delay: 4, size: 50, emoji: "⌚" },
      { x: "48%", y: "4%", delay: 1, size: 46, emoji: "📱" },
      { x: "50%", y: "88%", delay: 2.5, size: 54, emoji: "💻" },
    ],
    []
  );

  const priceTags = useMemo(
    () => [
      { x: "18%", y: "22%", price: "29.99", delay: 0 },
      { x: "72%", y: "18%", price: "149", delay: 2 },
      { x: "8%", y: "68%", price: "59.9", delay: 4 },
      { x: "78%", y: "65%", price: "99", delay: 6 },
      { x: "38%", y: "88%", price: "19.5", delay: 1 },
    ],
    []
  );

  const starBursts = useMemo(
    () => [
      { x: "22%", y: "35%", delay: 0 },
      { x: "75%", y: "30%", delay: 3 },
      { x: "15%", y: "72%", delay: 6 },
      { x: "80%", y: "75%", delay: 2 },
      { x: "55%", y: "15%", delay: 5 },
    ],
    []
  );

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f6ff] dark:bg-[#05080f]">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#f0f6ff] dark:bg-[#05080f]">
      <AnimatedGrid />
      <ScanLine />

      <MorphingOrb
        width={550}
        height={550}
        x="-12%"
        y="-18%"
        delay={0}
        color="radial-gradient(circle, rgba(15,105,176,0.22) 0%, transparent 70%)"
      />
      <MorphingOrb
        width={420}
        height={420}
        x="65%"
        y="55%"
        delay={3}
        color="radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)"
      />
      <MorphingOrb
        width={380}
        height={280}
        x="35%"
        y="62%"
        delay={6}
        color="radial-gradient(circle, rgba(6,182,212,0.14) 0%, transparent 70%)"
        borderRadius="40%"
      />
      <MorphingOrb
        width={320}
        height={320}
        x="72%"
        y="-12%"
        delay={2}
        color="radial-gradient(circle, rgba(15,105,176,0.18) 0%, transparent 70%)"
      />
      <MorphingOrb
        width={250}
        height={250}
        x="20%"
        y="40%"
        delay={5}
        color="radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)"
      />

      <FloatingRing size={320} delay={0} speed={40} color="rgba(15,105,176,0.12)" />
      <FloatingRing size={520} delay={2} speed={-60} color="rgba(124,58,237,0.08)" />
      <FloatingRing size={700} delay={4} speed={80} color="rgba(6,182,212,0.06)" />

      {floatingProducts.map((p, i) => (
        <FloatingProduct key={i} {...p} />
      ))}

      {priceTags.map((p, i) => (
        <PriceTag key={i} {...p} />
      ))}

      {starBursts.map((s, i) => (
        <StarBurst key={i} {...s} />
      ))}

      {particles.map((p) => (
        <ShoppingParticle key={p.id} {...p} />
      ))}

      <motion.div
        className="absolute top-14 left-14 pointer-events-none"
        animate={{ rotate: 360 }}
        transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
      >
        <div className="w-20 h-20 rounded-2xl border border-[#0F69B0]/15 flex items-center justify-center">
          <div className="w-13 h-13 rounded-xl border border-[#0F69B0]/20 flex items-center justify-center p-3">
            <div className="w-6 h-6 rounded-lg border border-[#0F69B0]/25" />
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-16 right-14 pointer-events-none"
        animate={{ rotate: -360 }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      >
        <div className="w-16 h-16 rounded-full border border-violet-500/15 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border border-violet-500/20 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-violet-500/15" />
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute top-1/3 right-10 pointer-events-none"
        animate={{
          y: [0, -18, 0],
          rotate: [0, 45, 0],
          opacity: [0.25, 0.6, 0.25],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <div
          className="w-7 h-7 border-2 border-[#0F69B0]/25"
          style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }}
        />
      </motion.div>

      <motion.div
        className="absolute bottom-1/3 left-10 pointer-events-none"
        animate={{
          y: [0, 18, 0],
          rotate: [0, -45, 0],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      >
        <div
          className="w-9 h-9 border-2 border-violet-400/20"
          style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }}
        />
      </motion.div>

      <motion.div
        className="absolute top-24 right-1/4 pointer-events-none"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <div className="w-3 h-3 rounded-full bg-[#0F69B0]/40" />
      </motion.div>

      <motion.div
        className="absolute bottom-28 left-1/4 pointer-events-none"
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.15, 0.45, 0.15],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      >
        <div className="w-4 h-4 rounded-full bg-violet-500/30" />
      </motion.div>

      <div className="w-full max-w-sm z-10 px-4">
        {children}
      </div>
    </div>
  );
}