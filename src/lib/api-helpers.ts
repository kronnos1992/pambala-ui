import api from './api'

// --- Types ---
export interface ApiProduct {
  id: string
  name: string
  slug: string
  description?: string
  price: number
  comparePrice?: number
  images: string[]
  condition: 'NEW' | 'USED' | 'REFURBISHED'
  stock: number
  isActive: boolean
  views: number
  categoryId: string
  storeId: string
  createdAt: string
  updatedAt: string
  store?: { id: string; name: string; slug: string; isVerified?: boolean; logo?: string; province?: string; district?: string }
  category?: { id: string; name: string; slug: string }
  avgRating?: number
  reviews?: ApiReview[]
}

export interface ApiStore {
  id: string
  name: string
  slug: string
  description?: string
  phone?: string
  logo?: string
  banner?: string
  province: string
  district?: string
  rating: number
  isVerified: boolean
  latitude?: number
  longitude?: number
  userId: string
  createdAt: string
  paymentMethods?: PaymentMethod[]
  _count?: { products: number; reviews: number }
  user?: { id: string; name: string; avatar?: string }
}

export type PaymentType = 'EXPRESS' | 'TRANSFER' | 'REFERENCE' | 'CASH_ON_DELIVERY'

export interface PaymentMethod {
  type: PaymentType
  enabled?: boolean
  phone?: string
  bankName?: string
  bankAccount?: string
  iban?: string
  entity?: string
  reference?: string
  ownerName?: string
}

export interface ApiCategory {
  id: string
  name: string
  slug: string
  icon?: string
  parentId?: string
  _count?: { products: number }
  children?: ApiCategory[]
}

export interface ApiReview {
  id: string
  rating: number
  comment?: string
  userId: string
  productId?: string
  storeId?: string
  createdAt: string
  user?: { id: string; name: string; avatar?: string }
  product?: { id: string; name: string; slug: string }
}

export interface ApiOrder {
  id: string
  orderNumber: string
  total: number
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  paymentMethod: PaymentType
  paymentStatus?: 'PENDING' | 'AWAITING_PAYMENT' | 'PAID' | 'CANCELLED'
  receiptImage?: string
  paymentDetails?: string
  shippingName: string
  shippingPhone: string
  shippingAddress: string
  shippingProvince: string
  shippingDistrict?: string
  notes?: string
  userId: string
  createdAt: string
  items: ApiOrderItem[]
  user?: { id: string; name: string; email: string; phone?: string }
}

export interface ApiOrderItem {
  id: string
  quantity: number
  price: number
  productId: string
  storeId: string
  product?: { id: string; name: string; images: string; slug?: string }
}

export interface ApiCart {
  id: string
  userId: string
  items: ApiCartItem[]
  total: number
}

export interface ApiCartItem {
  id: string
  quantity: number
  productId: string
  product: ApiProduct
}

export interface PaginatedResponse<T> {
  pagination: { page: number; limit: number; total: number; totalPages: number }
  [key: string]: unknown
}

// --- UI Types ---
export interface UiProduct {
  id: string
  name: string
  slug: string
  price: number
  comparePrice?: number
  image: string
  images: string[]
  storeName: string
  storeSlug?: string
  province: string
  condition: 'novo' | 'usado' | 'recondicionado'
  rating: number
  reviewCount: number
  stock: number
  description?: string
  categoryId?: string
}

export interface UiStore {
  id: string
  name: string
  slug: string
  logo?: string
  rating: number
  productCount: number
  location: string
  description?: string
}

export interface UiOrder {
  id: string
  date: string
  total: number
  status: string
  items: number
  storeName?: string
  orderNumber?: string
  shippingName?: string
  shippingPhone?: string
  shippingAddress?: string
  shippingProvince?: string
  paymentMethod?: string
  paymentStatus?: string
  receiptImage?: string
  paymentDetails?: string
  orderItems?: { name: string; price: number; quantity: number; image: string }[]
}

// --- Mappers ---
const conditionMap: Record<string, UiProduct['condition']> = {
  NEW: 'novo',
  USED: 'usado',
  REFURBISHED: 'recondicionado',
}

const statusMap: Record<string, string> = {
  PENDING: 'pendente',
  CONFIRMED: 'confirmado',
  PROCESSING: 'processando',
  SHIPPED: 'enviado',
  DELIVERED: 'entregue',
  CANCELLED: 'cancelado',
}

const statusLabels: Record<string, string> = {
  pendente: 'Pendente',
  confirmado: 'Confirmado',
  processando: 'Processando',
  enviado: 'Enviado',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
}

