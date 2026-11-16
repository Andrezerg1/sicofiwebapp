# SICOFI — Artefatos da Sprint

**Base:** commit 6ded93d5b2a56fe871344b0a88b5e97e87b5353f. **Natureza:** reconstrução acadêmica proposta para a S2.8.  
**Sprint:** “Controle financeiro básico” (nome proposto). Período real não identificado.

## 1. Visão do Produto

O SICOFI — Sistema de Controle Financeiro — é uma aplicação web para registrar receitas e despesas, organizar lançamentos em planilhas e consultar indicadores financeiros. Também apresenta código para lançamentos assistidos por IA e exportação de dados.

**Problema proposto a partir das funcionalidades:** registros dispersos dificultam saber quanto entrou, quanto saiu e como os gastos se distribuem.  
**Público-alvo proposto:** pessoas que desejam organizar suas finanças pessoais.  
**Valor esperado:** centralizar os registros e facilitar a consulta do saldo mensal, das categorias e do histórico. Redução de tempo e de erros é uma hipótese a medir, não um benefício já comprovado.

### Stakeholders

| Parte interessada | Necessidade | Como participa da Review |
|---|---|---|
| Usuário das finanças pessoais | Registrar e compreender suas receitas e despesas | Avalia se o fluxo atende ao uso cotidiano |
| Equipe de desenvolvimento | Validar o produto e orientar o trabalho seguinte | Demonstra, registra limitações e recebe sugestões |
| Docente | Verificar coerência entre planejamento, Incremento e evidências | Faz a pré-avaliação e orienta ajustes |
| Grupo convidado como stakeholders | Inspecionar clareza e valor da solução | Avalia o fluxo e propõe adaptações do backlog |

## 2. Product Goal proposto

Disponibilizar uma aplicação web na qual o usuário consiga centralizar seus lançamentos financeiros e compreender o saldo e a distribuição das despesas, com acesso individual e possibilidade de exportar os registros.

**Indicadores de verificação propostos:** concluir o fluxo login → registro → consulta → exportação; conferir os totais com dados conhecidos; demonstrar separação dos dados entre usuários. Esses critérios ainda exigem execução.

## 3. Sprint Goal proposto e atendimento

**Objetivo:** permitir que um usuário autenticado organize receitas e despesas em uma planilha, confira seu saldo mensal e exporte os registros para consulta.

**Seleção reconstruída:** H01, H02, H03, H04 e H05.  
**Atendimento apurado:** implementação correspondente identificada no código; atendimento funcional ainda não demonstrado nesta preparação. Não é possível atribuir percentual de conclusão confiável ou declarar o objetivo integralmente atingido.

### Regra de status

- **Implementação identificada / a validar:** há código para o fluxo; falta executar critérios e guardar evidências.
- **Ajuste identificado:** a leitura revelou uma limitação concreta.
- **Proposto:** melhoria acrescentada nesta preparação, sem alegação de execução.
- **Done:** somente após todos os critérios da DoD acordada serem comprovados.

## 4. Product Backlog priorizado proposto

A ordem abaixo foi reconstruída; não representa uma priorização histórica do grupo. “Selecionada” indica o recorte desta Review, não um compromisso de Sprint documentado anteriormente.

| Ordem | ID | História de usuário | Selecionada | Situação |
|---|---|---|---|---|
| 1 | H01 | Como usuário, quero entrar na minha conta para acessar meus registros financeiros. | Sim | Implementação identificada; a validar |
| 2 | H02 | Como usuário, quero cadastrar, editar, excluir e localizar receitas e despesas para manter meus registros atualizados. | Sim | Implementação identificada; tratamento de exclusão a revisar |
| 3 | H04 | Como usuário, quero organizar transações em planilhas para separar conjuntos de registros. | Sim | Implementação identificada; exclusão a revisar |
| 4 | H03 | Como usuário, quero consultar receitas, despesas e saldo mensal para compreender minha situação financeira. | Sim | Implementação identificada; percentuais comparativos fixos |
| 5 | H05 | Como usuário, quero exportar uma planilha em Excel e PDF para consultar ou compartilhar meus registros. | Sim | Implementação identificada; arquivos a validar |
| 6 | H09 | Como usuário, quero indicadores comparativos calculados com dados reais para confiar no dashboard. | Não | Ajuste proposto |
| 7 | H10 | Como usuário, quero mensagens de erro corretas e confirmação de exclusão para evitar perda involuntária de dados. | Não | Ajuste proposto |
| 8 | H11 | Como usuário, quero que os fluxos financeiros e o isolamento dos meus dados sejam testados para usar o sistema com confiança. | Não | Melhoria de qualidade proposta |
| 9 | H07 | Como usuário, quero recuperar minha senha para retomar o acesso à conta. | Não | Código existente; validar e-mail e redirecionamento |
| 10 | H06 | Como usuário, quero descrever uma transação em linguagem natural e confirmá-la antes de salvar. | Não | Código existente; validar integração externa |
| 11 | H08 | Como usuário, quero manter meu nome e dados financeiros de referência atualizados. | Não | Código existente; erros de gravação a revisar |

### Critérios de aceitação propostos — histórias selecionadas

**H01 — Acesso**
- CA01.1: com credenciais válidas, abrir o dashboard; sem sessão, redirecionar para autenticação.
- CA01.2: com senha inválida, exibir erro e não liberar acesso.
- CA01.3: ao sair, perder acesso às rotas protegidas; com duas contas de teste, não consultar os registros da outra conta.

