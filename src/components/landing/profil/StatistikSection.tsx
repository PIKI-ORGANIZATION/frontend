"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Users, Landmark, MapPin } from "lucide-react";

interface CounterProps {
  end: number;
  label: string;
  icon: React.ElementType;
}

function Counter({ end, label, icon: Icon }: CounterProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isInView) {
      let startTimestamp: number;
      const duration = 2000; // 2 seconds

      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        
        // easeOutQuart
        const ease = 1 - Math.pow(1 - progress, 4);
        setCount(Math.floor(ease * end));

        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    }
  }, [isInView, end]);

  return (
    <div ref={ref} className="flex flex-col items-center justify-center p-6 md:p-8 bg-card border border-foreground/5 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-shadow duration-500">
      <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 md:mb-6 text-primary">
        <Icon className="w-6 h-6 md:w-8 md:h-8" strokeWidth={1.5} />
      </div>
      <h3 className="text-4xl md:text-6xl font-bold tracking-tighter mb-2 text-foreground">
        {count.toLocaleString('id-ID')}
      </h3>
      <p className="text-muted-foreground font-medium text-center text-sm md:text-lg">{label}</p>
    </div>
  );
}

export function StatistikSection() {
  return (
    <section className="py-16 md:py-32 px-6 md:px-12 bg-muted/20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs md:text-sm font-semibold tracking-widest uppercase text-primary mb-3 md:mb-4 flex items-center justify-center gap-2"
          >
            Data Nasional
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 md:mb-6"
          >
            Jejak Langkah PIKI
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-base md:text-xl text-muted-foreground leading-relaxed"
          >
            Perkembangan dan persebaran anggota Persatuan Intelegensia Kristen Indonesia dalam melayani nusa dan bangsa di seluruh pelosok nusantara.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          <Counter end={12500} label="Total Anggota" icon={Users} />
          <Counter end={34} label="DPD Provinsi" icon={Landmark} />
          <Counter end={412} label="DPC Kabupaten/Kota" icon={MapPin} />
        </div>
      </div>
      
      {/* Decorative background circle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
    </section>
  );
}
