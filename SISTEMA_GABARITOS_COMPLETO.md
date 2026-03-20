# Sistema de Gabaritos - Documentação Completa

## 📋 Visão Geral

O sistema de Gabaritos é a moeda virtual da plataforma que controla o acesso à criação de simulados. **Não existe mais acesso ilimitado** - todo simulado custa Gabaritos baseado na quantidade de questões.

---

## 💰 Tabela de Custos por Simulado

| Questões | Custo em Gabaritos |
|----------|-------------------|
| 5 - 20   | 5 Gabaritos       |
| 21 - 40  | 10 Gabaritos      |
| 41 - 60  | 15 Gabaritos      |
| 61 - 80  | 20 Gabaritos      |

**Limite máximo:** 80 questões por simulado

---

## 👥 Tipos de Conta

### 1. **Trial (Teste Grátis - 3 dias)** 🎁

**Como funciona:**
- Usuário cria conta e cadastra forma de pagamento
- Recebe **50 Gabaritos grátis** automaticamente
- Tem **3 dias** para testar a plataforma
- Após 3 dias, Stripe cobra a primeira mensalidade automaticamente
- Se não cancelar, vira assinante Premium

**Implementação:**
- Webhook `customer.subscription.created` com status `trialing`
- Chama função `grant_trial_gabaritos(user_id)`
- Registra transação no histórico

**Regras:**
- ✅ Só pode receber trial **uma vez** por usuário
- ✅ Precisa ter forma de pagamento cadastrada
- ✅ Gabaritos são concedidos automaticamente via webhook

---

### 2. **Premium (Assinatura Mensal)** 💎

**Como funciona:**
- Assinatura mensal via Stripe
- Recebe **500 Gabaritos** todo mês
- Gabaritos **não acumulam** - sempre volta para 500
- Reset automático na renovação mensal

**Implementação:**
- Webhook `invoice.payment_succeeded` (renovação mensal)
- Chama função `reset_premium_gabaritos(user_id)`
- Saldo sempre volta para 500, independente do que sobrou

**Regras:**
- ✅ Reset automático todo mês via webhook Stripe
- ✅ Se tinha 200 Gabaritos → volta para 500
- ✅ Se tinha 600 Gabaritos (comprou avulso) → volta para 500
- ❌ Não acumula com mês anterior

**Exemplo:**
```
Dia 01/01: Renova assinatura → 500 Gabaritos
Dia 15/01: Usou 300 → Restam 200 Gabaritos
Dia 01/02: Renova assinatura → Volta para 500 Gabaritos (não 700)
```

---

### 3. **Conta Comum (Sem Trial/Premium)** 🔒

**Como funciona:**
- Usuário sem assinatura ativa
- Saldo de Gabaritos = 0 (ou o que comprou avulso)
- **Não pode criar simulados** sem Gabaritos
- Precisa comprar pacotes avulsos

**Implementação:**
- Sem subscription_status = 'active' ou 'trial'
- Verificação de saldo antes de criar simulado
- Modal de saldo insuficiente redireciona para loja

**Regras:**
- ❌ Não pode criar simulados sem Gabaritos
- ✅ Pode comprar Gabaritos avulsos
- ✅ Gabaritos avulsos não expiram
- ✅ Pode usar todas as outras funcionalidades (mural, chat, amigos)

---

## 🛒 Pacotes Avulsos

Disponíveis para compra na loja (`/dashboard/loja`):

| Pacote | Gabaritos | Preço |
|--------|-----------|-------|
| Básico | 100       | R$ 49,90 |
| Médio  | 300       | R$ 69,90 |
| Grande | 500       | R$ 89,90 |

**Características:**
- ✅ Não expiram
- ✅ Acumulam com saldo atual
- ✅ Podem ser comprados por qualquer tipo de conta
- ✅ Processamento via Stripe (a implementar)

---

## 🔄 Fluxo de Webhooks Stripe

