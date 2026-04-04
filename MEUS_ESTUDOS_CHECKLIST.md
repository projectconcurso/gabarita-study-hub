# ✅ Checklist de Testes - Sistema Meus Estudos

## 🗄️ Banco de Dados

### Migrations
- [ ] Aplicar migration `20260326_create_meus_estudos_tables.sql`
- [ ] Aplicar migration `20260326_create_meus_estudos_functions.sql`
- [ ] Aplicar migration `20260326_create_meus_estudos_triggers.sql`
- [ ] Aplicar migration `20260326_create_meus_estudos_rls.sql`
- [ ] Verificar se todas as tabelas foram criadas
- [ ] Verificar se coluna `assunto_id` existe em `simulados`

### Comandos para Aplicar Migrations
```bash
# No diretório do projeto
supabase db push
```

## ⚙️ Backend

### Edge Function
- [ ] Deploy da edge function `gerar-apostila`
- [ ] Testar chamada da função com parâmetros válidos
- [ ] Verificar se deduz 5 Gabaritos corretamente
- [ ] Verificar se apostila é salva no banco

### Comandos para Deploy
```bash
# Deploy da edge function
supabase functions deploy gerar-apostila
```

## 🎨 Frontend

### Página: Meus Estudos
- [ ] Acessar `/dashboard/meus-estudos`
- [ ] Verificar se página carrega sem erros
- [ ] Clicar em "Novo Concurso"
- [ ] Preencher formulário completo
- [ ] Adicionar múltiplas matérias
- [ ] Adicionar múltiplos assuntos por matéria
- [ ] Salvar concurso
- [ ] Verificar se concurso aparece na lista
- [ ] Verificar cálculo de progresso (deve ser 0%)
- [ ] Excluir concurso

### Página: Detalhes do Concurso
- [ ] Clicar em um concurso
- [ ] Verificar se detalhes carregam
- [ ] Verificar se matérias aparecem
- [ ] Verificar se assuntos aparecem
- [ ] Verificar progresso por matéria
- [ ] Verificar progresso por assunto

### Funcionalidade: Gerar Apostila
- [ ] Clicar em "Gerar Apostila" em um assunto
- [ ] Verificar se mostra custo (5 Gabaritos)
- [ ] Verificar se mostra saldo atual
- [ ] Confirmar geração
- [ ] Aguardar geração (pode demorar 30-60s)
- [ ] Verificar se apostila foi gerada
- [ ] Verificar se Gabaritos foram deduzidos
- [ ] Verificar se botão mudou para "Ler Apostila"

### Funcionalidade: Visualizar Apostila
- [ ] Clicar em "Ler Apostila"
- [ ] Verificar se conteúdo renderiza corretamente
- [ ] Verificar formatação Markdown
- [ ] Clicar em "Marcar como Lida"
- [ ] Verificar se progresso atualiza para 50%
- [ ] Verificar se indicador "Lida" aparece

### Funcionalidade: Criar Simulado Vinculado
- [ ] Clicar em "Criar Simulado" em um assunto
- [ ] Verificar se redireciona para `/dashboard/simulados`
- [ ] Verificar se formulário está pré-preenchido
- [ ] Verificar se matéria e assunto estão corretos
- [ ] Completar formulário (escolaridade, dificuldade, banca)
- [ ] Criar simulado
- [ ] Completar simulado
- [ ] Voltar para detalhes do concurso
- [ ] Verificar se progresso aumentou 25%
- [ ] Criar e completar 2º simulado
- [ ] Verificar se progresso chegou a 100%

### Funcionalidade: Cronômetro
- [ ] Clicar em "Iniciar Cronômetro"
- [ ] Verificar se cronômetro inicia
- [ ] Clicar em "Pausar"
- [ ] Verificar se cronômetro pausa
- [ ] Clicar em "Retomar"
- [ ] Verificar se cronômetro continua
- [ ] Clicar em "Parar"
- [ ] Verificar se tempo foi salvo
- [ ] Verificar se tempo aparece no assunto

## 🔄 Integração

### Fluxo Completo
- [ ] Criar concurso novo
- [ ] Adicionar 2 matérias com 2 assuntos cada
- [ ] Gerar apostila para 1 assunto
- [ ] Ler apostila e marcar como lida (50%)
- [ ] Criar 1º simulado vinculado (75%)
- [ ] Criar 2º simulado vinculado (100%)
- [ ] Verificar progresso da matéria
- [ ] Verificar progresso do concurso
- [ ] Usar cronômetro em um assunto
- [ ] Verificar tempo total de estudo

## 🐛 Verificações de Erro

### Validações
- [ ] Tentar criar concurso sem nome (deve dar erro)
- [ ] Tentar criar concurso sem matérias (deve dar erro)
- [ ] Tentar criar matéria sem assuntos (deve dar erro)
- [ ] Tentar gerar apostila sem saldo (deve mostrar alerta)
- [ ] Tentar gerar apostila duplicada (deve avisar que já existe)

### Performance
- [ ] Verificar tempo de carregamento da lista de concursos
- [ ] Verificar tempo de carregamento dos detalhes
- [ ] Verificar tempo de geração de apostila (30-60s é normal)
- [ ] Verificar se não há memory leaks no cronômetro

## 📱 Responsividade
- [ ] Testar em desktop (1920x1080)
- [ ] Testar em tablet (768x1024)
- [ ] Testar em mobile (375x667)
- [ ] Verificar se modais são scrolláveis
- [ ] Verificar se botões são clicáveis em mobile

## 🔒 Segurança (RLS)
- [ ] Verificar se usuário só vê seus próprios concursos
- [ ] Verificar se não consegue acessar concurso de outro usuário
- [ ] Verificar se não consegue editar concurso de outro usuário
- [ ] Verificar se não consegue deletar concurso de outro usuário

## 📊 Relatório de Bugs
Anote aqui qualquer bug encontrado:

```
Bug #1:
- Descrição:
- Passos para reproduzir:
- Comportamento esperado:
- Comportamento atual:

Bug #2:
...
```

## ✅ Aprovação Final
- [ ] Todos os testes passaram
- [ ] Sem bugs críticos
- [ ] Performance aceitável
- [ ] UI/UX funcionando bem
- [ ] Sistema pronto para produção

---

**Data do Teste**: ___/___/______
**Testador**: _________________
**Status**: [ ] Aprovado [ ] Reprovado
