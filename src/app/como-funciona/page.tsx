import Link from 'next/link'
import { ChevronRight, Search, CreditCard, Truck, Shield, Clock, Headphones, CheckCircle } from 'lucide-react'

const steps = [
  {
    icon: Search,
    title: 'Pesquise o que precisa',
    description: 'Navegue por categorias, pesquise por produtos especificos ou explore as lojas parceiras. Encontre milhares de produtos de vendedores verificados em todo o pais.',
  },
  {
    icon: CreditCard,
    title: 'Escolha como pagar',
    description: 'Opte por Multicaixa Express, transferencia bancaria ou pagamento na entrega. O sistema garante que o pagamento so e liberado quando voce confirmar o recebimento.',
  },
  {
    icon: Truck,
    title: 'Receba em seguranca',
    description: 'O produto e enviado directamente do vendedor ate a sua porta. Acompanhe o estado do seu pedido em tempo real. Entrega em todas as provincias de Angola.',
  },
]

const benefits = [
  {
    icon: Shield,
    title: 'Compras Protegidas',
    description: 'Se o produto nao chegar ou nao corresponder à descricao, devolvemos o seu dinheiro.',
  },
  {
    icon: Clock,
    title: 'Entrega Rapida',
    description: 'Entrega em 24-72 horas em Luanda e 3-7 dias para outras provincias.',
  },
  {
    icon: Headphones,
    title: 'Suporte 24/7',
    description: 'A nossa equipa esta disponível para ajudar sempre que precisar.',
  },
  {
    icon: CheckCircle,
    title: 'Vendedores Verificados',
    description: 'Todos os vendedores passam por um processo rigoroso de verificacao.',
  },
]

const faq = [
  {
    question: 'Como me registro no Pambala?',
    answer: 'Clique em "Registar" no canto superior direito. Preencha os seus dados e escolha se quer ser comprador ou vendedor. E gratuito!',
  },
  {
    question: 'Como vendo os meus produtos?',
    answer: 'Registe-se como vendedor, crie a sua loja e comeca a anunciar os seus produtos. E simples e rapido.',
  },
  {
    question: 'O pagamento e seguro?',
    answer: 'Sim! Usamos sistema de escrow. O pagamento so e liberado para o vendedor quando voce confirma o recebimento do produto.',
  },
  {
    question: 'Qual o prazo de entrega?',
    answer: 'Em Luanda: 24-72 horas. Noutras provincias: 3-7 dias uteis. O prazo pode variar conforme o vendedor e localizacao.',
  },
  {
    question: 'Posso devolver um produto?',
    answer: 'Sim, tem 7 dias para devolver o produto se nao estiver satisfeito. O reembolso e processado em ate 48 horas.',
  },
]

export default function ComoFuncionaPage() {
  return (
    <div>
      <div className="bg-gradient-to-br from-emerald-600 to-green-500 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-20">
          <nav className="flex items-center gap-1.5 text-sm text-emerald-100 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span>Como Funciona</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Como Funciona o Pambala</h1>
          <p className="text-emerald-100 text-lg max-w-2xl">
            O Pambala conecta compradores e vendedores em toda Angola. Veja como e simples comprar e vender na nossa plataforma.
          </p>
        </div>
      </div>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center mb-4">
            3 Passos Simples
          </h2>
          <p className="text-center text-gray-500 mb-12 max-w-lg mx-auto">
            Comprar no Pambala e facil e seguro
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => {
              const Icon = step.icon
              return (
                <div key={i} className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-400 text-white shadow-lg">
                    <Icon className="h-7 w-7" />
                  </div>
                  <div className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                    {i + 1}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">{step.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-[#111827]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            Por que escolher o Pambala?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, i) => {
              const Icon = benefit.icon
              return (
                <div key={i} className="rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 mb-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{benefit.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{benefit.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            Perguntas Frequentes
          </h2>
          <div className="space-y-4">
            {faq.map((item, i) => (
              <details key={i} className="group rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-50 transition-colors">
                  {item.question}
                  <span className="ml-4 shrink-0 text-gray-400 group-open:rotate-180 transition-transform">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </span>
                </summary>
                <div className="px-6 pb-4 text-sm text-gray-600 leading-relaxed">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-emerald-600 to-green-500 text-white text-center">
        <div className="mx-auto max-w-xl px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Pronto para comecar?</h2>
          <p className="text-emerald-100 mb-6">Junte-se a milhares de angolanos que ja compram e vendem no Pambala.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register">
              <button className="h-12 px-8 rounded-xl bg-white dark:bg-gray-800 text-emerald-700 dark:text-emerald-400 font-semibold hover:bg-gray-100 transition-colors w-full sm:w-auto">
                Criar Conta Gratis
              </button>
            </Link>
            <Link href="/produtos">
              <button className="h-12 px-8 rounded-xl border-2 border-white text-white font-semibold hover:bg-white/10 transition-colors w-full sm:w-auto">
                Explorar Produtos
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
