'use client';

import React, { useState, useEffect } from 'react';
import { createProduct, updateProduct, uploadImages, getLocations } from '../services/api';
import type { BlockedRange } from '../services/api';
import { Button } from '@/components/ui';
import type { Product } from '@/types';
import BookingCalendar from './BookingCalendar';
import ListingCropModal from './ListingCropModal';
import { X, Crop, Camera } from 'lucide-react';

const inputClass = 'w-full p-3 bg-brand-white border border-brand-grey rounded-xl font-body text-brand-burgundy placeholder:text-brand-burgundy/40 focus:outline-none focus:ring-2 focus:ring-brand-orange/30 transition-colors';
const labelClass = 'block font-body text-sm font-bold text-brand-burgundy mb-1';

const FormStep: React.FC<{ number: number; title: string; children: React.ReactNode; className?: string }> = ({ number, title, children, className = "" }) => (
  <div className={`flex gap-6 ${className}`}>
    <div className="flex-shrink-0">
      <div className="w-10 h-10 rounded-full bg-brand-blue flex items-center justify-center font-heading text-brand-yellow text-xl shadow-md">
        {number}
      </div>
    </div>
    <div className="flex-grow pt-1">
      <h2 className="font-heading text-2xl text-brand-burgundy mb-2">{title}</h2>
      {children}
    </div>
  </div>
);

interface ListItemProps {
  onNavigate: (view: string) => void;
  initialData?: Product;
  productId?: string | number;
}

interface LocationOption {
  id: string;
  name: string;
  address: string;
  city: string;
}

