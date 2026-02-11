'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createProduct, uploadImages, getLocations } from '@/services/api';

const FormStep: React.FC<{ number: number; title: string; children: React.ReactNode; className?: string }> = ({ number, title, children, className = "" }) => (
  <div className={`flex gap-6 ${className}`}>
    <div className="flex-shrink-0">
      <div className="w-10 h-10 rounded-full bg-brand-blue flex items-center justify-center font-heading text-brand-yellow text-xl shadow-md">
        {number}
      </div>
    </div>
    <div className="flex-grow pt-1">
      <h2 className="font-heading text-2xl text-brand-blue mb-2">{title}</h2>
      {children}
    </div>
  </div>
);

interface LocationOption {
  id: string;
  name: string;
  address: string;
  city: string;
}

const ListItem: React.FC = () => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [condition, setCondition] = useState<string>('');
  const [color, setColor] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price1Day, setPrice1Day] = useState('');
  const [price3Day, setPrice3Day] = useState('');
  const [price7Day, setPrice7Day] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    "Furniture", "Lighting", "Decor", "Tableware",
    "Textiles", "Plants", "Seasonal", "Photography", "Weddings", "Signage"
  ];

  const colors = [
    "Black", "White", "Grey", "Beige", "Brown", "Red", "Blue", "Green", "Yellow",
    "Orange", "Pink", "Purple", "Gold", "Silver", "Copper", "Natural", "Cream", "Multi-colour"
  ];

  useEffect(() => {
    // Fetch user's locations
    getLocations().then((locs) => {
      setLocations(locs || []);
    }).catch(() => {
      setLocations([]);
    });
  }, []);

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const newFiles = [...imageFiles];
    const newPreviews = [...imagePreviews];

    // Replace or add at index
    newFiles[index] = file;
    newPreviews[index] = URL.createObjectURL(file);

    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async () => {
    setError('');

    // Validation
    if (!title.trim()) {
      setError('Please enter a title for your item');
      return;
    }
    if (!selectedCategory) {
      setError('Please select a category');
      return;
    }
    if (!condition) {
      setError('Please select the condition');
      return;
    }
    if (!color) {
      setError('Please select a color');
      return;
    }
    if (!price1Day || parseFloat(price1Day) <= 0) {
      setError('Please enter a valid price for 1 day');
      return;
    }
    if (imageFiles.filter(f => f).length < 1) {
      setError('Please upload at least one image');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload images first
      const validFiles = imageFiles.filter(f => f);
      let imageUrls: string[] = [];

      if (validFiles.length > 0) {
        imageUrls = await uploadImages(validFiles);
      }

      // Create the product
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

      // Success - navigate to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = title && selectedCategory && condition && color && price1Day && imageFiles.filter(f => f).length > 0;

  return (
    <div className="bg-brand-white min-h-screen py-12 md:py-20 animate-fade-in">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="mb-12 text-center">
            <h1 className="font-heading text-4xl md:text-5xl text-brand-orange mb-4">List a treasure</h1>
            <p className="font-body text-brand-orange text-lg">Dust off that velvet chair. Share your oddities with the London creative community.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl border border-brand-grey p-8 md:p-12 space-y-16 text-brand-blue">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
              {error}
            </div>
          )}

          {/* Step 1: Category */}
          <FormStep number={1} title="Pick a category">
            <div className="relative">
                <select
                  className="w-full p-4 bg-brand-white border border-brand-blue/30 rounded-xl font-body text-brand-blue focus:ring-1 focus:ring-brand-blue outline-none appearance-none cursor-pointer"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="" className="text-brand-burgundy" disabled>Select where it fits</option>
                  {categories.map(cat => <option key={cat} value={cat} className="text-brand-burgundy">{cat}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-brand-blue">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
            </div>
          </FormStep>

          {/* Step 2: Tags */}
          <FormStep number={2} title="Help them find it">
              <p className="font-body text-brand-blue/70 mb-4 text-sm -mt-2">Keywords matter. Think 'vintage', 'boho', '70s', 'neon'.</p>
              <div className="flex gap-2 mb-4">
                  <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      placeholder="e.g. velvet..."
                      className="flex-grow p-4 bg-brand-white border border-brand-blue/30 rounded-xl font-body text-brand-blue outline-none focus:ring-1 focus:ring-brand-blue placeholder-brand-blue/30"
                  />
                  <button
                    onClick={handleAddTag}
                    className="bg-brand-blue text-white font-heading px-6 py-2 rounded-xl hover:brightness-110 transition-all active:scale-95 shadow-md"
                  >
                    Add
                  </button>
              </div>
              <div className="flex flex-wrap gap-2">
                  {selectedTags.map(tag => (
                      <span key={tag} className="px-4 py-2 rounded-full text-sm bg-brand-blue/5 text-brand-blue border border-brand-blue/20 flex items-center gap-2 group">
                          {tag}
                          <button onClick={() => removeTag(tag)} className="text-brand-blue/40 hover:text-brand-orange transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                      </span>
                  ))}
              </div>
          </FormStep>

          {/* Step 3: Item Details */}
          <FormStep number={3} title="The gritty details">
            <div className="space-y-6 text-brand-blue">
              <div>
                <label className="block font-bold text-brand-blue/90 mb-2 text-sm uppercase tracking-wider">Give it a name</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Stunning Mid-Century Velvet Armchair"
                    className="w-full p-4 bg-brand-white border border-brand-blue/30 rounded-xl font-body text-brand-blue outline-none focus:ring-1 focus:ring-brand-blue placeholder-brand-blue/30"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative">
                    <label className="block font-bold text-brand-blue/90 mb-2 text-sm uppercase tracking-wider">Condition</label>
                    <select
                        className="w-full p-4 bg-brand-white border border-brand-blue/30 rounded-xl font-body text-brand-blue outline-none focus:ring-1 focus:ring-brand-blue appearance-none cursor-pointer"
                        value={condition}
                        onChange={(e) => setCondition(e.target.value)}
                    >
                        <option value="" disabled className="text-brand-burgundy">Be honest...</option>
                        {['Like New', 'Good', 'Fair', 'Poor', 'Vintage/Antique'].map(c => <option key={c} value={c} className="text-brand-burgundy">{c}</option>)}
                    </select>
                    <div className="pointer-events-none absolute bottom-4 right-4 text-brand-blue">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block font-bold text-brand-blue/90 mb-2 text-sm uppercase tracking-wider">Colour</label>
                    <select
                        className="w-full p-4 bg-brand-white border border-brand-blue/30 rounded-xl font-body text-brand-blue outline-none focus:ring-1 focus:ring-brand-blue appearance-none cursor-pointer"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                    >
                        <option value="" disabled className="text-brand-burgundy">Select colour</option>
                        {colors.map(c => <option key={c} value={c} className="text-brand-burgundy">{c}</option>)}
                    </select>
                    <div className="pointer-events-none absolute bottom-4 right-4 text-brand-blue">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-brand-blue/90 mb-2 text-sm uppercase tracking-wider">How many do you have?</label>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className="w-full p-4 bg-brand-white border border-brand-blue/30 rounded-xl font-body text-brand-blue outline-none focus:ring-1 focus:ring-brand-blue"
                    />
                  </div>
              </div>

              <div>
                <label className="block font-bold text-brand-blue/90 mb-2 text-sm uppercase tracking-wider">Tell its story</label>
                <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-4 bg-brand-white border border-brand-blue/30 rounded-xl font-body text-brand-blue resize-none outline-none focus:ring-1 focus:ring-brand-blue placeholder-brand-blue/30"
                    placeholder="Describe the style, history, dimensions, and any unique features. Sell the dream."
                ></textarea>
              </div>
            </div>
          </FormStep>

          {/* Step 4: Pictures */}
          <FormStep number={4} title="Show it off">
            <div className="space-y-4">
              <p className="font-body text-sm text-brand-blue/70 leading-relaxed">
                Upload at least 1 photo. First one on a plain background, please. Then let us see it in the wild.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <label key={i} className="aspect-[4/3] bg-brand-blue/5 border-2 border-dashed border-brand-blue/20 rounded-xl flex items-center justify-center cursor-pointer hover:bg-brand-blue/10 hover:border-brand-blue transition-all group overflow-hidden relative">
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, i)}
                    />
                    {imagePreviews[i] ? (
                      <img src={imagePreviews[i]} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-8 h-8 text-brand-blue/30 group-hover:text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812-1.22A2 2 0 0118.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </label>
                ))}
              </div>
            </div>
          </FormStep>

          {/* Step 5: Price */}
          <FormStep number={5} title="Set your price">
            <div className="space-y-6">
              <p className="font-body text-sm text-brand-blue/70">
                You can offer deals for longer bookings. It's up to you.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-brand-blue/70 mb-2 uppercase tracking-tight">Price for 1 day (required)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-blue/60 font-body">£</span>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      value={price1Day}
                      onChange={(e) => setPrice1Day(e.target.value)}
                      placeholder="20"
                      className="w-full pl-8 pr-4 py-3.5 bg-brand-white border border-brand-blue/30 rounded-xl font-body text-brand-blue focus:ring-1 focus:ring-brand-blue outline-none placeholder-brand-blue/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-blue/70 mb-2 uppercase tracking-tight">Price for 3 days</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-blue/60 font-body">£</span>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      value={price3Day}
                      onChange={(e) => setPrice3Day(e.target.value)}
                      placeholder="50"
                      className="w-full pl-8 pr-4 py-3.5 bg-brand-white border border-brand-blue/30 rounded-xl font-body text-brand-blue focus:ring-1 focus:ring-brand-blue outline-none placeholder-brand-blue/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-blue/70 mb-2 uppercase tracking-tight">Price for 7 days</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-blue/60 font-body">£</span>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      value={price7Day}
                      onChange={(e) => setPrice7Day(e.target.value)}
                      placeholder="100"
                      className="w-full pl-8 pr-4 py-3.5 bg-brand-white border border-brand-blue/30 rounded-xl font-body text-brand-blue focus:ring-1 focus:ring-brand-blue outline-none placeholder-brand-blue/20"
                    />
                  </div>
                </div>
              </div>
            </div>
          </FormStep>

          {/* Step 6: Location */}
          <FormStep number={6} title="Where does it live?">
            <div className="space-y-6">
              <p className="font-body text-sm text-brand-blue/70">
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
                        className="mt-1 w-5 h-5 rounded-full border-brand-blue/30 bg-brand-white text-brand-blue focus:ring-brand-blue"
                      />
                      <div className="font-body">
                        <p className="font-bold text-brand-blue group-hover:underline">{loc.name}</p>
                        <p className="text-sm text-brand-blue/60">{loc.address}, {loc.city}</p>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-brand-blue/50 italic">No locations saved yet. You can add one from your profile.</p>
              )}
            </div>
          </FormStep>

          <div className="pt-8 border-t border-brand-grey">
             <button
                onClick={handleSubmit}
                disabled={!isFormValid || isSubmitting}
                className="w-full bg-brand-orange text-white text-xl font-heading px-12 py-5 rounded-2xl hover:brightness-110 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-1 active:translate-y-0"
             >
                {isSubmitting ? 'Publishing...' : 'Publish treasure'}
             </button>
             <p className="text-center text-brand-blue/50 text-xs mt-6">
                By publishing, you agree to Odd Folk's Terms of Service.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListItem;
