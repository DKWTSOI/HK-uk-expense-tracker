export type ExpenseType = 'expense' | 'refund' | 'cashback'

export interface Expense {
  id: string
  amount: number
  currency: 'GBP' | 'HKD'
  amount_gbp: number
  categories: string[]
  payment_methods: string[]
  type: ExpenseType
  notes: string | null
  recurring: boolean
  date: string
  created_at: string
}

export interface Budget {
  id: string
  user_id: string
  category: string
  cap_gbp: number
  period: 'monthly' | 'weekly'
  created_at: string
}
