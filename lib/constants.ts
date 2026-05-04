export const HKD_TO_GBP = 0.1 // hardcoded: 10 HKD = 1 GBP

export const CATEGORIES = [
  'Food & Drink',
  'Groceries',
  'Transport',
  'Bills & Utilities',
  'Shopping',
  'Health & Beauty',
  'Entertainment',
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
  'Investment / ISA': '📈',
  'Travel': '✈️',
  'Other': '📦',
}

export const CARDS = [
  'HK Card (HSBC HK)',
  'Barclaycard Avios',
  'Amex',
  'Chase',
  'Klarna',
  'Cash',
] as const

export const CARD_EMOJI: Record<string, string> = {
  'HK Card (HSBC HK)': '🏦',
  'Barclaycard Avios': '✈️',
  'Amex': '💳',
  'Chase': '🐇',
  'Klarna': '🛍️',
  'Cash': '💵',
}
