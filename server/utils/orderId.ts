import { prisma } from '../db.js';

export async function generateUniqueOrderId(): Promise<string> {
  let isUnique = false;
  let orderId = '';

  while (!isUnique) {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    orderId = `ORDER-${randomNum}`;

    const existing = await prisma.order.findUnique({
      where: { orderId },
      select: { id: true },
    });

    if (!existing) {
      isUnique = true;
    }
  }

  return orderId;
}
