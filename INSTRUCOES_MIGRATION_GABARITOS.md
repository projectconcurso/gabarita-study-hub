# Instruções para Aplicar Migration do Sistema de Gabaritos

## ⚠️ IMPORTANTE
Esta migration deve ser aplicada **manualmente** no Supabase Dashboard devido a incompatibilidades de versão local.

## Passo a Passo

### 1. Acessar o Supabase Dashboard
1. Acesse: https://supabase.com/dashboard/project/titvvpwddcbjyrvlzjss
2. Faça login com suas credenciais
3. Vá em **SQL Editor** no menu lateral

### 2. Executar a Migration
1. Clique em **New Query**
2. Copie todo o conteúdo do arquivo: `supabase/migrations/20260320_add_gabaritos_system.sql`
3. Cole no editor SQL
4. Clique em **Run** (ou pressione Ctrl/Cmd + Enter)

### 3. Verificar se a Migration foi Aplicada
Execute a seguinte query para verificar:

```sql
-- Verificar se as tabelas foram criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('gabaritos_transactions', 'gabaritos_packages');

-- Verificar se as funções foram criadas
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
  'calculate_simulado_cost',
  'deduct_gabaritos_for_simulado',
  'grant_trial_gabaritos',
  'reset_premium_gabaritos',
  'add_gabaritos'
);
```

### 4. Testar o Sistema

#### 4.1. Conceder Gabaritos de Trial para seu usuário
```sql
-- Substitua 'SEU_USER_ID' pelo seu ID de usuário
SELECT grant_trial_gabaritos('SEU_USER_ID');
```

#### 4.2. Verificar saldo
```sql
-- Substitua 'SEU_USER_ID' pelo seu ID de usuário
SELECT id, email, gabaritos 
FROM auth.users 
WHERE id = 'SEU_USER_ID';
```

#### 4.3. Testar cálculo de custo
```sql
-- Testar diferentes quantidades
SELECT calculate_simulado_cost(10);  -- Deve retornar 5
SELECT calculate_simulado_cost(25);  -- Deve retornar 10
SELECT calculate_simulado_cost(50);  -- Deve retornar 15
SELECT calculate_simulado_cost(70);  -- Deve retornar 20
```

## Sistema de Gabaritos - Resumo

### Tabela de Custos
| Questões | Custo em Gabaritos |
|----------|-------------------|
| 5 - 20   | 5 Gabaritos       |
| 21 - 40  | 10 Gabaritos      |
| 41 - 60  | 15 Gabaritos      |
| 61 - 80  | 20 Gabaritos      |

### Tipos de Conta

#### 1. **Trial (Teste Grátis - 3 dias)**
- ✅ 50 Gabaritos grátis
- ✅ Precisa cadastrar forma de pagamento
- ✅ Após 3 dias → cobra mensalidade automaticamente
- ✅ Concedido automaticamente ao criar conta

#### 2. **Premium (Assinatura Mensal)**
- ✅ 500 Gabaritos/mês (não cumulativos)
- ✅ Reset para 500 todo mês na renovação
- ✅ Não acumula com mês anterior
- ✅ Gabaritos resetados automaticamente via webhook Stripe

#### 3. **Conta Comum (Sem Trial/Premium)**
- ❌ Não pode criar simulados (saldo 0)
- ✅ Pode comprar Gabaritos avulsos
- ✅ Gabaritos avulsos não expiram

### Pacotes Avulsos
- **100 Gabaritos:** R$ 49,90
- **300 Gabaritos:** R$ 69,90
- **500 Gabaritos:** R$ 89,90

### Funcionalidades Implementadas
✅ Sistema de saldo de Gabaritos por usuário
✅ Dedução automática ao criar simulado
✅ Verificação de saldo antes de criar simulado
✅ Histórico de transações
✅ Trial de 50 Gabaritos (3 dias)
✅ Reset mensal para usuários Premium (500 Gabaritos)
✅ Loja de pacotes de Gabaritos
✅ Componente de exibição de saldo
✅ Limite máximo de 80 questões por simulado

## Próximos Passos (Após Aplicar Migration)

1. **Testar criação de simulado**
   - Criar simulado com diferentes quantidades de questões
   - Verificar se o saldo é deduzido corretamente
   - Verificar se bloqueia quando saldo insuficiente

2. **Testar loja**
   - Acessar `/dashboard/loja`
   - Verificar se os pacotes são exibidos
   - Testar compra (atualmente simulada)

3. **Integrar gateway de pagamento**
   - Stripe ou Mercado Pago
   - Atualizar função `handlePurchase` em `LojaGabaritos.tsx`

4. **Implementar sistema de Premium**
   - Integração com Stripe Subscriptions
   - Webhook para renovação mensal
   - Reset automático de Gabaritos

## Troubleshooting

### Erro: "relation does not exist"
- A migration não foi aplicada corretamente
- Execute novamente o SQL no dashboard

### Erro: "function does not exist"
- As funções SQL não foram criadas
- Verifique se todo o SQL foi executado

### Saldo não aparece na interface
- Verifique se a migration foi aplicada
- Limpe o cache do navegador
- Verifique o console do navegador para erros

## Contato
Se encontrar problemas, verifique:
1. Logs do Supabase Dashboard
2. Console do navegador (F12)
3. Network tab para erros de API
