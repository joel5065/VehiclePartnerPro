import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number): string {
  // Convert cents to dollars and format with $ symbol
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount / 100);
}

export function getDiscountPercentage(originalPrice: number, salePrice: number): number {
  if (!originalPrice || !salePrice) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}

export function formatRating(rating: number): number {
  // Convert rating from 0-500 to 0-5
  return rating / 100;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function getYearRange(startYear: number = 1990, endYear: number = new Date().getFullYear()): number[] {
  const years: number[] = [];
  for (let year = endYear; year >= startYear; year--) {
    years.push(year);
  }
  return years;
}

export function getMileageIntervalText(miles: number): string {
  return miles.toLocaleString() + ' miles';
}

export function mapMaintenanceItemsToSchedule(items: any[]): { [interval: string]: string[] } {
  const schedule: { [interval: string]: string[] } = {
    '5000': [],
    '10000': [],
    '15000': [],
    '30000': [],
    '60000': [],
  };
  
  items.forEach(item => {
    const intervalMiles = item.intervalMiles;
    
    // Add to appropriate intervals
    if (intervalMiles <= 5000) {
      schedule['5000'].push(item.name);
      schedule['10000'].push(item.name);
      schedule['15000'].push(item.name);
      schedule['30000'].push(item.name);
      schedule['60000'].push(item.name);
    } else if (intervalMiles <= 10000) {
      schedule['10000'].push(item.name);
      schedule['15000'].push(item.name);
      schedule['30000'].push(item.name);
      schedule['60000'].push(item.name);
    } else if (intervalMiles <= 15000) {
      schedule['15000'].push(item.name);
      schedule['30000'].push(item.name);
      schedule['60000'].push(item.name);
    } else if (intervalMiles <= 30000) {
      schedule['30000'].push(item.name);
      schedule['60000'].push(item.name);
    } else if (intervalMiles <= 60000) {
      schedule['60000'].push(item.name);
    }
  });
  
  return schedule;
}