### 1. **Início do Trial**
```
Evento: customer.subscription.created (status: trialing)
↓
Atualiza profiles.subscription_status = 'trial'
↓
Chama grant_trial_gabaritos(user_id)
↓
Adiciona 50 Gabaritos
↓
Registra transação tipo 'trial_grant'
```

### 2. **Renovação Mensal Premium**
```
Evento: invoice.payment_succeeded
↓
Atualiza profiles.subscription_status = 'active'
↓
Chama reset_premium_gabaritos(user_id)
↓
Reseta saldo para 500 Gabaritos
↓
Registra transação tipo 'premium_grant'
```

### 3. **Cancelamento**
```
Evento: customer.subscription.deleted
↓
Atualiza profiles.subscription_status = 'cancelled'
↓
Usuário mantém Gabaritos restantes
↓
Não recebe mais 500/mês
```

### 4. **Pagamento Falhou**
```
Evento: invoice.payment_failed
↓
Atualiza profiles.subscription_status = 'past_due'
↓
Usuário mantém Gabaritos restantes
↓
Não pode criar novos simulados se saldo = 0
```

---

## 🗄️ Estrutura do Banco de Dados

### Tabela: `user_gabaritos`
```sql
- user_id (UUID, PK)
- gabaritos (INTEGER) -- Saldo atual
- trial_gabaritos_granted (BOOLEAN) -- Se já recebeu trial
- trial_started_at (TIMESTAMP) -- Data do trial
- premium_reset_at (TIMESTAMP) -- Último reset Premium
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Tabela: `gabaritos_transactions`
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- amount (INTEGER) -- Positivo ou negativo
- type (TEXT) -- purchase, deduction, premium_grant, trial_grant, refund
- description (TEXT)
- simulado_id (UUID, FK, nullable)
- created_at (TIMESTAMP)
```

### Tabela: `gabaritos_packages`
```sql
- id (UUID, PK)
- name (TEXT)
- amount (INTEGER)
- price_brl (DECIMAL)
- active (BOOLEAN)
- created_at (TIMESTAMP)
```

---

## ⚙️ Funções SQL

### `calculate_simulado_cost(questoes_count INTEGER)`
Calcula o custo baseado na quantidade de questões.

### `deduct_gabaritos_for_simulado()`
Trigger que deduz Gabaritos automaticamente ao criar simulado.

### `grant_trial_gabaritos(p_user_id UUID)`
Concede 50 Gabaritos de trial (uma vez por usuário).

### `reset_premium_gabaritos(p_user_id UUID)`
Reseta saldo para 500 Gabaritos (renovação Premium).

### `add_gabaritos(p_user_id UUID, p_amount INTEGER, p_description TEXT)`
Adiciona Gabaritos ao saldo (compra de pacote).

### `get_gabaritos_balance(p_user_id UUID)`
Retorna o saldo atual de Gabaritos.

---

## 🎯 Fluxo do Usuário

### Novo Usuário (Trial)
```
1. Cria conta
2. Cadastra forma de pagamento
3. Stripe cria subscription com trial de 3 dias
4. Webhook concede 50 Gabaritos automaticamente
5. Usuário testa a plataforma por 3 dias
6. Após 3 dias, Stripe cobra primeira mensalidade
7. Webhook reseta para 500 Gabaritos
8. Vira assinante Premium
```

### Usuário Premium
```
1. Todo mês, Stripe cobra mensalidade
2. Webhook reseta saldo para 500 Gabaritos
3. Usuário cria simulados (deduz Gabaritos)
4. Se acabar antes do mês, pode comprar avulso
5. No próximo mês, volta para 500 (não acumula)
```

### Usuário Comum (Sem Assinatura)
```
1. Trial expirou ou cancelou assinatura
2. Saldo = 0 (ou Gabaritos avulsos comprados)
3. Tenta criar simulado
4. Modal: "Saldo Insuficiente"
5. Clica "Ir para Loja"
6. Compra pacote avulso
7. Pode criar simulados novamente
```

---

## 🚀 Implementação Frontend

### Componentes Criados

**`GabaritosBalance.tsx`**
- Exibe saldo em tempo real
- Clicável para abrir loja
- Presente na sidebar (desktop) e barra inferior (mobile)

