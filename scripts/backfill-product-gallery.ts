import 'dotenv/config';
import { createDirectus, rest, staticToken, readItems } from '@directus/sdk';
import { prisma } from '@/lib/prisma';

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_ADMIN_TOKEN = process.env.DIRECTUS_ADMIN_TOKEN;

if (!DIRECTUS_ADMIN_TOKEN) {
  console.error('DIRECTUS_ADMIN_TOKEN is required to backfill gallery data.');
  process.exit(1);
}

const directus = createDirectus(DIRECTUS_URL).with(staticToken(DIRECTUS_ADMIN_TOKEN)).with(rest());

async function main() {
  console.log('Scanning Directus products for legacy image data...');
  const products = await directus.request(
    readItems('products', {
      fields: ['id', 'image_id', { image_id: ['id'] }] as any,
      filter: { image_id: { _nnull: true } } as any,
      limit: -1,
    })
  );

  let created = 0;
  for (const product of products as any[]) {
    const fileId =
      typeof product.image_id === 'object' ? product.image_id?.id : product.image_id;
    if (!fileId) continue;

    const hasGallery = await prisma.productImage.findFirst({
      where: { productId: product.id },
    });

    if (hasGallery) continue;

    await prisma.productImage.create({
      data: {
        productId: product.id,
        fileId,
        sortOrder: 0,
      },
    });
    created++;
  }

  console.log(`Backfill complete. Added ${created} gallery rows.`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Failed to backfill gallery data:', err);
  process.exit(1);
});