const ListItem: React.FC<ListItemProps> = ({ onNavigate, initialData, productId }) => {
  const isEditMode = !!productId;

  const [selectedCategory, setSelectedCategory] = useState<string>(initialData?.category || '');
  const [condition, setCondition] = useState<string>(initialData?.condition || '');
  const [color, setColor] = useState<string>(initialData?.color || '');
  const [quantity, setQuantity] = useState<number>(initialData?.quantityAvailable || 1);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [title, setTitle] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [price1Day, setPrice1Day] = useState(initialData?.pricePerDay ? String(initialData.pricePerDay) : '');
  const [price3Day, setPrice3Day] = useState(initialData?.price3Day ? String(initialData.price3Day) : '');
  const [price7Day, setPrice7Day] = useState(initialData?.price7Day ? String(initialData.price7Day) : '');
  const [selectedLocationId, setSelectedLocationId] = useState<string>(initialData?.locationId || '');
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>(initialData?.images || []);
  const [imageFiles, setImageFiles] = useState<(File | null)[]>(
    (initialData?.images || []).map(() => null)
  );
  const [originalFiles, setOriginalFiles] = useState<(File | null)[]>(
    (initialData?.images || []).map(() => null)
  );
  const [cropTargetIndex, setCropTargetIndex] = useState<number | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [itemBlockedRanges, setItemBlockedRanges] = useState<BlockedRange[]>(
    (initialData?.blockedDates as BlockedRange[] | undefined) || []
  );
  const [itemRangeStart, setItemRangeStart] = useState<Date | null>(null);
  const [itemRangeEnd, setItemRangeEnd] = useState<Date | null>(null);

  const categories = [
    "Furniture", "Lighting", "Decor", "Tableware",
    "Textiles", "Plants", "Seasonal", "Photography", "Weddings", "Signage"
  ];

  const colors = [
    "Black", "White", "Grey", "Beige", "Brown", "Red", "Blue", "Green", "Yellow",
    "Orange", "Pink", "Purple", "Gold", "Silver", "Copper", "Natural", "Cream", "Multi-colour"
  ];

  useEffect(() => {
    getLocations().then((locs) => {
      setLocations(locs || []);
    }).catch(() => {
      setLocations([]);
    });
  }, []);

  const toDateStr = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const expandRanges = (ranges: BlockedRange[]): string[] => {
    const dates: string[] = [];
    ranges.forEach(({ start, end }) => {
      const cur = new Date(start);
      const endDate = new Date(end);
      while (cur <= endDate) {
        dates.push(`${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`);
        cur.setDate(cur.getDate() + 1);
      }
    });
    return dates;
  };

  const handleAddItemRange = () => {
    if (!itemRangeStart) return;
    const end = itemRangeEnd || itemRangeStart;
    setItemBlockedRanges(prev => [...prev, { start: toDateStr(itemRangeStart), end: toDateStr(end) }]);
    setItemRangeStart(null);
    setItemRangeEnd(null);
  };

  const handleRemoveItemRange = (index: number) => {
    setItemBlockedRanges(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (e.type === 'keydown' && (e as React.KeyboardEvent).key !== 'Enter') return;
    e.preventDefault();
    const newTag = tagInput.trim().toLowerCase();
    if (newTag && !selectedTags.includes(newTag)) {
        setSelectedTags([...selectedTags, newTag]);
        setTagInput('');
    }
  };

  const removeTag = (tag: string) => setSelectedTags(selectedTags.filter(t => t !== tag));

  const reorder = <T,>(arr: T[], from: number, to: number): T[] => {
    const r = [...arr];
    const [item] = r.splice(from, 1);
    r.splice(to, 0, item);
    return r;
  };

  const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;
    const slots = 8 - imagePreviews.length;
    const toAdd = files.slice(0, slots);
    setImagePreviews(p => [...p, ...toAdd.map(f => URL.createObjectURL(f))]);
    setImageFiles(p => [...p, ...toAdd]);
    setOriginalFiles(p => [...p, ...toAdd]);
  };

  const handleRemoveImage = (i: number) => {
    setImagePreviews(p => p.filter((_, idx) => idx !== i));
    setImageFiles(p => p.filter((_, idx) => idx !== i));
    setOriginalFiles(p => p.filter((_, idx) => idx !== i));
  };

  const handleDrop = (dropIndex: number) => {
    if (dragIndex === null || dragIndex === dropIndex) return;
    setImagePreviews(p => reorder(p, dragIndex, dropIndex));
    setImageFiles(p => reorder(p, dragIndex, dropIndex));
    setOriginalFiles(p => reorder(p, dragIndex, dropIndex));
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleOpenCrop = async (i: number) => {
    if (originalFiles[i]) {
      setCropTargetIndex(i);
      return;
    }
    // Existing URL — fetch and store as original so future crops also use original
    try {
      const res = await fetch(imagePreviews[i]);
      const blob = await res.blob();
      const file = new File([blob], 'photo.jpg', { type: blob.type });
      setOriginalFiles(p => { const n = [...p]; n[i] = file; return n; });
      setCropTargetIndex(i);
    } catch {
      setCropTargetIndex(i);
    }
  };

  const handleCropConfirm = (croppedFile: File) => {
    if (cropTargetIndex === null) return;
    setImageFiles(p => { const n = [...p]; n[cropTargetIndex] = croppedFile; return n; });
    setImagePreviews(p => { const n = [...p]; n[cropTargetIndex] = URL.createObjectURL(croppedFile); return n; });
    setCropTargetIndex(null);
  };

  const handleSubmit = async () => {
    setError('');

    if (!title.trim()) { setError('Please enter a title for your item'); return; }
    if (!selectedCategory) { setError('Please select a category'); return; }
    if (!condition) { setError('Please select the condition'); return; }
    if (!color) { setError('Please select a color'); return; }
    if (!price1Day || parseFloat(price1Day) <= 0) { setError('Please enter a valid price for 1 day'); return; }

    if (imagePreviews.length === 0) { setError('Please upload at least one image'); return; }

    setIsSubmitting(true);

    try {
      // Upload any new/cropped files; keep existing URLs as-is
      const filesToUpload = imageFiles.filter((f): f is File => f !== null);
      const uploadedUrls = filesToUpload.length > 0 ? await uploadImages(filesToUpload) : [];
      let uploadIdx = 0;
      const imageUrls = imagePreviews.map((preview, i) =>
        imageFiles[i] ? uploadedUrls[uploadIdx++] : preview
      );

      if (isEditMode) {
        await updateProduct(productId!, {
          title: title.trim(),
          description: description.trim(),
          category: selectedCategory,
          tags: selectedTags,
          condition,
          color,
          quantity,
          price1Day: parseFloat(price1Day),
          price3Day: price3Day ? parseFloat(price3Day) : null,
          price7Day: price7Day ? parseFloat(price7Day) : null,
          images: imageUrls,
          locationId: selectedLocationId || null,
          blockedDates: itemBlockedRanges,
        });
      } else {
        await createProduct({
          title: title.trim(),
          description: description.trim(),
          category: selectedCategory,
          tags: selectedTags,
          condition,
          color,
          quantity,
          price1Day: parseFloat(price1Day),
          price3Day: price3Day ? parseFloat(price3Day) : undefined,
          price7Day: price7Day ? parseFloat(price7Day) : undefined,
          images: imageUrls,
          locationId: selectedLocationId || undefined,
        });
      }

      onNavigate('dashboard-listings');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = title && selectedCategory && condition && color && price1Day && imagePreviews.length > 0;

  return (
    <>
    <div className="bg-brand-white min-h-screen py-12 md:py-20 animate-fade-in">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="mb-12 text-center">
          {isEditMode ? (
            <>
              <h1 className="font-heading text-4xl md:text-5xl text-brand-orange mb-4">Edit your item</h1>
              <p className="font-body text-brand-orange text-lg">Update the details below and save your changes.</p>
            </>
          ) : (
            <>
              <h1 className="font-heading text-4xl md:text-5xl text-brand-orange mb-4">List an item</h1>
              <p className="font-body text-brand-orange text-lg">Hire out your props with personality to London’s creative community.</p>
            </>
          )}
        </div>

        <div className="bg-white rounded-3xl shadow-2xl border border-brand-grey p-8 md:p-12 space-y-16">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
              {error}
            </div>
          )}

          {/* Step 1: Category */}
          <FormStep number={1} title="Pick a category">
            <select
              className={inputClass}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="" disabled>Select which fits best</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </FormStep>

          {/* Step 2: Item Details */}
          <FormStep number={2} title="Your Item">
            <div className="space-y-6">
              <div>
                <label className={labelClass}>Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Stunning Mid-Century Velvet Armchair"
                    className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Condition</label>
                    <select
                        className={inputClass}
                        value={condition}
                        onChange={(e) => setCondition(e.target.value)}
                    >
                        <option value="" disabled>Be honest...</option>
                        {['Like New', 'Good', 'Fair', 'Poor', 'Vintage/Antique'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Colour</label>
                    <select
                        className={inputClass}
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                    >
                        <option value="" disabled>Select colour</option>
                        {colors.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>How many do you have?</label>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className={inputClass}
                    />
                  </div>
              </div>

              <div>
                <label className={labelClass}>Add a description</label>
                <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={`${inputClass} resize-none`}
                    placeholder="Describe the style, history, dimensions, and any unique features."
                />
              </div>
            </div>
          </FormStep>

          {/* Step 3: Tags */}
          <FormStep number={3} title="Help them find it">
              <p className="font-body text-brand-burgundy/60 mb-4 text-sm -mt-2">Keywords matter. Think &apos;vintage&apos;, &apos;boho&apos;, &apos;70s&apos;, &apos;neon&apos;.</p>
              <div className="flex gap-2 mb-4">
                  <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      placeholder="e.g. velvet..."
                      className={inputClass}
                  />
                  <Button variant="secondary" size="sm" onClick={handleAddTag} className="flex-shrink-0">
                    Add
                  </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                  {selectedTags.map(tag => (
                      <span key={tag} className="px-4 py-2 rounded-full text-sm bg-brand-orange/10 text-brand-burgundy border border-brand-orange/20 flex items-center gap-2 group">
                          {tag}
                          <button onClick={() => removeTag(tag)} className="text-brand-burgundy/40 hover:text-brand-orange transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                      </span>
                  ))}
              </div>
          </FormStep>

          {/* Step 4: Pictures */}
          <FormStep number={4} title="Add photos">
            <div className="space-y-4">
              <p className="font-body text-sm text-brand-burgundy/60 leading-relaxed">
                Upload at least 1 photo. Drag to reorder. Click the crop icon to adjust framing.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {imagePreviews.map((src, i) => (
                  <div
                    key={i}
                    draggable
                    onDragStart={() => setDragIndex(i)}
                    onDragOver={e => { e.preventDefault(); setDragOverIndex(i); }}
                    onDrop={() => handleDrop(i)}
                    onDragEnd={() => { setDragIndex(null); setDragOverIndex(null); }}
                    className={`relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all cursor-grab active:cursor-grabbing select-none ${
                      dragOverIndex === i && dragIndex !== i
                        ? 'border-brand-orange scale-105'
                        : dragIndex === i
                        ? 'border-brand-orange/40 opacity-60'
                        : 'border-transparent'
                    }`}
                  >
                    <img src={src} alt={`Photo ${i + 1}`} className="w-full h-full object-cover pointer-events-none" draggable={false} />

                    {/* Order badge */}
                    <span className="absolute top-1.5 left-1.5 w-6 h-6 rounded-full bg-black/60 text-white text-xs font-bold flex items-center justify-center pointer-events-none">
                      {i + 1}
                    </span>

                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(i)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>

                    {/* Crop */}
                    <button
                      type="button"
                      onClick={() => handleOpenCrop(i)}
                      className="absolute bottom-1.5 right-1.5 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-brand-orange transition-colors"
                    >
                      <Crop className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {imagePreviews.length < 8 && (
                  <label className="aspect-[4/3] bg-brand-orange/5 border-2 border-dashed border-brand-orange/20 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-brand-orange/10 hover:border-brand-orange transition-all group">
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleAddImages} />
                    <Camera className="w-8 h-8 text-brand-burgundy/20 group-hover:text-brand-orange transition-colors" />
                    <span className="text-xs text-brand-burgundy/40 mt-1.5 group-hover:text-brand-orange transition-colors">Add photos</span>
                  </label>
                )}
              </div>
              <p className="text-xs text-brand-burgundy/40">{imagePreviews.length}/8 photos</p>
            </div>
          </FormStep>

          {/* Step 5: Price */}
          <FormStep number={5} title="Set your price">
            <div className="space-y-6">
              <p className="font-body text-sm text-brand-burgundy/60">
                You can offer deals for longer bookings. It's up to you.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Price for 1 day (required)', value: price1Day, setter: setPrice1Day, placeholder: '20' },
                  { label: 'Price for 3 days', value: price3Day, setter: setPrice3Day, placeholder: '50' },
                  { label: 'Price for 7 days', value: price7Day, setter: setPrice7Day, placeholder: '100' },
                ].map(({ label, value, setter, placeholder }) => (
                  <div key={label}>
                    <label className={labelClass}>{label}</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-burgundy/40 font-body text-sm select-none">£</span>
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        value={value}
                        onChange={(e) => setter(e.target.value)}
                        placeholder={placeholder}
                        className={`${inputClass} pl-7`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FormStep>

          {/* Step 6: Location */}
          <FormStep number={6} title="Location">
            <div className="space-y-6">
              <p className="font-body text-sm text-brand-burgundy/60">
                We won't share the exact address until a booking is confirmed and paid for.
              </p>
              {locations.length > 0 ? (
                <div className="space-y-4">
                  {locations.map(loc => (
                    <label key={loc.id} className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="location"
                        value={loc.id}
                        checked={selectedLocationId === loc.id}
                        onChange={(e) => setSelectedLocationId(e.target.value)}
                        className="mt-1 w-5 h-5 rounded-full border-brand-grey bg-brand-white text-brand-orange focus:ring-brand-orange"
                      />
                      <div className="font-body">
                        <p className="font-bold text-brand-burgundy group-hover:underline">{loc.name}</p>
                        <p className="text-sm text-brand-burgundy/60">{loc.address}, {loc.city}</p>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-brand-burgundy/50 italic">No locations saved yet. You must add one to your profile first.</p>
              )}
            </div>
          </FormStep>

          {/* Step 7: Block dates for this item */}
          <FormStep number={7} title="Block specific dates">
            <div className="space-y-4">
              <p className="font-body text-sm text-brand-burgundy/60">
                Block dates when this item is unavailable — e.g. already booked elsewhere. This is separate from your account-wide block dates.
              </p>
              <BookingCalendar
                initialStart={itemRangeStart}
                initialEnd={itemRangeEnd}
                onChange={(s, e) => { setItemRangeStart(s); setItemRangeEnd(e); }}
                unavailableDates={expandRanges(itemBlockedRanges)}
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={handleAddItemRange}
                disabled={!itemRangeStart}
              >
                Add blocked range
              </Button>
              {itemBlockedRanges.length > 0 && (
                <div className="border border-brand-grey rounded-xl overflow-hidden">
                  <table className="w-full text-sm font-body">
                    <thead className="bg-brand-grey/20">
                      <tr>
                        <th className="text-left px-4 py-2 text-brand-burgundy/60 font-semibold">From</th>
                        <th className="text-left px-4 py-2 text-brand-burgundy/60 font-semibold">To</th>
                        <th className="px-4 py-2" />
                      </tr>
                    </thead>
                    <tbody>
                      {itemBlockedRanges.map((r, i) => (
                        <tr key={i} className="border-t border-brand-grey/30">
                          <td className="px-4 py-2 text-brand-burgundy">{r.start}</td>
                          <td className="px-4 py-2 text-brand-burgundy">{r.end}</td>
                          <td className="px-4 py-2 text-right">
                            <button
                              onClick={() => handleRemoveItemRange(i)}
                              className="text-brand-burgundy/40 hover:text-red-500 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </FormStep>

          <div className="pt-8 border-t border-brand-grey">
             <Button
                onClick={handleSubmit}
                fullWidth
                size="lg"
                isLoading={isSubmitting}
                disabled={!isFormValid}
                className="text-xl py-5 rounded-2xl hover:-translate-y-1 active:translate-y-0"
             >
                {isSubmitting
                  ? (isEditMode ? 'Saving…' : 'Publishing...')
                  : (isEditMode ? 'Save changes' : 'Publish Item')}
             </Button>
             {!isEditMode && (
               <p className="text-center text-brand-burgundy/40 text-xs mt-6">
                 By publishing, you agree to Odd Folk's Terms of Service.
               </p>
             )}
          </div>
        </div>
      </div>
    </div>

    {cropTargetIndex !== null && originalFiles[cropTargetIndex] && (
      <ListingCropModal
        file={originalFiles[cropTargetIndex]!}
        onConfirm={handleCropConfirm}
        onCancel={() => setCropTargetIndex(null)}
      />
    )}
    </>
  );
};

export default ListItem;
