export interface Expense {
  id: string
  amount: number
  currency: 'GBP' | 'HKD'
  amount_gbp: number
  categories: string[]
  payment_methods: string[]
  date: string
  created_at: string
}
