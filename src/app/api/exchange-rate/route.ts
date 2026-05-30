import { NextResponse } from 'next/server';

// GET - Fetch USD/IDR exchange rate from Bank Indonesia API
export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Try Bank Indonesia API first
    // BI JISOR ( Jakonet Information System Online ) public API
    const biUrl = `https://api.bi.go.id/api/publikasi/kurs/transaksi?dd=${today}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    let rate: number | null = null;
    let source = '';
    let rateDate = today;

    try {
      const res = await fetch(biUrl, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });

      if (res.ok) {
        const data = await res.json();
        // BI API response format: { content: [{ kurs_jual: "...", kurs_beli: "...", ... }] }
        if (data?.content && Array.isArray(data.content) && data.content.length > 0) {
          // Find USD entry
          const usdEntry = data.content.find(
            (item: Record<string, string>) => item.kode_simbol === 'USD'
          );
          if (usdEntry) {
            const jualStr = usdEntry.kurs_jual?.replace(/\./g, '').replace(',', '.');
            const beliStr = usdEntry.kurs_beli?.replace(/\./g, '').replace(',', '.');
            if (jualStr && beliStr) {
              const jual = parseFloat(jualStr);
              const beli = parseFloat(beliStr);
              // Use average of buy/sell rate
              if (!isNaN(jual) && !isNaN(beli)) {
                rate = Math.round((jual + beli) / 2);
                source = 'Bank Indonesia (Jual+Beli)/2';
              }
            }
          }
        }
      }
    } catch {
      // BI API failed, try fallback sources
    } finally {
      clearTimeout(timeout);
    }

    // Fallback: try to get from another reliable source
    if (!rate) {
      try {
        const fallbackUrl = `https://api.exchangerate-api.com/v4/latest/USD`;
        const fallbackController = new AbortController();
        const fallbackTimeout = setTimeout(() => fallbackController.abort(), 5000);

        const fallbackRes = await fetch(fallbackUrl, {
          signal: fallbackController.signal,
        });

        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          if (fallbackData?.rates?.IDR) {
            rate = Math.round(fallbackData.rates.IDR);
            source = 'ExchangeRate-API (BI fallback)';
          }
        }

        clearTimeout(fallbackTimeout);
      } catch {
        // All APIs failed
      }
    }

    // Ultimate fallback
    if (!rate) {
      rate = 16200;
      source = 'Estimasi (API tidak tersedia)';
    }

    return NextResponse.json({
      rate,
      source,
      date: rateDate,
      currency: 'IDR',
      baseCurrency: 'USD',
    });
  } catch (error) {
    // Return fallback rate on any error
    return NextResponse.json({
      rate: 16200,
      source: 'Estimasi (API error)',
      date: new Date().toISOString().split('T')[0],
      currency: 'IDR',
      baseCurrency: 'USD',
    });
  }
}
