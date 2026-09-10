import axios from 'axios'
import api, { API_BASE_URL } from './api'

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
  salesCount?: number
  categoryId: string
  storeId: string
  createdAt: string
  updatedAt: string
  store?: { id: string; name: string; slug: string; isVerified?: boolean; logo?: string; province?: string; district?: string }
  category?: { id: string; name: string; slug: string }
  avgRating?: number
  reviews?: ApiReview[]
  translations?: { locale: string; name?: string; description?: string }[]
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
  views?: number
  latitude?: number
  longitude?: number
  userId: string
  createdAt: string
  paymentMethods?: PaymentMethod[]
  categories?: { id: string; name: string; slug: string; icon?: string }[]
  _count?: { products: number; reviews: number }
  user?: { id: string; name: string; avatar?: string }
}

export interface ApiResponsibility {
  key: string
  name: string
  description?: string | null
  isSystem?: boolean
}

export interface ApiRole {
  key: string
  name: string
  description?: string | null
  isSystem?: boolean
  users?: number
  responsibilities?: ApiResponsibility[]
}

export interface ApiMeStore {
  id?: string
  name?: string
  slug?: string
  isVerified?: boolean
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
  translations?: { locale: string; name?: string }[]
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
  store?: { id: string; name: string }
}

export interface ApiOrder {
  id: string
  orderNumber: string
  total: number
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'RECEIVED' | 'CANCELLED'
  paymentMethod: PaymentType
  paymentStatus?: 'PENDING' | 'AWAITING_PAYMENT' | 'PAYMENT_RECEIVED' | 'PAID' | 'REJECTED'
  paymentCode?: string
  receiptImage?: string
  receiptAttempts?: number
  paymentDetails?: string
  validationStatus?: 'PENDING' | 'AQUEUE' | 'PASS' | 'REVIEW' | 'FAIL' | 'ERROR' | 'PROOF_ACCEPTED' | 'MANUAL_REVIEW' | 'PROOF_REJECTED'
  validationResult?: string
  paymentHistory?: string
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
  stores?: { id: string; name: string; slug?: string; logo?: string }[]
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

export interface PaginatedResponse {
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
  salesCount?: number
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
  views?: number
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
  paymentDetails?: Record<string, unknown> | null
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
  RECEIVED: 'recebido',
  CANCELLED: 'cancelado',
}

const statusLabels: Record<string, string> = {
  pendente: 'Pendente',
  confirmado: 'Confirmado',
  processando: 'Processando',
  enviado: 'Enviado',
  entregue: 'Entregue',
  recebido: 'Recebido',
  cancelado: 'Cancelado',
}

const statusColors: Record<string, string> = {
  pendente: 'bg-amber-100 text-amber-700',
  confirmado: 'bg-blue-100 text-blue-700',
  processando: 'bg-amber-100 text-amber-700',
  enviado: 'bg-blue-100 text-blue-700',
  entregue: 'bg-emerald-100 text-emerald-700',
  recebido: 'bg-emerald-100 text-emerald-700',
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
    reviewCount: p.reviews?.length || 0,
    stock: p.stock,
    salesCount: p.salesCount || 0,
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
    views: s.views,
  }
}

export function mapApiOrder(o: ApiOrder): UiOrder {
  const itemCount = o.items?.reduce((sum, item) => sum + item.quantity, 0) || 0
  let pd: Record<string, unknown> | null = null
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
export function getApiErrorMessage(error: unknown): string | null {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { error?: string; message?: string } | undefined
    if (typeof data?.error === 'string') return data.error
    if (typeof data?.message === 'string') return data.message
  }
  return null
}