**`InsufficientBalanceDialog.tsx`**
- Modal quando saldo insuficiente
- Mostra custo vs saldo
- Botão para ir à loja

**`LojaGabaritos.tsx`**
- Página da loja (`/dashboard/loja`)
- Lista pacotes disponíveis
- Informações sobre Trial e Premium
- Tabela de custos

### Helpers

**`lib/gabaritos.ts`**
- `calculateSimuladoCost(questoesCount)` - Calcula custo
- `formatGabaritos(amount)` - Formata exibição
- `getCostDescription(questoesCount)` - Descrição do custo
- `hasSufficientBalance(balance, cost)` - Verifica saldo
- `calculatePossibleSimulados(balance, questoesCount)` - Quantos pode criar

---

## ✅ Checklist de Implementação

### Backend
- [x] Migration SQL criada
- [x] Tabelas: user_gabaritos, gabaritos_transactions, gabaritos_packages
- [x] Funções SQL: calculate, deduct, grant_trial, reset_premium, add
- [x] Trigger automático na criação de simulado
- [x] Webhook Stripe atualizado (trial + renovação)
- [ ] Aplicar migration no Supabase Dashboard

### Frontend
- [x] Componente GabaritosBalance
- [x] Componente InsufficientBalanceDialog
- [x] Página LojaGabaritos
- [x] Helpers em lib/gabaritos.ts
- [x] Integração no formulário de simulados
- [x] Contador de custo em tempo real
- [x] Verificação de saldo antes de criar
- [x] Navegação via saldo clicável (sem menu Loja)

### Integração
- [ ] Configurar webhook Stripe em produção
- [ ] Testar concessão de trial
- [ ] Testar reset mensal Premium
- [ ] Testar compra de pacotes avulsos
- [ ] Testar dedução ao criar simulado

---

## 🔧 Próximos Passos

1. **Aplicar migration no Supabase Dashboard**
   - Executar `20260320_add_gabaritos_system_v2.sql`
   - Verificar tabelas e funções criadas

2. **Configurar Webhook Stripe**
   - URL: `https://[seu-projeto].supabase.co/functions/v1/stripe-webhook`
   - Eventos: `customer.subscription.created`, `invoice.payment_succeeded`, etc.
   - Testar com Stripe CLI localmente

3. **Testar Trial**
   - Criar nova conta
   - Cadastrar cartão de teste
   - Verificar se recebe 50 Gabaritos
   - Criar simulado e verificar dedução

4. **Testar Premium**
   - Simular renovação mensal (Stripe CLI)
   - Verificar reset para 500 Gabaritos
   - Confirmar que não acumula

5. **Implementar Gateway de Pagamento para Pacotes Avulsos**
   - Stripe Checkout para compra única
   - Webhook para confirmar pagamento
   - Chamar `add_gabaritos()` após confirmação

---

## 📊 Métricas e Monitoramento

### Queries Úteis

**Ver saldo de um usuário:**
```sql
SELECT * FROM user_gabaritos WHERE user_id = 'UUID';
```

**Ver histórico de transações:**
```sql
SELECT * FROM gabaritos_transactions 
WHERE user_id = 'UUID' 
ORDER BY created_at DESC;
```

**Ver usuários com saldo baixo:**
```sql
SELECT user_id, gabaritos 
FROM user_gabaritos 
WHERE gabaritos < 10 
ORDER BY gabaritos ASC;
```

**Ver total de Gabaritos em circulação:**
```sql
SELECT SUM(gabaritos) as total_gabaritos 
FROM user_gabaritos;
```

---

## ⚠️ Observações Importantes

1. **Gabaritos Premium não acumulam** - Sempre resetam para 500
2. **Gabaritos avulsos não expiram** - Ficam permanentemente
3. **Trial é único** - Só pode receber uma vez por usuário
4. **Dedução é automática** - Trigger SQL ao criar simulado
5. **Sem assinatura = sem simulados** - Precisa comprar avulso

---

**Última atualização:** 20/03/2026
