import { ContactForm } from '../components/ContactForm';

export default function HomeTemplate() {
  return (
    <div className="bg-white text-slate-900">
      <section id="hero" className="border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-xl font-semibold text-slate-800">
            Hero goes here
          </div>
        </div>
      </section>

      <section id="services" className="border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-xl font-semibold text-slate-800">
            Services / Products goes here
          </div>
        </div>
      </section>

      <section id="other" className="border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-xl font-semibold text-slate-800">
            Other section goes here
          </div>
        </div>
      </section>

      <section id="social" className="border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-xl font-semibold text-slate-800">
            Social media goes here
          </div>
        </div>
      </section>

      <section id="contact" className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="mb-6 text-xl font-semibold text-slate-800">Contact</div>
          <ContactForm backgroundColor="#f8fafc" variant="embedded" />
        </div>
      </section>
    </div>
  );
}