export function getRetryAfterSeconds(error: unknown): number | null {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { retryAfter?: number } | undefined
    if (typeof data?.retryAfter === 'number' && data.retryAfter > 0) return Math.ceil(data.retryAfter)
    const header = error.response?.headers?.['retry-after']
    if (typeof header === 'string') {
      const n = parseInt(header, 10)
      if (!Number.isNaN(n) && n > 0) return n
    }
  }
  return null
}

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
  locale?: string
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
  if (params.locale) query.set('locale', params.locale)

  const { data } = await api.get(`/products?${query.toString()}`)
  return {
    products: (data.products || []).map(mapApiProduct),
    pagination: data.pagination,
  }
}

export async function fetchFeaturedProducts(locale?: string) {
  const query = new URLSearchParams()
  if (locale) query.set('locale', locale)

  const { data } = await api.get(`/products/featured?${query.toString()}`)
  return (data.products || []).map(mapApiProduct)
}

export async function fetchProductBySlug(slug: string, locale?: string) {
  const query = new URLSearchParams()
  if (locale) query.set('locale', locale)

  const { data } = await api.get(`/products/${slug}?${query.toString()}`)
  return data.product as ApiProduct
}

export async function fetchCategories(locale?: string) {
  const query = new URLSearchParams()
  if (locale) query.set('locale', locale)

  const { data } = await api.get(`/categories?${query.toString()}`)
  return data.categories as ApiCategory[]
}

export async function fetchStores(params: { page?: number; limit?: number; sort?: string; locale?: string } = {}) {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  if (params.sort) query.set('sort', params.sort)
  if (params.locale) query.set('locale', params.locale)

  const { data } = await api.get(`/stores?${query.toString()}`)
  return {
    stores: (data.stores || []).map(mapApiStore),
    pagination: data.pagination,
  }
}

export async function fetchStoreBySlug(slug: string, locale?: string) {
  const query = new URLSearchParams()
  if (locale) query.set('locale', locale)

  const { data } = await api.get(`/stores/${slug}?${query.toString()}`)
  return data.store as ApiStore
}

