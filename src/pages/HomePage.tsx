import { useEffect, useMemo, useState } from 'react';
import { fetchCategories, fetchShopCategoryTiles, getPublicSiteContentHome } from '../lib/api';
import { Category, CustomOrdersImage, HeroCollageImage, HomeSiteContent, ShopCategoryTile } from '../lib/types';
import { ContactForm } from '../components/ContactForm';
import { Link } from 'react-router-dom';
import HomeHero from '../components/HomeHero';
import { TikTokEmbed } from '../components/TikTokEmbed';
import { WaveDivider } from '../components/WaveDivider';
import { ProgressiveImage } from '../components/ui/ProgressiveImage';

function TikTokProfileCard() {
  return (
    <a
      href="https://www.tiktok.com/@thechesapeakeshell"
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center justify-between gap-3 rounded-2xl rounded-ui bg-black px-4 py-3 md:px-5 md:py-3.5 shadow-md hover:shadow-lg hover:opacity-95 transition"
    >
      <div className="flex items-center gap-3">
        <div className="relative h-8 w-8 rounded-full overflow-hidden bg-slate-800">
          <img
            src="/images/logo-circle.png"
            alt="The Chesapeake Shell"
            className="absolute inset-0 h-full w-full object-cover"
            decoding="async"
          />
        </div>
        <div className="flex flex-col leading-tight text-left">
          <span className="text-sm font-semibold text-white">TheChesapeakeShell</span>
          <span className="text-xs text-slate-300">@thechesapeakeshell</span>
        </div>
      </div>
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10">
        <span className="text-white text-base">♪</span>
      </div>
    </a>
  );
}

function InstagramProfileCard() {
  return (
    <a
      href="https://www.instagram.com/thechesapeakeshell"
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center justify-between gap-3 rounded-2xl rounded-ui bg-white px-4 py-3 md:px-5 md:py-3.5 shadow-md border border-slate-200 hover:shadow-lg hover:bg-slate-50 transition"
    >
      <div className="flex items-center gap-3">
        <div className="relative h-8 w-8 rounded-full overflow-hidden bg-slate-200">
          <img
            src="/images/logo-circle.png"
            alt="The Chesapeake Shell"
            className="absolute inset-0 h-full w-full object-cover"
            decoding="async"
          />
        </div>
        <div className="flex flex-col leading-tight text-left">
          <span className="text-sm font-semibold text-slate-900">TheChesapeakeShell</span>
          <span className="text-xs text-slate-500">@thechesapeakeshell</span>
        </div>
      </div>
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500">
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/90">
          <div className="relative h-3.5 w-3.5 rounded-lg border border-slate-700">
            <div className="absolute inset-[3px] rounded-full border border-slate-700" />
            <div className="absolute right-[2px] top-[2px] h-1 w-1 rounded-full bg-slate-700" />
          </div>
        </div>
      </div>
    </a>
  );
}

const fallbackCustomShellImages: CustomOrdersImage[] = [
  { imageUrl: '/images/custom-1.jpg', alt: 'Custom hand-painted oyster shell gift' },
  { imageUrl: '/images/custom-2.jpg', alt: 'Coastal oyster shell with bespoke colors' },
  { imageUrl: '/images/custom-3.jpg', alt: 'Personalized oyster shell keepsake' },
  { imageUrl: '/images/custom-4.jpg', alt: 'Custom decoupage oyster shell art' },
];

const customShellCards = [
  {
    title: 'Something Just for You',
    body: 'Have a favorite color palette, pattern, or idea? Share your inspiration and we’ll design a shell that feels like it was made just for you.',
  },
  {
    title: 'Weddings & Bridesmaids',
    body: 'Custom sets for bridesmaids, place settings, or coastal wedding favors — we can match colors, names, and dates to your day.',
  },
  {
    title: 'Names, Dates & Initials',
    body: 'Add a meaningful touch with initials, important dates, or short phrases that turn each shell into a keepsake.',
  },
  {
    title: 'Events, Clients & Host Gifts',
    body: 'Perfect for client thank-yous, host gifts, or small event favors when you want something more thoughtful than a standard gift card.',
  },
];

