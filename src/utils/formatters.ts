export function formatPKR(amount: number): string {
  return `Rs. ${new Intl.NumberFormat('en-PK').format(Math.round(amount))}`;
}

export function formatPKRUrdu(amount: number): string {
  return `${new Intl.NumberFormat('ur-PK').format(Math.round(amount))} روپے`;
}

export function formatPakistaniPhone(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('03')) {
    return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  }
  if (digits.length === 12 && digits.startsWith('923')) {
    return `+92 ${digits.slice(2, 5)} ${digits.slice(5)}`;
  }
  return phone;
}

export function cleanPhoneForWhatsapp(phone: string): string {
  let cleaned = phone.replace(/[\s\-\(\)\+]/g, '');
  if (cleaned.startsWith('03')) {
    cleaned = '92' + cleaned.slice(1);
  }
  return cleaned;
}
