# SICOFI — Conteúdo editável da Sprint Review

Recorte acadêmico proposto; base 6ded93d. Para atualizar os slides após a validação.

## Slide 1 — SICOFI

Sprint Review • Preparação da AV2

### Sistema de Controle Financeiro

Do registro de receitas e despesas à compreensão do saldo mensal.

### André Zerger Bigaran

Análise e Desenvolvimento de Sistemas
Fatec Ourinhos

**Nota:** Material preliminar • recorte acadêmico reconstruído • versão 6ded93d

**Fala sugerida:** Apresentar o produto e os participantes reais. Explicar que o recorte foi organizado a partir da versão existente e será confirmado pelo grupo.

---

## Slide 2 — Qual problema queremos resolver?

Registros dispersos dificultam entender o dinheiro que entra e sai.

### Para quem

Pessoas que desejam organizar suas finanças pessoais. Público-alvo proposto a partir das funcionalidades.

### O que o produto reúne

Receitas, despesas, categorias, planilhas e consulta do saldo em uma aplicação web.

### Valor esperado

Facilitar o acompanhamento financeiro e a exportação dos registros. Ganhos de tempo ainda não medidos.

**Nota:** Stakeholders: usuários, equipe, docente e grupo convidado para a Review.

**Fala sugerida:** Conectar o problema aos usuários. Evitar afirmar economia de tempo ou redução de erros sem medição.

---

## Slide 3 — Do Product Goal ao Sprint Goal

Objetivos propostos para organizar a Review desta versão.

### Product Goal

Centralizar os lançamentos e permitir que o usuário compreenda o saldo e a distribuição das despesas.

### Sprint Goal proposto

Permitir que um usuário autenticado organize receitas e despesas em uma planilha, confira o saldo mensal e exporte os registros.

### Atendimento apurado

Implementação correspondente identificada no código. Cumprimento funcional e DoD ainda dependem de testes e evidências.

**Nota:** Datas e compromisso original da Sprint não localizados; não foi atribuído percentual de conclusão.

**Fala sugerida:** Explicar que o objetivo da Sprint é um resultado para o usuário. Confirmar com a equipe o objetivo e período realmente trabalhados.

---

## Slide 4 — Cinco histórias no recorte proposto

Capacidades selecionadas por formarem um fluxo completo de uso.

| ID | História / benefício | Situação verificável |
| --- | --- | --- |
| H01 | Acessar a conta e os próprios registros | Código identificado; validar acesso |
| H02 | Manter e localizar receitas e despesas | Código identificado; revisar exclusão |
| H04 | Organizar lançamentos em planilhas | Código identificado; validar isolamento |
| H03 | Compreender saldo e despesas do mês | Código identificado; percentuais fixos |
| H05 | Consultar dados exportados em XLSX/PDF | Código identificado; validar arquivos |

**Nota:** IA (H06), recuperação de senha (H07) e perfil (H08): código existente, fora deste recorte.

**Fala sugerida:** Apresentar a relação entre histórias e objetivo. As prioridades e a seleção foram reconstruídas; não são um Sprint Planning histórico.

---

## Slide 5 — Quando uma história pode ser Done?

Definition of Done proposta para orientar a validação do grupo.

### Funciona e persiste

Critérios atendidos, gravações conferidas após recarregar e mensagens de erro coerentes.

### Protege e é verificável

Acesso individual testado; build, análise estática e testes relevantes com resultados registrados.

### Tem evidência e revisão

Resultado associado à história e ao commit, com data, responsável e limitações documentadas.

**Nota:** Nesta preparação, nenhuma história foi certificada como Done. Código versionado é apenas parte da evidência.

**Fala sugerida:** Explicar que a existência da função não comprova execução ou aceite. O teste genérico encontrado não valida regras financeiras.

---

## Slide 6 — O que o repositório comprova

Evidência técnica real, fixada no commit 6ded93d.

| Evidência | Implementação identificada | Limite |
| --- | --- | --- |
| E01 • Acesso | Sessão e rotas protegidas | Login não executado |
| E02 • Transações | Criar, editar, excluir, buscar e filtrar | Persistência não testada |
| E03 • Dashboard | Receitas - despesas = saldo do mês | Variações fixas a corrigir |
| E04/E05 • Planilhas | Organização e exportação XLSX/PDF | Arquivos não gerados no app |
| E06 • Banco | RLS por usuário e valor > 0 na migração | Implantação/isolamento a testar |

**Nota:** As fontes e os trechos de código estão no documento de evidências; não há screenshots fictícios.

**Fala sugerida:** Abrir uma ou duas fontes clicáveis no documento. Não transformar esta etapa em uma explicação extensa de implementação.

---

## Slide 7 — Roteiro para mostrar o valor

Conta de teste e planilha Demo AV2 • dados fictícios no mês atual.

