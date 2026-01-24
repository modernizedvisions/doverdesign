import { ShoppingCart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Product } from '../lib/types';
import { useCartStore } from '../store/cartStore';
import { useUIStore } from '../store/uiStore';
import { ProgressiveImage } from './ui/ProgressiveImage';
import { buildOptimizedImageSrc } from '../lib/imageOptimize';
import { getDiscountedCents, isPromotionEligible, usePromotions } from '../lib/promotions';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const qtyInCart = useCartStore((state) => {
    const found = state.items.find((i) => i.productId === product.id);
    return found?.quantity ?? 0;
  });
  const isOneOffInCart = useCartStore((state) => state.isOneOffInCart);
  const setCartDrawerOpen = useUIStore((state) => state.setCartDrawerOpen);
  const navigate = useNavigate();
  const { promotion } = usePromotions();

  const inCart = qtyInCart > 0;
  const maxQty = product.quantityAvailable ?? null;
  const isAtMax = maxQty !== null && qtyInCart >= maxQty;
  const isDisabled = (product.oneoff && inCart) || (maxQty !== null && qtyInCart >= maxQty);
  const isSold = product.isSold || (product.quantityAvailable !== undefined && product.quantityAvailable <= 0);
  const isPurchaseReady = !!product.priceCents && !isSold;
  const rawSrc = product.imageUrl || product.imageUrls?.[0] || '';
  const { primarySrc, fallbackSrc } = buildOptimizedImageSrc(rawSrc, 'thumb');

  const handleAddToCart = () => {
    if (!product.priceCents || isSold) return;
    if (product.oneoff && isOneOffInCart(product.id)) return;
    if (maxQty !== null && qtyInCart >= maxQty) {
      if (typeof window !== 'undefined') {
        alert(`Only ${maxQty} available.`);
      }
      return;
    }

    addItem({
      productId: product.id,
      name: product.name,
      priceCents: product.priceCents,
      quantity: 1,
      imageUrl: product.thumbnailUrl || product.imageUrl,
      oneoff: product.oneoff,
      quantityAvailable: product.quantityAvailable ?? null,
      stripeProductId: product.stripeProductId ?? null,
      stripePriceId: product.stripePriceId ?? null,
      category: product.category ?? null,
      categories: product.categories ?? null,
    });
    setCartDrawerOpen(true);
  };

  const basePriceCents = product.priceCents ?? null;
  const promoEligible = isPromotionEligible(promotion, product);
  const discountedCents =
    basePriceCents !== null && promoEligible && promotion
      ? getDiscountedCents(basePriceCents, promotion.percentOff)
      : basePriceCents;
  const priceLabel = basePriceCents !== null ? `$${(basePriceCents / 100).toFixed(2)}` : '';
  const discountedLabel =
    discountedCents !== null ? `$${(discountedCents / 100).toFixed(2)}` : '';

  const productHref = `/product/${product.id}`;

  return (
    <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {product.oneoff && inCart && (
          <span className="absolute top-3 right-3 z-10 rounded-full bg-white/90 text-slate-900 border border-slate-200 px-2.5 py-1 text-xs font-medium shadow-sm backdrop-blur">
            In Your Cart
          </span>
        )}
        <Link
          to={productHref}
          aria-label={`View ${product.name}`}
          className="block h-full w-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          {rawSrc ? (
            <ProgressiveImage
              src={primarySrc}
              fallbackSrc={fallbackSrc}
              timeoutMs={2500}
              alt={product.name}
              className="h-full w-full"
              imgClassName="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-400">
              No image
            </div>
          )}
        </Link>
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h3 className="text-sm font-serif font-medium text-slate-900 truncate">{product.name}</h3>
          {promoEligible && discountedCents !== basePriceCents && basePriceCents !== null ? (
            <div className="text-right whitespace-nowrap">
              <div className="text-xs text-slate-500 line-through">{priceLabel}</div>
              <div className="text-[20px] font-serif font-medium text-slate-800">{discountedLabel}</div>
            </div>
          ) : (
            <span className="text-[20px] font-serif font-medium text-slate-800 whitespace-nowrap">{priceLabel}</span>
          )}
        </div>

        {isSold && (
          <div className="mb-2">
            <span className="inline-block px-2 py-1 bg-red-50 text-red-700 text-xs rounded">
              Sold
            </span>
          </div>
        )}

        <div className="mt-3 grid grid-cols-2 gap-0">
          <button
            onClick={() => navigate(productHref)}
            className="w-full bg-white border border-gray-300 text-gray-800 py-2 px-4 rounded-l-lg font-medium hover:border-gray-400 transition-colors"
          >
            View
          </button>
          <button
            onClick={handleAddToCart}
            disabled={isDisabled || !isPurchaseReady}
            className="inline-flex items-center justify-center bg-white border border-gray-300 py-2 px-4 rounded-r-lg font-medium hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Add to Cart"
          >
            <ShoppingCart className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
