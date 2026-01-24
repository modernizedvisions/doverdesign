import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { X } from 'lucide-react';
import { fetchCategories, fetchCustomOrderExamples } from '../lib/api';
import type { CustomOrderExample } from '../lib/api';
import type { Category } from '../lib/types';
import { WaveDivider } from '../components/WaveDivider';

type CategoryChip = {
  id: string;
  name: string;
  slug: string;
};

type CustomOrderRequestDraft = {
  name: string;
  email: string;
  message: string;
  categoryIds: string[];
  categoryNames: string[];
  attachments: File[];
  inspoExampleId: string | null;
  inspoTitle: string | null;
  inspoImageUrl: string | null;
};

const heroImages: Array<{ id: string; url: string; alt: string }> = [
  { id: '1', url: 'https://files.reimage.dev/modernizedvisions/538adbd9170a/original', alt: 'Custom order preview 1' },
  { id: '2', url: 'https://files.reimage.dev/modernizedvisions/2a80e1ff05b2/original', alt: 'Custom order preview 2' },
  { id: '3', url: 'https://files.reimage.dev/modernizedvisions/f8aa6f90acbc/original', alt: 'Custom order preview 3' },
  { id: '4', url: 'https://files.reimage.dev/modernizedvisions/538adbd9170a/original', alt: 'Custom order preview 4' },
  { id: '5', url: 'https://files.reimage.dev/modernizedvisions/2a80e1ff05b2/original', alt: 'Custom order preview 5' },
  { id: '6', url: 'https://files.reimage.dev/modernizedvisions/f8aa6f90acbc/original', alt: 'Custom order preview 6' },
  { id: '7', url: 'https://files.reimage.dev/modernizedvisions/538adbd9170a/original', alt: 'Custom order preview 7' },
  { id: '8', url: 'https://files.reimage.dev/modernizedvisions/2a80e1ff05b2/original', alt: 'Custom order preview 8' },
  { id: '9', url: 'https://files.reimage.dev/modernizedvisions/f8aa6f90acbc/original', alt: 'Custom order preview 9' },
  { id: '10', url: 'https://files.reimage.dev/modernizedvisions/538adbd9170a/original', alt: 'Custom order preview 10' },
];

const skeletonChips = Array.from({ length: 7 });
const skeletonExamples = Array.from({ length: 6 });

