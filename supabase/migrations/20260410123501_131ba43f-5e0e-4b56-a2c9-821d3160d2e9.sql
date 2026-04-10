
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE TABLE public.financial_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  monthly_income NUMERIC DEFAULT 0,
  monthly_expenses NUMERIC DEFAULT 0,
  savings_goal NUMERIC DEFAULT 0,
  debt_total NUMERIC DEFAULT 0,
  income_sources JSONB DEFAULT '[]'::jsonb,
  expense_categories JSONB DEFAULT '[]'::jsonb,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.financial_onboarding ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own onboarding" ON public.financial_onboarding FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own onboarding" ON public.financial_onboarding FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own onboarding" ON public.financial_onboarding FOR UPDATE USING (auth.uid() = user_id);
CREATE TRIGGER update_onboarding_updated_at BEFORE UPDATE ON public.financial_onboarding FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE public.spreadsheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Minha Planilha',
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.spreadsheets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own spreadsheets" ON public.spreadsheets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own spreadsheets" ON public.spreadsheets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own spreadsheets" ON public.spreadsheets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own spreadsheets" ON public.spreadsheets FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_spreadsheets_updated_at BEFORE UPDATE ON public.spreadsheets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  icon TEXT,
  color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own categories" ON public.categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own categories" ON public.categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own categories" ON public.categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own categories" ON public.categories FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  spreadsheet_id UUID REFERENCES public.spreadsheets(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount NUMERIC NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions" ON public.transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions" ON public.transactions FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_transactions_user_date ON public.transactions(user_id, date);
CREATE INDEX idx_transactions_spreadsheet ON public.transactions(spreadsheet_id);
CREATE INDEX idx_categories_user ON public.categories(user_id);
CREATE INDEX idx_spreadsheets_user ON public.spreadsheets(user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user_defaults()
RETURNS TRIGGER AS $$
DECLARE
  sheet_id UUID;
BEGIN
  INSERT INTO public.spreadsheets (user_id, name, is_default)
  VALUES (NEW.id, 'Planilha Principal', true)
  RETURNING id INTO sheet_id;
  
  INSERT INTO public.categories (user_id, name, type, icon, color) VALUES
    (NEW.id, 'Salário', 'income', '💰', '#22c55e'),
    (NEW.id, 'Freelance', 'income', '💼', '#3b82f6'),
    (NEW.id, 'Investimentos', 'income', '📈', '#8b5cf6'),
    (NEW.id, 'Outros', 'income', '📦', '#6b7280'),
    (NEW.id, 'Alimentação', 'expense', '🍔', '#ef4444'),
    (NEW.id, 'Transporte', 'expense', '🚗', '#f97316'),
    (NEW.id, 'Moradia', 'expense', '🏠', '#eab308'),
    (NEW.id, 'Saúde', 'expense', '🏥', '#14b8a6'),
    (NEW.id, 'Educação', 'expense', '📚', '#6366f1'),
    (NEW.id, 'Lazer', 'expense', '🎮', '#ec4899'),
    (NEW.id, 'Compras', 'expense', '🛒', '#f43f5e'),
    (NEW.id, 'Contas', 'expense', '📄', '#64748b');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
CREATE TRIGGER on_auth_user_defaults AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user_defaults();
