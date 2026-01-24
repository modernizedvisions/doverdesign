import { ContactForm } from '../components/ContactForm';
import { ProgressiveImage } from '../components/ui/ProgressiveImage';

export type HomeTemplateProps = {
  heroImageUrl?: string;
  galleryImageUrls?: string[];
  primaryCtaHref?: string;
  secondaryCtaHref?: string;
};

const placeholderCards = [
  { title: 'Service One', body: 'Short description of the service.' },
  { title: 'Service Two', body: 'Short description of the service.' },
  { title: 'Service Three', body: 'Short description of the service.' },
  { title: 'Service Four', body: 'Short description of the service.' },
  { title: 'Service Five', body: 'Short description of the service.' },
  { title: 'Service Six', body: 'Short description of the service.' },
];

const placeholderReviews = [
  { name: 'Client Name', quote: 'Short review quote highlighting results.' },
  { name: 'Client Name', quote: 'Short review quote highlighting results.' },
  { name: 'Client Name', quote: 'Short review quote highlighting results.' },
];

const placeholderGallery = Array.from({ length: 8 }, (_, index) => `placeholder-${index}`);

export default function HomeTemplate({
  heroImageUrl,
  galleryImageUrls,
  primaryCtaHref = '#services',
  secondaryCtaHref = '#contact',
}: HomeTemplateProps) {
  const hasGalleryImages = Boolean(galleryImageUrls && galleryImageUrls.length);
  const galleryItems = hasGalleryImages ? galleryImageUrls : placeholderGallery;

  return (
    <div className="bg-white text-slate-900">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <a href="#top" className="text-sm font-semibold tracking-wide text-slate-900">
            TEMPLATE HOME
          </a>
          <nav className="flex flex-wrap gap-4 text-xs uppercase tracking-[0.18em] text-slate-600">
            <a href="#services" className="hover:text-slate-900">Services</a>
            <a href="#gallery" className="hover:text-slate-900">Gallery</a>
            <a href="#reviews" className="hover:text-slate-900">Reviews</a>
            <a href="#about" className="hover:text-slate-900">About</a>
            <a href="#contact" className="hover:text-slate-900">Contact</a>
          </nav>
        </div>
      </header>

      <section id="top" className="border-b border-slate-100">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Blank slate</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              Your Headline Here
            </h1>
            <p className="mt-4 text-base text-slate-600">
              Short description of the business.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={primaryCtaHref}
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              >
                Primary Action
              </a>
              <a
                href={secondaryCtaHref}
                className="inline-flex items-center justify-center rounded-full border border-slate-300 px-6 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
              >
                Secondary Action
              </a>
            </div>
          </div>
          <div className="relative">
            {heroImageUrl ? (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
                <ProgressiveImage
                  src={heroImageUrl}
                  alt="Hero image"
                  className="h-full w-full"
                  imgClassName="h-full w-full object-cover"
                  loading="eager"
                  decoding="async"
                />
              </div>
            ) : (
              <div className="flex h-72 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-400">
                Hero image placeholder
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="services" className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Services</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">What you offer</h2>
          </div>
          <a href="#contact" className="text-sm font-semibold text-slate-600 hover:text-slate-900">
            Get in touch
          </a>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {placeholderCards.map((card) => (
            <div key={card.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">{card.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="gallery" className="border-y border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Featured work</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">Gallery</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {galleryItems.map((item, index) => (
              <div
                key={typeof item === 'string' ? `${item}-${index}` : `gallery-${index}`}
                className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                {hasGalleryImages && typeof item === 'string' ? (
                  <ProgressiveImage
                    src={item}
                    alt="Gallery item"
                    className="h-48 w-full"
                    imgClassName="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center text-sm text-slate-400">
                    Image placeholder
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="reviews" className="mx-auto max-w-6xl px-4 py-16">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Reviews</p>
        <h2 className="mt-2 text-3xl font-semibold text-slate-900">What people say</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {placeholderReviews.map((review, index) => (
            <div key={`${review.name}-${index}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-600">"{review.quote}"</p>
              <p className="mt-4 text-sm font-semibold text-slate-900">{review.name}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="about" className="border-t border-slate-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">About</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">Tell your story</h2>
          <div className="mt-4 max-w-2xl space-y-4 text-sm text-slate-600">
            <p>
              This is a placeholder area for a short origin story, mission statement, or summary.
            </p>
            <p>
              Keep it simple and editable so each new client can replace the copy quickly.
            </p>
          </div>
        </div>
      </section>

      <section id="contact" className="border-t border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Contact</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">Start a project</h2>
          <div className="mt-8">
            <ContactForm backgroundColor="#f8fafc" variant="embedded" />
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>Template footer placeholder</span>
          <span>Replace with client details</span>
        </div>
      </footer>
    </div>
  );
}
