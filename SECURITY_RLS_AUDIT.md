# 🛡️ Auditoria de Segurança RLS - Gabarita Study Hub

## 📋 **Índice**
1. [Visão Geral](#visão-geral)
2. [Tabelas e Políticas RLS](#tabelas-e-políticas-rls)
3. [Vulnerabilidades Identificadas](#vulnerabilidades-identificadas)
4. [Checklist de Segurança](#checklist-de-segurança)
5. [Recomendações de Correção](#recomendações-de-correção)
6. [Testes de Segurança](#testes-de-segurança)

---

## 🎯 **Visão Geral**

### **O que é RLS (Row Level Security)?**
RLS é um sistema de segurança do PostgreSQL/Supabase que controla quais linhas (rows) um usuário pode acessar em uma tabela. É a **primeira linha de defesa** contra acessos não autorizados.

### **Por que RLS é Crítico?**
- ✅ Impede que usuários vejam dados de outros usuários
- ✅ Previne modificações não autorizadas
- ✅ Protege contra ataques de escalação de privilégios
- ✅ Funciona mesmo se o código do frontend for comprometido

---

## 📊 **Tabelas e Políticas RLS**

### **Status Atual: 17 Tabelas Mapeadas**

| Tabela | RLS Habilitado | Políticas | Status |
|--------|----------------|-----------|--------|
| `profiles` | ❓ | ❓ | **CRÍTICO - VERIFICAR** |
| `amizades` | ✅ | 5 | ✅ Seguro |
| `mensagens` | ✅ | 3 | ✅ Seguro |
| `simulados` | ✅ | 4 | ✅ Seguro |
| `questoes` | ✅ | ❓ | ⚠️ Verificar políticas |
| `posts_mural` | ✅ | 4 | ✅ Seguro |
| `reacoes_mural` | ✅ | ❓ | ⚠️ Verificar políticas |
| `comentarios_mural` | ✅ | ❓ | ⚠️ Verificar políticas |
| `user_gabaritos` | ✅ | 3 | ✅ Seguro |
| `gabaritos_transactions` | ✅ | 2 | ✅ Seguro |
| `gabaritos_packages` | ✅ | 1 | ⚠️ Público? |
| `concursos` | ✅ | 4 | ✅ Seguro |
| `materias_concurso` | ✅ | 4 | ✅ Seguro |
| `assuntos_materia` | ✅ | 4 | ✅ Seguro |
| `apostilas` | ✅ | 4 | ✅ Seguro |
| `progresso_estudos` | ✅ | 4 | ✅ Seguro |
| `sessoes_estudo` | ✅ | 4 | ✅ Seguro |
| `user_xp` | ✅ | 3 | ✅ Seguro |
| `xp_history` | ✅ | 2 | ✅ Seguro |

---

## 🚨 **Vulnerabilidades Identificadas**

### **1. CRÍTICO: Tabela `profiles` sem RLS verificado**

**Risco**: Se RLS não estiver habilitado, **qualquer usuário autenticado pode ver/modificar perfis de outros usuários**.

**Impacto**:
- 🔴 Vazamento de dados pessoais (nome, email, foto, etc.)
- 🔴 Modificação de perfis de terceiros
- 🔴 Acesso a informações sensíveis (escolaridade, cidade, etc.)

**Verificação Necessária**:
```sql
-- Executar no Supabase SQL Editor
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'profiles';

-- Listar políticas existentes
SELECT * FROM pg_policies 
WHERE tablename = 'profiles';
```

**Correção Recomendada**:
```sql
-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política de SELECT (ver apenas próprio perfil)
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Política de UPDATE (atualizar apenas próprio perfil)
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Política de INSERT (criar apenas próprio perfil)
CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- IMPORTANTE: Permitir que usuários vejam perfis de amigos
CREATE POLICY "Users can view profiles of accepted friends"
ON public.profiles FOR SELECT
TO authenticated
USING (
  auth.uid() = id OR
  EXISTS (
    SELECT 1 FROM public.amizades
    WHERE status = 'aceito'
    AND (
      (user_id = auth.uid() AND amigo_id = profiles.id) OR
      (amigo_id = auth.uid() AND user_id = profiles.id)
    )
  )
);
```

---

### **2. MÉDIO: Políticas de `questoes` não documentadas**

**Risco**: Questões podem estar acessíveis publicamente ou sem restrições adequadas.

**Verificação**:
```sql
SELECT * FROM pg_policies WHERE tablename = 'questoes';
```

**Correção Esperada**:
- Questões devem ser visíveis apenas para usuários autenticados
- Apenas administradores devem poder criar/editar questões

---

### **3. MÉDIO: `gabaritos_packages` pode estar público**

**Risco**: Se for público, está OK. Se não for intencional, pode ser explorado.

**Verificação**:
```sql
SELECT * FROM pg_policies WHERE tablename = 'gabaritos_packages';
```

**Decisão Necessária**:
- ✅ Se pacotes devem ser públicos (para exibição na loja) → OK
- ❌ Se devem ser restritos → Adicionar política

---

### **4. BAIXO: Políticas de `reacoes_mural` e `comentarios_mural` não verificadas**

**Verificação**:
```sql
SELECT * FROM pg_policies WHERE tablename IN ('reacoes_mural', 'comentarios_mural');
```

**Políticas Esperadas**:
```sql
-- Reações: usuários podem ver todas, mas só criar/deletar as próprias
CREATE POLICY "Users can view all reactions"
ON public.reacoes_mural FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create their own reactions"
ON public.reacoes_mural FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions"
ON public.reacoes_mural FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Comentários: similar às reações
CREATE POLICY "Users can view all comments"
ON public.comentarios_mural FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create their own comments"
ON public.comentarios_mural FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON public.comentarios_mural FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
```

---

## ✅ **Checklist de Segurança RLS**

### **Auditoria Inicial**

- [ ] **1. Verificar se RLS está habilitado em TODAS as tabelas**
  ```sql
  -- Executar no Supabase SQL Editor
  SELECT 
    tablename,
    rowsecurity as rls_enabled
  FROM pg_tables 
  WHERE schemaname = 'public'
  ORDER BY tablename;
  ```

- [ ] **2. Listar todas as políticas existentes**
  ```sql
  SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
  FROM pg_policies
  WHERE schemaname = 'public'
  ORDER BY tablename, policyname;
  ```

- [ ] **3. Identificar tabelas SEM políticas RLS**
  ```sql
  SELECT t.tablename
  FROM pg_tables t
  LEFT JOIN pg_policies p ON t.tablename = p.tablename
  WHERE t.schemaname = 'public'
  AND t.rowsecurity = true
  AND p.policyname IS NULL;
  ```

---

### **Testes de Segurança**

- [ ] **4. Testar acesso não autorizado a perfis**
  ```javascript
  // No frontend, tentar acessar perfil de outro usuário
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', 'UUID_DE_OUTRO_USUARIO')
    .single();
  
  // Resultado esperado: error ou data = null
  ```

- [ ] **5. Testar modificação não autorizada**
  ```javascript
  // Tentar atualizar perfil de outro usuário
  const { error } = await supabase
    .from('profiles')
    .update({ nome: 'Hacker' })
    .eq('id', 'UUID_DE_OUTRO_USUARIO');
  
  // Resultado esperado: error (violação de RLS)
  ```

- [ ] **6. Testar acesso a mensagens de outros usuários**
  ```javascript
  // Tentar ler mensagens de outros usuários
  const { data, error } = await supabase
    .from('mensagens')
    .select('*')
    .neq('remetente_id', auth.user.id)
    .neq('destinatario_id', auth.user.id);
  
  // Resultado esperado: data = [] (vazio)
  ```

- [ ] **7. Testar acesso a concursos de outros usuários**
  ```javascript
  const { data, error } = await supabase
    .from('concursos')
    .select('*')
    .neq('user_id', auth.user.id);
  
  // Resultado esperado: data = [] (vazio)
  ```

---

## 🔧 **Recomendações de Correção**

### **Prioridade CRÍTICA**

1. **Verificar e corrigir RLS da tabela `profiles`**
   - Executar queries de verificação acima
   - Aplicar políticas recomendadas
   - Testar acesso não autorizado

2. **Criar política para visualização de perfis de amigos**
   - Essencial para funcionalidade social do app
   - Ver código SQL acima

---

### **Prioridade ALTA**

3. **Auditar políticas de `questoes`**
   - Verificar se questões estão protegidas
   - Garantir que apenas admins podem criar/editar

4. **Verificar políticas de `reacoes_mural` e `comentarios_mural`**
   - Aplicar políticas recomendadas acima

---

### **Prioridade MÉDIA**

5. **Documentar todas as políticas RLS**
   - Criar comentários SQL explicando cada política
   - Manter documentação atualizada

6. **Implementar testes automatizados de RLS**
   - Criar suite de testes para verificar políticas
   - Executar em CI/CD

---

### **Prioridade BAIXA**

7. **Revisar políticas de `gabaritos_packages`**
   - Decidir se deve ser público ou restrito

8. **Adicionar logging de tentativas de acesso negadas**
   - Monitorar tentativas de violação de RLS
   - Alertar sobre atividades suspeitas

---

## 🧪 **Testes de Segurança**

### **Script de Teste Completo**

Crie um arquivo `test-rls-security.ts` no projeto:

```typescript
import { supabase } from '@/integrations/supabase/client';

export async function testRLSSecurity() {
  const results = {
    passed: [] as string[],
    failed: [] as string[],
  };

  // 1. Testar acesso a perfil de outro usuário
  try {
    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser.user) throw new Error('Not authenticated');

    // Tentar buscar TODOS os perfis (deve retornar apenas o próprio)
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*');

    if (profiles && profiles.length === 1 && profiles[0].id === currentUser.user.id) {
      results.passed.push('✅ RLS profiles: Apenas próprio perfil acessível');
    } else {
      results.failed.push('❌ RLS profiles: Múltiplos perfis acessíveis!');
    }
  } catch (error) {
    results.failed.push(`❌ RLS profiles: Erro - ${error}`);
  }

  // 2. Testar acesso a mensagens de outros
  try {
    const { data: messages } = await supabase
      .from('mensagens')
      .select('*');

    const { data: currentUser } = await supabase.auth.getUser();
    const allMessagesAreOwn = messages?.every(
      (msg) => msg.remetente_id === currentUser.user?.id || 
               msg.destinatario_id === currentUser.user?.id
    );

    if (allMessagesAreOwn) {
      results.passed.push('✅ RLS mensagens: Apenas próprias mensagens acessíveis');
    } else {
      results.failed.push('❌ RLS mensagens: Mensagens de outros acessíveis!');
    }
  } catch (error) {
    results.failed.push(`❌ RLS mensagens: Erro - ${error}`);
  }

  // 3. Testar acesso a concursos de outros
  try {
    const { data: concursos } = await supabase
      .from('concursos')
      .select('*');

    const { data: currentUser } = await supabase.auth.getUser();
    const allConcursosAreOwn = concursos?.every(
      (c) => c.user_id === currentUser.user?.id
    );

    if (allConcursosAreOwn) {
      results.passed.push('✅ RLS concursos: Apenas próprios concursos acessíveis');
    } else {
      results.failed.push('❌ RLS concursos: Concursos de outros acessíveis!');
    }
  } catch (error) {
    results.failed.push(`❌ RLS concursos: Erro - ${error}`);
  }

  // 4. Testar modificação não autorizada
  try {
    const fakeUserId = '00000000-0000-0000-0000-000000000000';
    const { error } = await supabase
      .from('profiles')
      .update({ nome: 'Hacker' })
      .eq('id', fakeUserId);

    if (error) {
      results.passed.push('✅ RLS profiles UPDATE: Modificação bloqueada');
    } else {
      results.failed.push('❌ RLS profiles UPDATE: Modificação permitida!');
    }
  } catch (error) {
    results.passed.push('✅ RLS profiles UPDATE: Modificação bloqueada');
  }

  return results;
}
```

---

## 📝 **Comandos SQL Úteis**

### **Verificar RLS em todas as tabelas**
```sql
SELECT 
  tablename,
  CASE 
    WHEN rowsecurity THEN '✅ Habilitado'
    ELSE '❌ DESABILITADO'
  END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
```

### **Contar políticas por tabela**
```sql
SELECT 
  t.tablename,
  COUNT(p.policyname) as num_policies,
  CASE 
    WHEN COUNT(p.policyname) = 0 THEN '⚠️ SEM POLÍTICAS'
    WHEN COUNT(p.policyname) < 3 THEN '⚠️ POUCAS POLÍTICAS'
    ELSE '✅ OK'
  END as status
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename
WHERE t.schemaname = 'public'
AND t.rowsecurity = true
GROUP BY t.tablename
ORDER BY num_policies ASC, t.tablename;
```

### **Verificar políticas de uma tabela específica**
```sql
SELECT 
  policyname,
  cmd as operation,
  CASE 
    WHEN qual IS NOT NULL THEN 'USING: ' || qual
    ELSE 'N/A'
  END as using_clause,
  CASE 
    WHEN with_check IS NOT NULL THEN 'WITH CHECK: ' || with_check
    ELSE 'N/A'
  END as with_check_clause
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;
```

---

## 🎯 **Próximos Passos**

1. **IMEDIATO**: Executar queries de verificação no Supabase SQL Editor
2. **URGENTE**: Corrigir RLS da tabela `profiles` se necessário
3. **IMPORTANTE**: Executar testes de segurança
4. **RECOMENDADO**: Implementar script de teste automatizado
5. **MANUTENÇÃO**: Revisar políticas RLS a cada nova feature

---

## 📚 **Recursos Adicionais**

- [Documentação Oficial Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers)

---

**Última atualização**: 2026-04-07  
**Status**: 🔴 **AUDITORIA NECESSÁRIA**
