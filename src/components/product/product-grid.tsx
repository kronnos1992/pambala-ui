import { ProductCard } from './product-card'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  comparePrice?: number
  image: string
  images?: string[]
  storeName: string
  storeSlug?: string
  province: string
  condition: 'novo' | 'usado' | 'recondicionado'
  rating: number
  reviewCount: number
  stock: number
}

interface ProductGridProps {
  products: Product[]
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
          <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Nenhum produto encontrado</h3>
        <p className="mt-1 text-sm text-gray-500">Tente ajustar os filtros ou pesquisar por algo diferente.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
