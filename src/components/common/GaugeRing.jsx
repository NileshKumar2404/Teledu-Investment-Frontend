import React from 'react';

export default function GaugeRing({ score = 75, size = 110, strokeWidth = 10, label = "Health" }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(100, score || 0));
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  let color = 'var(--accent)';
  if (clampedScore >= 80) color = 'var(--success)';
  else if (clampedScore >= 65) color = '#818CF8';
  else if (clampedScore >= 45) color = 'var(--amber)';
  else color = 'var(--rose)';

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Fill */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)' }}
          />
        </svg>
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{ fontSize: size * 0.26, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
            {Math.round(clampedScore)}
          </span>
          <span style={{ fontSize: size * 0.11, color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>
            / 100
          </span>
        </div>
      </div>
      {label && (
        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {label}
        </span>
      )}
    </div>
  );
}
