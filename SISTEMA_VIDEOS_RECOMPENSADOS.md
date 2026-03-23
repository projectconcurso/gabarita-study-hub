# 🎬 Sistema de Vídeos Recompensados - AppLixir

## 📋 Configuração Inicial

### 1. Obter Credenciais do AppLixir

1. Acesse: https://www.applixir.com
2. Faça login na sua conta
3. No Dashboard, vá em **Sites** → **[Seu Site]**
4. Copie as credenciais:
   - **Game API Key** (ou API Key)
   - **Zone ID** (provavelmente será `2050` para teste)

### 2. Configurar Variáveis de Ambiente

Crie ou edite o arquivo `.env.local` na raiz do projeto:

```bash
# AppLixir Rewarded Video Ads
VITE_APPLIXIR_API_KEY=sua_api_key_aqui
VITE_APPLIXIR_ZONE_ID=2050
```

**⚠️ IMPORTANTE:** Substitua `sua_api_key_aqui` pela sua API Key real do AppLixir.

---

## 🏗️ Arquitetura Implementada

### Arquivos Criados/Modificados:

1. **`index.html`**
   - ✅ SDK do AppLixir adicionado no `<head>`

2. **`src/components/ads/RewardedVideoAd.tsx`**
   - ✅ Componente React para vídeos recompensados
   - ✅ Integração com AppLixir SDK
   - ✅ Callbacks de sucesso/erro
   - ✅ Adiciona Gabaritos automaticamente

3. **`src/components/InsufficientBalanceDialog.tsx`**
   - ✅ Botão de vídeo recompensado integrado
   - ✅ Verificação de uso diário (1x por dia)
   - ✅ Mensagens de feedback

4. **`.env.local.example`**
   - ✅ Variáveis de ambiente documentadas

---

## 🎯 Como Funciona

### Fluxo do Usuário:

1. **Usuário tenta criar simulado sem Gabaritos suficientes**
   → Modal "Saldo Insuficiente" abre

2. **Sistema verifica se pode assistir vídeo**
   - ✅ **Pode assistir**: Mostra botão verde "Assistir vídeo e ganhar 10 Gabaritos"
   - ❌ **Já assistiu hoje**: Mostra mensagem "Você já assistiu seu vídeo grátis hoje"

3. **Usuário clica no botão**
   → Vídeo do AppLixir carrega (30 segundos)

4. **Usuário assiste até o fim**
   → Sistema adiciona 10 Gabaritos automaticamente
   → Toast de sucesso aparece
   → Botão desaparece (limite diário atingido)

5. **Usuário pode criar o simulado**
   → Agora tem Gabaritos suficientes!

---

## 🔧 Controle de Limite Diário

### Lógica Implementada:

```typescript
// Verifica na tabela gabaritos_transactions
// Se já existe registro hoje com descrição "Recompensa por assistir vídeo"
// → canWatchVideo = false
// Caso contrário
// → canWatchVideo = true
```

### Query SQL:
```sql
SELECT COUNT(*) 
FROM gabaritos_transactions 
WHERE user_id = 'xxx'
  AND created_at >= CURRENT_DATE
  AND description LIKE '%Recompensa por assistir vídeo%';
```

---

## 💰 Recompensas

- **Valor por vídeo:** 10 Gabaritos
- **Limite diário:** 1 vídeo
- **Máximo por dia:** 10 Gabaritos grátis
- **Máximo por mês:** ~300 Gabaritos grátis

---

## 🧪 Como Testar

### 1. Configurar Credenciais

```bash
# .env.local
VITE_APPLIXIR_API_KEY=sua_api_key_real
VITE_APPLIXIR_ZONE_ID=2050
```

### 2. Reiniciar Servidor de Desenvolvimento

```bash
npm run dev
```

### 3. Testar Fluxo

1. Faça login na aplicação
2. Vá em **Simulados** → **Novo Simulado**
3. Configure um simulado que custe mais Gabaritos do que você tem
4. Clique em **Criar Simulado**
5. Modal "Saldo Insuficiente" deve abrir
6. Deve aparecer botão verde "Assistir vídeo e ganhar 10 Gabaritos"
7. Clique no botão
8. Vídeo deve carregar (pode demorar alguns segundos)
9. Assista até o fim
10. Toast de sucesso deve aparecer
11. Verifique se 10 Gabaritos foram adicionados

### 4. Testar Limite Diário

1. Após assistir 1 vídeo
2. Tente criar outro simulado sem Gabaritos
3. Modal deve mostrar: "⏰ Você já assistiu seu vídeo grátis hoje. Volte amanhã!"

