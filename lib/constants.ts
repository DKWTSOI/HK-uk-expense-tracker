export const HKD_TO_GBP = 0.1

export const CATEGORIES = [
  'Food & Drink',
  'Groceries',
  'Transport',
  'Bills & Utilities',
  'Shopping',
  'Health & Beauty',
  'Entertainment',
  'Subscriptions',
  'Investment / ISA',
  'Travel',
  'Other',
] as const

export const CATEGORY_EMOJI: Record<string, string> = {
  'Food & Drink': '🍜',
  'Groceries': '🛒',
  'Transport': '🚇',
  'Bills & Utilities': '💡',
  'Shopping': '🛍️',
  'Health & Beauty': '🌿',
  'Entertainment': '🎬',
  'Subscriptions': '🔔',
  'Investment / ISA': '📈',
  'Travel': '✈️',
  'Other': '📦',
}

export const PAYMENT_METHOD_GROUPS: { label: string; methods: string[] }[] = [
  {
    label: 'HK Cards',
    methods: [
      'HSBC HK Red Card',
      'HSBC HK Signature Card',
      'Mox',
    ],
  },
  {
    label: 'UK Cards',
    methods: [
      'Barclaycard Avios',
      'Amex',
      'Chase',
    ],
  },
  {
    label: 'Other',
    methods: [
      'Klarna',
      'Cash',
      'Direct Debit',
      'PayPal',
    ],
  },
]

export const PAYMENT_METHODS: string[] = PAYMENT_METHOD_GROUPS.flatMap(g => g.methods)

export const PAYMENT_METHOD_EMOJI: Record<string, string> = {
  'HSBC HK Red Card': '🔴',
  'HSBC HK Signature Card': '⚫',
  'Mox': '🟣',
  'Barclaycard Avios': '💳',
  'Amex': '💚',
  'Chase': '🔵',
  'Klarna': '🩷',
  'Cash': '💷',
  'Direct Debit': '🔄',
  'PayPal': '💙',
}