const statusColors: Record<string, string> = {
  pendente: 'bg-amber-100 text-amber-700',
  confirmado: 'bg-blue-100 text-blue-700',
  processando: 'bg-amber-100 text-amber-700',
  enviado: 'bg-blue-100 text-blue-700',
  entregue: 'bg-emerald-100 text-emerald-700',
  cancelado: 'bg-red-100 text-red-700',
}

export function mapCondition(cond: string): UiProduct['condition'] {
  return conditionMap[cond] || 'novo'
}

export function mapStatus(status: string): string {
  return statusMap[status] || status.toLowerCase()
}

export function getStatusLabel(status: string): string {
  return statusLabels[status] || status
}

export function getStatusColor(status: string): string {
  return statusColors[status] || 'bg-gray-100 text-gray-700'
}

export function mapApiProduct(p: ApiProduct): UiProduct {
  const images = Array.isArray(p.images) ? p.images : []
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    comparePrice: p.comparePrice,
    image: images[0] || 'https://placehold.co/400x400/f3f4f6/6b7280?text=Produto',
    images,
    storeName: p.store?.name || 'Loja',
    storeSlug: p.store?.slug,
    province: p.store?.province || 'Luanda',
    condition: mapCondition(p.condition),
    rating: p.avgRating || 0,
    reviewCount: 0,
    stock: p.stock,
    description: p.description,
    categoryId: p.categoryId,
  }
}

export function mapApiStore(s: ApiStore): UiStore {
  return {
    id: s.id,
    name: s.name,
    slug: s.slug,
    logo: s.logo,
    rating: s.rating || 0,
    productCount: s._count?.products || 0,
    location: s.province || 'Luanda',
    description: s.description,
  }
}

export function mapApiOrder(o: ApiOrder): UiOrder {
  const itemCount = o.items?.reduce((sum, item) => sum + item.quantity, 0) || 0
  let pd: any = null
  if (o.paymentDetails) { try { pd = JSON.parse(o.paymentDetails) } catch { pd = null } }
  return {
    id: o.orderNumber || o.id.slice(0, 8),
    date: new Date(o.createdAt).toLocaleDateString('pt-AO'),
    total: o.total,
    status: mapStatus(o.status),
    items: itemCount,
    orderNumber: o.orderNumber,
    shippingName: o.shippingName,
    shippingPhone: o.shippingPhone,
    shippingAddress: o.shippingAddress,
    shippingProvince: o.shippingProvince,
    paymentMethod: o.paymentMethod,
    paymentStatus: o.paymentStatus,
    receiptImage: o.receiptImage,
    paymentDetails: pd,
    orderItems: o.items?.map((item) => ({
      name: item.product?.name || 'Produto',
      price: item.price,
      quantity: item.quantity,
      image: item.product?.images
        ? (Array.isArray(item.product.images) ? item.product.images[0] : (() => { try { return JSON.parse(item.product.images)[0] } catch { return '' } })())
        : '',
    })),
  }
}

export const paymentLabels: Record<string, string> = {
  EXPRESS: 'Multicaixa Express',
  TRANSFER: 'Transferência Bancária',
  REFERENCE: 'Pagamento por Referência',
  CASH_ON_DELIVERY: 'Pagamento na Entrega',
  MULTICAIXA: 'Multicaixa Express',
}

// --- API Calls ---
export async function fetchProducts(params: {
  page?: number
  limit?: number
  q?: string
  categoryId?: string
  categorySlug?: string
  storeId?: string
  minPrice?: number
  maxPrice?: number
  condition?: string
  sort?: string
} = {}) {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  if (params.q) query.set('q', params.q)
  if (params.categoryId) query.set('categoryId', params.categoryId)
  if (params.categorySlug) query.set('categorySlug', params.categorySlug)
  if (params.storeId) query.set('storeId', params.storeId)
  if (params.minPrice) query.set('minPrice', String(params.minPrice))
  if (params.maxPrice) query.set('maxPrice', String(params.maxPrice))
  if (params.condition) query.set('condition', params.condition)
  if (params.sort) query.set('sort', params.sort)

  const { data } = await api.get(`/products?${query.toString()}`)
  return {
    products: (data.products || []).map(mapApiProduct),
    pagination: data.pagination,
  }
}

export async function fetchFeaturedProducts() {
  const { data } = await api.get('/products/featured')
  return (data.products || []).map(mapApiProduct)
}

export async function fetchProductBySlug(slug: string) {
  const { data } = await api.get(`/products/${slug}`)
  return data.product as ApiProduct
}

export async function fetchCategories() {
  const { data } = await api.get('/categories')
  return data.categories as ApiCategory[]
}

