export const HKD_TO_GBP = 0.1

export const CATEGORIES = [
  'Food & Drink',
  'Groceries',
  'Transport',
  'Bills & Utilities',
  'Shopping',
  'Health & Beauty',
  'Entertainment',
  'Concert',
  'Subscriptions',
  'Investment / ISA',
  'Travel',
  'Amazon',
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
  'Concert': '🎵',
  'Subscriptions': '🔔',
  'Investment / ISA': '📈',
  'Travel': '✈️',
  'Amazon': '📦',
  'Other': '🗂️',
}

export const PAYMENT_METHOD_GROUPS: { label: string; methods: string[] }[] = [
  {
    label: 'HK Cards',
    methods: [
      'HSBC HK Red Card',
      'HSBC HK Signature Card',
    ],
  },
  {
    label: 'UK Cards',
    methods: [
      'Barclaycard Avios',
      'Amex Avios',
      'Chase Debit Card',
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
  'Barclaycard Avios': '💳',
  'Amex Avios': '🇺🇸',
  'Chase Debit Card': '🔵',
  'Klarna': '🩷',
  'Cash': '💷',
  'Direct Debit': '🔄',
  'PayPal': '💙',
}
