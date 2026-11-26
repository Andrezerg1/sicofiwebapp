import { format, subMonths } from 'date-fns';

export interface DemoTransaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
  spreadsheet_id: string;
  categories: { name: string; icon: string; color: string };
}

const STORAGE_KEY = 'sicofi-demo-transactions';

export const demoSheets = [
  { id: 'general', name: 'Controle mensal', color: '#6366f1' },
  { id: 'home', name: 'Casa', color: '#22c55e' },
];

function seed(): DemoTransaction[] {
  return Array.from({ length: 6 }, (_, i) => {
    const month = subMonths(new Date(), 5 - i);
    const date = (day: number) => format(new Date(month.getFullYear(), month.getMonth(), day), 'yyyy-MM-dd');
    const suffix = String(i);
    return [
      { id: 'salary-' + suffix, type: 'income' as const, amount: 4500 + i * 90, description: 'Salário', date: date(5), spreadsheet_id: 'general', categories: { name: 'Trabalho', icon: '💼', color: '#22c55e' } },
      { id: 'freelance-' + suffix, type: 'income' as const, amount: 750 + i * 35, description: 'Projeto extra', date: date(12), spreadsheet_id: 'general', categories: { name: 'Trabalho', icon: '💼', color: '#22c55e' } },
      { id: 'market-' + suffix, type: 'expense' as const, amount: 680 + i * 18, description: 'Supermercado', date: date(8), spreadsheet_id: 'home', categories: { name: 'Alimentação', icon: '🛒', color: '#f97316' } },
      { id: 'rent-' + suffix, type: 'expense' as const, amount: 1350, description: 'Aluguel', date: date(10), spreadsheet_id: 'home', categories: { name: 'Moradia', icon: '🏠', color: '#6366f1' } },
      { id: 'transport-' + suffix, type: 'expense' as const, amount: 240 + i * 8, description: 'Transporte', date: date(15), spreadsheet_id: 'general', categories: { name: 'Transporte', icon: '🚗', color: '#14b8a6' } },
    ];
  }).flat();
}

export function getDemoTransactions(): DemoTransaction[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // A demonstração continua com os dados iniciais se o armazenamento estiver indisponível.
  }
  return seed();
}

export function saveDemoTransactions(transactions: DemoTransaction[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch {
    // Os lançamentos ainda podem ser usados nesta sessão.
  }
}
