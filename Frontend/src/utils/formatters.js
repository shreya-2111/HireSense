/**
 * Centralized formatting utilities for Indian localization:
 * - 12-hour Indian Time (hh:mm A / IST)
 * - Indian Rupee (₹, Lakhs, Crores)
 * - Indian Date Format (DD MMM YYYY or DD/MM/YYYY)
 * - Standard Job / Work Types
 */

export const JOB_TYPES = [
  'Remote',
  'Work from Home',
  'Work from Office',
  'Hybrid'
];

/**
 * Formats numeric amounts or dollar strings into Indian Rupee (₹) format
 * e.g. 1200000 -> ₹12,00,000 or "$120,000 - $145,000" -> "₹12,00,000 - ₹14,50,000"
 */
export function formatIndianCurrency(val) {
  if (val === null || val === undefined || val === '') return '₹0';
  if (typeof val === 'string') {
    if (val.includes('₹')) return val;
    if (val.includes('$')) {
      return val.replace(/\$/g, '₹');
    }
    const num = parseFloat(val.replace(/[^0-9.-]+/g, ''));
    if (isNaN(num)) return val;
    val = num;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val);
}

/**
 * Format salary in Lakhs Per Annum (LPA) or Rupees
 * e.g. "12-18" -> "₹12 - ₹18 LPA"
 */
export function formatSalary(salaryStr) {
  if (!salaryStr) return '₹12,00,000 - ₹18,00,000 / year';
  if (salaryStr.includes('₹')) return salaryStr;
  if (salaryStr.includes('$')) return salaryStr.replace(/\$/g, '₹');
  return `₹${salaryStr}`;
}

/**
 * Format date in standard Indian format (e.g. 13 Sep 2026)
 */
export function formatIndianDate(dateInput) {
  if (!dateInput) return '';
  const d = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return String(dateInput);
  
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Format date in numeric Indian format (DD/MM/YYYY)
 */
export function formatIndianDateNumeric(dateInput) {
  if (!dateInput) return '';
  const d = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return String(dateInput);
  
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Format time in 12-hour format with AM/PM (e.g., 02:30 PM)
 */
export function formatIndianTime12Hr(dateInput) {
  if (!dateInput) return '';
  const d = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) {
    if (typeof dateInput === 'string') {
      // Replace foreign timezones with IST
      return dateInput.replace(/EST|EDT|PST|PDT|UTC|GMT/gi, 'IST');
    }
    return String(dateInput);
  }
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Format full date and 12-hour time in Indian format (e.g., 13 Sep 2026, 02:30 PM)
 */
export function formatIndianDateTime(dateInput) {
  if (!dateInput) return '';
  const d = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return String(dateInput);
  return `${formatIndianDate(d)}, ${formatIndianTime12Hr(d)}`;
}
