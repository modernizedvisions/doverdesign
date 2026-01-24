import { ContactForm } from '../components/ContactForm';

export type HomeTemplateProps = {
  heroImageUrl?: string;
  galleryImageUrls?: string[];
};

export default function HomeTemplate() {

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
        <div className="mx-auto flex max-w-6xl px-4 py-16">
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Hero
          </h1>
        </div>
      </section>

      <section id="services" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-semibold text-slate-900">Services</h2>
      </section>

      <section id="gallery" className="border-y border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-3xl font-semibold text-slate-900">Gallery</h2>
        </div>
      </section>

      <section id="reviews" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-semibold text-slate-900">Reviews</h2>
      </section>

      <section id="about" className="border-t border-slate-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-3xl font-semibold text-slate-900">About</h2>
        </div>
      </section>

      <section id="contact" className="border-t border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-3xl font-semibold text-slate-900">Contact</h2>
          <div className="mt-8">
            <ContactForm backgroundColor="#f8fafc" variant="embedded" />
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>Footer</span>
        </div>
      </footer>
    </div>
  );
}
