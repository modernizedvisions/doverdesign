import { useEffect } from 'react';
import { LegalPageLayout } from '../components/LegalPageLayout';

export function TermsPage() {
  useEffect(() => {
    document.title = 'Terms of Service | The Chesapeake Shell';
  }, []);

  return (
    <LegalPageLayout title="TERMS OF SERVICE" lastUpdated="January 02, 2026">
      <p>
        Welcome to The Chesapeake Shell (“we,” “us,” “our”). By accessing or using our website (the “Site”), you agree
        to these Terms of Service (the “Terms”). If you do not agree, do not use the Site.
      </p>

      <div>
        <h2 className="text-lg font-serif font-semibold text-gray-900 mb-2">1) USING THE SITE</h2>
        <p>
          You may use the Site for personal, non-commercial purposes and in accordance with these Terms. You agree not
          to misuse the Site, interfere with its operation, attempt unauthorized access, or violate any applicable laws.
        </p>
      </div>

      <div>
        <h2 className="text-lg font-serif font-semibold text-gray-900 mb-2">2) PRODUCTS, ORDERS, AND PAYMENTS</h2>
        <p>
          We offer handmade products and may offer custom orders. Prices and availability may change without notice.
          Payments are processed through third-party payment providers. We do not store full payment card details on our
          servers.
        </p>
      </div>

      <div>
        <h2 className="text-lg font-serif font-semibold text-gray-900 mb-2">3) SHIPPING AND RETURNS</h2>
        <p>
          Shipping, delivery estimates, and return policies (if any) are provided during checkout or on the Site.
          Because many items are handmade or custom, certain sales may be final unless otherwise stated. If you have an
          issue with an order, contact us and we will work with you to make it right where reasonably possible.
        </p>
      </div>

      <div>
        <h2 className="text-lg font-serif font-semibold text-gray-900 mb-2">4) CUSTOM ORDERS</h2>
        <p>
          If you request a custom order, you are responsible for providing accurate details and approvals. Handmade work
          may vary from photos, sketches, or descriptions. Unless explicitly agreed otherwise, deposits or payments for
          custom work may be non-refundable once work begins.
        </p>
      </div>

      <div>
        <h2 className="text-lg font-serif font-semibold text-gray-900 mb-2">5) USER CONTENT AND MESSAGES</h2>
        <p>
          If you submit content (such as messages, photos, or files) through our contact forms or other features, you
          grant us permission to use that content solely to respond to you, fulfill your request, provide support,
          prevent fraud/abuse, and operate our services. You represent that you have the right to submit the content.
        </p>
      </div>

      <div>
        <h2 className="text-lg font-serif font-semibold text-gray-900 mb-2">6) INTELLECTUAL PROPERTY</h2>
        <p>
          The Site, including text, photographs, designs, logos, and other content, is owned by The Chesapeake Shell or
          its licensors and is protected by intellectual property laws. You may not copy, reproduce, distribute, or
          create derivative works without permission, except for personal, non-commercial use.
        </p>
      </div>

      <div>
        <h2 className="text-lg font-serif font-semibold text-gray-900 mb-2">7) THIRD-PARTY SERVICES AND LINKS</h2>
        <p>
          The Site may rely on or link to third-party services (for example, payment processing, email delivery,
          embedded media, or analytics). We are not responsible for third-party services or their content. Your use of
          third-party services may be governed by their separate terms.
        </p>
      </div>

      <div>
        <h2 className="text-lg font-serif font-semibold text-gray-900 mb-2">8) DISCLAIMERS</h2>
        <p>
          The Site and all content are provided “as is” and “as available.” We do not guarantee that the Site will be
          uninterrupted, error-free, or secure. To the fullest extent permitted by law, we disclaim all warranties,
          express or implied.
        </p>
      </div>

      <div>
        <h2 className="text-lg font-serif font-semibold text-gray-900 mb-2">9) LIMITATION OF LIABILITY</h2>
        <p>
          To the fullest extent permitted by law, The Chesapeake Shell will not be liable for any indirect, incidental,
          consequential, special, or punitive damages, or any loss of profits or revenues, arising out of or related to
          your use of the Site or purchases made through the Site.
        </p>
      </div>

      <div>
        <h2 className="text-lg font-serif font-semibold text-gray-900 mb-2">10) INDEMNIFICATION</h2>
        <p>
          You agree to indemnify and hold harmless The Chesapeake Shell from any claims, damages, liabilities, and
          expenses (including reasonable attorneys’ fees) arising out of your misuse of the Site or your violation of
          these Terms.
        </p>
      </div>

      <div>
        <h2 className="text-lg font-serif font-semibold text-gray-900 mb-2">11) CHANGES TO THE TERMS</h2>
        <p>
          We may update these Terms from time to time. Changes become effective when posted. Your continued use of the
          Site after changes means you accept the updated Terms.
        </p>
      </div>

      <div>
        <h2 className="text-lg font-serif font-semibold text-gray-900 mb-2">12) GOVERNING LAW</h2>
        <p>
          These Terms are governed by the laws of the jurisdiction where The Chesapeake Shell operates, without regard
          to conflict of law principles.
        </p>
      </div>

      <div>
        <h2 className="text-lg font-serif font-semibold text-gray-900 mb-2">13) CONTACT</h2>
        <p>Questions about these Terms? Contact us at:</p>
        <p>Email: morgan.senofonte@gmail.com</p>
        <p>(or use the contact form on the Site)</p>
      </div>
    </LegalPageLayout>
  );
}
