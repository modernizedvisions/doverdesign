import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { X } from 'lucide-react';
import { fetchCustomOrderExamples } from '../lib/api';
import type { CustomOrderExample } from '../lib/api';
import { ContactForm } from '../components/ContactForm';

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

  const marqueeTiles =
    examples.length > 0
      ? examples.map((example) => ({
          id: example.id,
          url: example.imageUrl,
          alt: example.title,
        }))
      : heroImages;

  return (
    <main className="w-full bg-linen text-charcoal">
      <section className="px-4">
        <div className="mx-auto w-full max-w-[92vw] sm:max-w-6xl py-12 md:py-16">
          <div className="mx-auto max-w-2xl text-center space-y-3">
            <p className="text-[11px] uppercase tracking-[0.32em] text-deep-ocean/75">Custom Studio</p>
            <h1 className="text-3xl md:text-4xl font-serif font-semibold tracking-[0.02em] text-deep-ocean">
              Coastal shell art, tailored to your story.
            </h1>
            <p className="text-sm md:text-base text-charcoal/80 max-w-5xl mx-auto font-serif leading-relaxed whitespace-nowrap">
              Hand-painted shell pieces designed around your palette, names, dates, and the coastal details that matter most.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleScrollToForm}
                className="rounded-shell-full bg-deep-ocean px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-white shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all"
              >
                Start Your Request
              </button>
              <button
                type="button"
                onClick={handleScrollToGallery}
                className="rounded-shell-full border border-driftwood/70 bg-white/80 px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-deep-ocean hover:bg-sand/70 hover:-translate-y-0.5 transition-all"
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
        <div className="mx-auto w-full max-w-[92vw] sm:max-w-6xl py-12 md:py-16">
          <div className="px-6 py-10 md:px-10 rounded-shell-lg border border-driftwood/50 bg-white/70 shadow-sm">
            <div className="mx-auto max-w-2xl text-center space-y-3">
              <p className="text-[11px] uppercase tracking-[0.3em] text-deep-ocean/75">Made with intention</p>
              <h2 className="text-3xl md:text-4xl font-serif font-semibold text-deep-ocean">Customs, crafted with care.</h2>
              <p className="text-sm md:text-base text-charcoal/80 max-w-2xl mx-auto font-serif leading-relaxed">
                Every story is different. Share what you are celebrating, the palette you love, or the vibe you want it to have. You’ll see a proof before anything is finalized.
              </p>
            </div>
            <ul className="mt-6 grid gap-3 text-sm text-charcoal/85 md:grid-cols-3">
              <li className="rounded-shell-lg border border-driftwood/40 bg-linen px-4 py-3 text-center">Designed from your inspiration</li>
              <li className="rounded-shell-lg border border-driftwood/40 bg-linen px-4 py-3 text-center">Proof shared before finishing</li>
              <li className="rounded-shell-lg border border-driftwood/40 bg-linen px-4 py-3 text-center">Carefully packaged & shipped</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="px-4">
        <div ref={galleryRef} className="mx-auto w-full max-w-[92vw] sm:max-w-6xl py-12 md:py-16 md:pt-10">
          <div className="mx-auto max-w-2xl text-center space-y-3">
            <p className="text-[11px] uppercase tracking-[0.3em] text-deep-ocean/75">Past work</p>
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-deep-ocean">Past custom pieces</h2>
            <p className="text-sm md:text-base text-charcoal/80 max-w-2xl mx-auto font-serif leading-relaxed">
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
                  <div className="relative overflow-hidden rounded-shell-lg bg-white/80 border border-driftwood/40 shadow-sm aspect-[4/5] sm:aspect-square">
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
                            className="rounded-full border border-driftwood/40 bg-white/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-charcoal/70"
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

      <section id="contact" className="py-16 sm:py-20" style={{ backgroundColor: contactBg }}>
        <div ref={formRef} className="w-full max-w-[92vw] sm:max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="space-y-8">
            <div className="space-y-3 max-w-3xl">
              <p className="text-xs uppercase tracking-[0.32em] text-deep-ocean/75">Contact</p>
              <h2 className="text-3xl sm:text-4xl font-serif tracking-[0.03em] text-deep-ocean">Soft luxury form experience</h2>
              <p className="text-base text-charcoal/80 leading-relaxed">
                Tell us about your space, palette, or the story you want a shell to hold.
              </p>
            </div>
            <div className="mt-10 rounded-shell-lg border border-driftwood/70 bg-white lux-shadow">
              <div className="flex justify-center">
                <div className="p-6 sm:p-8 bg-white w-full max-w-4xl">
                  <ContactForm backgroundColor="transparent" variant="embedded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
                        className="rounded-full border border-driftwood/40 bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-charcoal/70"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={handleRequestFromModal}
                  className="mt-6 rounded-shell-full bg-deep-ocean px-6 py-3 text-xs font-semibold uppercase tracking-[0.26em] text-white hover:bg-deep-ocean/90 transition-colors"
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
