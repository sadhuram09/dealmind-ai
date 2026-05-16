import { useState } from 'react';
import { motion } from 'framer-motion';

export default function BrainHologramEmbed() {
  const [loaded, setLoaded] = useState(false);

  const params = new URLSearchParams({
    ui_theme: 'dark',
    autostart: '1',
    autospin: '0.2',
    transparent: '1',
    ui_infos: '0',
    ui_controls: '0',
    ui_stop: '0',
    ui_watermark: '0',
    ui_hint: '0',
    ui_annotations: '0',
    ui_ar: '0',
    ui_vr: '0',
    ui_inspector: '0',
    ui_loading: '0',
    preload: '1',
    dnt: '1',
  });

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      borderRadius: 16,
      overflow: 'hidden', // clips everything outside bounds
    }}>

      {/* Loading state */}
      {!loaded && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 3,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: 14,
        }}>
          <motion.div
            style={{
              width: 48, height: 48, borderRadius: '50%',
              border: '2px solid var(--border)',
              borderTopColor: 'var(--purple)',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
          />
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>
            Initializing hologram…
          </div>
        </div>
      )}

      {/*
        Iframe is intentionally OVERSIZED beyond all 4 edges so Sketchfab's
        chrome (top title bar ~52px, bottom timeline+controls ~62px,
        left annotation dot ~42px) slides outside the clipping container.
        Only the pure hologram canvas remains visible.
      */}
      <iframe
        title="Brain Hologram"
        frameBorder="0"
        allowFullScreen
        allow="autoplay; fullscreen; xr-spatial-tracking"
        src={`https://sketchfab.com/models/18e8505582aa46879acc9da891958677/embed?${params}`}
        onLoad={() => setLoaded(true)}
        style={{
          position: 'absolute',
          top:    -54,   // clips the title/author top bar
          bottom: -64,   // clips the timeline + bottom controls bar
          left:   -44,   // clips the left annotation dot
          right:  -10,   // clips any right-side edge artifacts
          width:  'calc(100% + 54px)',
          height: 'calc(100% + 118px)',
          border: 'none',
          background: 'transparent',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.5s ease',
        }}
      />
    </div>
  );
}
