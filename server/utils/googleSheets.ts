export interface SheetOrderPayload {
  orderId: string;
  customerName: string;
  phone: string;
  whatsapp?: string | null;
  city: string;
  address: string;
  deliveryInstructions?: string | null;
  variantName: string;
  quantity: number;
  unitPrice: number;
  deliveryCharge: number;
  discount: number;
  total: number;
  paymentMethod: string;
  transactionId?: string | null;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
}

export async function sendOrderToGoogleSheets(
  webhookUrl: string | undefined | null,
  orderData: SheetOrderPayload
): Promise<boolean> {
  if (!webhookUrl || !webhookUrl.trim() || !webhookUrl.startsWith('http')) {
    return false;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1200); // 1.2s timeout

  try {
    const res = await fetch(webhookUrl.trim(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return res.ok;
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('Google Sheets webhook skipped or timed out:', err);
    return false;
  }
}
