import { MetadataRoute } from 'next';
import { fetchTFTData } from '@/lib/tft-api';
import { GUIDES } from '@/lib/guides-data';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://tftchess.com';

  const guideRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/guides`, priority: 0.85, changeFrequency: 'weekly' as const },
    ...GUIDES.map(g => ({
      url: `${base}/guides/${g.slug}`,
      priority: 0.8,
      changeFrequency: 'monthly' as const,
    })),
  ];

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base,                priority: 1.0,  changeFrequency: 'daily'   },
    { url: `${base}/champions`, priority: 0.9,  changeFrequency: 'weekly'  },
    { url: `${base}/decks`,     priority: 0.9,  changeFrequency: 'weekly'  },
    { url: `${base}/meta`,      priority: 0.8,  changeFrequency: 'daily'   },
    { url: `${base}/items`,     priority: 0.8,  changeFrequency: 'weekly'  },
    ...guideRoutes,
    { url: `${base}/about`,     priority: 0.4,  changeFrequency: 'monthly' },
    { url: `${base}/privacy`,   priority: 0.3,  changeFrequency: 'monthly' },
    { url: `${base}/contact`,   priority: 0.3,  changeFrequency: 'monthly' },
  ];

  try {
    const { champions } = await fetchTFTData();
    const champRoutes: MetadataRoute.Sitemap = champions.map(c => ({
      url: `${base}/champions/${encodeURIComponent(c.name)}`,
      priority: 0.7,
      changeFrequency: 'weekly' as const,
    }));
    return [...staticRoutes, ...champRoutes];
  } catch {
    return staticRoutes;
  }
}
