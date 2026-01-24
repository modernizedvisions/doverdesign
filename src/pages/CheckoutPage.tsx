import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { loadStripe, type EmbeddedCheckout } from '@stripe/stripe-js';
import { BannerMessage } from '../components/BannerMessage';
import { createEmbeddedCheckoutSession, fetchCategories, fetchProductById } from '../lib/api';
import type { Category, Product } from '../lib/types';
import { useCartStore } from '../store/cartStore';
import { calculateShippingCents } from '../lib/shipping';
import { getCategoryKeys, getDiscountedCents, isPromotionEligible, usePromotions } from '../lib/promotions';
import type { CheckoutPromoSummary } from '../lib/payments/checkout';

const SESSION_MAX_AGE_MS = 10 * 60 * 1000;
const sessionTimestampKey = (sessionId: string) => `checkout_session_created_at_${sessionId}`;

const isExpiredSessionError = (error: unknown) => {
  const code = (error as any)?.code || (error as any)?.type;
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
      ? error
      : typeof code === 'string'
      ? code
      : '';
  if (typeof code === 'string' && code.toLowerCase().includes('expired')) return true;
  if (message && /expired/i.test(message)) return true;
  return false;
};

export function CheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const cartItems = useCartStore((state) => state.items);
  const stripeContainerRef = useRef<HTMLDivElement | null>(null);

  const [product, setProduct] = useState<Product | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMountingStripe, setIsMountingStripe] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [promoInput, setPromoInput] = useState('');
  const [promoSummary, setPromoSummary] = useState<CheckoutPromoSummary | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;
  const { promotion } = usePromotions();

  const productIdFromUrl = searchParams.get('productId');
  const fallbackCartProduct = cartItems[0]?.productId;
  const targetProductId = useMemo(() => productIdFromUrl || fallbackCartProduct || null, [productIdFromUrl, fallbackCartProduct]);

  const clearSessionTimestamp = useCallback((id: string | null) => {
    if (!id || typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(sessionTimestampKey(id));
    } catch (storageError) {
      console.warn('checkout: failed to clear session timestamp', storageError);
    }
  }, []);

  const recordSessionTimestamp = useCallback((id: string) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(sessionTimestampKey(id), String(Date.now()));
    } catch (storageError) {
      console.warn('checkout: failed to store session timestamp', storageError);
    }
  }, []);

  const hasSessionExpired = useCallback(
    (id: string) => {
      if (typeof window === 'undefined') return false;
      try {
        const stored = window.localStorage.getItem(sessionTimestampKey(id));
        if (!stored) return false;
        const createdAt = Number(stored);
        if (!createdAt) return false;
        return Date.now() - createdAt > SESSION_MAX_AGE_MS;
      } catch (storageError) {
        console.warn('checkout: failed to read session timestamp', storageError);
        return false;
      }
    },
    []
  );

  const handleStaleSession = useCallback(
    (reason: string) => {
      console.warn('checkout: session expired; redirecting', { reason, sessionId });
      if (sessionId) {
        clearSessionTimestamp(sessionId);
      }
      setClientSecret(null);
      setSessionId(null);
      setError('Your checkout session expired. Please start again.');
      navigate('/shop', { replace: true });
    },
    [clearSessionTimestamp, navigate, sessionId]
  );

  const buildSessionItems = useCallback(() => {
    if (cartItems.length) {
      return cartItems.map((ci) => ({ productId: ci.productId, quantity: ci.quantity }));
    }
    if (targetProductId) {
      return [{ productId: targetProductId, quantity: 1 }];
    }
    return [];
  }, [cartItems, targetProductId]);

  const refreshCheckoutSession = useCallback(
    async (promoCode?: string) => {
      const sessionItems = buildSessionItems();
      if (!sessionItems.length) {
        throw new Error('No products in cart.');
      }
      const session = await createEmbeddedCheckoutSession(sessionItems, promoCode);
      setClientSecret(session.clientSecret);
      setSessionId(session.sessionId);
      recordSessionTimestamp(session.sessionId);
      setPromoSummary(session.promo ?? null);
      setPromoError(null);
    },
    [buildSessionItems, recordSessionTimestamp]
  );

  const handleApplyPromo = useCallback(async () => {
    const code = promoInput.trim();
    setPromoError(null);
    setIsApplyingPromo(true);
    try {
      await refreshCheckoutSession(code || undefined);
      if (code) {
        setPromoInput(code);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to apply promo code.';
      setPromoError(message);
    } finally {
      setIsApplyingPromo(false);
    }
  }, [promoInput, refreshCheckoutSession]);

  const handleClearPromo = useCallback(async () => {
    setPromoInput('');
    setPromoError(null);
    setIsApplyingPromo(true);
    try {
      await refreshCheckoutSession(undefined);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to remove promo code.';
      setPromoError(message);
    } finally {
      setIsApplyingPromo(false);
    }
  }, [refreshCheckoutSession]);

  useEffect(() => {
    let isCancelled = false;

    const load = async () => {
      if (!publishableKey) {
        console.error('VITE_STRIPE_PUBLISHABLE_KEY is missing on the client');
        setError('Stripe is not configured');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        if (cartItems.length === 0 && !targetProductId) {
          throw new Error('No products in cart.');
        }

        let displayProduct: Product | null = null;
        if (targetProductId) {
          console.log('checkout: targetProductId', targetProductId);
          const found = await fetchProductById(targetProductId);
          console.log('checkout: fetched product', found);

          if (!found) {
            throw new Error('Product not found.');
          }
          if (found.isSold) {
            throw new Error('This piece has already been sold.');
          }
          if (!found.priceCents) {
            throw new Error('This product is missing pricing details.');
          }
          if (!found.stripePriceId) {
            throw new Error('This product has no Stripe price configured.');
          }
          displayProduct = found;
        } else {
          // No single target product; use first cart item for display only.
          displayProduct = cartItems[0] as any;
        }

        if (isCancelled) return;
        setProduct(displayProduct);

        const sessionItems = cartItems.length
          ? cartItems.map((ci) => ({ productId: ci.productId, quantity: ci.quantity }))
          : targetProductId
          ? [{ productId: targetProductId, quantity: 1 }]
          : [];

        const session = await createEmbeddedCheckoutSession(sessionItems);
        console.log('checkout: session response', session);
        if (isCancelled) return;
        setClientSecret(session.clientSecret);
        setSessionId(session.sessionId);
        recordSessionTimestamp(session.sessionId);
        setPromoSummary(session.promo ?? null);
        setPromoError(null);
      } catch (err) {
        if (isCancelled) return;
        const message = err instanceof Error ? err.message : 'Unable to start checkout.';
        setError(message);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    load();
    return () => {
      isCancelled = true;
    };
  }, [cartItems, publishableKey, recordSessionTimestamp, targetProductId]);

  useEffect(() => {
    if (!clientSecret) return;
    if (!publishableKey) return;

    let checkout: EmbeddedCheckout | null = null;
    let isCancelled = false;

    const mount = async () => {
      try {
        setIsMountingStripe(true);
        const stripe = await loadStripe(publishableKey);
        if (!stripe) throw new Error('Failed to load Stripe.');

        if (isCancelled) return;

        checkout = await stripe.initEmbeddedCheckout({ clientSecret });
        checkout.mount('#embedded-checkout');
      } catch (err) {
        if (isCancelled) return;
        const message = err instanceof Error ? err.message : 'Unable to load checkout.';
        if (isExpiredSessionError(err)) {
          handleStaleSession('stripe-reported-expired');
          return;
        }
        setError(message);
      } finally {
        if (!isCancelled) setIsMountingStripe(false);
      }
    };

    mount();
    return () => {
      isCancelled = true;
      checkout?.destroy();
    };
  }, [clientSecret, handleStaleSession, publishableKey]);

  useEffect(() => {
    if (!sessionId) return;

    const checkExpiry = () => {
      if (hasSessionExpired(sessionId)) {
        handleStaleSession('age-limit');
      }
    };

    checkExpiry();
    const intervalId = window.setInterval(checkExpiry, 15000);
    return () => window.clearInterval(intervalId);
  }, [sessionId, hasSessionExpired, handleStaleSession]);

  useEffect(() => {
    const load = async () => {
      const data = await fetchCategories();
      setCategories(data);
    };
    void load();
  }, []);

  const previewItems = useMemo(() => {
    if (cartItems.length) {
        return cartItems.map((item) => ({
          id: item.productId,
          name: item.name,
          collection: (item as any).collection,
          description: (item as any).description,
          imageUrl: item.imageUrl,
          quantity: item.quantity,
          priceCents: item.priceCents,
          category: item.category ?? null,
          categories: item.categories ?? null,
        }));
    }
    if (product) {
      return [
        {
          id: product.id ?? product.stripeProductId ?? 'product',
          name: product.name,
          collection: product.collection || product.type,
          description: product.description,
          imageUrl: (product as any).thumbnailUrl || (product as any).imageUrl || null,
          quantity: 1,
          priceCents: product.priceCents ?? 0,
          category: product.category ?? null,
          categories: product.categories ?? null,
        },
      ];
    }
    return [];
  }, [cartItems, product]);

  const previewItemsWithPricing = useMemo(() => {
    return previewItems.map((item) => {
      const autoPercent = isPromotionEligible(promotion, item) ? promotion?.percentOff || 0 : 0;
      const codePercent =
        promoSummary?.codePercentOff && promoSummary.codePercentOff > 0
          ? promoSummary.codeScope === 'global'
            ? promoSummary.codePercentOff
            : promoSummary.codeScope === 'categories'
            ? getCategoryKeys(item).some((key) => promoSummary.codeCategorySlugs.includes(key))
              ? promoSummary.codePercentOff
              : 0
            : 0
          : 0;
      const appliedPercent = Math.max(autoPercent, codePercent);
      const unitPrice = getDiscountedCents(item.priceCents, appliedPercent);
      return {
        ...item,
        appliedPercent,
        unitPrice,
        lineTotal: unitPrice * (item.quantity || 1),
      };
    });
  }, [previewItems, promoSummary, promotion]);

  const subtotalCents = useMemo(
    () => previewItemsWithPricing.reduce((sum, item) => sum + item.lineTotal, 0),
    [previewItemsWithPricing]
  );

  const shippingItems = useMemo(() => {
    if (cartItems.length) return cartItems;
    if (product) {
      return [
        {
          category: product.category ?? null,
          categories: product.categories ?? null,
        },
      ];
    }
    return [];
  }, [cartItems, product]);

  const shippingCents = calculateShippingCents(shippingItems, categories);
  const effectiveShippingCents = promoSummary?.freeShippingApplied ? 0 : shippingCents;
  const totalCents = (subtotalCents || 0) + effectiveShippingCents;

  const formatMoney = (cents: number) => `$${((cents ?? 0) / 100).toFixed(2)}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <p className="text-gray-600">Preparing your checkout...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Chesapeake Shell</p>
            <h1 className="text-3xl font-bold text-gray-900">Secure Checkout</h1>
            <p className="text-gray-600 mt-1">Complete your purchase safely and securely.</p>
          </div>
          <button
            onClick={() => navigate('/shop')}
            className="bg-white border border-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium hover:border-gray-400 transition-colors"
          >
            Back to Shop
          </button>
        </div>

        {error && <BannerMessage message={error} type="error" />}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-4 space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Order Preview</p>
                <h2 className="text-base font-semibold text-gray-900">Items in your cart</h2>
              </div>

              <div className="space-y-3">
                {previewItems.length === 0 && (
                  <div className="text-sm text-gray-600">No items to display.</div>
                )}
                {previewItemsWithPricing.map((item) => (
                  <div key={`${item.id}-${item.name}`} className="flex gap-3">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name || 'Item'}
                        className="w-14 h-14 rounded-md object-cover bg-gray-100 border border-gray-100"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-md bg-gray-100 border border-gray-100" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-gray-900 truncate">{item.name || 'Item'}</p>
                        <span className="text-sm font-semibold text-gray-900">{formatMoney(item.lineTotal)}</span>
                      </div>
                      {item.collection && (
                        <p className="text-[11px] uppercase tracking-wide text-gray-500">{item.collection}</p>
                      )}
                      {item.description && (
                        <p className="text-xs text-gray-600 line-clamp-2">{item.description}</p>
                      )}
                      <div className="text-xs text-gray-500 mt-0.5 flex items-baseline gap-2">
                        <span>Qty: {item.quantity || 1}</span>
                        {item.appliedPercent > 0 ? (
                          <>
                            <span className="line-through text-slate-400">{formatMoney(item.priceCents)}</span>
                            <span className="text-slate-700">{formatMoney(item.unitPrice)}</span>
                          </>
                        ) : (
                          <span>{formatMoney(item.priceCents)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs uppercase tracking-wide text-gray-500">Promo Code</label>
                  {promoSummary?.code ? (
                    <button
                      type="button"
                      onClick={handleClearPromo}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="Enter promo code"
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm capitalize"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    disabled={isApplyingPromo || !promoInput.trim()}
                    className="px-3 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-900 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isApplyingPromo ? 'Applying...' : 'Apply'}
                  </button>
                </div>
                {promoSummary?.code ? (
                  <div className="text-xs text-slate-600">
                    Applied: <span className="font-semibold text-slate-900">{promoSummary.code.toUpperCase()}</span>
                    {promoSummary.source ? (
                      <span className="text-slate-500"> - {promoSummary.source}</span>
                    ) : null}
                  </div>
                ) : null}
                {promoError ? (
                  <div className="text-xs text-red-600">{promoError}</div>
                ) : null}
              </div>

              <div className="border-t border-gray-200 pt-3 space-y-1 text-sm">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-medium">{formatMoney(subtotalCents || 0)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span className="font-medium">{formatMoney(effectiveShippingCents)}</span>
                </div>
                {promoSummary?.percentOff ? (
                  <div className="flex justify-between text-gray-700">
                    <span>Promotion</span>
                    <span className="font-medium">{promoSummary.percentOff}% off</span>
                  </div>
                ) : null}
                {promoSummary?.freeShippingApplied ? (
                  <div className="flex justify-between text-gray-700">
                    <span>Free shipping</span>
                    <span className="font-medium">Applied</span>
                  </div>
                ) : null}
                <div className="flex justify-between pt-2 border-t border-gray-200 text-base font-semibold text-gray-900">
                  <span>Total</span>
                  <span>{formatMoney(totalCents)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Payment</h2>
                {isMountingStripe && <p className="text-sm text-gray-500">Loading Stripeâ€¦</p>}
              </div>
              <div
                id="embedded-checkout"
                ref={stripeContainerRef}
                className="rounded-lg border border-dashed border-gray-200 min-h-[360px]"
              />
              <p className="text-xs text-gray-500">
                Secure payment is handled by Stripe. Youâ€™ll receive a confirmation as soon as the purchase completes.
              </p>
            </div>
          </div>
        </div>

        {!product && !error && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center mt-6">
            <p className="text-gray-700">Select a product to begin checkout.</p>
            <Link to="/shop" className="text-gray-900 font-semibold underline">
              Back to Shop
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
