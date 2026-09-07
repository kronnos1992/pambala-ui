'use client'

import * as React from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Store, Truck, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AuthHero() {
  const t = useTranslations('authHero')

  const PHOTOS = [
    { src: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop', alt: t('altHeadphones'), className: 'col-span-2 row-span-2' },
    { src: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400&auto=format&fit=crop', alt: t('altSneakers'), className: '' },
    { src: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=400&auto=format&fit=crop', alt: t('altSofa'), className: '' },
    { src: 'https://images.unsplash.com/photo-1463320726281-696a485928c7?q=80&w=800&auto=format&fit=crop', alt: t('altPlant'), className: 'col-span-2' },
    { src: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop', alt: t('altWatch'), className: '' },
  ]

  const CHIPS = [
    { icon: Truck, label: t('chipDelivery') },
    { icon: ShieldCheck, label: t('chipSecurePayment') },
    { icon: Store, label: t('chipThousandsStores') },
  ]

  return (
    <section className="hidden flex-col items-start gap-5 lg:flex">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl text-emerald-600 dark:text-emerald-400',
            'bg-[#e0e5ec] shadow-[5px_5px_12px_#bec3cf,-5px_-5px_12px_#ffffff]',
            'dark:bg-[#1f242e] dark:shadow-[5px_5px_12px_#14171f,-5px_-5px_12px_#2b313d]'
          )}
        >
          <Store className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xl font-bold tracking-tight text-[#3d4468] dark:text-[#e6eaf4]">Pambala</p>
          <p className="text-[13px] text-[#9499b7] dark:text-[#7c85a1]">{t('subtitle')}</p>
        </div>
      </div>

      <div className="grid w-full grid-cols-3 grid-rows-[116px_116px_116px] gap-3">
        {PHOTOS.map((photo) => (
          <div
            key={photo.src}
            className={cn(
              'group relative overflow-hidden rounded-[16px]',
              photo.className,
              'bg-[#e0e5ec] shadow-[6px_6px_14px_#bec3cf,-6px_-6px_14px_#ffffff]',
              'dark:bg-[#1f242e] dark:shadow-[6px_6px_14px_#14171f,-6px_-6px_14px_#2b313d]'
            )}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              unoptimized
              loading="lazy"
              sizes="(max-width: 1024px) 0px, 300px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2.5">
        {CHIPS.map(({ icon: Icon, label }) => (
          <span
            key={label}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium text-[#6c7293] dark:text-[#aeb6cc]',
              'bg-[#e0e5ec] shadow-[3px_3px_8px_#bec3cf,-3px_-3px_8px_#ffffff]',
              'dark:bg-[#1f242e] dark:shadow-[3px_3px_8px_#14171f,-3px_-3px_8px_#2b313d]'
            )}
          >
            <Icon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            {label}
          </span>
        ))}
      </div>
    </section>
  )
}
