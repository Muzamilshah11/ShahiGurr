declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
  }
}

let activePixelId: string | null = null;

/**
 * Extracts clean numeric Facebook Pixel ID even if user pasted full script snippet
 */
export function extractPixelId(input: string | undefined | null): string {
  if (!input) return '';
  const trimmed = input.trim();
  
  // If user pasted script snippet like fbq('init', '1234567890')
  const match = trimmed.match(/fbq\s*\(\s*['"]init['"]\s*,\s*['"](\d+)['"]\s*\)/);
  if (match && match[1]) {
    return match[1];
  }

  // If user pasted numeric ID directly or with spaces
  const digitsOnly = trimmed.replace(/\D/g, '');
  if (digitsOnly.length >= 8 && digitsOnly.length <= 20) {
    return digitsOnly;
  }

  return trimmed;
}

/**
 * Injects and initializes Meta / Facebook Pixel
 */
export function initFacebookPixel(pixelIdInput: string | undefined | null): void {
  const pixelId = extractPixelId(pixelIdInput);

  if (!pixelId) {
    return;
  }

  if (activePixelId === pixelId && window.fbq) {
    return;
  }

  try {
    // Official Facebook Pixel snippet
    if (!window.fbq) {
      /* eslint-disable */
      (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
        if (f.fbq) return;
        n = f.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = true;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = true;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      /* eslint-enable */
    }

    if (window.fbq) {
      window.fbq('init', pixelId);
      window.fbq('track', 'PageView');
      activePixelId = pixelId;
      console.log(`[Meta Pixel] Active & initialized with Pixel ID: ${pixelId}`);
    }
  } catch (err) {
    console.warn('[Meta Pixel] Failed to initialize pixel:', err);
  }
}

/**
 * Track generic custom or standard Facebook Pixel event
 */
export function trackPixelEvent(eventName: string, params?: Record<string, any>): void {
  if (typeof window !== 'undefined' && window.fbq) {
    try {
      if (params) {
        window.fbq('track', eventName, params);
      } else {
        window.fbq('track', eventName);
      }
      console.log(`[Meta Pixel] Tracked ${eventName}:`, params);
    } catch (e) {
      console.warn(`[Meta Pixel] Error tracking event ${eventName}:`, e);
    }
  }
}

/**
 * Track ViewContent event (product page viewed / variant inspected)
 */
export function trackPixelViewContent(params: {
  content_name: string;
  value?: number;
  currency?: string;
  content_type?: string;
  content_ids?: string[];
}): void {
  trackPixelEvent('ViewContent', {
    content_name: params.content_name,
    content_type: params.content_type || 'product',
    value: params.value || 0,
    currency: params.currency || 'PKR',
    content_ids: params.content_ids || ['shahi-gurr-default'],
  });
}

/**
 * Track InitiateCheckout event (when customer clicks Order Now or opens checkout modal)
 */
export function trackPixelInitiateCheckout(params: {
  value: number;
  currency?: string;
  num_items?: number;
  content_name?: string;
}): void {
  trackPixelEvent('InitiateCheckout', {
    value: params.value,
    currency: params.currency || 'PKR',
    num_items: params.num_items || 1,
    content_name: params.content_name || 'Shahi Gurr Order',
  });
}

/**
 * Track Purchase event (when customer successfully completes Cash on Delivery / Bank / Wallet order)
 */
export function trackPixelPurchase(params: {
  order_id: string;
  value: number;
  currency?: string;
  content_name?: string;
  num_items?: number;
  payment_method?: string;
}): void {
  trackPixelEvent('Purchase', {
    value: params.value,
    currency: params.currency || 'PKR',
    order_id: params.order_id,
    content_name: params.content_name || 'Shahi Gurr',
    num_items: params.num_items || 1,
    content_type: 'product',
    payment_method: params.payment_method || 'COD',
  });
}
