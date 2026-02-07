import { prisma } from '@/lib/prisma';

export interface GalleryRecord {
  id: string;
  productId: string;
  fileId: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export async function getProductGallery(productId: string): Promise<GalleryRecord[]> {
  if (!productId) return [];
  return prisma.productImage.findMany({
    where: { productId },
    orderBy: { sortOrder: 'asc' },
  });
}

export async function getGalleryMap(productIds: string[]): Promise<Record<string, GalleryRecord[]>> {
  if (!productIds.length) return {};
  const rows = await prisma.productImage.findMany({
    where: { productId: { in: productIds } },
    orderBy: [
      { productId: 'asc' },
      { sortOrder: 'asc' },
      { createdAt: 'asc' },
    ],
  });

  return rows.reduce<Record<string, GalleryRecord[]>>((acc, row) => {
    if (!acc[row.productId]) acc[row.productId] = [];
    acc[row.productId].push(row);
    return acc;
  }, {});
}

export async function replaceProductGallery(productId: string, fileIds: string[]): Promise<void> {
  if (!productId) return;

  await prisma.$transaction(async (tx) => {
    await tx.productImage.deleteMany({ where: { productId } });
    if (!fileIds?.length) return;

    await tx.productImage.createMany({
      data: fileIds.map((fileId, index) => ({
        productId,
        fileId,
        sortOrder: index,
      })),
    });
  });
}

export async function deleteProductGallery(productId: string): Promise<void> {
  if (!productId) return;
  await prisma.productImage.deleteMany({ where: { productId } });
}
