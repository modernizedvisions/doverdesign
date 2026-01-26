import { ContactForm } from '../components/ContactForm';

export function AboutPage() {
  return (
    <div className="bg-linen text-charcoal">
      <section className="py-16 sm:py-20">
        <div className="w-full max-w-[92vw] sm:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 space-y-3">
            <p className="text-[11px] uppercase tracking-[0.32em] text-deep-ocean/80">About Dover Designs</p>
            <h1 className="text-4xl sm:text-5xl font-serif font-semibold tracking-[0.03em] text-deep-ocean">About Dover Designs</h1>
          </div>

          <div className="grid gap-10 lg:grid-cols-[1.05fr,0.95fr] items-start">
            <div className="order-2 lg:order-1 space-y-5 text-base leading-relaxed">
              <p>
                Dover Designs is a coastal shell art studio dedicated to creating refined, one-of-a-kind pieces for thoughtfully curated interiors. Each design is handcrafted using carefully selected natural shells, finished by hand, and styled to bring a sense of calm, warmth, and coastal elegance into modern living spaces.
              </p>
              <p>
                Inspired by shoreline textures, ocean-washed tones, and timeless interior design, Dover Designs bridges fine art and functional decor. From bespoke custom commissions to limited-run collections, every piece is created with intention, balance, and an eye for lasting beauty.
              </p>
              <p>
                Whether styling a single statement piece or designing a full interior moment, Dover Designs approaches every project as a collaboration — turning natural materials into meaningful, personal works of art.
              </p>
            </div>

            <div className="order-1 lg:order-2">
              <div className="relative overflow-hidden rounded-2xl border border-driftwood/30 bg-linen shadow-sm">
                <img
                  src="/pictures/screenshot3.jpg"
                  alt="Dover Designs studio"
                  className="h-full w-full object-cover rounded-2xl"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <ContactForm backgroundColor="transparent" />
    </div>
  );
}