---

## 📊 Monitoramento

### Verificar Transações de Vídeos:

```sql
-- Ver todos os vídeos assistidos
SELECT 
  user_id,
  amount,
  description,
  created_at
FROM gabaritos_transactions
WHERE description LIKE '%Recompensa por assistir vídeo%'
ORDER BY created_at DESC;

-- Contar vídeos por dia
SELECT 
  DATE(created_at) as dia,
  COUNT(*) as videos_assistidos,
  SUM(amount) as gabaritos_distribuidos
FROM gabaritos_transactions
WHERE description LIKE '%Recompensa por assistir vídeo%'
GROUP BY DATE(created_at)
ORDER BY dia DESC;
```

---

## 🎨 Customização

### Alterar Recompensa:

```typescript
// src/components/InsufficientBalanceDialog.tsx
<RewardedVideoAd
  apiKey={APPLIXIR_API_KEY}
  zoneId={APPLIXIR_ZONE_ID}
  rewardAmount={10}  // ← Altere aqui (ex: 15, 20)
  onRewardGranted={handleVideoReward}
  className="w-full"
/>
```

### Alterar Limite Diário:

Para permitir mais de 1 vídeo por dia, modifique a lógica em `checkVideoAvailability()`:

```typescript
// Exemplo: 3 vídeos por dia
const MAX_VIDEOS_PER_DAY = 3;

const { count } = await supabase
  .from('gabaritos_transactions')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', user.id)
  .gte('created_at', today)
  .like('description', '%Recompensa por assistir vídeo%');

setCanWatchVideo((count || 0) < MAX_VIDEOS_PER_DAY);
```

---

## ⚠️ Troubleshooting

### Vídeo não carrega:

1. **Verifique se o SDK está carregado:**
   - Abra DevTools → Console
   - Digite: `window.invokeApplixirVideoUnit`
   - Deve retornar uma função

2. **Verifique credenciais:**
   - API Key está correta?
   - Zone ID está correto?

3. **Verifique logs do AppLixir:**
   - Dashboard AppLixir → Analytics
   - Veja se há requisições

### Gabaritos não são adicionados:

1. **Verifique console do navegador:**
   - Deve aparecer: "✅ Vídeo assistido completamente!"
   - Se aparecer erro, verifique permissões do RPC `add_gabaritos`

2. **Verifique banco de dados:**
   ```sql
   SELECT * FROM gabaritos_transactions 
   WHERE user_id = 'seu_user_id'
   ORDER BY created_at DESC 
   LIMIT 5;
   ```

### Limite diário não funciona:

1. **Verifique timezone:**
   - A query usa `CURRENT_DATE` do servidor
   - Pode haver diferença de fuso horário

2. **Limpar cache de teste:**
   ```sql
   -- APENAS PARA TESTE - Remove transações de vídeo de hoje
   DELETE FROM gabaritos_transactions 
   WHERE user_id = 'seu_user_id'
     AND created_at >= CURRENT_DATE
     AND description LIKE '%Recompensa por assistir vídeo%';
   ```

---

## 📈 Próximos Passos (Opcional)

### Funcionalidades Futuras:

1. **Página "Ganhe Gabaritos"**
   - Página dedicada para assistir vídeos
   - Contador de vídeos assistidos
   - Sistema de streaks (dias consecutivos)

2. **Gamificação**
   - Badges por vídeos assistidos
   - Bônus por assistir X dias seguidos
   - Missões diárias

3. **Analytics**
   - Dashboard de vídeos assistidos
   - Taxa de conclusão
   - Receita gerada

4. **A/B Testing**
   - Testar diferentes recompensas (5, 10, 15 Gabaritos)
   - Testar diferentes limites diários
   - Otimizar conversão

---

## 💡 Dicas de Monetização

### Estimativa de Receita:

```
Usuários ativos/dia: 1.000
Taxa de engajamento: 50% (500 vídeos/dia)
eCPM médio: $18
Receita/dia: $9
Receita/mês: $270
```

### Otimizar eCPM:

1. **Tráfego de qualidade** → Maior eCPM
2. **Usuários engajados** → Maior taxa de conclusão
3. **Tier 1 GEOs** (US, UK, CA) → eCPM mais alto
4. **Vídeos completos** → Melhor performance

---

## 📞 Suporte

- **AppLixir Support:** https://support.applixir.com
- **Documentação:** https://www.applixir.com/how-it-works/
- **Dashboard:** https://www.applixir.com/dashboard

---

**Sistema implementado e pronto para uso! 🚀**