### 1. Acessar e registrar

Entrar na conta. Criar Demo AV2 e cadastrar uma receita de R$ 3.000 e despesas de R$ 450 e R$ 150.

### 2. Localizar e compreender

Pesquisar Mercado, filtrar despesas e consultar receitas, despesas e saldo no dashboard.

### 3. Levar o resultado

Abrir Demo AV2, exportar Excel e PDF e conferir os três registros nos arquivos.

**Nota:** Roteiro preparado, ainda não executado. Capturar as telas reais durante o ensaio.

**Fala sugerida:** Reservar cerca de 3 minutos para os slides 7–8. Deixar parte dos dados pronta e realizar pelo menos um cadastro ao vivo. Confirmar que não há outros lançamentos no mês.

---

## Slide 8 — Valores esperados na demonstração

Cálculo de referência para detectar inconsistências no produto.

- **Receitas:** R$ 3.000
- **Despesas:** R$ 600
- **Saldo:** R$ 2.400
- **Economia:** 80,0%

### Distribuição das despesas

Alimentação: R$ 450 (75%)
Transporte: R$ 150 (25%)

### Critérios a verificar

Três registros persistidos; totais corretos; XLSX e PDF com os mesmos lançamentos.

**Nota:** Valores calculados para dados fictícios. Não são resultados observados nem indicadores de uso real.

**Fala sugerida:** Conferir a tela com esses números. O dashboard agrega os lançamentos do usuário, não apenas a planilha selecionada; usar conta limpa.

---

## Slide 9 — Avanço identificado e valor a validar

Relacionar cada resultado à necessidade do usuário.

| Resultado no código | Contribuição esperada | Como demonstrar |
| --- | --- | --- |
| Transações e planilhas | Centralizar e organizar registros | Cadastrar, recarregar e localizar |
| Saldo mensal e categorias | Compreender a situação financeira | Conferir totais e distribuição |
| Exportação XLSX/PDF | Consultar registros fora do sistema | Abrir arquivos e comparar dados |
| Acesso individual | Restringir os dados à própria conta | Testar duas contas |

**Nota:** Ainda não há medição de tempo, satisfação, redução de erros ou aceite funcional neste pacote.

**Fala sugerida:** Mostrar benefícios a partir das ações e resultados observados, não apenas da lista de funcionalidades. Atualizar este slide após o ensaio.

---

## Slide 10 — O que precisa ser melhorado

Achados concretos da inspeção, com prioridade proposta.

### Confiabilidade dos indicadores

O dashboard contém +12% e -3% fixos. Calcular a comparação real ou remover os rótulos.

### Erros e exclusões

As exclusões não conferem explicitamente o erro antes da mensagem de sucesso. Planilhas têm exclusão em cascata no banco.

### Qualidade comprovada

O teste existente apenas verifica true. Faltam evidências de testes dos fluxos financeiros e do isolamento entre contas.

**Nota:** São ajustes identificados, não correções já realizadas. IA também exige validação adicional fora deste recorte.

**Fala sugerida:** Apresentar limitações sem ocultar seu efeito. Os testes, as capturas e os arquivos reais precisam ser produzidos antes da AV2.

---

## Slide 11 — Quadro reconstruído para a Review

Fotografia atual a confirmar pelo grupo; não é o histórico diário da Sprint.

| A fazer | Em execução confirmada | Implementado / a validar | Done comprovado |
| --- | --- | --- | --- |
| Executar roteiro e capturas | Sem registro confirmado | H01 • acesso | Nenhum item certificado |
| Corrigir comparativos | — | H02 • transações | — |
| Revisar exclusões | — | H04 • planilhas | — |
| Testar regras e isolamento | — | H03 • dashboard | — |
| Registrar aceite | — | H05 • exportação | — |

**Nota:** Objetivo: registrar → organizar → compreender → exportar. Mover para Done somente com evidências.

**Fala sugerida:** Confirmar datas, integrantes e papéis. Explicar impedimentos: ambiente não executado nesta preparação e ausência dos registros originais.

---

## Slide 12 — Inspecionar, ouvir e adaptar

A Review termina com informação útil para decidir o trabalho seguinte.

### Antes da AV2

Validar o fluxo, corrigir rótulos, registrar testes, capturas e exportações; confirmar tempo e dividir as falas.

### Com os stakeholders

O saldo fica claro? As planilhas ajudam? O que gera mais valor agora: comparativos corretos, IA ou outra necessidade?

### Após o feedback

Registrar observação, decisão, prioridade e responsável. Atualizar Product Backlog e material da apresentação.

**Nota:** Ensaio e feedback do docente ainda não realizados. Roteiro proposto: 10 minutos.

**Fala sugerida:** Solicitar observações concretas. Não apresentar sugestões como decisões já tomadas. Usar o registro de ajustes para acompanhar o retorno.
