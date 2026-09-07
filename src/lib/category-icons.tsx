import * as React from 'react'
import {
  Apple,
  PawPrint,
  Car,
  Dumbbell,
  BookOpen,
  Smartphone,
  Baby,
  Sofa,
  Shirt,
  Briefcase,
  Folder,
  Gamepad2,
  Sparkles,
  Hammer,
} from 'lucide-react'

const ICON_BY_NAME: Record<string, React.ElementType> = {
  apple: Apple,
  'paw-print': PawPrint,
  car: Car,
  dumbbell: Dumbbell,
  'book-open': BookOpen,
  smartphone: Smartphone,
  baby: Baby,
  sofa: Sofa,
  shirt: Shirt,
  briefcase: Briefcase,
  'gamepad-2': Gamepad2,
  sparkles: Sparkles,
  hammer: Hammer,
}

const COLOR_BY_SLUG: Record<string, string> = {
  tecnologia: 'from-blue-500 to-indigo-500',
  entretenimento: 'from-purple-500 to-fuchsia-600',
  'moda-vestuario': 'from-pink-500 to-rose-500',
  'beleza-cuidados-pessoais': 'from-fuchsia-500 to-pink-500',
  'casa-decoracao': 'from-amber-500 to-orange-500',
  'desporto-lazer': 'from-emerald-500 to-green-500',
  veiculos: 'from-sky-500 to-cyan-600',
  infantil: 'from-amber-400 to-yellow-500',
  'animais-estimacao': 'from-teal-500 to-emerald-600',
  'jardinagem-construcao': 'from-yellow-500 to-orange-600',
  'alimentos-bebidas': 'from-lime-500 to-green-600',
  'educacao-artes': 'from-violet-500 to-purple-600',
  servicos: 'from-red-500 to-orange-500',
}

const DEFAULT_ICON = Folder
const DEFAULT_COLOR = 'from-gray-500 to-gray-700'

export function getCategoryIcon(iconName?: string | null) {
  return (iconName && ICON_BY_NAME[iconName]) || DEFAULT_ICON
}

export function getCategoryColor(slug?: string | null) {
  return (slug && COLOR_BY_SLUG[slug]) || DEFAULT_COLOR
}