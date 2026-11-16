# SICOFI — Registro de ajustes e ensaio

**Origem dos itens A01–A08:** inspeção do repositório, não feedback do docente.  
**Ensaio:** ainda não realizado. **Feedback do docente:** ainda não recebido.  
**Prioridades:** proposta para discussão pelo grupo.

## 1. Ajustes identificados

| ID | Prioridade | Achado e evidência | Ajuste proposto | Como verificar | Situação |
|---|---|---|---|---|---|
| A01 | Alta | Dashboard usa +12% e -3% literais (E08) | Calcular comparação com período anterior ou remover rótulos | Conferir com dois meses de dados conhecidos | Aberto; H09 |
| A02 | Alta | Exclusões de transações/planilhas não verificam explicitamente erro antes do toast de sucesso | Tratar erro, confirmar ação e explicar efeito da exclusão em cascata | Simular falha e testar dados descartáveis | Aberto; H10 |
| A03 | Alta | Teste versionado usa apenas expect(true).toBe(true) | Adicionar testes relevantes de totais, CRUD, filtros, exportação e isolamento | Resultados e falhas registrados por critério | Aberto; H11 |
| A04 | Alta | Migração tem políticas por usuário; aplicação efetiva e vínculos cruzados não foram testados | Testar duas contas, leitura/alteração e vínculos entre registros | Conta B não acessa ou vincula registros da A | Aberto; H11 |
| A05 | Média | Função de IA checa apenas parte dos campos do JSON | Validar tipo, valor positivo finito, data, categoria e estrutura antes de persistir | Casos inválidos rejeitados com mensagem clara | Aberto; H06 |
| A06 | Média | Settings.tsx exibe sucesso sem conferir todos os resultados de gravação | Tratar erros e preservar consistência dos dados | Falha controlada não gera sucesso indevido | Aberto; H08 |
| A07 | Alta para a AV2 | Não foram encontrados registros originais de Sprint/Flap e responsáveis | Confirmar recorte, datas, integrantes, acordo de DoD e distribuição das falas | Artefatos consistentes com a prática real | Pendente do grupo |
| A08 | Alta para a AV2 | Não há evidência funcional produzida nesta preparação | Executar roteiro e anexar capturas, exportações e resultados | Evidências ligadas às histórias e ao commit | Pendente do grupo |

A documentação foi organizada nesta preparação. As correções de código e os testes acima não foram realizados.

## 2. Roteiro de ensaio — 10 minutos propostos

| Bloco | Slides | Tempo | Responsável |
|---|---|---|---|
| Abertura, problema e valor | 1–2 | 1min15s | Integrante a definir |
| Objetivo, escopo e critérios | 3–5 | 2min | Integrante a definir |
| Evidência técnica | 6 | 45s | Integrante a definir |
| Demonstração e conferência | 7–8 | 3min | Integrante a definir |
| Resultados e limitações | 9–10 | 1min15s | Integrante a definir |
| Quadro, próximos passos e feedback | 11–12 | 1min45s | Integrante a definir |

Confirmar a duração com o docente. Os blocos podem ser distribuídos conforme o número real de integrantes; ninguém foi apresentado como participante sem confirmação.

## 3. Checklist do ensaio

- [ ] Confirmar todos os nomes e a participação de cada integrante.
- [ ] Ensaiar a passagem de fala entre blocos.
- [ ] Conferir o ambiente e uma conta com dados fictícios.
- [ ] Ter capturas e arquivos reais como alternativa se a conexão falhar.
- [ ] Mostrar ao menos uma interação com o produto e os resultados.
- [ ] Explicar o valor de cada entrega, sem ficar apenas no código.
- [ ] Diferenciar código existente, resultado testado e limitação.
- [ ] Evitar apresentar os percentuais fixos como evolução real.
- [ ] Medir o tempo e reduzir conteúdo se necessário.
- [ ] Registrar dúvidas e alterações decididas.

## 4. Registro do ensaio — a completar com fatos observados

| Data | Observação real | Ajuste decidido | Responsável | Prazo | Situação |
|---|---|---|---|---|---|
| Não realizado | Nenhum resultado de ensaio disponível | Executar checklist | A definir | Antes da AV2 | Pendente |

## 5. Feedback do docente — a completar após pré-avaliação

| Data | Feedback recebido | Decisão do grupo | Item do backlog/material | Responsável | Situação |
|---|---|---|---|---|---|
| Não recebido | Nenhum feedback disponível | Aguardar pré-avaliação e registrar | A definir | A definir | Pendente |

## 6. Avaliação por pares

| Critério | Pergunta para orientar a observação |
|---|---|
| Problema e proposta de valor | Ficou claro para quem o SICOFI existe e que necessidade atende? |
| Planejamento e organização | Objetivo, histórias, critérios, quadro e evidências são coerentes? |
| Atendimento ao Sprint Goal | O fluxo apresentado sustenta o objetivo e deixa claros os limites? |
| Qualidade do Incremento | O que foi demonstrado funciona e os valores conferem? |
| Demonstração de valor | O benefício foi demonstrado ou apenas prometido? |
| Comunicação e participação | Houve objetividade, divisão das falas e respeito ao tempo? |

**Registro sugerido:** observação concreta → impacto para o usuário → sugestão → prioridade discutida. A Review deve apoiar decisões sobre o backlog.
