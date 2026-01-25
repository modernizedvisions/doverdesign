import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { ContactForm } from '../components/ContactForm';

export type HomeTemplateProps = {
  heroImageUrl?: string;
  galleryImageUrls?: string[];
};

const picturePaths = [
  '/pictures/screenshot1.jpg',
  '/pictures/screenshot2.jpg',
  '/pictures/screenshot3.jpg',
  '/pictures/screenshot4.jpg',
  '/pictures/screenshot5.jpg',
];

const services = [
  {
    title: 'Handcrafted Art',
    copy: 'Every shell is individually selected, painted, and finished by hand.',
  },
  {
    title: 'Custom Interior Pieces',
    copy: 'Designed to harmonize with your palette, finishes, and collected objects.',
  },
  {
    title: 'Curated Collections',
    copy: 'Seasonal and limited-run coastal shell designs ready to style and gift.',
  },
];

const galleryItems = [
  { label: 'Shell art product image', accent: 'Sea-glass wash', tall: true },
  { label: 'Studio painting process', accent: 'Warm linen', tall: false },
  { label: 'Framed interior display', accent: 'Charcoal trims', tall: true },
  { label: 'Shell art product image', accent: 'Gold edge', tall: false },
  { label: 'Framed interior display', accent: 'Driftwood frame', tall: false },
  { label: 'Studio painting process', accent: 'In-progress', tall: true },
  { label: 'Shell art product image', accent: 'Sable shell', tall: false },
  { label: 'Framed interior display', accent: 'Mantel styling', tall: false },
];

const testimonials = [
  { quote: 'The shell trio elevated our entry console instantly - calm, refined, unforgettable.', name: 'Charlotte M.', location: 'Beacon Hill, Boston' },
  { quote: "She matched our paint deck and made a custom piece for our living room. It's art and memory in one.", name: 'Evelyn R.', location: 'Newport, RI' },
  { quote: 'Luxury craftsmanship with the warmth of a studio visit. The gold detailing is exquisite.', name: 'Ian P.', location: 'Nantucket, MA' },
];

