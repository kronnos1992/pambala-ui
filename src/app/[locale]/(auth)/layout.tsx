import { AuthHero } from '@/components/auth/auth-hero'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-[calc(100dvh-64px)] w-full items-center justify-center overflow-hidden bg-[#e0e5ec] px-4 py-4 sm:px-6 dark:bg-[#1f242e]">
      <div className="grid w-full max-w-[960px] grid-cols-1 items-center gap-7 lg:grid-cols-[1fr_420px] lg:gap-8">
        <AuthHero />
        <div className="w-full">{children}</div>
      </div>
    </div>
  )
}