export async function fetchStores(params: { page?: number; limit?: number } = {}) {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))

  const { data } = await api.get(`/stores?${query.toString()}`)
  return {
    stores: (data.stores || []).map(mapApiStore),
    pagination: data.pagination,
  }
}

export async function fetchStoreBySlug(slug: string) {
  const { data } = await api.get(`/stores/${slug}`)
  return data.store as ApiStore
}

export async function fetchStoreProducts(slug: string, params: { page?: number; limit?: number } = {}) {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))

  const { data } = await api.get(`/stores/${slug}/products?${query.toString()}`)
  return {
    products: (data.products || []).map(mapApiProduct),
    pagination: data.pagination,
  }
}

export async function fetchProductReviews(productId: string) {
  const { data } = await api.get(`/reviews/product/${productId}`)
  return {
    reviews: data.reviews as ApiReview[],
    avgRating: data.avgRating as number,
    totalReviews: data.totalReviews as number,
  }
}

export async function fetchStoreReviews(storeId: string) {
  const { data } = await api.get(`/reviews/store/${storeId}`)
  return {
    reviews: data.reviews as ApiReview[],
    avgRating: data.avgRating as number,
    totalReviews: data.totalReviews as number,
  }
}

export async function fetchOrders(params: { page?: number; limit?: number } = {}) {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))

  const { data } = await api.get(`/orders?${query.toString()}`)
  return {
    orders: (data.orders || []).map(mapApiOrder),
    pagination: data.pagination,
  }
}

export async function fetchOrderById(id: string) {
  const { data } = await api.get(`/orders/${id}`)
  return data.order as ApiOrder
}

export async function createOrder(orderData: {
  shippingName: string
  shippingPhone: string
  shippingAddress: string
  shippingProvince: string
  shippingDistrict?: string
  storeId: string
  paymentMethod: PaymentType
  notes?: string
}) {
  const { data } = await api.post('/orders', orderData)
  return data.order as ApiOrder
}

export async function uploadOrderReceipt(orderId: string, receiptImage: string) {
  const { data } = await api.post(`/orders/${orderId}/receipt`, { receiptImage })
  return data.order as ApiOrder
}

export async function updateOrderPaymentStatus(orderId: string, paymentStatus: string) {
  const { data } = await api.put(`/orders/${orderId}/payment-status`, { paymentStatus })
  return data.order as ApiOrder
}

export async function fetchStorePaymentMethods() {
  const { data } = await api.get('/stores/payment-methods')
  return data.paymentMethods as PaymentMethod[]
}

export async function updateStorePaymentMethods(paymentMethods: PaymentMethod[]) {
  const { data } = await api.put('/stores/payment-methods', { paymentMethods })
  return data.paymentMethods as PaymentMethod[]
}

export async function uploadFile(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await api.post('/uploads', formData)
  return data as { url: string; filename: string }
}

export async function fetchCart() {
  const { data } = await api.get('/cart')
  return data.cart as ApiCart
}

export async function addToCart(productId: string, quantity = 1) {
  const { data } = await api.post('/cart/items', { productId, quantity })
  return data.cart as ApiCart
}

export async function updateCartItem(itemId: string, quantity: number) {
  const { data } = await api.put(`/cart/items/${itemId}`, { quantity })
  return data
}

export async function removeCartItem(itemId: string) {
  const { data } = await api.delete(`/cart/items/${itemId}`)
  return data
}

export async function clearCartApi() {
  const { data } = await api.delete('/cart')
  return data
}

export async function loginApi(email: string, password: string) {
  const { data } = await api.post('/auth/login', { email, password })
  return data as { token: string; user: { id: string; name: string; email: string; phone?: string; role: string; avatar?: string } }
}

export async function registerApi(payload: {
  name: string
  email: string
  password: string
  phone?: string
  role?: 'BUYER' | 'SELLER'
}) {
  const { data } = await api.post('/auth/register', payload)
  return data as { token: string; user: { id: string; name: string; email: string; phone?: string; role: string; avatar?: string } }
}

export async function fetchMe() {
  const { data } = await api.get('/auth/me')
  return data.user
}

export async function updateProfile(payload: { name?: string; phone?: string; avatar?: string }) {
  const { data } = await api.put('/auth/me', payload)
  return data.user
}

export async function createProduct(productData: {
  name: string
  description?: string
  price: number
  comparePrice?: number
  images?: string[]
  condition?: string
  stock: number
  categoryId: string
}) {
  const { data } = await api.post('/products', productData)
  return data.product as ApiProduct
}

