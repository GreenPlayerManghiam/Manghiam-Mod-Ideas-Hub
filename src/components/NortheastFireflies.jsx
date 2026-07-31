import React, { useEffect, useRef } from 'react';

export default function NortheastFireflies() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const updateSize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    // Mouse tracking state
    const mouse = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      prevX: window.innerWidth / 2,
      prevY: window.innerHeight / 2,
      active: false,
      speed: 0,
    };

    const handleMouseMove = (e) => {
      mouse.prevX = mouse.x;
      mouse.prevY = mouse.y;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
      
      const dx = mouse.x - mouse.prevX;
      const dy = mouse.y - mouse.prevY;
      mouse.speed = Math.sqrt(dx * dx + dy * dy);
    };

    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        mouse.prevX = mouse.x;
        mouse.prevY = mouse.y;
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
        mouse.active = true;
      }
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // 1. Fluid Cursor Trail Particles
    const trailParticles = [];
    const maxTrailParticles = 55;

    // 2. Expanded Independent Firefly Swarm (Increased to 130 for rich density)
    const fireflies = [];
    for (let i = 0; i < 130; i++) {
      fireflies.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 1.8 + 0.5,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        baseSpeed: Math.random() * 0.025 + 0.006,
        offset: Math.random() * Math.PI * 2,
      });
    }

    let tick = 0;
    const render = () => {
      tick++;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // --- PART A: Fluid Cursor Trail Particles ---
      if (mouse.active) {
        if (Math.random() > 0.25 && trailParticles.length < maxTrailParticles) {
          trailParticles.push({
            x: mouse.x + (Math.random() - 0.5) * 12,
            y: mouse.y + (Math.random() - 0.5) * 12,
            vx: (Math.random() - 0.5) * 1.8 + (mouse.x - mouse.prevX) * 0.08,
            vy: (Math.random() - 0.5) * 1.8 + (mouse.y - mouse.prevY) * 0.08,
            size: Math.random() * 2.4 + 0.8,
            life: 1.0, 
            decay: Math.random() * 0.03 + 0.015,
          });
        }
      }

      // Update & render trail sparks
      for (let i = trailParticles.length - 1; i >= 0; i--) {
        const p = trailParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;

        if (p.life <= 0) {
          trailParticles.splice(i, 1);
          continue;
        }

        ctx.fillStyle = `rgba(253, 224, 71, ${p.life * 0.85})`;
        ctx.shadowBlur = 12;
        ctx.shadowColor = 'rgba(234, 179, 8, 0.9)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // --- PART B: Fireflies interacting with the Cursor ---
      fireflies.forEach((f) => {
        f.x += f.vx;
        f.y += f.vy;

        // Friction damping
        f.vx *= 0.96;
        f.vy *= 0.96;

        // Interaction: Shockwave scattering effect on nearby fireflies
        if (mouse.active) {
          const dx = f.x - mouse.x;
          const dy = f.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const interactionRadius = 150;

          if (dist < interactionRadius && dist > 0) {
            const force = (interactionRadius - dist) / interactionRadius;
            const scatterIntensity = Math.min(mouse.speed * 0.07, 3.2) + 0.8;
            f.vx += (dx / dist) * force * scatterIntensity;
            f.vy += (dy / dist) * force * scatterIntensity;
          }
        }

        // Screen wrapping
        if (f.x < 0) f.x = window.innerWidth;
        if (f.x > window.innerWidth) f.x = 0;
        if (f.y < 0) f.y = window.innerHeight;
        if (f.y > window.innerHeight) f.y = 0;

        // Organic flashing pulse
        const rawPulse = Math.sin(tick * f.baseSpeed + f.offset);
        const alpha = Math.pow(Math.abs(rawPulse), 1.3) * 0.88 + 0.12;

        ctx.fillStyle = `rgba(250, 204, 21, ${alpha})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(202, 138, 4, 0.75)';
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 h-full w-full bg-[#020408]">
      {/* High-definition tactical map background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-45 mix-blend-luminosity filter contrast-125"
        style={{ backgroundImage: `url('/northeast-map.jpg')` }}
      />
      {/* Cinematic vignettes */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#020408] via-transparent to-[#020408] opacity-95" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,#020408_95%)]" />
      
      {/* Unified Canvas handling both cursor trail sparks & reacting fireflies */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full pointer-events-none" />
    </div>
  );
}