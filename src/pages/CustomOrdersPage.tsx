import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { fetchCustomOrderExamples } from '../lib/api';
import type { CustomOrderExample } from '../lib/api';
import { ContactForm } from '../components/ContactForm';

const skeletonExamples = Array.from({ length: 6 });

export default function CustomOrdersPage() {
  const galleryRef = useRef<HTMLDivElement | null>(null);
  const formRef = useRef<HTMLDivElement | null>(null);
  const [selectedItem, setSelectedItem] = useState<CustomOrderExample | null>(null);
  const contactBg = '#E6DFD4';
  const [examples, setExamples] = useState<CustomOrderExample[]>([]);
  const [isLoadingExamples, setIsLoadingExamples] = useState(true);
  const [examplesError, setExamplesError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadExamples = async () => {
      try {
        setIsLoadingExamples(true);
        const data = await fetchCustomOrderExamples();
        if (!isMounted) return;
        setExamples(Array.isArray(data) ? data : []);
        setExamplesError(null);
      } catch (_err) {
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

  const handleScrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleScrollToGallery = () => {
    galleryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleRequestFromModal = () => {
    setSelectedItem(null);
    handleScrollToForm();
  };

  return (
    <main className="w-full bg-linen text-charcoal relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 shell-pattern opacity-60" />
      <section className="px-4 relative">
        <div className="mx-auto w-full max-w-[92vw] sm:max-w-6xl py-12 md:py-16">
          <div className="mx-auto max-w-2xl text-center space-y-3">
            <p className="lux-eyebrow">Custom Studio</p>
            <h1 className="text-3xl md:text-4xl font-serif font-semibold tracking-[0.02em] text-deep-ocean">
              Coastal shell art, tailored to your story.
            </h1>
            <p className="text-sm md:text-base text-charcoal/80 max-w-5xl mx-auto font-serif leading-relaxed">
              Hand-painted shell pieces designed around your palette, names, dates, and the coastal details that matter most.
            </p>
          </div>

          <div className="mt-12 flex justify-center">
            <div className="lux-card bg-white/92 w-full max-w-4xl text-center px-8 py-12 md:px-14 md:py-14">
              <div className="space-y-3 max-w-2xl mx-auto">
                <p className="lux-eyebrow">Made with intention</p>
                <h2 className="text-3xl md:text-4xl font-serif font-semibold text-deep-ocean">Your Custom, Curated</h2>
                <p className="lux-subtitle">
                  Every piece begins with your story — from color and coastal mood to names, dates, and meaningful details. We’ll share a proof before finishing, so everything feels just right.
                </p>
              </div>
              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={handleScrollToForm}
                  className="lux-button w-full sm:w-auto justify-center"
                >
                  Start Your Request
                </button>
                <button
                  type="button"
                  onClick={handleScrollToGallery}
                  className="lux-button--ghost w-full sm:w-auto justify-center"
                >
                  Browse Past Customs
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4">
        <div ref={galleryRef} className="mx-auto w-full max-w-[92vw] sm:max-w-6xl py-12 md:py-16 md:pt-10">
          <div className="mx-auto max-w-2xl text-center space-y-3">
            <p className="lux-eyebrow">Past work</p>
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-deep-ocean">Past custom pieces</h2>
            <p className="lux-subtitle max-w-2xl mx-auto">
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
                  <div className="aspect-[4/5] sm:aspect-square rounded-shell-lg bg-stone animate-pulse" />
                  <div className="h-4 rounded bg-stone animate-pulse" />
                  <div className="h-3 rounded bg-stone animate-pulse" />
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
                  <div className="relative overflow-hidden rounded-shell-lg bg-white/85 border border-driftwood/50 lux-shadow aspect-[4/5] sm:aspect-square">
                    <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
                  </div>
                  <div className="mt-3 space-y-1">
                    <h3 className="font-semibold font-serif text-deep-ocean">{item.title}</h3>
                    <p className="text-sm text-charcoal/80 leading-6">{item.description}</p>
                    {item.tags?.length ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {item.tags.map((tag) => (
                          <span
                            key={`${item.id}-${tag}`}
                            className="lux-chip"
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
            <div className="mt-8 text-center text-sm text-charcoal/70">Examples coming soon.</div>
          )}
        </div>
      </section>

      <section id="contact" className="py-16 sm:py-20" style={{ backgroundColor: contactBg }}>
        <div ref={formRef} className="w-full max-w-[92vw] sm:max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="space-y-8">
            <div className="space-y-3 max-w-3xl">
              <p className="lux-eyebrow">Contact</p>
              <h2 className="text-3xl sm:text-4xl font-serif tracking-[0.03em] text-deep-ocean">Soft luxury form experience</h2>
              <p className="lux-subtitle">
                Tell us about your space, palette, or the story you want a shell to hold.
              </p>
            </div>
            <div className="mt-10 lux-card bg-white/92">
              <div className="flex justify-center">
                <div className="p-6 sm:p-8 bg-white/95 w-full max-w-4xl">
                  <ContactForm backgroundColor="transparent" variant="embedded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/70 backdrop-blur-sm p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="relative w-full max-w-4xl rounded-shell-lg bg-white/95 shadow-2xl border border-driftwood/70"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedItem(null)}
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm hover:bg-sand"
              aria-label="Close"
            >
              <X className="h-4 w-4 text-slate-700" />
            </button>
            <div className="grid gap-6 p-6 md:grid-cols-2 md:p-8">
              <div className="rounded-shell-lg bg-linen p-4 border border-driftwood/50">
                <div className="relative aspect-[4/5] sm:aspect-square">
                  <img
                    src={selectedItem.imageUrl}
                    alt={selectedItem.title}
                    className="absolute inset-0 h-full w-full object-contain"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <h3 className="text-xl font-semibold font-serif text-deep-ocean">{selectedItem.title}</h3>
                <p className="mt-3 text-sm text-charcoal/80 leading-6">{selectedItem.description}</p>
                {selectedItem.tags?.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedItem.tags.map((tag) => (
                      <span
                        key={`${selectedItem.id}-modal-${tag}`}
                        className="lux-chip"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={handleRequestFromModal}
                  className="mt-6 lux-button"
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
