import React, { useEffect, useRef } from 'react';

export default function AuroraBackdrop({ engineMode = 'founder' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Mouse proximity tracking
    let mouse = { x: width / 2, y: height / 2, active: false };
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    const handleMouseLeave = () => {
      mouse.active = false;
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // Particle nodes for constellation mesh
    const particleCount = Math.min(48, Math.floor(width / 35));
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      radius: Math.random() * 1.8 + 0.8,
      baseAlpha: Math.random() * 0.4 + 0.15
    }));

    // Chromatic ambient floating light orbs
    const isInvestor = engineMode === 'investor';
    const orbs = [
      {
        x: width * 0.25,
        y: height * 0.2,
        radius: Math.min(width, height) * 0.35,
        color: isInvestor ? 'rgba(16, 185, 129, 0.08)' : 'rgba(99, 102, 241, 0.09)',
        phase: 0,
        speed: 0.0008
      },
      {
        x: width * 0.75,
        y: height * 0.3,
        radius: Math.min(width, height) * 0.32,
        color: isInvestor ? 'rgba(6, 182, 212, 0.06)' : 'rgba(139, 92, 246, 0.07)',
        phase: Math.PI / 2,
        speed: 0.001
      },
      {
        x: width * 0.5,
        y: height * 0.7,
        radius: Math.min(width, height) * 0.4,
        color: isInvestor ? 'rgba(52, 211, 153, 0.05)' : 'rgba(236, 72, 153, 0.05)',
        phase: Math.PI,
        speed: 0.0006
      }
    ];

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 1;

      // Draw chromatic ambient light orbs
      orbs.forEach((orb) => {
        orb.phase += orb.speed;
        const currentX = orb.x + Math.sin(orb.phase) * 60;
        const currentY = orb.y + Math.cos(orb.phase * 0.8) * 45;

        const gradient = ctx.createRadialGradient(
          currentX,
          currentY,
          0,
          currentX,
          currentY,
          orb.radius
        );
        gradient.addColorStop(0, orb.color);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(currentX, currentY, orb.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Update & Draw Constellation particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Draw particle node
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = isInvestor
          ? `rgba(110, 231, 183, ${p.baseAlpha})`
          : `rgba(165, 180, 252, ${p.baseAlpha})`;
        ctx.fill();

        // Connect proximity lines between particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 115) {
            const lineAlpha = (1 - dist / 115) * 0.16;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = isInvestor
              ? `rgba(52, 211, 153, ${lineAlpha})`
              : `rgba(129, 140, 248, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        // Connect to mouse cursor if within range
        if (mouse.active) {
          const mdx = p.x - mouse.x;
          const mdy = p.y - mouse.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < 140) {
            const mAlpha = (1 - mdist / 140) * 0.28;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = isInvestor
              ? `rgba(52, 211, 153, ${mAlpha})`
              : `rgba(165, 180, 252, ${mAlpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [engineMode]);

  return (
    <>
      <div className={`aurora-bg ${engineMode === 'investor' ? 'aurora-bg-investor' : ''}`} />
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />
    </>
  );
}
