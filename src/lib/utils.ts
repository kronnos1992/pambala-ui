import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('pt-AO', {
    style: 'decimal',
    minimumFractionDigits: 0,
  }).format(price) + ' Kz'
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('pt-AO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function isPdfUrl(url?: string | null): boolean {
  if (!url) return false
  try {
    const clean = url.split(/[?#]/)[0].toLowerCase()
    // Se for Cloudinary, é servido como imagem .jpg convertida
    if (url.includes('res.cloudinary.com')) return false
    return clean.endsWith(".pdf")
  } catch {
    return false
  }
}

export function receiptDisplayUrl(url?: string | null): string {
  if (!url) return ''
  try {
    if (url.includes('res.cloudinary.com') && url.split(/[?#]/)[0].toLowerCase().endsWith('.pdf')) {
      return url.replace(/\.pdf(\?.*)?$/i, '.jpg$1')
    }
  } catch {
    // fallback
  }
  return url
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}
