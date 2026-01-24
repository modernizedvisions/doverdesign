import { useEffect, useState } from 'react';
import { getPublicSiteContentHome } from '../lib/api';
import type { HomeSiteContent } from '../lib/types';
import HomeTemplate from './HomeTemplate';

export function HomePage() {
  const [heroImageUrl, setHeroImageUrl] = useState<string | undefined>(undefined);
  const [galleryImageUrls, setGalleryImageUrls] = useState<string[]>([]);

  useEffect(() => {
    loadHomeContent();
  }, []);

  const loadHomeContent = async () => {
    try {
      const content = await getPublicSiteContentHome();
      const normalized = normalizeHomeContent(content || {});
      setHeroImageUrl(normalized.heroImageUrl);
      setGalleryImageUrls(normalized.galleryImageUrls);
    } catch (error) {
      console.error('Error loading home content:', error);
    }
  };

  return (
    <HomeTemplate
      heroImageUrl={heroImageUrl}
      galleryImageUrls={galleryImageUrls}
      primaryCtaHref="/shop"
      secondaryCtaHref="#contact"
    />
  );
}

function normalizeHomeContent(content: HomeSiteContent) {
  const heroSlots = content?.heroImages || {};
  const heroCandidates = [heroSlots.left, heroSlots.middle, heroSlots.right]
    .map((value) => (typeof value === 'string' ? value.trim() : ''))
    .filter((value) => value && !value.startsWith('blob:') && !value.startsWith('data:'));
  const heroImageUrl = heroCandidates[0] || undefined;

  const galleryImageUrls = Array.isArray(content.customOrderImages)
    ? content.customOrderImages
        .map((value) => (typeof value === 'string' ? value.trim() : ''))
        .filter((value) => value && !value.startsWith('blob:') && !value.startsWith('data:'))
        .slice(0, 12)
    : [];

  return { heroImageUrl, galleryImageUrls };
}