export default function HomeTemplate({ heroImageUrl, galleryImageUrls }: HomeTemplateProps) {
  const resolvedHeroImage = heroImageUrl ?? picturePaths[0];
  const resolvedGalleryImages = galleryImageUrls?.length ? galleryImageUrls : picturePaths;
  const resolvedAboutImage = resolvedGalleryImages[1] ?? resolvedHeroImage ?? picturePaths[1];
  const galleryWithSources = useMemo(
    () =>
      galleryItems.map((item, index) => ({
        ...item,
        image: resolvedGalleryImages[index % resolvedGalleryImages.length] ?? resolvedHeroImage ?? null,
      })),
    [resolvedGalleryImages, resolvedHeroImage]
  );

  return (
    <div className="bg-linen text-charcoal">
      <div className="relative isolate overflow-hidden">
        <div className="pointer-events-none absolute inset-0 shell-pattern opacity-60" />
        <div className="pointer-events-none absolute inset-x-0 -top-32 h-64 bg-[radial-gradient(circle_at_top,_rgba(159,191,187,0.22),_transparent_52%)]" />

        <section
          id="top"
          className="relative pt-14 sm:pt-20 lg:pt-24 pb-16 bg-gradient-to-b from-[var(--warm-linen)] via-[var(--linen)] to-[var(--sand)]"
        >
          <SectionWrapper>
            <div className="grid gap-10 lg:grid-cols-[1.05fr,0.95fr] items-center">
              <RevealOnScroll className="space-y-8">
                <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.32em] text-deep-ocean/80">
                  <span className="inline-flex items-center rounded-shell bg-white/85 px-3 py-1.5 border border-driftwood/60 shadow-sm">
                    Dover Designs · Boston · Coastal Shell Atelier
                  </span>
                </div>
                <div className="space-y-5">
                  <h1 className="font-serif text-4xl sm:text-5xl lg:text-[54px] leading-tight tracking-[0.04em] text-deep-ocean">
                    Handcrafted Coastal Shell Art for Curated Interiors
                  </h1>
                  <p className="max-w-2xl text-lg text-charcoal/80">
                    One-of-a-kind, hand-painted seashell designs inspired by the calm of the coast - thoughtfully finished to elevate modern living spaces.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <LuxuryButton to="/shop" variant="primary">
                    Explore the Collection
                  </LuxuryButton>
                  <LuxuryButton to="/custom-orders" variant="ghost">
                    Custom Orders
                  </LuxuryButton>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    { title: 'Hand-painted', desc: 'Every shell finished in-studio' },
                    { title: 'Gallery-grade', desc: 'UV protected & sealed' },
                    { title: 'Ships with care', desc: 'White-glove packaging' },
                  ].map((item) => (
                    <div key={item.title} className="shell-card px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.28em] text-deep-ocean/80">{item.title}</p>
                      <p className="text-sm mt-2 text-charcoal/80">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </RevealOnScroll>

              <RevealOnScroll delay={120} className="relative">
                <div className="absolute -left-6 -top-6 hidden lg:block">
                  <div className="shell-card px-4 py-3 text-xs uppercase tracking-[0.26em] text-deep-ocean/80">
                    Coastal Luxury, Hand Finished
                  </div>
                </div>
                <div className="relative rounded-shell-lg overflow-hidden lux-shadow border border-driftwood/70 bg-white/70">
                  <div className="absolute inset-0 bg-gradient-to-br from-sand/70 via-transparent to-sea-glass/15 pointer-events-none" />
                  <div className="aspect-[4/5] w-full flex items-end justify-start">
                    {resolvedHeroImage ? (
                      <img
                        src={resolvedHeroImage}
                        alt="Handcrafted shell art lifestyle"
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-sand via-linen to-sea-glass/40 shell-pattern flex items-end">
                        <div className="m-6 shell-card">
                          <p className="text-xs uppercase tracking-[0.26em] text-deep-ocean/80">// Lifestyle shell art image</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="absolute right-4 top-4 shell-card px-4 py-3 text-xs uppercase tracking-[0.28em] text-deep-ocean">
                    Lead time: 2-3 weeks
                  </div>
                  <div className="absolute left-4 bottom-4 shell-card px-4 py-3 text-xs uppercase tracking-[0.26em] text-deep-ocean/90">
                    Lifestyle Shell Art — Studio Photography
                  </div>
                </div>
              </RevealOnScroll>
            </div>
          </SectionWrapper>

          <SectionWrapper className="mt-10">
            <div className="flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.28em] text-charcoal/80">
              <AnchorPill href="#services" label="Services" />
              <AnchorPill href="#gallery" label="Gallery" />
              <AnchorPill href="#reviews" label="Reviews" />
              <AnchorPill href="#about" label="About" />
              <AnchorPill href="#contact" label="Contact" />
            </div>
          </SectionWrapper>
        </section>

        <SectionDivider />

        <SectionWrapper id="services" className="py-16 sm:py-20 bg-[var(--sand)]">
          <SectionHeading
            eyebrow="Offerings"
            title="What makes this special"
            subtitle="A boutique coastal studio blending fine-art detail with interior design sensibility."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <RevealOnScroll key={service.title} delay={index * 60} className="shell-card group h-full bg-stone/70 border border-driftwood/80">
                <div className="flex h-full flex-col justify-between gap-6">
                  <div className="space-y-3">
                    <div className="h-1 w-12 bg-gold-accent/90 rounded-shell shadow-[0_6px_18px_rgba(217,199,161,0.35)]" />
                    <h3 className="text-2xl font-serif tracking-[0.02em] text-deep-ocean">{service.title}</h3>
                    <p className="text-sm leading-relaxed text-charcoal/80">{service.copy}</p>
                  </div>
                  <div className="text-sm uppercase tracking-[0.3em] text-deep-ocean/80">
                    <span className="group-hover:underline decoration-[0.5px] underline-offset-4">Discover</span>
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </SectionWrapper>

        <SectionDivider />

        <SectionWrapper id="gallery" className="py-16 sm:py-20 bg-[var(--stone)]">
          <SectionHeading
            eyebrow="Gallery"
            title="Visual proof of craft"
            subtitle="Soft, artisanal finishes captured in lifestyle scenes and studio moments."
          />
          <GalleryGrid items={galleryWithSources} />
          <div className="mt-10 flex flex-wrap gap-4">
            <LuxuryButton to="/shop" variant="primary">
              View in Shop
            </LuxuryButton>
            <LuxuryButton to="/gallery" variant="outline">
              Full Gallery
            </LuxuryButton>
          </div>
        </SectionWrapper>

        <SectionWrapper id="reviews" className="py-16 sm:py-20 bg-[var(--warm-linen)]">
          <SectionHeading
            eyebrow="Reviews"
            title="Trusted by collectors"
            subtitle="Words from interior designers and collectors who live with Dover pieces."
          />
          <div className="mt-10 rounded-shell-lg border border-sea-glass/30 bg-sea-glass/10 px-4 py-6 sm:px-6 sm:py-8 shadow-inner">
            <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
              {testimonials.map((testimonial, index) => (
                <RevealOnScroll key={testimonial.name} delay={index * 80} className="min-w-[260px] max-w-sm snap-center shell-card bg-white/90">
                  <div className="space-y-4">
                    <p className="text-lg leading-relaxed text-deep-ocean">"{testimonial.quote}"</p>
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.28em] text-charcoal/70">
                      <span>{testimonial.name}</span>
                      <span className="text-[11px]">{testimonial.location}</span>
                    </div>
                    <div className="text-gold-accent text-sm" aria-label="5 star rating">
                      ★★★★★
                    </div>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </SectionWrapper>

        <SectionDivider />

        <SectionWrapper id="about" className="py-16 sm:py-20 bg-[var(--sand)]">
          <div className="grid gap-10 lg:grid-cols-[0.95fr,1.05fr] items-center">
            <RevealOnScroll delay={60} className="relative">
              <div className="absolute -right-6 -top-6 hidden md:block">
                <div className="shell-card px-4 py-3 text-xs uppercase tracking-[0.26em] text-deep-ocean/80">
                  Boston coastal atelier
                </div>
              </div>
              <div className="rounded-shell-lg overflow-hidden shadow-2xl border border-driftwood/70 bg-gradient-to-br from-linen via-sand to-sea-glass/20 shell-pattern">
                {resolvedAboutImage ? (
                  <img
                    src={resolvedAboutImage}
                    alt="Artist portrait or studio"
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="aspect-[4/5] flex items-end">
                    <div className="m-6 shell-card bg-white/80">
                      <p className="text-xs uppercase tracking-[0.26em] text-deep-ocean/80">// Artist portrait or studio</p>
                    </div>
                  </div>
                )}
              </div>
            </RevealOnScroll>
            <RevealOnScroll className="space-y-6">
              <SectionHeading
                eyebrow="The artist"
                title="Behind Dover Designs"
                subtitle="Dover Designs is a coastal shell art studio based in Boston, creating one-of-a-kind pieces inspired by the shoreline, natural textures, and modern interior spaces."
              />
              <p className="text-base leading-relaxed text-charcoal/80">
                Each shell is sourced, painted, and gilded by hand - balancing soft coastal tones with gallery-grade finishes.
                The work is designed to layer effortlessly with modern furnishings and heirloom objects.
              </p>
              <div className="flex flex-col gap-4">
                <div className="h-[2px] w-16 bg-gold-accent/80 rounded-shell" />
                <LuxuryButton to="/about" variant="primary">
                  Learn the Story
                </LuxuryButton>
              </div>
            </RevealOnScroll>
          </div>
        </SectionWrapper>

        <SectionDivider />

        <SectionWrapper id="contact" className="py-16 sm:py-20 bg-[var(--stone)]">
          <SectionHeading
            eyebrow="Contact"
            title="Soft luxury form experience"
            subtitle="Tell us about your space, palette, or the story you want a shell to hold."
          />
          <div className="mt-10 rounded-shell-lg border border-driftwood/70 bg-white/80 lux-shadow">
            <div className="grid lg:grid-cols-[1.05fr,0.95fr] gap-0">
              <div className="relative overflow-hidden border-b lg:border-b-0 lg:border-r border-driftwood/60">
                <div className="absolute inset-0 bg-gradient-to-br from-sand/80 via-transparent to-sea-glass/20" />
                <div className="p-8 space-y-4 relative">
                  <p className="text-xs uppercase tracking-[0.28em] text-deep-ocean/80">Custom & inquiries</p>
                  <h3 className="text-3xl font-serif tracking-[0.02em] text-deep-ocean">Let's create something bespoke</h3>
                  <p className="text-sm leading-relaxed text-charcoal/80">
                    Share inspiration, upload photos of your space, and outline your vision. We'll reply with options, finishes, and timelines.
                  </p>
                  <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.22em] text-deep-ocean/80">
                    <span className="rounded-shell bg-sand px-3 py-2 border border-driftwood/60">Palette matching</span>
                    <span className="rounded-shell bg-sand px-3 py-2 border border-driftwood/60">Gold leaf detailing</span>
                    <span className="rounded-shell bg-sand px-3 py-2 border border-driftwood/60">Framed display</span>
                  </div>
                </div>
              </div>
              <div className="p-6 sm:p-8 bg-white/90">
                <ContactForm backgroundColor="transparent" variant="embedded" />
              </div>
            </div>
          </div>
        </SectionWrapper>

        <SectionWrapper className="pb-16 sm:pb-20 bg-[var(--sand)]">
          <div className="shell-card flex flex-col gap-6 items-start sm:items-center sm:flex-row sm:justify-between px-6 py-6 sm:px-10 sm:py-8">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-deep-ocean/80">Ready to style</p>
              <h3 className="text-2xl font-serif tracking-[0.02em] text-deep-ocean">Bring coastal luxury home</h3>
              <p className="text-sm text-charcoal/80">
                Explore the current collection or request a bespoke piece for your project.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <LuxuryButton to="/shop" variant="primary">
                Shop Collection
              </LuxuryButton>
              <LuxuryButton to="/custom-orders" variant="ghost">
                Custom Orders
              </LuxuryButton>
            </div>
          </div>
        </SectionWrapper>
      </div>

      <MobileStickyCta />
    </div>
  );
}

function SectionWrapper({ children, id, className }: { children: ReactNode; id?: string; className?: string }) {
  return (
    <section id={id} className={className}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">{children}</div>
    </section>
  );
}

function SectionHeading({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="space-y-3 max-w-3xl">
      <p className="text-xs uppercase tracking-[0.32em] text-deep-ocean/75">{eyebrow}</p>
      <h2 className="text-3xl sm:text-4xl font-serif tracking-[0.03em] text-deep-ocean">{title}</h2>
      {subtitle ? <p className="text-base text-charcoal/80 leading-relaxed">{subtitle}</p> : null}
    </div>
  );
}

function SectionDivider() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
      <div className="shell-divider" />
    </div>
  );
}

function LuxuryButton({
  to,
  variant = 'primary',
  children,
}: {
  to: string;
  variant?: 'primary' | 'ghost' | 'outline';
  children: ReactNode;
}) {
  const styles = {
    primary: 'bg-deep-ocean text-white shadow-lg hover:-translate-y-0.5 hover:shadow-xl',
    ghost: 'bg-white/80 text-deep-ocean border border-driftwood/70 hover:bg-sand/80 hover:-translate-y-0.5',
    outline: 'border border-charcoal/60 text-charcoal hover:bg-charcoal hover:text-sand hover:-translate-y-0.5',
  };
  const ariaLabel = typeof children === 'string' ? children : undefined;

  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-2 rounded-shell px-6 py-3 uppercase tracking-[0.24em] text-[11px] transition-all duration-200 ${styles[variant]}`}
      aria-label={ariaLabel}
    >
      <span className="whitespace-nowrap">{children}</span>
      <ArrowUpRight className="h-4 w-4" />
    </Link>
  );
}

function AnchorPill({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="rounded-shell bg-white/70 border border-driftwood/70 px-4 py-2 hover:bg-sand/80 transition-all duration-150"
    >
      {label}
    </a>
  );
}

function RevealOnScroll({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-[cubic-bezier(.22,1,.36,1)] ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      } ${className}`}
    >
      {children}
    </div>
  );
}

