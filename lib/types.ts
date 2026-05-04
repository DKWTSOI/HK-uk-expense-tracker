export interface Expense {
  id: string
  amount: number
  currency: 'GBP' | 'HKD'
  amount_gbp: number
  category: string
  card: string
  date: string
  created_at: string
}