export function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tiles, setTiles] = useState<ShopCategoryTile[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingTiles, setIsLoadingTiles] = useState(true);
  const [homeContent, setHomeContent] = useState<HomeSiteContent | null>(null);
  const [customOrderImages, setCustomOrderImages] = useState<CustomOrdersImage[]>([]);
  const [heroImages, setHeroImages] = useState<HeroCollageImage[]>([]);
  const [heroRotationEnabled, setHeroRotationEnabled] = useState(false);

  useEffect(() => {
    loadCategories();
    loadTiles();
    loadHeroImages();
  }, []);

  const loadCategories = async () => {
    try {
      const loaded = await fetchCategories();
      setCategories(Array.isArray(loaded) ? loaded : []);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const loadTiles = async () => {
    try {
      const loaded = await fetchShopCategoryTiles();
      setTiles(Array.isArray(loaded) ? loaded : []);
    } catch (error) {
      console.error('Error loading category tiles:', error);
    } finally {
      setIsLoadingTiles(false);
    }
  };

  const loadHeroImages = async () => {
    try {
      const content = await getPublicSiteContentHome();
      setHomeContent(content || {});
      const { hero, customOrders, rotation } = normalizeHomeContent(content);
      setCustomOrderImages(customOrders);
      setHeroImages(hero);
      setHeroRotationEnabled(rotation);
      if (import.meta.env.DEV) {
        console.debug('[home hero] site content', {
          heroCount: hero.length,
          heroUrls: hero.map((img) => img?.imageUrl || ''),
          rotation,
        });
      }
    } catch (error) {
      console.error('Error loading hero images:', error);
    } finally {
      // Even on failure we want to unblock the UI and let fallbacks render.
    }
  };

  const orderedTiles = useMemo(() => {
    if (!tiles?.length) return [];
    return [...tiles]
      .map((tile, index) => ({
        ...tile,
        slotIndex: tile.slotIndex ?? index,
        __index: index,
      }))
      .sort((a, b) => (a.slotIndex ?? a.__index) - (b.slotIndex ?? b.__index));
  }, [tiles]);

  const contentSlots = useMemo(() => {
    const slots = homeContent?.shopCategoryCards;
    if (!Array.isArray(slots) || !slots.length) return [];
    return [...slots]
      .map((slot, index) => ({
        ...slot,
        slotIndex: typeof slot.slotIndex === 'number' ? slot.slotIndex : index,
      }))
      .sort((a, b) => (a.slotIndex ?? 0) - (b.slotIndex ?? 0))
      .slice(0, 4);
  }, [homeContent]);

  const categoryById = useMemo(() => new Map(categories.map((cat) => [cat.id, cat])), [categories]);
  const categoryBySlug = useMemo(
    () => new Map(categories.map((cat) => [(cat.slug || '').toLowerCase(), cat])),
    [categories]
  );

  const pickImage = (...values: Array<string | undefined | null>) => {
    for (const value of values) {
      if (typeof value === 'string' && value.trim().length) return value;
    }
    return '/images/category-placeholder.jpg';
  };

  const featuredCards = (contentSlots.length ? contentSlots : orderedTiles)
    .map((slot, index) => {
      const category =
        (slot.categoryId ? categoryById.get(slot.categoryId) : undefined) ||
        (slot.categorySlug ? categoryBySlug.get(slot.categorySlug.toLowerCase()) : undefined);
      const slug = category?.slug || slot.categorySlug || '';
      const label = category?.name || slot.label || `Category ${index + 1}`;
      const image = pickImage(category?.heroImageUrl, category?.imageUrl);
      const tile: ShopCategoryTile = {
        id: (slot as ShopCategoryTile).id || slot.categoryId || slot.categorySlug || `slot-${index + 1}`,
        label: slot.label || '',
        ctaLabel: slot.ctaLabel || '',
        categorySlug: slot.categorySlug || '',
        imageUrl: '',
        slotIndex: slot.slotIndex ?? index,
        categoryId: slot.categoryId,
      };

      if (!slug || !label) return null;

      return {
        slot: slot.slotIndex ?? 0,
        category,
        tile,
        slug,
        label,
        image,
      };
    })
    .filter(Boolean)
    .slice(0, 4) as {
    slot: number;
    category?: Category;
    tile: ShopCategoryTile;
    slug: string;
    label: string;
    image: string;
  }[];

  const customImagesToShow = customOrderImages.length ? customOrderImages : fallbackCustomShellImages;
  const contactBg = '#C0CBD8';

  return (
    <div className="bg-white">
      <HomeHero heroImages={heroImages} heroRotationEnabled={heroRotationEnabled} />

      <section className="pt-0 pb-16 bg-white" data-testid="section-hero-shop">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-16">
            <h2 className="text-3xl font-serif font-semibold text-gray-900 mb-8 text-center">
              SHOP THE COLLECTION
            </h2>

          {isLoadingCategories || isLoadingTiles ? (
            <div className="text-center py-12">
              <p className="text-gray-500 font-sans">Loading categories...</p>
            </div>
          ) : featuredCards.length ? (
            <>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {featuredCards.map(({ category, tile, slot, image, slug, label }) => {
                  return (
                    <div
                      key={`${slug || category?.id || tile.id || slot}`}
                      className="group flex flex-col items-center"
                    >
                      <Link
                        to={`/shop?type=${encodeURIComponent(slug || tile.categorySlug || '')}`}
                        className="block w-full overflow-hidden shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                      >
                        <div className="aspect-[4/5] sm:aspect-square w-full bg-white border border-gray-200">
                          {image ? (
                            <ProgressiveImage
                              src={image}
                              alt={label}
                              className="h-full w-full"
                              imgClassName="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              decoding="async"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">
                              Image
                            </div>
                          )}
                        </div>
                      </Link>

                      <Link
                        to={`/shop?type=${encodeURIComponent(slug || tile.categorySlug || '')}`}
                        className="mt-3 inline-flex items-center rounded-full rounded-ui border border-slate-300 bg-white/70 px-6 py-2 text-sm font-medium font-serif text-slate-900 shadow-sm transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 focus:ring-offset-white/70"
                      >
                        {`Shop ${label}`}
                      </Link>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-center mt-10">
                <Link
                  to="/shop"
                  className="inline-flex items-center justify-center rounded-full rounded-ui px-8 py-3 text-base font-medium font-serif text-white shadow-md transition hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                  style={{ backgroundColor: '#000000' }}
                >
                  Explore the Whole Collection
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 font-sans">No categories available yet.</p>
            </div>
          )}
        </div>
      </section>

      <section className="w-full py-16 md:py-20 bg-white" data-testid="section-custom-orders">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-900">CUSTOM ORDERS</h2>
            <p className="mt-3 text-sm md:text-base text-slate-600 max-w-2xl mx-auto font-serif subtitle-text">
              Have something specific in mind? From wedding parties to special dates and colors, I’m happy to create custom oyster shell pieces that feel personal to you — or to someone you love.
            </p>
          </div>

          <div className="flex flex-col gap-8 md:flex-row md:items-stretch">
            <div className="flex-1">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {customImagesToShow.map((img, idx) => (
                  <div
                    key={idx}
                    className="overflow-hidden rounded-2xl shadow-md border border-slate-100"
                  >
                    <div className="relative aspect-[4/5] sm:aspect-square bg-slate-100">
                      <ProgressiveImage
                        src={img.imageUrl}
                        alt={img.alt || 'Custom hand-painted oyster shell art'}
                        className="absolute inset-0"
                        imgClassName="h-full w-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full flex-1 max-w-none md:max-w-xl md:ml-8">
              <div className="w-full space-y-4 md:space-y-0 md:grid md:grid-rows-4 md:h-full md:gap-3">
                {customShellCards.map((card) => (
                  <div
                    key={card.title}
                    className="rounded-md custom-order-card bg-white text-slate-900 shadow-md md:shadow-lg p-5 md:p-5 md:h-full md:flex md:flex-col md:justify-center border border-slate-200 transition-transform hover:-translate-y-1 hover:shadow-xl"
                    data-testid="custom-order-card"
                  >
                    <h3 className="text-sm md:text-base font-semibold text-slate-900 mb-2">
                      {card.title}
                    </h3>
                    <p className="text-sm md:text-[15px] text-slate-600 leading-relaxed">
                      {card.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-10">
            <Link
              to="/custom-orders"
              className="inline-flex items-center justify-center rounded-full rounded-ui bg-slate-900 px-5 py-2.5 text-sm font-medium font-serif text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 focus:ring-offset-white/70"
            >
              Start a Custom Order
            </Link>
          </div>
        </div>
      </section>

      <section className="w-full py-16 md:py-20 bg-white" data-testid="section-follow">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-900">FOLLOW ALONG</h2>
            <p className="mt-3 text-sm md:text-base text-slate-600 max-w-xl mx-auto font-serif subtitle-text">
              See new pieces and find out where I’ll be for craft shows and pop-ups — follow on social to stay up to date.
            </p>
          </div>

          <div className="flex flex-row items-center justify-center gap-6 mb-10 flex-wrap">
            <a
              href="https://instagram.com/thechesapeakeshell"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white border border-slate-200 shadow-md rounded-xl rounded-ui px-6 py-3 hover:opacity-90 transition"
            >
              <img
                src="https://files.reimage.dev/modernizedvisions/d8f83b8f2c6e/original"
                alt="Instagram Icon"
                className="w-8 h-8 rounded-full object-cover"
                decoding="async"
              />
              <div className="flex flex-col">
                <span className="font-semibold text-slate-800">TheChesapeakeShell</span>
                <span className="text-sm text-slate-500">@thechesapeakeshell</span>
              </div>
            </a>

            <a
              href="https://www.tiktok.com/@thechesapeakeshell"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-black text-white shadow-md rounded-xl rounded-ui px-6 py-3 hover:opacity-90 transition"
            >
              <img
                src="https://files.reimage.dev/modernizedvisions/e5eaa1654c4f/original"
                alt="TikTok Icon"
                className="w-8 h-8 rounded-full object-cover"
                decoding="async"
              />
              <div className="flex flex-col">
                <span className="font-semibold">TheChesapeakeShell</span>
                <span className="text-sm text-gray-300">@thechesapeakeshell</span>
              </div>
            </a>
          </div>

          <div className="mb-10 flex justify-center">
            <div className="w-full max-w-4xl">
              <TikTokEmbed
                videoId="7582267436842487070"
                citeUrl="https://www.tiktok.com/@thechesapeakeshell/video/7582267436842487070"
              />
            </div>
          </div>
        </div>
      </section>

      <div
        className="w-full leading-[0] m-0 p-0 overflow-hidden -mb-px"
        style={{ backgroundColor: '#ffffff' }}
        data-testid="divider-contact-follow"
      >
        <WaveDivider
          direction="down"
          fill={contactBg}
          className="block"
          dataTestId="divider-contact-follow"
        />
      </div>

      <div className="-mt-px">
        <ContactForm backgroundColor={contactBg} variant="embedded" />
      </div>
    </div>
  );
}

function normalizeHomeContent(content: HomeSiteContent) {
  const heroSlots = content?.heroImages || {};
  const slotOrder: Array<{ key: 'left' | 'middle' | 'right'; id: string }> = [
    { key: 'left', id: 'hero-left' },
    { key: 'middle', id: 'hero-middle' },
    { key: 'right', id: 'hero-right' },
  ];

  const hero: HeroCollageImage[] = slotOrder
    .map(({ key, id }) => ({
      id,
      imageUrl: (heroSlots as Record<string, string | undefined>)[key] || '',
    }))
    .filter((img) => {
      if (!img.imageUrl) return false;
      const trimmed = img.imageUrl.trim();
      if (!trimmed) return false;
      return !trimmed.startsWith('blob:') && !trimmed.startsWith('data:');
    })
    .map((img) => ({ ...img, imageUrl: img.imageUrl.trim() }));

  const customOrders = Array.isArray(content.customOrderImages)
    ? content.customOrderImages.slice(0, 4).map((url) => ({ imageUrl: url }))
    : [];

  return { hero, customOrders, rotation: !!content.heroRotationEnabled };
}