export async function fetchStoreProducts(slug: string, params: { page?: number; limit?: number; locale?: string } = {}) {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  if (params.locale) query.set('locale', params.locale)

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

export async function createReview(data: {
  rating: number
  comment?: string
  productId?: string
  storeId?: string
}) {
  const { data: res } = await api.post('/reviews', data)
  return res.review as ApiReview
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

// --- Order lifecycle / tracking timeline ---

export interface OrderTimelineEvent {
  id: string
  kind: 'ORDER' | 'PAYMENT' | 'RECEIPT' | 'VALIDATION' | 'MODERATION' | 'TRACKING' | 'SYSTEM' | string
  from: string | null
  to: string | null
  note: string | null
  at: string
  actorRole: string | null
  score?: number | null
  tracking?: {
    carrierName?: string | null
    trackingCode?: string | null
    estimatedDelivery?: string | null
  } | null
}

export interface OrderTimelineTracking {
  carrierName: string | null
  trackingCode: string | null
  estimatedDelivery: string | null
  shippedAt: string | null
  deliveredAt: string | null
  receivedAt: string | null
}

export interface OrderTimelineResponse {
  orderId: string
  orderNumber: string
  currentStatus: ApiOrder['status']
  paymentStatus: string
  paymentMethod: PaymentType
  tracking: OrderTimelineTracking
  capabilities: {
    role: 'BUYER' | 'SELLER' | 'ADMIN'
    canConfirmReceipt: boolean
    canShip: boolean
    canDeliver: boolean
  }
  events: OrderTimelineEvent[]
}

export async function fetchOrderTimeline(orderId: string) {
  const { data } = await api.get(`/orders/${orderId}/timeline`)
  return data as OrderTimelineResponse
}

export async function shipOrder(
  orderId: string,
  data: { carrierName: string; trackingCode: string; estimatedDelivery?: string }
) {
  const res = await api.post(`/orders/${orderId}/ship`, data)
  return res.data.order as ApiOrder
}

export async function markOrderDelivered(orderId: string, note?: string) {
  const { data } = await api.put(`/orders/${orderId}/delivered`, { note })
  return data.order as ApiOrder
}

export async function confirmOrderReceipt(orderId: string) {
  const { data } = await api.put(`/orders/${orderId}/received`)
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

// --- Store (própria) ---
export async function fetchMyStore(): Promise<ApiStore | null> {
  const me = await fetchMe()
  if (!me?.store?.slug) return null
  const { data } = await api.get(`/stores/${me.store.slug}`)
  return data.store as ApiStore
}

export type StoreInput = {
  name: string
  description?: string
  phone?: string
  logo?: string
  banner?: string
  province: string
  district?: string
  categoryIds?: string[]
}

export async function createStore(data: StoreInput) {
  const { data: result } = await api.post('/stores', data)
  return result.store as ApiStore
}

export async function updateStore(data: StoreInput) {
  const { data: result } = await api.put('/stores', data)
  return result.store as ApiStore
}

// --- Roles (RBAC) ---
export async function fetchRoles(): Promise<ApiRole[]> {
  const { data } = await api.get('/roles')
  return (data.roles || []) as ApiRole[]
}

export async function fetchResponsibilities(): Promise<ApiResponsibility[]> {
  const { data } = await api.get('/roles/responsibilities')
  return (data.responsibilities || []) as ApiResponsibility[]
}

export async function createRole(data: { key: string; name: string; description?: string }) {
  const { data: result } = await api.post('/roles', data)
  return result.role as ApiRole
}

export async function updateRole(key: string, data: { name?: string; description?: string | null }) {
  const { data: result } = await api.put(`/roles/${key}`, data)
  return result.role as ApiRole
}

export async function deleteRole(key: string) {
  const { data } = await api.delete(`/roles/${key}`)
  return data
}

export async function setRoleResponsibilities(key: string, responsibilityKeys: string[]) {
  const { data } = await api.put(`/roles/${key}/responsibilities`, { responsibilityKeys })
  return data
}

export async function createResponsibility(data: { key: string; name: string; description?: string }) {
  const { data: result } = await api.post('/roles/responsibilities', data)
  return result.responsibility as ApiResponsibility
}

export async function updateResponsibility(key: string, data: { name?: string; description?: string | null }) {
  const { data: result } = await api.put(`/roles/responsibilities/${key}`, data)
  return result.responsibility as ApiResponsibility
}

export async function deleteResponsibility(key: string) {
  const { data } = await api.delete(`/roles/responsibilities/${key}`)
  return data
}

export async function uploadFile(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await api.post('/uploads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  const url = data.url as string
  return {
    url: url.startsWith('http') ? url : `http://localhost:3001${url}`,
    filename: data.filename as string,
  }
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
  return data as { token: string; user: ApiAuthUser }
}

export async function registerApi(payload: {
  name: string
  email: string
  password: string
  phone?: string
  role?: 'BUYER' | 'SELLER'
  aiValidationConsent?: boolean
}) {
  const { data } = await api.post('/auth/register', payload)
  return data as { token: string; user: ApiAuthUser }
}

export interface ApiAuthUser {
  id: string
  name: string
  email: string
  phone?: string
  role: string
  roles?: string[] | { role: { key: string } }[]
  avatar?: string
  aiValidationConsent?: boolean
  store?: ApiMeStore
}

export async function fetchMe(): Promise<ApiAuthUser & { store?: ApiMeStore | null }> {
  const { data } = await api.get('/auth/me')
  return data.user
}

export async function updateProfile(payload: { name?: string; phone?: string; avatar?: string; aiValidationConsent?: boolean }) {
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
  translations?: { locale: string; name?: string; description?: string }[]
}) {
  const { data } = await api.post('/products', productData)
  return data.product as ApiProduct
}

export async function updateProduct(id: string, productData: {
  name: string
  description?: string
  price: number
  comparePrice?: number
  images?: string[]
  condition?: string
  stock: number
  categoryId: string
  translations?: { locale: string; name?: string; description?: string }[]
}) {
  const { data } = await api.put(`/products/${id}`, productData)
  return data.product as ApiProduct
}

export async function deleteSellerProduct(id: string) {
  const { data } = await api.delete(`/products/${id}`)
  return data
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

export async function fetchSellerOrderById(id: string) {
  const { data } = await api.get(`/orders/seller/orders/${encodeURIComponent(id)}`)
  return data.order as ApiOrder
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

export interface AdminStoreRevenueProduct {
  productId: string
  productName: string
  units: number
  revenue: number
}

export interface AdminStoreRevenueRow {
  storeId: string
  storeName: string
  slug: string
  logo?: string
  units: number
  revenue: number
  declared: number
  ordersCount: number
  topProducts: AdminStoreRevenueProduct[]
}

export interface AdminStoreRevenue {
  totals: {
    revenue: number
    declared: number
    units: number
    confirmedOrders: number
    declaredOrders: number
    storesCount: number
  }
  stores: AdminStoreRevenueRow[]
}

export async function fetchAdminStoreRevenue(): Promise<AdminStoreRevenue> {
  const { data } = await api.get('/admin/stats/store-revenue')
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

export async function updateAdminPaymentStatus(orderId: string, paymentStatus: string, note?: string) {
  const { data } = await api.put(`/admin/orders/${orderId}/payment`, { paymentStatus, note })
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
    products: (data.products || []) as ApiProduct[],
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

export async function createCategory(data: { name: string; slug?: string; icon?: string; image?: string; parentId?: string; translations?: { locale: string; name?: string }[] }) {
  const { data: result } = await api.post('/admin/categories', data)
  return result.category as ApiCategory
}

export async function updateCategory(categoryId: string, data: { name?: string; slug?: string; icon?: string; image?: string; translations?: { locale: string; name?: string }[] }) {
  const { data: result } = await api.put(`/admin/categories/${categoryId}`, data)
  return result.category as ApiCategory
}

export async function deleteCategory(categoryId: string) {
  const { data } = await api.delete(`/admin/categories/${categoryId}`)
  return data
}

export async function fetchAdminCategories(): Promise<ApiCategory[]> {
  const { data } = await api.get('/admin/categories')
  return (data.categories || []).map((cat: RawAdminCategory) => mapApiCategory(cat))
}

interface RawAdminTranslation {
  locale: string
  name?: string | null
}

interface RawAdminCategory {
  id: string
  name: string
  slug: string
  icon?: string | null
  parentId?: string | null
  _count?: { products: number }
  translations?: RawAdminTranslation[]
  children?: RawAdminCategory[]
}

function mapApiCategory(cat: RawAdminCategory): ApiCategory {
  return {
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    icon: cat.icon ?? undefined,
    parentId: cat.parentId ?? undefined,
    _count: cat._count,
    translations: (cat.translations || []).map((tr) => ({ locale: tr.locale, name: tr.name ?? undefined })),
    children: (cat.children || []).map(mapApiCategory),
  }
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

// --- Chat Tripartido (Disputas / Mediação de Pedidos) ---
export interface OrderDisputeSender {
  id: string
  name: string
  role?: string
  avatar?: string | null
}

export interface OrderDisputeMessage {
  id: string
  disputeId: string
  senderId: string
  senderRole: 'CLIENT' | 'SELLER' | 'ADMIN' | 'SYSTEM'
  content: string
  attachment?: string | null
  createdAt: string
  sender?: OrderDisputeSender
}

export interface OrderDispute {
  id: string
  orderId: string
  status: 'OPEN' | 'RESOLVED' | 'CLOSED'
  reason: string
  createdAt: string
  updatedAt: string
  messages: OrderDisputeMessage[]
}

export interface DisputeDetailsResponse {
  dispute: OrderDispute | null
  currentUserRole: 'CLIENT' | 'SELLER' | 'ADMIN'
  order: {
    id: string
    orderNumber: string
    status: string
    paymentStatus?: string
    validationStatus?: string
    receiptAttempts?: number
    customerName?: string
  }
}

export async function fetchOrderDispute(orderId: string): Promise<DisputeDetailsResponse> {
  const { data } = await api.get(`/orders/${orderId}/dispute`)
  return data
}

export async function sendOrderDisputeMessage(
  orderId: string,
  content: string,
  attachment?: string
): Promise<{ message: OrderDisputeMessage; disputeId: string }> {
  const { data } = await api.post(`/orders/${orderId}/dispute/messages`, {
    content,
    attachment,
  })
  return data
}

export async function updateOrderDisputeStatus(
  orderId: string,
  status: 'OPEN' | 'RESOLVED' | 'CLOSED'
): Promise<{ dispute: OrderDispute }> {
  const { data } = await api.put(`/orders/${orderId}/dispute/status`, { status })
  return data
}

export interface OrderDisputeStreamHandlers {
  onUpdate: (snapshot: DisputeDetailsResponse) => void
  onError?: (error: unknown) => void
}

/**
 * Subscreve ao stream SSE do chat tripartido em tempo real.
 * Usa fetch + ReadableStream (e não EventSource) porque o EventSource nativo
 * não permite enviar o cabeçalho Authorization com o token JWT.
 * Reconecta automaticamente com backoff; retorna a função para cancelar.
 */
export function subscribeOrderDispute(
  orderId: string,
  handlers: OrderDisputeStreamHandlers
): () => void {
  let cancelled = false
  let retryDelay = 1000
  const controller = new AbortController()
  let timeoutId: number | undefined

  let token: string | null = null
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('pambala-auth')
      if (raw) {
        const parsed = JSON.parse(raw)
        token = parsed?.state?.token ?? null
      }
    } catch {}
  }

  const headers: Record<string, string> = {}
  if (token) headers.Authorization = `Bearer ${token}`

  const handleBlock = (block: string) => {
    let data = ''
    for (const line of block.split('\n')) {
      if (line.startsWith('data:')) {
        data += (data ? '\n' : '') + line.slice(5).trimStart()
      }
    }
    if (!data) return
    try {
      handlers.onUpdate(JSON.parse(data) as DisputeDetailsResponse)
    } catch {
      // Ignora payloads inválidos
    }
  }

  const connect = async () => {
    if (cancelled) return
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/orders/${orderId}/dispute/events`,
        { headers, signal: controller.signal }
      )

      if (res.status === 401 || res.status === 403 || res.status === 404) {
        cancelled = true
        handlers.onError?.(new Error(`SSE indisponível (${res.status})`))
        return
      }
      if (!res.ok || !res.body) throw new Error(`SSE indisponível (${res.status})`)

      retryDelay = 1000

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      for (;;) {
        if (cancelled) break
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split('\n\n')
        buffer = parts.pop() ?? ''
        for (const part of parts) handleBlock(part)
      }
    } catch (error) {
      if (!cancelled && (error as Error)?.name !== 'AbortError') {
        handlers.onError?.(error)
      }
    }

    if (!cancelled) {
      timeoutId = window.setTimeout(connect, retryDelay)
      retryDelay = Math.min(retryDelay * 2, 15000)
    }
  }

  void connect()

  return () => {
    cancelled = true
    if (timeoutId) window.clearTimeout(timeoutId)
    controller.abort()
  }
}

// --- Notificações de Disputas (badges + toasts) ---
export interface DisputeUnreadItem {
  disputeId: string
  orderId: string
  orderNumber: string
  status: string
  unreadCount: number
  lastMessage?: {
    id: string
    senderRole: string
    senderId?: string
    senderName?: string
    content: string
    createdAt: string
  }
}

export interface DisputeUnreadResponse {
  total: number
  items: DisputeUnreadItem[]
}

export async function fetchDisputeUnread(): Promise<DisputeUnreadResponse> {
  const { data } = await api.get('/orders/disputes/unread')
  return data
}

export async function markOrderDisputeRead(orderId: string): Promise<{ success: boolean; marked: boolean }> {
  const { data } = await api.put(`/orders/${orderId}/dispute/read`)
  return data
}

export type DisputeModerationAction = 'MANUAL_OVERRIDE_ACCEPT' | 'DEFINITIVE_REJECT'

export interface DisputeModerationResult {
  action: DisputeModerationAction
  dispute: OrderDispute | null
  order: {
    id: string
    orderNumber: string
    status: string
    paymentStatus: string
    validationStatus: string
  }
}

export async function moderateOrderDispute(
  orderId: string,
  action: DisputeModerationAction,
  note?: string
): Promise<DisputeModerationResult> {
  const { data } = await api.post(`/orders/${orderId}/dispute/moderation`, { action, note })
  return data
}

// --- Admin Disputes ---
export interface AdminDispute {
  id: string
  orderId: string
  orderNumber: string
  status: 'OPEN' | 'RESOLVED' | 'CLOSED'
  reason: string
  createdAt: string
  updatedAt: string
  messagesCount: number
  unreadMessages: number
  lastMessage?: {
    content: string
    senderRole: string
    createdAt: string
  }
  order: {
    id: string
    orderNumber: string
    total: number
    status: string
    paymentStatus?: string
    validationStatus?: string
    receiptAttempts?: number
    shippingName: string
    shippingProvince: string
    createdAt: string
  }
  client?: {
    id: string
    name: string
    email: string
  }
  seller?: {
    id: string
    name: string
    storeName: string
  }
}

export interface AdminDisputesResponse {
  disputes: AdminDispute[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  stats: {
    total: number
    open: number
    resolved: number
    closed: number
  }
}

export async function fetchAdminDisputes(params: {
  page?: number
  limit?: number
  status?: string
  q?: string
} = {}): Promise<AdminDisputesResponse> {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  if (params.status) query.set('status', params.status)
  if (params.q) query.set('q', params.q)

  const { data } = await api.get(`/admin/disputes?${query.toString()}`)
  return data
}

export async function fetchAdminDisputeStats() {
  const { data } = await api.get('/admin/disputes/stats')
  return data
}

// --- Faturação Electrónica (AGT / DE 683/25) ---
export interface ApiFiscalSettings {
  id: string
  productId: string
  productVersion: string
  softwareValidationNumber?: string | null
  certificationDate?: string | null
  signatureVersion: number
  signatureKeyPem?: string | null
  schemaVersion: string
  agtBaseUrl?: string | null
  agtUsername?: string | null
  agtPassword?: string | null
  timezone: string
  createdAt: string
  updatedAt: string
}

export const VAT_REGIMES = ['GERAL', 'SIMPLIFICADO', 'EXCLUIDO', 'ISENTO'] as const
export type VatRegime = (typeof VAT_REGIMES)[number]

export interface ApiStoreFiscalProfile {
  id: string
  storeId: string
  nif: string
  legalName: string
  address: string
  province: string
  district?: string | null
  industryCode?: string | null
  vatRegime: VatRegime
  vatExemptionCode?: string | null
  establishmentNumber: string
  establishmentRegistered: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
  store?: { id: string; name: string; slug: string }
}

export interface ApiInvoiceSeries {
  id: string
  storeId: string
  documentType: string
  agtSeriesCode?: string | null
  establishmentNumber: string
  year: number
  status: 'PENDING' | 'OPEN' | 'CLOSED' | 'CANCELLED' | 'REJECTED'
  nextNumber: number
  lastNumberUsed?: number | null
  authorizedQuantity?: number | null
  firstDocumentNo?: string | null
  lastDocumentNo?: string | null
  validFrom: string
  validUntil?: string | null
  createdAt: string
  updatedAt: string
}

export const FISCAL_DOCUMENT_TYPES = [
  'FA', 'FT', 'FR', 'FG', 'GF', 'AC', 'AR', 'TV', 'RC',
  'RG', 'RE', 'ND', 'NC', 'AF', 'RP', 'RA', 'CS', 'LD',
] as const

export interface ApiInvoiceLine {
  id: string
  productName: string
  productSku?: string | null
  quantity: number
  unitPrice: number
  taxRate: number
  taxAmount: number
  lineTotal: number
}

export interface ApiInvoice {
  id: string
  storeId: string
  orderId?: string | null
  seriesId: string
  documentType: string
  number: number
  documentNo: string
  status: string
  issueDate: string
  customerTaxId?: string | null
  currency: string
  subtotal: number
  discountTotal: number
  taxTotal: number
  total: number
  taxSummary: string
  signature: string
  qrUrl?: string | null
  agtStatus: string
  agtResponse?: string | null
  agtRequestId?: string | null
  agtValidatedAt?: string | null
  createdAt: string
  lines?: ApiInvoiceLine[]
  series?: ApiInvoiceSeries | null
}

export const AGT_INVOICE_STATUSES = ['PENDING', 'SUBMITTED', 'VALID', 'INVALID', 'REJECTED', 'FAILED'] as const

export async function fetchFiscalSettings(): Promise<ApiFiscalSettings> {
  const { data } = await api.get('/fiscal/settings')
  return data.settings
}

export async function updateFiscalSettings(payload: Partial<ApiFiscalSettings>): Promise<ApiFiscalSettings> {
  const { data } = await api.put('/fiscal/settings', payload)
  return data.settings
}

export async function fetchStoreFiscalProfile(storeId: string): Promise<ApiStoreFiscalProfile | null> {
  const { data } = await api.get(`/fiscal/stores/${storeId}/fiscal-profile`)
  return data.profile ?? null
}

export async function updateStoreFiscalProfile(
  storeId: string,
  payload: Partial<ApiStoreFiscalProfile>
): Promise<ApiStoreFiscalProfile> {
  const { data } = await api.put(`/fiscal/stores/${storeId}/fiscal-profile`, payload)
  return data.profile
}

export async function fetchStoreFiscalSeries(storeId: string): Promise<ApiInvoiceSeries[]> {
  const { data } = await api.get(`/fiscal/stores/${storeId}/series`)
  return data.series ?? []
}

export async function openInvoiceSeries(
  storeId: string,
  payload: { documentType: string; establishmentNumber?: string; year?: number }
): Promise<ApiInvoiceSeries> {
  const { data } = await api.post(`/fiscal/stores/${storeId}/series`, payload)
  return data.series
}

export async function fetchOrderInvoice(orderId: string): Promise<ApiInvoice[]> {
  const { data } = await api.get(`/fiscal/orders/${encodeURIComponent(orderId)}/invoice`)
  return (data.invoices ?? []) as ApiInvoice[]
}

export async function fetchInvoicePdf(invoiceId: string): Promise<Blob> {
  const { data } = await api.get(`/fiscal/invoices/${encodeURIComponent(invoiceId)}/pdf`, {
    responseType: 'blob',
  })
  return data as Blob
}

export async function emitOrderInvoice(
  orderId: string
): Promise<{ invoice: ApiInvoice; created: boolean }> {
  const { data } = await api.post(`/fiscal/orders/${encodeURIComponent(orderId)}/invoice`)
  return data
}

export async function refreshInvoiceAgtStatus(
  invoiceId: string
): Promise<{ invoice: ApiInvoice; refreshed: boolean; message?: string }> {
  const { data } = await api.post(`/fiscal/invoices/${encodeURIComponent(invoiceId)}/refresh-status`)
  return data
}

export function formatAoaCents(cents: number): string {
  return new Intl.NumberFormat('pt-AO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format((cents || 0) / 100)
}

