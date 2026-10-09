/**
 * Configuração centralizada do quiz.
 * Altere copies, opções e ícones aqui sem mexer na lógica da aplicação.
 * Os `id` das opções são usados pela qualificação de leads (src/lib/qualification.ts):
 * se renomear um id, atualize também a qualificação.
 */
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  CalendarRange,
  Eye,
  Handshake,
  Lightbulb,
  MapPin,
  Pill,
  RotateCcw,
  Search,
  ShoppingCart,
  Sparkles,
  Sprout,
  TrendingUp,
  Warehouse,
  Zap,
  type LucideIcon,
} from 'lucide-react';

export type StepId =
  | 'welcome'
  | 'establishment'
  | 'location'
  | 'resale'
  | 'budget'
  | 'relationship'
  | 'timing'
  | 'contact'
  | 'success';

/** Ordem das telas. A barra de progresso e o indicador de etapa derivam desta lista. */
export const STEP_ORDER: StepId[] = [
  'welcome',
  'establishment',
  'location',
  'resale',
  'budget',
  'relationship',
  'timing',
  'contact',
  'success',
];

/** Número de etapas exibido no indicador ("Etapa X de N"): tudo entre a abertura e a finalização. */
export const TOTAL_STEPS = STEP_ORDER.length - 2;

export type ChoiceQuestionId = 'establishment' | 'resale' | 'budget' | 'relationship' | 'timing';

export interface QuizOption {
  id: string;
  label: string;
  /** Ícone minimalista exibido no card. */
  icon?: LucideIcon;
  /** Alternativa ao ícone: indicador de nível (1–4), usado nas faixas de investimento. */
  level?: number;
}

export interface ChoiceQuestion {
  id: ChoiceQuestionId;
  title: string;
  subtitle: string;
  options: QuizOption[];
  /** Rótulo curto usado na mensagem do WhatsApp e no resumo. */
  summaryLabel: string;
}

export const QUESTIONS: Record<ChoiceQuestionId, ChoiceQuestion> = {
  establishment: {
    id: 'establishment',
    title: 'Qual é o tipo do seu estabelecimento?',
    subtitle: 'Queremos entender melhor o seu negócio para direcionar seu atendimento.',
    summaryLabel: 'Tipo de estabelecimento',
    options: [
      { id: 'cosmetics', label: 'Loja de cosméticos ou perfumaria', icon: Sparkles },
      { id: 'pharmacy', label: 'Farmácia ou drogaria', icon: Pill },
      { id: 'supermarket', label: 'Supermercado ou mercadinho', icon: ShoppingCart },
      { id: 'distributor', label: 'Distribuidora ou atacadista', icon: Warehouse },
      { id: 'other', label: 'Outro tipo de comércio', icon: Building2 },
      { id: 'none', label: 'Ainda não tenho estabelecimento', icon: Lightbulb },
    ],
  },
  resale: {
    id: 'resale',
    title: 'Sua loja já vende óleos e produtos capilares?',
    subtitle: 'Queremos conhecer sua experiência com essa categoria de produtos.',
    summaryLabel: 'Já vende produtos capilares',
    options: [
      { id: 'frequent', label: 'Sim, vendo com frequência', icon: TrendingUp },
      { id: 'little', label: 'Sim, mas ainda vendo pouco', icon: Sprout },
      { id: 'starting', label: 'Não, quero começar a trabalhar com essa linha', icon: Sparkles },
    ],
  },
  budget: {
    id: 'budget',
    title: 'Quanto sua loja costuma investir em cosméticos por mês?',
    subtitle:
      'Selecione a faixa que mais se aproxima do valor das suas compras para reposição de estoque.',
    summaryLabel: 'Volume mensal de compras',
    options: [
      { id: 'upto500', label: 'Até R$ 500', level: 1 },
      { id: '501to1500', label: 'De R$ 501 a R$ 1.500', level: 2 },
      { id: '1501to3000', label: 'De R$ 1.501 a R$ 3.000', level: 3 },
      { id: 'above3000', label: 'Acima de R$ 3.000', level: 4 },
      { id: 'none', label: 'Ainda não compro cosméticos', level: 0 },
    ],
  },
  relationship: {
    id: 'relationship',
    title: 'Você já trabalha com produtos da MZ3 Cosméticos?',
    subtitle:
      'Assim conseguimos entender se você está conhecendo nossa marca ou deseja voltar a comprar.',
    summaryLabel: 'Relacionamento com a MZ3',
    options: [
      { id: 'current', label: 'Sim, compro atualmente', icon: BadgeCheck },
      { id: 'stopped', label: 'Já comprei, mas parei', icon: RotateCcw },
      { id: 'aware', label: 'Conheço, mas nunca comprei', icon: Eye },
      { id: 'unaware', label: 'Ainda não conheço a MZ3', icon: Handshake },
    ],
  },
  timing: {
    id: 'timing',
    title: 'Quando você pretende abastecer ou repor o estoque da sua loja?',
    subtitle:
      'Estamos quase terminando! Essa informação ajuda nossa equipe a preparar o seu atendimento.',
    summaryLabel: 'Previsão de compra',
    options: [
      { id: 'asap', label: 'O mais rápido possível', icon: Zap },
      { id: '7days', label: 'Nos próximos 7 dias', icon: CalendarDays },
      { id: '30days', label: 'Nos próximos 30 dias', icon: CalendarRange },
      { id: 'researching', label: 'Estou apenas pesquisando fornecedores', icon: Search },
    ],
  },
};

