# SICOFI — Evidências e demonstração

## 1. Escopo da verificação

**Snapshot analisado:** 6ded93d5b2a56fe871344b0a88b5e97e87b5353f. Inspeção de código e histórico, sem execução. Não foram geradas capturas de um produto em funcionamento, nem declarados testes aprovados.

As evidências abaixo comprovam implementação versionada. A execução deverá complementar essas evidências antes da apresentação.

## 2. Matriz de rastreabilidade

| Evidência | História | O que o código comprova | Fonte |
|---|---|---|---|
| E01 | H01 | Rota verifica sessão; página chama autenticação Supabase | [App.tsx:21](https://github.com/Andrezerg1/sicofiwebapp/blob/6ded93d5b2a56fe871344b0a88b5e97e87b5353f/src/App.tsx#L21) e [Auth.tsx](https://github.com/Andrezerg1/sicofiwebapp/blob/6ded93d5b2a56fe871344b0a88b5e97e87b5353f/src/pages/Auth.tsx) |
| E02 | H02 | Há gravação/edição, exclusão, pesquisa e filtro | [Transactions.tsx:83](https://github.com/Andrezerg1/sicofiwebapp/blob/6ded93d5b2a56fe871344b0a88b5e97e87b5353f/src/pages/Transactions.tsx#L83) e [filtro:131](https://github.com/Andrezerg1/sicofiwebapp/blob/6ded93d5b2a56fe871344b0a88b5e97e87b5353f/src/pages/Transactions.tsx#L131) |
| E03 | H03 | Totais mensais são calculados a partir dos lançamentos | [Dashboard.tsx:49](https://github.com/Andrezerg1/sicofiwebapp/blob/6ded93d5b2a56fe871344b0a88b5e97e87b5353f/src/pages/Dashboard.tsx#L49) |
| E04 | H04 | Há criação, listagem e consulta de planilhas | [Spreadsheets.tsx:69](https://github.com/Andrezerg1/sicofiwebapp/blob/6ded93d5b2a56fe871344b0a88b5e97e87b5353f/src/pages/Spreadsheets.tsx#L69) |
| E05 | H05 | Há funções de exportação Excel e PDF | [Excel:101](https://github.com/Andrezerg1/sicofiwebapp/blob/6ded93d5b2a56fe871344b0a88b5e97e87b5353f/src/pages/Spreadsheets.tsx#L101) e [PDF:117](https://github.com/Andrezerg1/sicofiwebapp/blob/6ded93d5b2a56fe871344b0a88b5e97e87b5353f/src/pages/Spreadsheets.tsx#L117) |
| E06 | H01/H02/H04 | Migração define RLS por usuário e restrição de valor positivo | [migração:85](https://github.com/Andrezerg1/sicofiwebapp/blob/6ded93d5b2a56fe871344b0a88b5e97e87b5353f/supabase/migrations/20260410123501_131ba43f-5e0e-4b56-a2c9-821d3160d2e9.sql#L85) |
| E07 | H06, fora do recorte | Interpretação por função externa e confirmação antes de inserir | [AITransactions.tsx:41](https://github.com/Andrezerg1/sicofiwebapp/blob/6ded93d5b2a56fe871344b0a88b5e97e87b5353f/src/pages/AITransactions.tsx#L41) e [confirmação:66](https://github.com/Andrezerg1/sicofiwebapp/blob/6ded93d5b2a56fe871344b0a88b5e97e87b5353f/src/pages/AITransactions.tsx#L66) |
| E08 | H09/H11 | Percentuais fixos e teste genérico evidenciam pendências | [Dashboard.tsx:77](https://github.com/Andrezerg1/sicofiwebapp/blob/6ded93d5b2a56fe871344b0a88b5e97e87b5353f/src/pages/Dashboard.tsx#L77) e [teste](https://github.com/Andrezerg1/sicofiwebapp/blob/6ded93d5b2a56fe871344b0a88b5e97e87b5353f/src/test/example.test.ts) |

**Limite de E06:** a migração versionada não comprova implantação no banco nem isolamento efetivo. É preciso testar acesso cruzado e associação entre registros de usuários distintos.

## 3. Trechos verificáveis

### E02 — src/pages/Transactions.tsx:83

[Fonte fixada no commit](https://github.com/Andrezerg1/sicofiwebapp/blob/6ded93d5b2a56fe871344b0a88b5e97e87b5353f/src/pages/Transactions.tsx#L83)

```tsx
  const handleSave = async () => {
    if (!user || !form.description || !form.amount) return;
    const payload = {
      user_id: user.id,
      type: form.type,
      amount: parseFloat(form.amount),
      description: form.description,
      date: form.date,
      category_id: form.category_id || null,
```

### E03 — src/pages/Dashboard.tsx:49

[Fonte fixada no commit](https://github.com/Andrezerg1/sicofiwebapp/blob/6ded93d5b2a56fe871344b0a88b5e97e87b5353f/src/pages/Dashboard.tsx#L49)

```tsx
  const currentTransactions = transactions.filter(t => t.date >= monthStart && t.date <= monthEnd);
  const totalIncome = currentTransactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = currentTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
  const balance = totalIncome - totalExpense;

  // Monthly chart data
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const month = subMonths(currentMonth, 5 - i);
    const mStart = format(startOfMonth(month), 'yyyy-MM-dd');
```

### E05 — src/pages/Spreadsheets.tsx:101

[Fonte fixada no commit](https://github.com/Andrezerg1/sicofiwebapp/blob/6ded93d5b2a56fe871344b0a88b5e97e87b5353f/src/pages/Spreadsheets.tsx#L101)

```tsx
  const exportExcel = () => {
    const sheet = sheets.find(s => s.id === selectedSheet);
    const wsData = sheetTransactions.map(t => ({
      Data: formatDate(t.date),
      Descrição: t.description,
      Categoria: t.categories?.name || 'Sem categoria',
      Tipo: t.type === 'income' ? 'Receita' : 'Despesa',
      Valor: Number(t.amount),
    }));
```

### E06 — supabase/migrations/20260410123501_131ba43f-5e0e-4b56-a2c9-821d3160d2e9.sql:99

[Fonte fixada no commit](https://github.com/Andrezerg1/sicofiwebapp/blob/6ded93d5b2a56fe871344b0a88b5e97e87b5353f/supabase/migrations/20260410123501_131ba43f-5e0e-4b56-a2c9-821d3160d2e9.sql#L99)

```sql
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions" ON public.transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions" ON public.transactions FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_transactions_user_date ON public.transactions(user_id, date);
CREATE INDEX idx_transactions_spreadsheet ON public.transactions(spreadsheet_id);
```

### E08a — src/pages/Dashboard.tsx:77

[Fonte fixada no commit](https://github.com/Andrezerg1/sicofiwebapp/blob/6ded93d5b2a56fe871344b0a88b5e97e87b5353f/src/pages/Dashboard.tsx#L77)

```tsx
  const statCards = [
    { title: 'Receitas', value: totalIncome, icon: ArrowUpRight, gradient: 'gradient-income', change: '+12%' },
    { title: 'Despesas', value: totalExpense, icon: ArrowDownLeft, gradient: 'gradient-expense', change: '-3%' },
    { title: 'Saldo', value: balance, icon: Wallet, gradient: 'gradient-primary', change: balance >= 0 ? 'Positivo' : 'Negativo' },
    { title: 'Economia', value: totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0, icon: TrendingUp, gradient: 'gradient-primary', isPercent: true },
  ];

  if (loading) {
    return (
```

### E08b — src/test/example.test.ts:3

[Fonte fixada no commit](https://github.com/Andrezerg1/sicofiwebapp/blob/6ded93d5b2a56fe871344b0a88b5e97e87b5353f/src/test/example.test.ts#L3)

```tsx
describe("example", () => {
  it("should pass", () => {
    expect(true).toBe(true);
  });
});

```

## 4. Preparação do ambiente

1. Usar a versão analisada ou registrar outro commit caso o grupo apresente uma versão mais recente.
2. Seguir o README: instalar dependências, configurar o ambiente Supabase e iniciar a aplicação.
3. Executar `npm run build`, `npm run lint` e `npm test`; guardar saída e resultado. Esses comandos não foram executados nesta preparação.
4. Confirmar a aplicação das migrações, a autenticação e as políticas de acesso no ambiente de demonstração.
5. Utilizar uma conta exclusiva de teste, sem transações anteriores, e uma segunda conta para verificar isolamento.
6. Usar dados fictícios e registrar data, responsável, versão e URL/ambiente. Não publicar senhas ou dados financeiros reais.

## 5. Dados de demonstração — resultados esperados, não observados

Criar a planilha **Demo AV2**. Cadastrar os três lançamentos abaixo no **mês em que a demonstração ocorrer**, selecionando essa planilha. O dashboard calcula o mês corrente e considera as planilhas do usuário; por isso, a conta precisa estar sem outros lançamentos no mês.

| Descrição | Tipo | Categoria | Valor |
|---|---|---|---|
| Salário demonstração | Receita | Salário | R$ 3.000,00 |
| Mercado demonstração | Despesa | Alimentação | R$ 450,00 |
| Transporte demonstração | Despesa | Transporte | R$ 150,00 |

**Conferência esperada:** 3 registros; receitas R$ 3.000,00; despesas R$ 600,00; saldo R$ 2.400,00; economia 80,0%; distribuição das despesas: alimentação 75% e transporte 25%.

Esses números foram calculados a partir do conjunto fictício. Não representam resultados observados no aplicativo.

## 6. Roteiro principal da demonstração — 3 minutos sugeridos

| Passo | Ação | Evidência a capturar | Aceitação vinculada |
|---|---|---|---|
| 1 | Entrar na conta de teste e mostrar o menu | Captura da sessão, sem dados sensíveis | CA01.1 |
| 2 | Abrir/criar Demo AV2 e cadastrar os três lançamentos | Lista com descrição, tipo, valor, data e planilha | CA02.1 / CA04.1 |
| 3 | Pesquisar “Mercado” e filtrar despesas | Resultado coerente com o filtro | CA02.2 |
| 4 | Abrir o dashboard | Totais de 3.000 / 600 / 2.400 e economia de 80% | CA03.1–2 |
| 5 | Abrir Demo AV2 e exportar Excel e PDF | Dois arquivos abertos com os mesmos 3 registros | CA05.1–2 |
| 6 | Explicar o benefício e pedir feedback | Registro de observação dos stakeholders | Product Goal |

Para caber no tempo, deixar parte dos dados preparada e realizar ao menos um cadastro durante a demonstração. Não usar os rótulos fixos “+12%” e “-3%” como prova de resultado.

## 7. Validações complementares antes da Review

| Teste | Procedimento e resultado esperado | Situação |
|---|---|---|
| T01 | Credenciais incorretas: mensagem de erro e nenhum acesso | Não executado |
| T02 | Editar Mercado para 400: despesas 550; saldo 2.450; economia aproximadamente 81,7%. Restaurar 450 após o teste. | Não executado |
| T03 | Criar e excluir uma transação fictícia adicional; confirmar persistência da exclusão após recarregar | Não executado |
| T04 | Enviar valor zero/negativo: rejeição, sem gravação nem mensagem de sucesso | Não executado |
| T05 | Usar outra conta: não ler, alterar ou associar lançamentos à planilha da primeira conta | Não executado |
| T06 | Lançamento de outro mês: não alterar os cartões do mês atual | Não executado |
| T07 | Exportar planilha vazia e planilha com acentos; abrir XLSX/PDF e conferir os campos | Não executado |
| T08 | Simular falha de exclusão em ambiente controlado: não exibir sucesso; defeito provável identificado no código | Não executado |
| T09 | Cadastrar transação em outra planilha: não incluí-la na exportação de Demo AV2 | Não executado |

A exclusão de uma planilha pode apagar seus lançamentos por cascata. Testar somente com dados descartáveis e registrar a necessidade de confirmação e aviso.

## 8. IA — demonstração opcional, fora do Sprint Goal proposto

Frase sugerida: “Gastei 45 reais no almoço hoje”. Mostrar interpretação, conferir valor/tipo/data/categoria e confirmar antes de salvar. O fluxo depende da função Supabase, da configuração do provedor e de disponibilidade/créditos. Não foi executado. A validação do JSON devolvido é parcial no código; não declarar precisão garantida.

Se a IA não estiver disponível, explicar a dependência e manter a demonstração principal no fluxo manual. Se for executada, usar outra conta ou restaurar o conjunto de dados para não alterar os totais do roteiro.

## 9. Registro de execução para preencher após testes

| Campo | Valor atual |
|---|---|
| Data e responsável | Pendente |
| Commit e ambiente efetivamente executados | Pendente |
| Critérios aprovados/reprovados | Pendente |
| Capturas e arquivos exportados | Ainda não produzidos |
| Defeitos observados durante a execução | Ainda não apurados |
| Aceite do grupo e adaptações do backlog | Pendente |

## 10. Perguntas aos stakeholders

- O fluxo ajuda a compreender o saldo mensal e o destino das despesas?
- É mais útil priorizar comparativos mensais corretos, IA ou outra necessidade?
- A organização por planilhas e as exportações atendem ao uso esperado?
- Que informação ficou confusa ou ausente?

Registrar observações como feedback, sem tratá-las automaticamente como compromisso da próxima Sprint.