function MarqueeBand({ tiles }: { tiles: Array<{ id: string; url: string; alt: string }> }) {
  const [isPaused, setIsPaused] = useState(false);
  const trackStyle = {
    animationPlayState: isPaused ? 'paused' : undefined,
  } as CSSProperties;

  const looped = [...tiles, ...tiles];

  return (
    <div
      className="marquee relative overflow-hidden"
      style={{ ['--marquee-duration' as string]: '70s' }}
      onPointerDown={() => setIsPaused(true)}
      onPointerUp={() => setIsPaused(false)}
      onPointerCancel={() => setIsPaused(false)}
      onPointerLeave={() => setIsPaused(false)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="marqueeTrack flex items-center gap-3 py-2" style={trackStyle}>
        {looped.map((tile, index) => (
          <div
            key={`${tile.id}-${index}`}
            className="relative overflow-hidden rounded-2xl bg-slate-100 shrink-0 w-[120px] sm:w-[140px] md:w-[160px] aspect-[4/5] sm:aspect-square"
          >
            <img
              src={tile.url}
              alt={tile.alt}
              className="h-full w-full object-cover"
              loading="eager"
              draggable={false}
            />
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 md:w-20 bg-gradient-to-r from-white/90 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 md:w-20 bg-gradient-to-l from-white/90 to-transparent" />
    </div>
  );
}

export default function CustomOrdersPage() {
  const galleryRef = useRef<HTMLDivElement | null>(null);
  const formRef = useRef<HTMLDivElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedItem, setSelectedItem] = useState<CustomOrderExample | null>(null);
  const contactBg = '#C0CBD8';
  const [examples, setExamples] = useState<CustomOrderExample[]>([]);
  const [isLoadingExamples, setIsLoadingExamples] = useState(true);
  const [examplesError, setExamplesError] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  const [draft, setDraft] = useState<CustomOrderRequestDraft>({
    name: '',
    email: '',
    message: '',
    categoryIds: [],
    categoryNames: [],
    attachments: [],
    inspoExampleId: null,
    inspoTitle: null,
    inspoImageUrl: null,
  });
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [isImageProcessing, setIsImageProcessing] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const MAX_IMAGE_BYTES = 8_000_000;
  const MAX_DATA_URL_LENGTH = 1_800_000;
  const MAX_IMAGE_DIMENSION = 1600;
  const IMAGE_QUALITY = 0.82;

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setIsLoadingCategories(true);
        const data = await fetchCategories();
        if (!isMounted) return;
        setCategories(Array.isArray(data) ? data : []);
        setCategoryError(null);
      } catch (err) {
        if (!isMounted) return;
        setCategoryError('Categories are loading soon. You can still select the One-of-a-Kind option.');
        setCategories([]);
      } finally {
        if (isMounted) setIsLoadingCategories(false);
      }
    };
    void load();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  useEffect(() => {
    let isMounted = true;
    const loadExamples = async () => {
      try {
        setIsLoadingExamples(true);
        const data = await fetchCustomOrderExamples();
        if (!isMounted) return;
        setExamples(Array.isArray(data) ? data : []);
        setExamplesError(null);
      } catch (err) {
        if (!isMounted) return;
        setExamples([]);
        setExamplesError('Examples are loading soon.');
      } finally {
        if (isMounted) setIsLoadingExamples(false);
      }
    };
    void loadExamples();
    return () => {
      isMounted = false;
    };
  }, []);

  const categoryChips = useMemo<CategoryChip[]>(() => {
    const filtered = categories.filter((category) => {
      const name = category.name.toLowerCase();
      const slug = category.slug.toLowerCase();
      return name !== 'other items' && slug !== 'other-items';
    });
    const mapped = filtered.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
    }));
    return [
      ...mapped,
      {
        id: 'custom-one-of-a-kind',
        name: 'One-of-a-Kind Request',
        slug: 'one-of-a-kind-request',
      },
    ];
  }, [categories]);

  const handleScrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleScrollToGallery = () => {
    galleryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleFieldChange = (field: 'name' | 'email' | 'message', value: string) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const compressImageToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        const maxDim = MAX_IMAGE_DIMENSION;
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const targetWidth = Math.max(1, Math.round(img.width * scale));
        const targetHeight = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          reject(new Error('Image processing failed'));
          return;
        }
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        const dataUrl = canvas.toDataURL('image/jpeg', IMAGE_QUALITY);
        URL.revokeObjectURL(objectUrl);
        resolve(dataUrl);
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Failed to read image'));
      };
      img.src = objectUrl;
    });

  const handleFiles = (files: FileList | null) => {
    if (!files || !files.length) return;
    const file = files[0];
    if (file.size > MAX_IMAGE_BYTES) {
      setImageFile(null);
      setImageDataUrl(null);
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
      }
      setImageError('Image too large. Please upload a photo under 8MB.');
      return;
    }
    if (!file.type.startsWith('image/')) {
      setImageError('Unsupported file type. Please upload an image.');
      return;
    }
    setImageError(null);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setIsImageProcessing(true);
    setImageDataUrl(null);
    compressImageToDataUrl(file)
      .then((dataUrl) => {
        if (dataUrl.length > MAX_DATA_URL_LENGTH) {
          setImageError('Image is still too large after compression. Please use a smaller photo.');
          setImageFile(null);
          setImageDataUrl(null);
          return;
        }
        setImageDataUrl(dataUrl);
      })
      .catch(() => {
        setImageError('Unable to process image. Please try another photo.');
        setImageFile(null);
        setImageDataUrl(null);
      })
      .finally(() => {
        setIsImageProcessing(false);
      });
  };

  const handleClearImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
    setImageDataUrl(null);
    setImageError(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleSelectCategory = (chip: CategoryChip) => {
    setDraft((prev) => {
      const index = prev.categoryIds.indexOf(chip.id);
      if (index >= 0) {
        const nextIds = prev.categoryIds.filter((id) => id !== chip.id);
        const nextNames = prev.categoryNames.filter((_, idx) => idx !== index);
        return { ...prev, categoryIds: nextIds, categoryNames: nextNames };
      }
      return {
        ...prev,
        categoryIds: [...prev.categoryIds, chip.id],
        categoryNames: [...prev.categoryNames, chip.name],
      };
    });
  };

  const validateForm = () => {
    const nextErrors = {
      name: draft.name.trim() ? '' : 'Name is required.',
      email: draft.email.trim() ? '' : 'Email is required.',
      message: draft.message.trim() ? '' : 'Please share a short message.',
    };
    setErrors(nextErrors);
    return !nextErrors.name && !nextErrors.email && !nextErrors.message;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const payload = {
        name: draft.name.trim(),
        email: draft.email.trim(),
        message: draft.message.trim(),
        imageUrl: imageDataUrl || undefined,
        type: 'custom_order',
        categoryIds: draft.categoryIds,
        categoryNames: draft.categoryNames,
        inspoExampleId: draft.inspoExampleId || undefined,
        inspoTitle: draft.inspoTitle || undefined,
        inspoImageUrl: draft.inspoImageUrl || undefined,
      };
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        let detail = 'Failed to send request';
        try {
          const data = await response.json();
          if (data?.error) detail = data.error;
        } catch {
          // ignore parse errors
        }
        throw new Error(detail);
      }
      setSubmitted(true);
      setDraft({
        name: '',
        email: '',
        message: '',
        categoryIds: [],
        categoryNames: [],
        attachments: [],
        inspoExampleId: null,
        inspoTitle: null,
        inspoImageUrl: null,
      });
      handleClearImage();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'There was an error sending your request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setDraft({
      name: '',
      email: '',
      message: '',
      categoryIds: [],
      categoryNames: [],
      attachments: [],
      inspoExampleId: null,
      inspoTitle: null,
      inspoImageUrl: null,
    });
    setErrors({ name: '', email: '', message: '' });
    setSubmitError(null);
    handleClearImage();
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleRequestFromModal = () => {
    if (selectedItem) {
      setDraft((prev) => ({
        ...prev,
        inspoExampleId: selectedItem.id,
        inspoTitle: selectedItem.title,
        inspoImageUrl: selectedItem.imageUrl,
      }));
    }
    setSelectedItem(null);
    handleScrollToForm();
  };

  const handleClearInspo = () => {
    setDraft((prev) => ({
      ...prev,
      inspoExampleId: null,
      inspoTitle: null,
      inspoImageUrl: null,
    }));
  };

  const marqueeTiles =
    examples.length > 0
      ? examples.map((example) => ({
          id: example.id,
          url: example.imageUrl,
          alt: example.title,
        }))
      : heroImages;

  return (
    <main className="w-full">
      <section className="px-4">
        <div className="mx-auto w-full max-w-5xl py-12 md:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-2xl md:text-3xl font-semibold font-serif text-slate-900">Custom Studio</h1>
            <p className="mt-3 text-sm md:text-base text-slate-600 max-w-2xl mx-auto font-serif subtitle-text">
              Hand-painted oyster shell art designed around your story - colors, names, dates, and coastal details that matter.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleScrollToForm}
                className="rounded-full rounded-ui bg-slate-900 px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white hover:bg-slate-800 transition-colors"
              >
                Start Your Request
              </button>
              <button
                type="button"
                onClick={handleScrollToGallery}
                className="rounded-full rounded-ui border border-slate-900 px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-900 hover:bg-slate-900 hover:text-white transition-colors"
              >
                Browse Past Customs
              </button>
            </div>
          </div>

          <div className="mt-10">
            <MarqueeBand tiles={marqueeTiles} />
          </div>
        </div>
      </section>

      <section className="px-4">
        <div className="mx-auto w-full max-w-5xl py-12 md:py-16">
          <div className="px-6 py-10 md:px-10">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl md:text-3xl font-semibold font-serif text-slate-900">Made with intention.</h2>
              <p className="mt-3 text-sm md:text-base text-slate-600 max-w-2xl mx-auto font-serif subtitle-text">
                Custom work is my favorite part - because no two stories are the same. Share what you are celebrating,
                who it is for, or the vibe you want it to have. I will guide the design and send a proof before anything is finalized.
              </p>
            </div>
            <ul className="mt-6 grid gap-3 text-sm text-slate-700 md:grid-cols-3">
              <li className="rounded-2xl bg-white/80 px-4 py-3 text-center">Designed from your inspiration</li>
              <li className="rounded-2xl bg-white/80 px-4 py-3 text-center">Proof shared before payment</li>
              <li className="rounded-2xl bg-white/80 px-4 py-3 text-center">Carefully packaged + shipped to you</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="px-4">
        <div ref={galleryRef} className="mx-auto w-full max-w-5xl py-12 md:py-16 md:pt-10">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl md:text-3xl font-semibold font-serif text-slate-900">Past Custom Pieces</h2>
            <p className="mt-3 text-sm md:text-base text-slate-600 max-w-2xl mx-auto font-serif subtitle-text">
              Click any piece to view it larger and see what it was made for.
            </p>
          </div>

          {examplesError && (
            <p className="mt-4 text-center text-xs text-slate-500">{examplesError}</p>
          )}

          {isLoadingExamples ? (
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
              {skeletonExamples.map((_, idx) => (
                <div key={`example-skeleton-${idx}`} className="space-y-3">
                  <div className="aspect-[4/5] sm:aspect-square rounded-3xl bg-slate-200/70 animate-pulse" />
                  <div className="h-4 rounded bg-slate-200/70 animate-pulse" />
                  <div className="h-3 rounded bg-slate-200/70 animate-pulse" />
                </div>
              ))}
            </div>
          ) : examples.length ? (
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
              {examples.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedItem(item)}
                  className="text-left"
                >
                  <div className="relative overflow-hidden rounded-3xl bg-slate-100 aspect-[4/5] sm:aspect-square">
                    <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
                  </div>
                  <div className="mt-3">
                    <h3 className="font-semibold font-serif text-slate-900">{item.title}</h3>
                    <p className="mt-1 text-sm text-slate-600 leading-6">{item.description}</p>
                    {item.tags?.length ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {item.tags.map((tag) => (
                          <span
                            key={`${item.id}-${tag}`}
                            className="rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-8 text-center text-sm text-slate-500">Examples coming soon.</div>
          )}
        </div>
      </section>

      <div
        className="w-full leading-[0] m-0 p-0 overflow-hidden -mb-px"
        style={{ backgroundColor: '#ffffff' }}
        data-testid="divider-custom-orders-contact"
      >
        <WaveDivider direction="down" fill={contactBg} className="block" dataTestId="divider-custom-orders-contact" />
      </div>

      <div className="-mt-px">
        <section className="px-4" style={{ backgroundColor: contactBg }}>
          <div ref={formRef} className="mx-auto w-full max-w-5xl py-12 md:py-16">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl md:text-3xl font-semibold font-serif text-slate-900">Start Your Custom Request</h2>
              <p className="mt-3 text-sm md:text-base text-slate-600 max-w-2xl mx-auto font-serif subtitle-text">
                Pick a category (optional), then tell me what you are imagining.
              </p>
            </div>

            <div className="mx-auto mt-6 w-full max-w-3xl contact-form-card rounded-3xl p-6 md:p-8">
              {submitted ? (
                <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-center">
                  <h3 className="text-lg font-semibold font-serif text-emerald-900">Got it - we're excited!</h3>
                  <p className="mt-2 text-sm text-emerald-800">We will reply within 24-48 hours with next steps.</p>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="mt-4 rounded-full rounded-ui border border-emerald-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-900"
                  >
                    Start another request
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {categoryError && (
                    <p className="text-center text-xs text-slate-500">{categoryError}</p>
                  )}

                  {isLoadingCategories && (
                    <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-2">
                      {skeletonChips.map((_, index) => (
                        <div
                          key={`skeleton-chip-${index}`}
                          className="h-10 w-28 rounded-full bg-slate-200/70 animate-pulse"
                        />
                      ))}
                    </div>
                  )}

                  {!isLoadingCategories && (
                    <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-3">
                      {categoryChips.map((chip) => {
                        const isSelected = draft.categoryIds.includes(chip.id);
                        return (
                          <button
                            key={chip.id}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => handleSelectCategory(chip)}
                            className={`rounded-full rounded-ui px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] min-h-[40px] shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#c89f6e] ${
                              isSelected
                                ? 'border border-transparent bg-slate-900 text-white hover:bg-slate-800'
                                : 'border border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-white'
                            }`}
                          >
                            {chip.name}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <div>
                    <label htmlFor="custom-name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      id="custom-name"
                      type="text"
                      value={draft.name}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                  </div>

                  <div>
                    <label htmlFor="custom-email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      id="custom-email"
                      type="email"
                      value={draft.email}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                    {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                  </div>

                  {(draft.inspoTitle || draft.inspoImageUrl) && (
                    <div className="rounded-2xl border border-slate-200 bg-white/80 p-3 flex items-center gap-3">
                      {draft.inspoImageUrl && (
                        <img
                          src={draft.inspoImageUrl}
                          alt={draft.inspoTitle || 'Inspired by example'}
                          className="h-12 w-12 rounded-xl object-cover border border-slate-200"
                        />
                      )}
                      <div className="flex-1">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Inspired by</p>
                        <p className="text-sm text-slate-700">{draft.inspoTitle || 'Custom example'}</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleClearInspo}
                        className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 hover:text-slate-800"
                      >
                        Clear
                      </button>
                    </div>
                  )}

                  <div>
                    <label htmlFor="custom-message" className="block text-sm font-medium text-gray-700 mb-1">
                      What are you imagining?
                    </label>
                    <textarea
                      id="custom-message"
                      rows={5}
                      value={draft.message}
                      onChange={(e) => handleFieldChange('message', e.target.value)}
                      placeholder="Share a few details or a vibe to start."
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                    />
                    {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message}</p>}
                  </div>

                  <div>
                    <div
                      className="rounded-md border-2 border-dashed border-gray-300 bg-gray-50 p-4 text-center text-sm text-gray-600 cursor-pointer"
                      onClick={() => imageInputRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        handleFiles(e.dataTransfer.files);
                      }}
                    >
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFiles(e.target.files)}
                      />
                      {imagePreview ? (
                        <div className="flex flex-col items-center gap-2">
                          <img
                            src={imagePreview}
                            alt="Upload preview"
                            className="h-32 w-32 object-cover rounded-md border border-gray-200"
                          />
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>Click or drop to replace</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleClearImage();
                              }}
                              className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 hover:text-slate-800"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <span>Share inspiration photos (optional)</span>
                          <span className="text-xs text-gray-500">Upload images or designs you'd like us to reference</span>
                        </div>
                      )}
                    </div>
                    {imageError && (
                      <p className="mt-2 text-xs text-red-600 text-center">{imageError}</p>
                    )}
                  </div>

                  {submitError && (
                    <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {submitError}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting || isImageProcessing}
                    className="w-full rounded-full rounded-ui bg-slate-900 text-white py-3 px-6 text-xs font-semibold uppercase tracking-[0.3em] hover:bg-slate-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting || isImageProcessing ? 'Sending...' : 'Send Custom Request'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="relative w-full max-w-4xl rounded-3xl bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedItem(null)}
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full rounded-ui bg-white shadow-sm hover:bg-slate-100"
              aria-label="Close"
            >
              <X className="h-4 w-4 text-slate-700" />
            </button>
            <div className="grid gap-6 p-6 md:grid-cols-2 md:p-8">
              <div className="rounded-2xl bg-white p-4">
                <div className="relative aspect-[4/5] sm:aspect-square">
                  <img
                    src={selectedItem.imageUrl}
                    alt={selectedItem.title}
                    className="absolute inset-0 h-full w-full object-contain"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <h3 className="text-xl font-semibold font-serif text-slate-900">{selectedItem.title}</h3>
                <p className="mt-3 text-sm text-slate-600 leading-6">{selectedItem.description}</p>
                {selectedItem.tags?.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedItem.tags.map((tag) => (
                      <span
                        key={`${selectedItem.id}-modal-${tag}`}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={handleRequestFromModal}
                  className="mt-6 rounded-full rounded-ui bg-slate-900 px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white hover:bg-slate-800 transition-colors"
                >
                  Start a request like this
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
