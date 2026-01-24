import { ContactForm } from '../components/ContactForm';

export function AboutPage() {
  return (
    <div className="bg-white">
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-8">About the Artist</h1>

          <div className="grid gap-10 lg:grid-cols-2 items-start lg:items-stretch">
            <div className="space-y-5 lg:space-y-0 font-serif text-gray-700 order-2 lg:order-1 lg:flex lg:flex-col lg:justify-between lg:h-full lg:py-1 lg:text-[17px] lg:leading-relaxed">
              <p className="m-0">
                Hi, I'm so glad you're here! I'm a 36-year-old Eastern Shore native, born and raised in Salisbury,
                Maryland. Growing up surrounded by the water, shells, and coastal charm sparked a love for all things
                beach-inspired that never left me.
              </p>
              <p className="m-0">
                By day, I work in healthcare and have for the past 18 years. Helping others has always been a big part
                of who I am, but creating shell art gives me a creative escape and a chance to slow down and recharge.
              </p>
              <p className="m-0">
                I am a proud wife and mom to two young children, ages 3 and 5, who keep life busy and full of love.
                Between work, family, and everyday life, my art is something I truly do for joy. Every piece is made
                with care and inspired by the shoreline I grew up loving.
              </p>
              <p className="m-0">
                Thank you for being here and for supporting my passion. It means the world, and I hope each shell brings
                a bit of happiness and coastal charm into your life.
              </p>
            </div>

            <div className="w-full order-1 lg:order-2 lg:flex lg:h-full lg:items-stretch">
              {/* Artist photo — replace src when image is provided */}
              <div className="aspect-[4/5] w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                <img
                  src="https://files.reimage.dev/modernizedvisions/c7140492d93f/original"
                  alt="Artist portrait"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <ContactForm backgroundColor="#ffffff" />
    </div>
  );
}