/* ------------------------------------------------------------------ */
/* Localização                                                         */
/* ------------------------------------------------------------------ */

export type StateOptionId = 'PI' | 'MA';

export const LOCATION_STEP = {
  title: 'Onde fica o seu estabelecimento?',
  subtitle: 'Estamos expandindo nossa presença comercial no Piauí e Maranhão.',
  options: [
    { id: 'PI', label: 'Piauí', icon: MapPin },
    { id: 'MA', label: 'Maranhão', icon: MapPin },
  ] as (QuizOption & { id: StateOptionId })[],
  cityLabel: 'Cidade',
  cta: 'Continuar',
};

/** Sugestões de autocompletar (o campo aceita qualquer cidade). */
export const CITY_SUGGESTIONS: Record<'PI' | 'MA', string[]> = {
  PI: [
    'Teresina', 'Parnaíba', 'Picos', 'Piripiri', 'Floriano', 'Barras', 'Campo Maior',
    'União', 'Altos', 'Esperantina', 'José de Freitas', 'Pedro II', 'Oeiras',
    'São Raimundo Nonato', 'Bom Jesus', 'Corrente', 'Luís Correia', 'Valença do Piauí',
  ],
  MA: [
    'São Luís', 'Imperatriz', 'São José de Ribamar', 'Timon', 'Caxias', 'Paço do Lumiar',
    'Codó', 'Açailândia', 'Bacabal', 'Balsas', 'Santa Inês', 'Pinheiro', 'Chapadinha',
    'Barra do Corda', 'Grajaú', 'Itapecuru Mirim', 'Coroatá', 'Presidente Dutra',
  ],
};

/* ------------------------------------------------------------------ */
/* Copies das telas fixas                                              */
/* ------------------------------------------------------------------ */

export const WELCOME_COPY = {
  eyebrow: 'Para lojistas do Piauí e Maranhão',
  headlineBefore: 'Abasteça sua loja com a ',
  headlineHighlight: 'linha Keratex',
  headlineAfter: ' da MZ3 Cosméticos',
  subheadline:
    'Conheça nossa linha de óleos capilares e descubra como levar os produtos MZ3 para o seu estabelecimento.',
  support: 'Responda algumas perguntas rápidas para receber um atendimento comercial personalizado.',
  benefits: [
    'Linha de óleos capilares para revenda.',
    'Atendimento comercial para lojistas.',
    'Consulte produtos e condições de fornecimento.',
  ],
  cta: 'Quero revender MZ3',
  microcopy: 'Leva menos de 1 minuto.',
};

export const CONTACT_COPY = {
  title: 'Falta pouco para conhecer as condições comerciais da MZ3!',
  subtitle:
    'Informe seus dados para que nossa equipe possa identificar seu estabelecimento e continuar seu atendimento.',
  fields: {
    name: { label: 'Nome completo', placeholder: 'Seu nome e sobrenome' },
    business: { label: 'Nome do estabelecimento', placeholder: 'Ex.: Perfumaria Central' },
    whatsapp: { label: 'WhatsApp com DDD', placeholder: '(86) 99999-9999' },
    cnpj: { label: 'CNPJ', placeholder: '00.000.000/0000-00', hint: 'Opcional' },
  },
  consent:
    'Autorizo a MZ3 Cosméticos a entrar em contato comigo pelo WhatsApp e telefone informados para fins comerciais.',
  cta: 'Quero conhecer as condições',
  sending: 'Enviando…',
  microcopy: 'Seus dados serão utilizados para dar continuidade ao seu atendimento comercial.',
};

export const SUCCESS_COPY = {
  title: 'Pronto! Agora é hora de conhecer a linha Keratex.',
  /** Usado quando o CRM confirmou o recebimento. */
  subtitleSaved:
    'Suas respostas foram registradas. Clique abaixo para conversar com nossa equipe, conhecer os produtos disponíveis e consultar as condições comerciais para sua loja.',
  /** Usado quando o CRM não confirmou — evita afirmar um registro que não aconteceu. */
  subtitleUnsaved:
    'Suas respostas estão prontas. Clique abaixo para enviá-las à nossa equipe, conhecer os produtos disponíveis e consultar as condições comerciais para sua loja.',
  cta: 'Falar com um consultor no WhatsApp',
  microcopy: 'Você será direcionado para o atendimento comercial da MZ3 Cosméticos.',
};

export const WHATSAPP_INTRO =
  'Olá! Preenchi o quiz da MZ3 Cosméticos e gostaria de conhecer a linha Keratex e as condições comerciais para revenda.';
