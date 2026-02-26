import { EmailListSignupSection } from '../components/email-list/EmailListSignupSection';

export function EmailListPage() {
  return (
    <section className="w-full min-h-[100svh] bg-linen text-charcoal flex items-center justify-center px-4 py-0 sm:px-6">
      <div className="w-full max-w-4xl">
        <EmailListSignupSection />
      </div>
    </section>
  );
}
