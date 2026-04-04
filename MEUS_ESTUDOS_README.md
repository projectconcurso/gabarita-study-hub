# 📚 Sistema Meus Estudos - Documentação

## 🎯 Visão Geral
Sistema completo para organização de estudos para concursos e vestibulares.

## ✅ Funcionalidades
- Cadastro de concursos com matérias e assuntos
- Geração de apostilas com IA (5 Gabaritos)
- Visualização e marcação de apostilas
- Criação de simulados vinculados
- Cronômetro de estudos
- Cálculo automático de progresso (0-100%)

## 📊 Cálculo de Progresso
- **Apostila lida**: 50%
- **1º simulado concluído**: +25% = 75%
- **2º simulado concluído**: +25% = **100%**

## 🗄️ Banco de Dados

### Tabelas Criadas
1. `concursos` - Concursos/provas cadastrados
2. `materias_concurso` - Matérias de cada concurso
3. `assuntos_materia` - Assuntos de cada matéria
4. `apostilas` - Apostilas geradas por IA
5. `progresso_estudos` - Progresso do usuário
6. `sessoes_estudo` - Sessões de cronômetro
7. `simulados` - Coluna `assunto_id` adicionada

### Migrations
```bash
✅ 20260326_create_meus_estudos_tables.sql
✅ 20260326_create_meus_estudos_functions.sql
✅ 20260326_create_meus_estudos_triggers.sql
✅ 20260326_create_meus_estudos_rls.sql
```

## ⚙️ Backend

### Edge Function
- **Nome**: `gerar-apostila`
- **Custo**: 5 Gabaritos
- **IA**: OpenAI GPT-4o
- **Output**: Markdown, mínimo 2000 palavras

### Funções SQL
- `calcular_progresso_assunto()`
- `calcular_progresso_materia()`
- `calcular_progresso_concurso()`
- `marcar_apostila_lida()`
- `iniciar_sessao_estudo()`
- `finalizar_sessao_estudo()`

## 🎨 Frontend

### Rotas
```
/dashboard/meus-estudos       → Lista de concursos
/dashboard/meus-estudos/:id   → Detalhes do concurso
```

### Componentes
- `MeusEstudos.tsx` - Lista de concursos
- `DetalhesConcurso.tsx` - Detalhes e progresso
- `CriarConcursoDialog.tsx` - Cadastro de concurso
- `GerarApostilaDialog.tsx` - Gerar apostila
- `VisualizarApostilaDialog.tsx` - Visualizar apostila
- `CronometroEstudos.tsx` - Cronômetro

## 🔄 Fluxo de Uso

### 1. Cadastrar Concurso
```
Meus Estudos → Novo Concurso → Preencher dados → Adicionar matérias e assuntos → Salvar
```

### 2. Gerar Apostila
```
Detalhes → Assunto → Gerar Apostila → Confirmar (5 Gabaritos) → Apostila gerada
```

### 3. Estudar
```
Ler Apostila → Marcar como Lida (50%) → Criar Simulados (25% cada) → 100%
```

## 🚀 Como Usar

### Passo 1: Criar Concurso
1. Acesse "Meus Estudos" no menu
2. Clique em "Novo Concurso"
3. Preencha nome, data e descrição
4. Adicione matérias (ex: Matemática, Português)
5. Adicione assuntos para cada matéria
6. Salve

### Passo 2: Gerar Apostila
1. Entre nos detalhes do concurso
2. Escolha um assunto
3. Clique em "Gerar Apostila (5 Gabaritos)"
4. Confirme a geração
5. Aguarde (IA gerando conteúdo)

### Passo 3: Estudar
1. Leia a apostila gerada
2. Marque como lida (50% de progresso)
3. Crie e complete simulados vinculados (25% cada)
4. Use o cronômetro para registrar tempo de estudo

## 💰 Custos
- **Gerar Apostila**: 5 Gabaritos
- **Criar Simulado**: 10-40 Gabaritos (conforme número de questões)

## 🔧 Arquivos Importantes

### Backend
- `supabase/migrations/20260326_*.sql` - Migrations do banco
- `supabase/functions/gerar-apostila/index.ts` - Edge function

### Frontend
- `src/pages/dashboard/MeusEstudos.tsx`
- `src/pages/dashboard/DetalhesConcurso.tsx`
- `src/components/meus-estudos/*.tsx`
- `src/lib/meus-estudos.ts`
- `src/types/meus-estudos.ts`

## ✅ Status do Sistema
**TODAS AS FASES CONCLUÍDAS**

- ✅ Fase 1: Banco de Dados
- ✅ Fase 2: Backend/Edge Functions
- ✅ Fase 3: Interface de Cadastro
- ✅ Fase 4: Página de Detalhes
- ✅ Fase 5: Integração com Simulados
- ✅ Fase 6: Documentação

**Sistema 100% funcional e pronto para uso!** 🎉
