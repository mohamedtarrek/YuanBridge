'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Button } from '@/components/ui/Button';

export function Hero() {
  const { t, lang } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number }[] = [];
    const particleCount = 60;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.5 + 0.1,
      });
    }

    const lines: { x1: number; y1: number; x2: number; y2: number; alpha: number }[] = [];
    for (let i = 0; i < 30; i++) {
      lines.push({
        x1: Math.random() * canvas.width,
        y1: Math.random() * canvas.height,
        x2: Math.random() * canvas.width,
        y2: Math.random() * canvas.height,
        alpha: Math.random() * 0.1 + 0.02,
      });
    }

    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 168, 67, ${p.alpha})`;
        ctx.fill();
      });

      lines.forEach((l) => {
        l.x1 += (Math.random() - 0.5) * 0.3;
        l.y1 += (Math.random() - 0.5) * 0.3;
        l.x2 += (Math.random() - 0.5) * 0.3;
        l.y2 += (Math.random() - 0.5) * 0.3;

        ctx.beginPath();
        ctx.moveTo(l.x1, l.y1);
        ctx.lineTo(l.x2, l.y2);
        ctx.strokeStyle = `rgba(212, 168, 67, ${l.alpha})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });

      animationId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-surface-dark via-transparent to-surface-dark z-[1]" />
      <div className="absolute inset-0 dot-pattern opacity-30 z-[1]" />

      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-accent-500/10 rounded-full blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-primary-500/10 rounded-full blur-[100px]" />

      <div className="container-custom relative z-10 pt-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-accent-500 mb-8">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              {lang === 'ar' ? 'تحليل فوري للأسواق' : 'Real-Time Market Analysis'}
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-text leading-tight mb-6"
          >
            {t('hero.title').split(' ').map((word, i) =>
              word === 'AI' || word === 'بالذكاء' || word === 'الذكاء' ? (
                <span key={i} className="gradient-text">{word} </span>
              ) : (
                <span key={i}>{word} </span>
              )
            )}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-text-muted max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            {t('hero.subtitle')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button variant="primary" size="lg" href={`/${lang}/register`}>
              {t('hero.cta1')}
            </Button>
            <Button variant="secondary" size="lg" href={`/${lang}/pricing`}>
              {t('hero.cta2')}
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-surface-dark to-transparent z-10" />
    </section>
  );
}
