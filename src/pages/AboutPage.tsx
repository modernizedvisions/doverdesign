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

          <div className="grid gap-10 lg:grid-cols-[1.05fr,0.95fr] items-center">
            <div className="order-2 lg:order-1 space-y-5 text-[15px] sm:text-lg leading-relaxed font-sans text-center max-w-2xl mx-auto tracking-[0.01em]">
              <p>
                Dover Designs crafts one-of-a-kind shell art for curated interiors, pairing natural shells with hand-applied finishes to bring calm, warm elegance into modern living spaces.
              </p>
              <p>
                Inspired by shoreline textures and timeless design, each commission or limited collection is created with balance, intention, and a gallery-worthy finish meant to live beautifully for years.
              </p>
              <p>
                From bespoke statements to cohesive sets, every piece is designed to layer effortlessly with heirloom objects and modern furnishings alike—quiet luxury that feels personal, collected, and enduring.
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

      <section className="py-16 sm:py-20 bg-transparent">
        <div className="w-full max-w-[92vw] sm:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="rounded-shell-lg border border-driftwood/60 bg-white/85 shadow-sm">
            <div className="p-6 sm:p-8">
              <ContactForm backgroundColor="transparent" variant="embedded" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
