import { Order, StoreSettings } from '../types';
import { formatPKR } from './formatters';

export function generateReceiptCanvas(order: Order, settings?: StoreSettings | null): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Set high resolution for crisp rendering
  const width = 800;
  const height = 1100;
  canvas.width = width;
  canvas.height = height;

  // Background - Warm Cream
  ctx.fillStyle = '#FAF7F2';
  ctx.fillRect(0, 0, width, height);

  // Outer Border & Header Banner
  ctx.strokeStyle = '#D4A373';
  ctx.lineWidth = 4;
  ctx.strokeRect(24, 24, width - 48, height - 48);

  // Header Banner Background
  ctx.fillStyle = '#2C1E14';
  ctx.fillRect(24, 24, width - 48, 140);

  // Header Typography
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 28px "Playfair Display", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(settings?.storeName || 'SHAHI GURR CO.', width / 2, 75);

  ctx.fillStyle = '#D4A373';
  ctx.font = '20px "Noto Nastaliq Urdu", serif';
  ctx.fillText(settings?.urduStoreName || 'شاہی گُڑ — پریمیم روایتی گُڑ', width / 2, 115);

  ctx.fillStyle = '#E6CCB2';
  ctx.font = '14px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('OFFICIAL ORDER RECEIPT & INVOICE', width / 2, 145);

  // Order Information Card
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(50, 190, width - 100, 100);
  ctx.strokeStyle = '#E6CCB2';
  ctx.lineWidth = 1;
  ctx.strokeRect(50, 190, width - 100, 100);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#8F5E2B';
  ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('ORDER NUMBER:', 70, 225);
  ctx.fillText('DATE & TIME:', 70, 260);

  ctx.fillStyle = '#2C1E14';
  ctx.font = 'bold 18px monospace';
  ctx.fillText(order.orderId, 220, 225);

  ctx.font = '14px "Plus Jakarta Sans", sans-serif';
  const orderDate = new Date(order.createdAt).toLocaleString('en-PK', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  ctx.fillText(orderDate, 220, 260);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#8F5E2B';
  ctx.font = 'bold 14px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('PAYMENT METHOD:', width - 240, 225);
  ctx.fillText('ORDER STATUS:', width - 240, 260);

  ctx.fillStyle = '#2C1E14';
  ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(order.paymentMethod.toUpperCase(), width - 70, 225);
  ctx.fillText(order.orderStatus.toUpperCase(), width - 70, 260);

  // Customer Information Box
  ctx.fillStyle = '#F4EBE1';
  ctx.fillRect(50, 310, width - 100, 130);
  ctx.strokeStyle = '#E6CCB2';
  ctx.strokeRect(50, 310, width - 100, 130);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#2C1E14';
  ctx.font = 'bold 16px "Playfair Display", Georgia, serif';
  ctx.fillText('DELIVER TO:', 70, 340);

  ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(order.customerName, 70, 370);

  ctx.font = '14px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#5C4033';
  ctx.fillText(`Phone: ${order.phone} ${order.whatsapp ? `| WhatsApp: ${order.whatsapp}` : ''}`, 70, 395);
  ctx.fillText(`Address: ${order.address}, ${order.city}`, 70, 420);

  // Itemized Product Table Header
  const tableY = 465;
  ctx.fillStyle = '#2C1E14';
  ctx.fillRect(50, tableY, width - 100, 40);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 14px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('ITEM / PACKAGING', 70, tableY + 25);
  ctx.textAlign = 'center';
  ctx.fillText('QTY', width - 280, tableY + 25);
  ctx.fillText('PRICE', width - 190, tableY + 25);
  ctx.textAlign = 'right';
  ctx.fillText('SUBTOTAL', width - 70, tableY + 25);

  // Table Row
  const rowY = tableY + 65;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(50, tableY + 40, width - 100, 60);
  ctx.strokeStyle = '#E6CCB2';
  ctx.strokeRect(50, tableY + 40, width - 100, 60);

  ctx.fillStyle = '#2C1E14';
  ctx.textAlign = 'left';
  ctx.font = 'bold 15px "Playfair Display", serif';
  ctx.fillText(order.variantName || 'Premium Natural Gurr with Nuts', 70, rowY + 5);
  ctx.font = '12px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#8F5E2B';
  ctx.fillText('100% Pure Sugarcane Jaggery with Roasted Cashews & Seeds', 70, rowY + 25);

  ctx.fillStyle = '#2C1E14';
  ctx.textAlign = 'center';
  ctx.font = '15px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(String(order.quantity), width - 280, rowY + 12);
  ctx.fillText(formatPKR(order.unitPrice), width - 190, rowY + 12);

  ctx.textAlign = 'right';
  ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(formatPKR(order.subtotal), width - 70, rowY + 12);

  // Financial Breakdown
  const sumY = 590;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(width - 380, sumY, 330, 160);
  ctx.strokeStyle = '#E6CCB2';
  ctx.strokeRect(width - 380, sumY, 330, 160);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#5C4033';
  ctx.font = '14px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Items Subtotal:', width - 360, sumY + 30);
  ctx.fillText('Delivery Charges:', width - 360, sumY + 65);
  ctx.fillText('Special Discount:', width - 360, sumY + 100);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#2C1E14';
  ctx.fillText(formatPKR(order.subtotal), width - 70, sumY + 30);
  ctx.fillText(order.deliveryCharge === 0 ? 'FREE' : formatPKR(order.deliveryCharge), width - 70, sumY + 65);
  ctx.fillText(`- ${formatPKR(order.discount)}`, width - 70, sumY + 100);

  // Divider inside summary
  ctx.strokeStyle = '#2C1E14';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(width - 360, sumY + 115);
  ctx.lineTo(width - 70, sumY + 115);
  ctx.stroke();

  // Grand Total Line
  ctx.fillStyle = '#2C1E14';
  ctx.textAlign = 'left';
  ctx.font = 'bold 17px "Playfair Display", Georgia, serif';
  ctx.fillText('TOTAL PAYABLE:', width - 360, sumY + 145);

  ctx.textAlign = 'right';
  ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#8F5E2B';
  ctx.fillText(formatPKR(order.total), width - 70, sumY + 145);

  // Digital Payment / Transaction Note
  if (order.transactionId) {
    ctx.fillStyle = '#E9F5ED';
    ctx.fillRect(50, 770, width - 100, 50);
    ctx.strokeStyle = '#2E7D32';
    ctx.strokeRect(50, 770, width - 100, 50);
    ctx.fillStyle = '#1B5E20';
    ctx.textAlign = 'center';
    ctx.font = 'bold 14px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`Payment Transaction ID (TID): ${order.transactionId} - Verified`, width / 2, 800);
  }

  // Footer Note & Quality Seal
  ctx.fillStyle = '#FAF7F2';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#5C4033';
  ctx.font = 'italic 14px "Playfair Display", serif';
  ctx.fillText('Thank you for choosing authentic Pakistani heritage & traditional sweetness.', width / 2, 920);

  ctx.font = '13px "Noto Nastaliq Urdu", serif';
  ctx.fillText('خیبر گُڑ کو منتخب کرنے کا شکریہ — روایتی دیسی مٹھاس', width / 2, 955);

  ctx.fillStyle = '#8F5E2B';
  ctx.font = '12px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`For customer support or parcel inquiries: WhatsApp +${settings?.whatsappNumber || '923001234567'}`, width / 2, 995);
  ctx.fillText(`Track your order live at any time with Order ID: ${order.orderId}`, width / 2, 1020);

  return canvas;
}

export function downloadReceiptPng(order: Order, settings?: StoreSettings | null): void {
  const canvas = generateReceiptCanvas(order, settings);
  const link = document.createElement('a');
  link.download = `Receipt-${order.orderId}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