export async function fetchSellerOrders(params: { page?: number; limit?: number } = {}) {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))

  const { data } = await api.get(`/orders/seller/orders?${query.toString()}`)
  return {
    orders: (data.orders || []).map(mapApiOrder),
    pagination: data.pagination,
  }
}

// --- Admin API ---
export async function fetchAdminStats() {
  const { data } = await api.get('/admin/stats')
  return data
}

export async function fetchAdminOrdersStats() {
  const { data } = await api.get('/admin/stats/orders')
  return data
}

export async function fetchAdminUsersStats() {
  const { data } = await api.get('/admin/stats/users')
  return data
}

export async function fetchAdminStoresStats() {
  const { data } = await api.get('/admin/stats/stores')
  return data
}

export async function fetchAdminProductsStats() {
  const { data } = await api.get('/admin/stats/products')
  return data
}

export async function fetchAdminCategoriesStats() {
  const { data } = await api.get('/admin/stats/categories')
  return data
}

export async function fetchAdminReviewsStats() {
  const { data } = await api.get('/admin/stats/reviews')
  return data
}

export async function fetchAdminRevenueChart(days = 30) {
  const { data } = await api.get(`/admin/stats/charts/revenue?days=${days}`)
  return data.data
}

export async function fetchAdminUsersChart(days = 30) {
  const { data } = await api.get(`/admin/stats/charts/users?days=${days}`)
  return data.data
}

export async function fetchAdminUsers(params: { page?: number; limit?: number; role?: string; q?: string } = {}) {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  if (params.role) query.set('role', params.role)
  if (params.q) query.set('q', params.q)
  const { data } = await api.get(`/admin/users?${query.toString()}`)
  return data
}

export async function updateUserRole(userId: string, role: string) {
  const { data } = await api.put(`/admin/users/${userId}/role`, { role })
  return data.user
}

export async function deleteUser(userId: string) {
  const { data } = await api.delete(`/admin/users/${userId}`)
  return data
}

export async function fetchAdminOrders(params: { page?: number; limit?: number; status?: string; q?: string } = {}) {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  if (params.status) query.set('status', params.status)
  if (params.q) query.set('q', params.q)
  const { data } = await api.get(`/admin/orders?${query.toString()}`)
  return data
}

export async function updateOrderStatus(orderId: string, status: string) {
  const { data } = await api.put(`/admin/orders/${orderId}/status`, { status })
  return data.order
}

export async function fetchAdminStores(params: { page?: number; limit?: number; q?: string; verified?: string } = {}) {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  if (params.q) query.set('q', params.q)
  if (params.verified) query.set('verified', params.verified)
  const { data } = await api.get(`/admin/stores?${query.toString()}`)
  return data
}

export async function toggleStoreVerification(storeId: string) {
  const { data } = await api.put(`/admin/stores/${storeId}/verify`)
  return data.store
}

export async function deleteStore(storeId: string) {
  const { data } = await api.delete(`/admin/stores/${storeId}`)
  return data
}

export async function fetchAdminProducts(params: { page?: number; limit?: number; q?: string; active?: string; categoryId?: string } = {}) {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  if (params.q) query.set('q', params.q)
  if (params.active) query.set('active', params.active)
  if (params.categoryId) query.set('categoryId', params.categoryId)
  const { data } = await api.get(`/admin/products?${query.toString()}`)
  return {
    products: (data.products || []).map(mapApiProduct),
    pagination: data.pagination,
  }
}

export async function toggleProductActive(productId: string) {
  const { data } = await api.put(`/admin/products/${productId}/toggle-active`)
  return data.product
}

export async function deleteProduct(productId: string) {
  const { data } = await api.delete(`/admin/products/${productId}`)
  return data
}

export async function createCategory(data: { name: string; slug?: string; icon?: string; image?: string; parentId?: string }) {
  const { data: result } = await api.post('/admin/categories', data)
  return result.category as ApiCategory
}

export async function updateCategory(categoryId: string, data: { name?: string; slug?: string; icon?: string; image?: string }) {
  const { data: result } = await api.put(`/admin/categories/${categoryId}`, data)
  return result.category as ApiCategory
}

export async function deleteCategory(categoryId: string) {
  const { data } = await api.delete(`/admin/categories/${categoryId}`)
  return data
}

export async function fetchAdminReviews(params: { page?: number; limit?: number } = {}) {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  const { data } = await api.get(`/admin/reviews?${query.toString()}`)
  return data
}

export async function deleteReview(reviewId: string) {
  const { data } = await api.delete(`/admin/reviews/${reviewId}`)
  return data
}
