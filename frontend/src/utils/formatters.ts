/**
 * Standardized Indian number, currency, date, and percentage formatters
 * for JanDrishti (SIH26102).
 */

/**
 * Formats an amount in Indian Rupees (INR).
 * @param amount Number in INR
 * @param compact If true, formats as e.g. ₹12.45 Cr or ₹45.60 Lakh. If false, ₹12,45,000.
 */
export function formatIndianCurrency(amount: number | null | undefined, compact: boolean = true): string {
  if (amount == null || isNaN(amount)) return '₹0.00';

  const absAmt = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (compact) {
    if (absAmt >= 10000000) {
      // 1 Crore = 10,000,000
      const cr = absAmt / 10000000;
      return `${sign}₹${cr.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Cr`;
    }
    if (absAmt >= 100000) {
      // 1 Lakh = 100,000
      const lakh = absAmt / 100000;
      return `${sign}₹${lakh.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Lakh`;
    }
  }

  return `${sign}₹${Math.round(absAmt).toLocaleString('en-IN')}`;
}

/**
 * Formats a count or integer into the Indian grouping system (e.g. 1,02,487).
 */
export function formatIndianNumber(num: number | null | undefined): string {
  if (num == null || isNaN(num)) return '0';
  return Math.round(num).toLocaleString('en-IN');
}

/**
 * Formats a percentage value (e.g. 72.4%).
 */
export function formatPercent(pct: number | null | undefined, decimals: number = 1): string {
  if (pct == null || isNaN(pct)) return '0.0%';
  return `${pct.toFixed(decimals)}%`;
}

/**
 * Formats an ISO date string into Indian civil standard (e.g. 12 Aug 2026).
 */
export function formatDateIndian(dateStr: string | null | undefined): string {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr).slice(0, 10);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return String(dateStr).slice(0, 10);
  }
}

/**
 * Standardized status label mapper.
 */
export function formatLifecycleStatus(status: string | null | undefined): string {
  if (!status) return 'In Progress';
  const clean = status.replace(/_/g, ' ').toUpperCase();
  switch (clean) {
    case 'FULL LIFECYCLE MATCH':
    case 'COMPLETED':
    case 'COMPLETED ONLY':
      return 'Completed';
    case 'SANCTIONED':
    case 'ADMIN SANCTIONED':
      return 'Sanctioned';
    case 'RECOMMENDED':
    case 'RECOMMENDED ONLY':
      return 'Recommended';
    case 'TENDERED':
    case 'IN PROGRESS':
      return 'In Progress';
    case 'REJECTED':
      return 'Rejected';
    default:
      return clean.charAt(0) + clean.slice(1).toLowerCase();
  }
}
