'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui';

const VIEWPORT = 300; // editor square size in px
const OUTPUT   = 400; // exported canvas size in px

interface AvatarCropModalProps {
  file: File;
  onConfirm: (croppedFile: File) => Promise<void>;
  onCancel: () => void;
}

export default function AvatarCropModal({ file, onConfirm, onCancel }: AvatarCropModalProps) {
  const [natW, setNatW]         = useState(0);
  const [natH, setNatH]         = useState(0);
  const [objectUrl, setObjUrl]  = useState('');
  const [imgLoaded, setLoaded]  = useState(false);
  const [scale, setScale]       = useState(1);
  const [pos, setPos]           = useState({ x: 0, y: 0 });
  const [isConfirming, setConf] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Drag state lives in a ref so document listeners never capture stale values
  const drag = useRef({ active: false, startMouseX: 0, startMouseY: 0, startPosX: 0, startPosY: 0 });

  // Derived — recalculated on every render, only meaningful after image loads
  const minScale  = natW > 0 ? Math.max(VIEWPORT / natW, VIEWPORT / natH) : 1;
  const maxScale  = minScale * 3;
  const scaleStep = minScale * 0.1;

  // Clamp position so the image always covers the full editor square (circle is inscribed)
  const clampPos = useCallback((raw: { x: number; y: number }, s: number) => {
    const halfW = Math.max(0, (natW * s - VIEWPORT) / 2);
    const halfH = Math.max(0, (natH * s - VIEWPORT) / 2);
    return {
      x: Math.max(-halfW, Math.min(halfW, raw.x)),
      y: Math.max(-halfH, Math.min(halfH, raw.y)),
    };
  }, [natW, natH]);

  // Effect 1 — object URL lifecycle
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setObjUrl(url);
    setLoaded(false);
    setPos({ x: 0, y: 0 });
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Effect 2 — reset scale once natural dimensions are known
  useEffect(() => {
    if (natW > 0 && natH > 0) {
      setScale(Math.max(VIEWPORT / natW, VIEWPORT / natH));
      setPos({ x: 0, y: 0 });
    }
  }, [natW, natH]);

  // Effect 3 — document-level drag and touch listeners
  // scale is a dep because clampPos is called with it inside the listeners
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!drag.current.active) return;
      const raw = {
        x: drag.current.startPosX + (e.clientX - drag.current.startMouseX),
        y: drag.current.startPosY + (e.clientY - drag.current.startMouseY),
      };
      setPos(clampPos(raw, scale));
    };

    const onMouseUp = () => { drag.current.active = false; };

    const onTouchMove = (e: TouchEvent) => {
      if (!drag.current.active) return;
      e.preventDefault(); // prevent page scroll during drag
      const t = e.touches[0];
      const raw = {
        x: drag.current.startPosX + (t.clientX - drag.current.startMouseX),
        y: drag.current.startPosY + (t.clientY - drag.current.startMouseY),
      };
      setPos(clampPos(raw, scale));
    };

    const onTouchEnd = () => { drag.current.active = false; };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [clampPos, scale]);

  const handleImgLoad = () => {
    if (imgRef.current) {
      setNatW(imgRef.current.naturalWidth);
      setNatH(imgRef.current.naturalHeight);
    }
    setLoaded(true);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    drag.current = { active: true, startMouseX: e.clientX, startMouseY: e.clientY, startPosX: pos.x, startPosY: pos.y };
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const t = e.touches[0];
    drag.current = { active: true, startMouseX: t.clientX, startMouseY: t.clientY, startPosX: pos.x, startPosY: pos.y };
  };

  const handleScaleChange = (delta: number) => {
    setScale(prev => {
      const next = Math.max(minScale, Math.min(maxScale, prev + delta));
      setPos(p => clampPos(p, next));
      return next;
    });
  };

  const handleConfirm = () => {
    const img = imgRef.current;
    if (!img) return;

    const canvas = document.createElement('canvas');
    canvas.width  = OUTPUT;
    canvas.height = OUTPUT;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const r     = OUTPUT / VIEWPORT;
    const drawW = natW * scale * r;
    const drawH = natH * scale * r;
    const drawX = (VIEWPORT / 2 + pos.x - (natW * scale) / 2) * r;
    const drawY = (VIEWPORT / 2 + pos.y - (natH * scale) / 2) * r;

    // Clip to circle
    ctx.beginPath();
    ctx.arc(OUTPUT / 2, OUTPUT / 2, OUTPUT / 2, 0, Math.PI * 2);
    ctx.clip();

    ctx.drawImage(img, drawX, drawY, drawW, drawH);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const croppedFile = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
      setConf(true);
      onConfirm(croppedFile).finally(() => setConf(false));
    }, 'image/jpeg', 0.92);
  };

  const fillPct = natW > 0
    ? Math.round(((scale - minScale) / (maxScale - minScale)) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-brand-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="px-8 pt-8 pb-4">
          <h2 className="font-heading text-2xl text-brand-burgundy">Adjust your photo</h2>
          <p className="font-body text-sm text-brand-burgundy/50 mt-1">
            Drag to reposition. Use the controls to zoom.
          </p>
        </div>

        {/* Editor */}
        <div className="flex justify-center px-8 pb-4">
          <div
            className="relative bg-gray-900 overflow-hidden cursor-grab active:cursor-grabbing select-none"
            style={{ width: VIEWPORT, height: VIEWPORT }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            {/* Spinner while image loads */}
            {!imgLoaded && (
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              </span>
            )}

            {/* Image — sized in px so canvas maths matches exactly */}
            {objectUrl && (
              <img
                ref={imgRef}
                src={objectUrl}
                alt="Crop preview"
                onLoad={handleImgLoad}
                draggable={false}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: natW > 0 ? natW * scale : undefined,
                  height: natH > 0 ? natH * scale : undefined,
                  maxWidth: 'none',
                  transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`,
                  userSelect: 'none',
                  pointerEvents: 'none',
                }}
              />
            )}

            {/* Vignette — darkens the corners outside the circle */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `radial-gradient(circle at center, transparent ${VIEWPORT / 2}px, rgba(0,0,0,0.6) ${VIEWPORT / 2}px)`,
                pointerEvents: 'none',
              }}
            />

            {/* Circle ring — inset box-shadow is clipped by overflow:hidden correctly */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.7)',
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>

        {/* Scale controls */}
        <div className="flex items-center justify-center gap-4 px-8 pb-6">
          <button
            type="button"
            onClick={() => handleScaleChange(-scaleStep)}
            disabled={scale <= minScale || isConfirming}
            className="w-10 h-10 rounded-full bg-brand-grey flex items-center justify-center font-heading text-xl text-brand-burgundy hover:brightness-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0"
            aria-label="Zoom out"
          >
            −
          </button>

          <div className="flex-1 max-w-[160px] h-1.5 bg-brand-grey rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-orange rounded-full transition-all"
              style={{ width: `${fillPct}%` }}
            />
          </div>

          <button
            type="button"
            onClick={() => handleScaleChange(scaleStep)}
            disabled={scale >= maxScale || isConfirming}
            className="w-10 h-10 rounded-full bg-brand-grey flex items-center justify-center font-heading text-xl text-brand-burgundy hover:brightness-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0"
            aria-label="Zoom in"
          >
            +
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 justify-end px-8 pb-8">
          <Button variant="ghost" onClick={onCancel} disabled={isConfirming}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            isLoading={isConfirming}
            disabled={!imgLoaded || isConfirming}
          >
            Save photo
          </Button>
        </div>
      </div>
    </div>
  );
}