function GalleryGrid({ items }: { items: Array<{ label: string; accent: string; tall?: boolean; image?: string | null }> }) {
  return (
    <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {items.map((item, index) => {
        const toneClass = index % 2 === 0 ? 'bg-white/90' : 'bg-sand/70';
        return (
          <RevealOnScroll key={`${item.label}-${index}`} delay={index * 40}>
            <div
              className={`group relative overflow-hidden rounded-shell-lg border border-driftwood/70 ${toneClass} shadow-md ${
                item.tall ? 'row-span-2 aspect-[3/4] lg:aspect-[2/3]' : 'aspect-[4/5]'
              }`}
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.label}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                  loading="lazy"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-sand via-linen to-sea-glass/20 shell-pattern" />
              )}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300 bg-deep-ocean/25" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3">
                <div className="shell-card bg-white/90 px-4 py-3 text-xs uppercase tracking-[0.24em] text-deep-ocean/90">
                  {item.label}
                </div>
                <Link
                  to="/shop"
                  className="rounded-shell bg-deep-ocean text-white px-3 py-2 text-[10px] uppercase tracking-[0.26em] opacity-0 group-hover:opacity-100 transition-all duration-200 hover:-translate-y-0.5"
                >
                  View
                </Link>
              </div>
              <div className="absolute top-3 right-3 shell-card bg-white/90 px-3 py-2 text-[11px] uppercase tracking-[0.28em] text-deep-ocean/80">
                {item.accent}
              </div>
            </div>
          </RevealOnScroll>
        );
      })}
    </div>
  );
}

function MobileStickyCta() {
  return (
    <div className="fixed bottom-0 inset-x-0 z-30 md:hidden">
      <div className="mx-3 mb-3 rounded-shell-lg bg-deep-ocean text-white shadow-2xl">
        <Link
          to="/shop"
          className="flex items-center justify-center gap-2 px-4 py-4 text-xs uppercase tracking-[0.26em]"
        >
          Shop Collection
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
