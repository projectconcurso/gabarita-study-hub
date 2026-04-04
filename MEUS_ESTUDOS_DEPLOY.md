# 🚀 Deploy do Sistema Meus Estudos

## 📋 Pré-requisitos
- Supabase CLI instalado
- Projeto Supabase configurado
- OpenAI API Key configurada

## 🗄️ Passo 1: Aplicar Migrations

```bash
# No diretório do projeto
cd /Users/felipeflexa/Documents/focaai/gabarita-study-hub

# Aplicar todas as migrations
supabase db push

# Ou aplicar individualmente
supabase db push --file supabase/migrations/20260326_create_meus_estudos_tables.sql
supabase db push --file supabase/migrations/20260326_create_meus_estudos_functions.sql
supabase db push --file supabase/migrations/20260326_create_meus_estudos_triggers.sql
supabase db push --file supabase/migrations/20260326_create_meus_estudos_rls.sql
```

## ⚙️ Passo 2: Deploy da Edge Function

```bash
# Deploy da função gerar-apostila
supabase functions deploy gerar-apostila

# Verificar se foi deployada
supabase functions list
```

## 🔑 Passo 3: Configurar Secrets

A edge function `gerar-apostila` precisa da OpenAI API Key:

```bash
# Configurar secret (se ainda não estiver configurado)
supabase secrets set OPENAI_API_KEY=sk-...
```

## ✅ Passo 4: Verificar Deploy

### Verificar Tabelas
```sql
-- No Supabase Dashboard > SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%concurso%' OR table_name LIKE '%apostila%' OR table_name LIKE '%progresso%';
```

### Verificar Funções
```sql
-- No Supabase Dashboard > SQL Editor
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%progresso%' OR routine_name LIKE '%apostila%' OR routine_name LIKE '%sessao%';
```

### Verificar Edge Function
```bash
# Testar edge function
curl -i --location --request POST 'https://[PROJECT_ID].supabase.co/functions/v1/gerar-apostila' \
  --header 'Authorization: Bearer [ANON_KEY]' \
  --header 'Content-Type: application/json' \
  --data '{"assuntoId":"test","userId":"test","nomeAssunto":"Teste","nomeMateria":"Teste"}'
```

## 🎨 Passo 5: Testar Frontend

1. Iniciar servidor de desenvolvimento:
```bash
npm run dev
```

2. Acessar: `http://localhost:5173/dashboard/meus-estudos`

3. Seguir checklist de testes em `MEUS_ESTUDOS_CHECKLIST.md`

## 📊 Monitoramento

### Logs da Edge Function
```bash
# Ver logs em tempo real
supabase functions logs gerar-apostila --tail
```

### Verificar Uso de Gabaritos
```sql
-- Ver transações de Gabaritos
SELECT * FROM transacoes_gabaritos 
WHERE descricao LIKE '%apostila%' 
ORDER BY created_at DESC 
LIMIT 10;
```

## 🐛 Troubleshooting

### Problema: Migrations não aplicam
```bash
# Reset do banco (CUIDADO: apaga dados)
supabase db reset

# Ou aplicar manualmente via Dashboard
```

### Problema: Edge function retorna erro
```bash
# Ver logs detalhados
supabase functions logs gerar-apostila

# Verificar secrets
supabase secrets list
```

### Problema: RLS bloqueando acesso
```sql
-- Verificar políticas RLS
SELECT * FROM pg_policies WHERE tablename LIKE '%concurso%';

-- Temporariamente desabilitar RLS para debug (NÃO FAZER EM PRODUÇÃO)
ALTER TABLE concursos DISABLE ROW LEVEL SECURITY;
```

## ✅ Checklist de Deploy

- [ ] Migrations aplicadas com sucesso
- [ ] Edge function deployada
- [ ] OpenAI API Key configurada
- [ ] Tabelas criadas no banco
- [ ] Funções SQL criadas
- [ ] Triggers funcionando
- [ ] RLS policies ativas
- [ ] Frontend compilando sem erros
- [ ] Testes básicos passando
- [ ] Sistema acessível via navegador

## 🎉 Deploy Concluído!

Após completar todos os passos, o sistema estará 100% funcional e pronto para uso em produção.
