'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui';

const VIEWPORT_W = 480;
const VIEWPORT_H = 360;
const OUTPUT_W   = 800;
const OUTPUT_H   = 600;

interface ListingCropModalProps {
  file: File;
  onConfirm: (croppedFile: File) => void;
  onCancel: () => void;
}

export default function ListingCropModal({ file, onConfirm, onCancel }: ListingCropModalProps) {
  const [natW, setNatW]         = useState(0);
  const [natH, setNatH]         = useState(0);
  const [objectUrl, setObjUrl]  = useState('');
  const [imgLoaded, setLoaded]  = useState(false);
  const [scale, setScale]       = useState(1);
  const [pos, setPos]           = useState({ x: 0, y: 0 });
  const imgRef = useRef<HTMLImageElement>(null);

  const drag = useRef({ active: false, startMouseX: 0, startMouseY: 0, startPosX: 0, startPosY: 0 });

  const minScale  = natW > 0 ? Math.max(VIEWPORT_W / natW, VIEWPORT_H / natH) : 1;
  const maxScale  = minScale * 3;
  const scaleStep = minScale * 0.1;

  const clampPos = useCallback((raw: { x: number; y: number }, s: number) => {
    const halfW = Math.max(0, (natW * s - VIEWPORT_W) / 2);
    const halfH = Math.max(0, (natH * s - VIEWPORT_H) / 2);
    return {
      x: Math.max(-halfW, Math.min(halfW, raw.x)),
      y: Math.max(-halfH, Math.min(halfH, raw.y)),
    };
  }, [natW, natH]);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setObjUrl(url);
    setLoaded(false);
    setPos({ x: 0, y: 0 });
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (natW > 0 && natH > 0) {
      setScale(Math.max(VIEWPORT_W / natW, VIEWPORT_H / natH));
      setPos({ x: 0, y: 0 });
    }
  }, [natW, natH]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!drag.current.active) return;
      setPos(clampPos({
        x: drag.current.startPosX + (e.clientX - drag.current.startMouseX),
        y: drag.current.startPosY + (e.clientY - drag.current.startMouseY),
      }, scale));
    };
    const onMouseUp = () => { drag.current.active = false; };
    const onTouchMove = (e: TouchEvent) => {
      if (!drag.current.active) return;
      e.preventDefault();
      const t = e.touches[0];
      setPos(clampPos({
        x: drag.current.startPosX + (t.clientX - drag.current.startMouseX),
        y: drag.current.startPosY + (t.clientY - drag.current.startMouseY),
      }, scale));
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
    canvas.width  = OUTPUT_W;
    canvas.height = OUTPUT_H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rW = OUTPUT_W / VIEWPORT_W;
    const rH = OUTPUT_H / VIEWPORT_H;
    const drawW = natW * scale * rW;
    const drawH = natH * scale * rH;
    const drawX = (VIEWPORT_W / 2 + pos.x - (natW * scale) / 2) * rW;
    const drawY = (VIEWPORT_H / 2 + pos.y - (natH * scale) / 2) * rH;

    ctx.drawImage(img, drawX, drawY, drawW, drawH);

    canvas.toBlob((blob) => {
      if (!blob) return;
      onConfirm(new File([blob], 'photo.jpg', { type: 'image/jpeg' }));
    }, 'image/jpeg', 0.92);
  };

  const fillPct = natW > 0
    ? Math.round(((scale - minScale) / (maxScale - minScale)) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-brand-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden">

        <div className="px-8 pt-8 pb-4">
          <h2 className="font-heading text-2xl text-brand-burgundy">Crop photo</h2>
          <p className="font-body text-sm text-brand-burgundy/50 mt-1">
            Drag to reposition. Use the controls to zoom.
          </p>
        </div>

        <div className="flex justify-center px-8 pb-4">
          <div
            className="relative bg-gray-900 overflow-hidden cursor-grab active:cursor-grabbing select-none"
            style={{ width: VIEWPORT_W, height: VIEWPORT_H }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            {!imgLoaded && (
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              </span>
            )}

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

            {/* Crop boundary overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.5)',
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 px-8 pb-6">
          <button
            type="button"
            onClick={() => handleScaleChange(-scaleStep)}
            disabled={scale <= minScale}
            className="w-10 h-10 rounded-full bg-brand-grey flex items-center justify-center font-heading text-xl text-brand-burgundy hover:brightness-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0"
            aria-label="Zoom out"
          >
            −
          </button>
          <div className="flex-1 max-w-[200px] h-1.5 bg-brand-grey rounded-full overflow-hidden">
            <div className="h-full bg-brand-orange rounded-full transition-all" style={{ width: `${fillPct}%` }} />
          </div>
          <button
            type="button"
            onClick={() => handleScaleChange(scaleStep)}
            disabled={scale >= maxScale}
            className="w-10 h-10 rounded-full bg-brand-grey flex items-center justify-center font-heading text-xl text-brand-burgundy hover:brightness-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0"
            aria-label="Zoom in"
          >
            +
          </button>
        </div>

        <div className="flex gap-3 justify-end px-8 pb-8">
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button variant="primary" onClick={handleConfirm} disabled={!imgLoaded}>
            Apply crop
          </Button>
        </div>
      </div>
    </div>
  );
}