**H02 — Transações**
- CA02.1: cadastrar receita e despesa com valor positivo, descrição e data; recarregar e conferir persistência.
- CA02.2: editar valor e descrição; localizar por texto e filtrar por tipo.
- CA02.3: excluir um registro de teste e conferir sua ausência; falha de exclusão não deve aparecer como sucesso.
- CA02.4: rejeitar valor zero ou negativo e informar o erro. A restrição existe na migração; deve-se verificar sua aplicação e a experiência da interface.

**H04 — Planilhas**
- CA04.1: criar “Demo AV2”, selecionar essa planilha nos lançamentos e visualizar somente os seus registros.
- CA04.2: conferir quantidade de lançamentos, total de receitas e total de despesas.
- CA04.3: verificar que outra conta não acessa essa planilha.
- CA04.4: não excluir dados sem explicação clara do efeito. A exclusão em cascata das transações está prevista na migração e precisa ser revisada na interface.

**H03 — Dashboard**
- CA03.1: no mês atual, calcular receitas de R$ 3.000, despesas de R$ 600 e saldo de R$ 2.400 para o conjunto de teste.
- CA03.2: exibir taxa de economia de 80,0% e despesas por categoria coerentes.
- CA03.3: não incluir lançamento de outro mês nos cartões do mês atual.
- CA03.4: toda variação exibida como indicador deve ser calculada ou removida. O código atual contém “+12%” e “-3%” fixos, portanto este critério possui uma lacuna identificada.

**H05 — Exportação**
- CA05.1: exportar a planilha selecionada em XLSX e PDF.
- CA05.2: abrir os dois arquivos e conferir descrição, data, categoria, tipo e valor dos três lançamentos.
- CA05.3: não incluir lançamentos de outra planilha; verificar acentuação, legibilidade e planilha vazia.

## 5. Sprint Backlog reconstruído

A coluna “atividade identificada” descreve implementação existente; não comprova quem a executou ou quando dentro de uma Sprint.

| Item | Atividade identificada no código | Critérios | Situação final verificável |
|---|---|---|---|
| H01 | Autenticação Supabase e proteção das rotas | CA01.1–3 | Implementado no código; teste integrado pendente |
| H02 | Inserção, edição, exclusão, pesquisa e filtro | CA02.1–4 | Implementado; exclusão sem checagem explícita de erro |
| H04 | Criação/listagem de planilhas e associação de lançamentos | CA04.1–4 | Implementado; testar isolamento e rever exclusão |
| H03 | Cálculo mensal, categorias e gráficos | CA03.1–4 | Implementado; corrigir variações fixas |
| H05 | Geração de XLSX e PDF da planilha | CA05.1–3 | Implementado; exportação não executada |
| V01 | Executar roteiro, teste de duas contas e capturar resultados | Todos | Pendente |
| V02 | Registrar aceite e atualizar status do quadro | Todos | Pendente |

Não foram inventadas horas, estimativas, responsáveis individuais ou pontos de história.

## 6. Definition of Done proposta

Esta DoD foi elaborada para orientar a validação; não é apresentada como acordo histórico.

Uma história só poderá ser marcada como Done quando:
1. Os critérios de aceitação estiverem atendidos em ambiente executável.
2. As gravações persistirem após recarregar a página e os erros forem tratados sem mensagens falsas de sucesso.
3. A autenticação e a autorização forem verificadas, inclusive com duas contas quando houver dados pessoais.
4. Build, análise estática e testes relevantes tiverem seus resultados registrados; um teste genérico não comprova regra de negócio.
5. Não houver defeito conhecido que invalide o resultado apresentado; limitações remanescentes estiverem registradas.
6. A evidência estiver vinculada à história e ao commit, e a validação tiver responsável e data.

**Situação atual:** o código está versionado; os demais critérios não foram comprovados nesta preparação. Nenhuma história foi certificada como Done.

## 7. Incremento candidato e relação com o valor

O candidato a Incremento é o fluxo integrado de acesso individual, registro de transações, organização em planilhas, dashboard e exportação. Há implementação nas páginas React e estrutura de persistência/migrações Supabase.

Esse fluxo contribui para o Product Goal ao reunir registro, consulta e extração de informações financeiras. Sua disponibilidade real e o cumprimento da DoD dependem da validação em execução. Não se declara um Incremento concluído apenas pela existência de arquivos.

## 8. Flap do eduScrum — reconstrução visual

**Objetivo em destaque:** registrar → organizar → compreender → exportar.  
**Compromisso proposto:** mover cartões para Done apenas com evidências.  
**Equipe/papéis e período:** a confirmar pelo grupo; somente André está identificado no README.

| A fazer | Em execução confirmada | Implementado / a validar | Done comprovado |
|---|---|---|---|
| V01: rodar roteiro e capturar evidências | Nenhuma atividade de execução confirmada nesta preparação | H01: acesso | Nenhum item certificado |
| H09: corrigir variações do dashboard | — | H02: transações | — |
| H10: revisar exclusão e mensagens | — | H04: planilhas | — |
| H11: testes de negócio e isolamento | — | H03: dashboard | — |
| V02: registrar aceite e atualizar quadro | — | H05: exportação | — |

**Impedimentos:** falta de evidência em execução e de registros originais da Sprint; ambiente Supabase e URL de demonstração ainda precisam ser confirmados.  
**Inspeção na Review:** comparar resultados observados com critérios, registrar sugestões e adaptar o backlog.  
**Limite:** este quadro é uma fotografia reconstruída para a atividade, não um registro histórico de acompanhamento diário.
