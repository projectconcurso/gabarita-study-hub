# Sistema Meus Estudos - Documentação do Banco de Dados

## 📊 Estrutura de Tabelas

### 1. **concursos**
Armazena os concursos/provas cadastrados pelo usuário.

**Campos:**
- `id` - UUID (PK)
- `user_id` - UUID (FK → auth.users)
- `nome` - Nome do concurso
- `data_prova` - Data da prova
- `descricao` - Descrição opcional
- `ativo` - Se o concurso está ativo
- `created_at`, `updated_at` - Timestamps

### 2. **materias_concurso**
Matérias de cada concurso.

**Campos:**
- `id` - UUID (PK)
- `concurso_id` - UUID (FK → concursos)
- `nome` - Nome da matéria (ex: Matemática)
- `ordem` - Ordem de exibição
- `created_at` - Timestamp

### 3. **assuntos_materia**
Assuntos de cada matéria.

**Campos:**
- `id` - UUID (PK)
- `materia_id` - UUID (FK → materias_concurso)
- `nome` - Nome do assunto (ex: Álgebra)
- `ordem` - Ordem de exibição
- `created_at` - Timestamp

### 4. **apostilas**
Apostilas geradas por IA para cada assunto.

**Campos:**
- `id` - UUID (PK)
- `assunto_id` - UUID (FK → assuntos_materia)
- `conteudo` - Conteúdo da apostila (TEXT)
- `status` - Status da apostila
- `custo_gabaritos` - Custo para gerar (padrão: 5)
- `created_at` - Timestamp

### 5. **progresso_estudos**
Tracking de progresso do usuário em cada assunto.

**Campos:**
- `id` - UUID (PK)
- `user_id` - UUID (FK → auth.users)
- `assunto_id` - UUID (FK → assuntos_materia)
- `apostila_lida` - Se leu a apostila
- `data_leitura_apostila` - Quando leu
- `simulados_concluidos` - Quantidade de simulados feitos
- `tempo_estudo_segundos` - Tempo total estudado
- `percentual_conclusao` - 0-100%
- `created_at`, `updated_at` - Timestamps

**Constraint:** UNIQUE(user_id, assunto_id)

### 6. **sessoes_estudo**
Sessões de estudo cronometradas.

**Campos:**
- `id` - UUID (PK)
- `user_id` - UUID (FK → auth.users)
- `assunto_id` - UUID (FK → assuntos_materia)
- `inicio` - Timestamp de início
- `fim` - Timestamp de fim
- `duracao_segundos` - Duração calculada
- `created_at` - Timestamp

### 7. **simulados** (modificada)
Adicionada coluna `assunto_id` para vincular simulados aos assuntos.

---

## 🔧 Funções Principais

### Cálculo de Progresso

#### `calcular_progresso_assunto(user_id, assunto_id)`
Calcula o progresso de um assunto (0-100%).

**Regra:**
- Apostila lida: **50%**
- 1º simulado concluído: **+25%**
- 2º simulado concluído: **+25%**
- **Total: 100%**

#### `calcular_progresso_materia(user_id, materia_id)`
Calcula a média de progresso de todos os assuntos da matéria.

#### `calcular_progresso_concurso(user_id, concurso_id)`
Calcula a média de progresso de todas as matérias do concurso.

### Gerenciamento de Progresso

#### `atualizar_progresso_assunto(user_id, assunto_id)`
Recalcula e atualiza o percentual de conclusão.

#### `inicializar_progresso_assunto(user_id, assunto_id)`
Cria registro inicial de progresso (se não existir).

#### `marcar_apostila_lida(user_id, assunto_id)`
Marca apostila como lida e atualiza progresso.

### Sessões de Estudo

#### `iniciar_sessao_estudo(user_id, assunto_id)`
Inicia uma nova sessão de estudo e retorna o ID.

#### `finalizar_sessao_estudo(sessao_id)`
Finaliza a sessão e calcula a duração.

---

## ⚡ Triggers Automáticos

### 1. **trigger_update_concurso_updated_at**
Atualiza `updated_at` ao modificar concurso.

### 2. **trigger_update_progresso_updated_at**
Atualiza `updated_at` ao modificar progresso.

### 3. **trigger_calcular_duracao_sessao**
Ao finalizar sessão de estudo:
- Calcula duração em segundos
- Adiciona ao tempo total no progresso

### 4. **trigger_atualizar_progresso_simulado**
Ao concluir simulado vinculado a assunto:
- Incrementa contador de simulados
- Recalcula progresso automaticamente

### 5. **trigger_inicializar_progresso_assunto**
Ao criar novo assunto:
- Inicializa registro de progresso automaticamente

---

## 🔒 Segurança (RLS)

Todas as tabelas têm Row Level Security habilitado.

**Regras:**
- Usuários só veem/modificam seus próprios dados
- Acesso a matérias/assuntos validado via concurso
- Acesso a apostilas validado via hierarquia completa

---

## 📈 Fluxo de Dados

```
Concurso
  └── Matéria 1
      ├── Assunto 1.1
      │   ├── Apostila
      │   ├── Simulados
      │   ├── Progresso
      │   └── Sessões de Estudo
      └── Assunto 1.2
          ├── Apostila
          ├── Simulados
          ├── Progresso
          └── Sessões de Estudo
```

---

## 🎯 Exemplo de Uso

### Criar Concurso Completo

```sql
-- 1. Criar concurso
INSERT INTO concursos (user_id, nome, data_prova)
VALUES ('user-uuid', 'ENEM 2024', '2024-11-05')
RETURNING id;

-- 2. Criar matéria
INSERT INTO materias_concurso (concurso_id, nome, ordem)
VALUES ('concurso-uuid', 'Matemática', 1)
RETURNING id;

-- 3. Criar assuntos
INSERT INTO assuntos_materia (materia_id, nome, ordem)
VALUES 
  ('materia-uuid', 'Álgebra', 1),
  ('materia-uuid', 'Geometria', 2);
```

### Verificar Progresso

```sql
-- Progresso de um assunto
SELECT calcular_progresso_assunto('user-uuid', 'assunto-uuid');

-- Progresso de uma matéria
SELECT calcular_progresso_materia('user-uuid', 'materia-uuid');

-- Progresso do concurso
SELECT calcular_progresso_concurso('user-uuid', 'concurso-uuid');
```

### Gerenciar Sessão de Estudo

```sql
-- Iniciar
SELECT iniciar_sessao_estudo('user-uuid', 'assunto-uuid');

-- Finalizar
SELECT finalizar_sessao_estudo('sessao-uuid');
```

---

## 📝 Ordem de Execução das Migrations

1. `20260326_create_meus_estudos_tables.sql` - Tabelas
2. `20260326_create_meus_estudos_functions.sql` - Funções
3. `20260326_create_meus_estudos_triggers.sql` - Triggers
4. `20260326_create_meus_estudos_rls.sql` - Políticas de segurança

---

## ✅ Checklist de Implementação

- [x] Tabelas criadas
- [x] Índices criados
- [x] Funções de cálculo de progresso
- [x] Funções de gerenciamento
- [x] Triggers automáticos
- [x] RLS policies
- [ ] Edge function para gerar apostilas
- [ ] Interface frontend
- [ ] Integração com simulados
- [ ] Testes

---

## 🚀 Próximos Passos

1. Aplicar migrations no Supabase
2. Testar funções no SQL Editor
3. Criar edge function `gerar-apostila`
4. Desenvolver interface frontend
5. Integrar com sistema de simulados existente
