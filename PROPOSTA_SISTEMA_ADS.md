# 📊 Proposta: Sistema de Anúncios para Usuários Free

## 🎯 Objetivo
Implementar anúncios display (banner ads) para usuários que não assinam o plano Premium, gerando receita adicional sem prejudicar a experiência do usuário.

---

## 🔍 Análise de Plataformas de Anúncios

### **1. Google AdSense** ⭐ RECOMENDADO
**Prós:**
- ✅ Maior rede de anunciantes do mundo
- ✅ CPM/CPC competitivo (R$ 0,50 - R$ 5,00 por 1000 impressões)
- ✅ Pagamentos confiáveis (mínimo R$ 400)
- ✅ Fácil integração com React
- ✅ Anúncios relevantes baseados em contexto
- ✅ Dashboard completo de analytics

**Contras:**
- ❌ Processo de aprovação rigoroso (7-14 dias)
- ❌ Requer conteúdo original e tráfego mínimo
- ❌ Políticas rígidas (pode suspender conta)

**Requisitos:**
- Site com domínio próprio (✅ você tem)
- Conteúdo original e de qualidade (✅ questões de concurso)
- Política de privacidade (precisa adicionar)
- Termos de uso (precisa adicionar)

---

### **2. Media.net** (Alternativa)
**Prós:**
- ✅ Powered by Yahoo/Bing
- ✅ Bom CPM para nichos educacionais
- ✅ Aprovação mais rápida que AdSense

**Contras:**
- ❌ Menor alcance que Google
- ❌ Pagamento mínimo US$ 100

---

### **3. Ezoic** (Para crescimento futuro)
**Prós:**
- ✅ IA otimiza posicionamento de ads
- ✅ Maior CPM que AdSense (até 2x)
- ✅ Testes A/B automáticos

**Contras:**
- ❌ Requer 10.000+ visitas/mês
- ❌ Mais complexo de implementar

---

## 🎨 Estratégia de Implementação

### **Fase 1: Preparação (1-2 dias)**

1. **Adicionar Páginas Legais**
   - Política de Privacidade
   - Termos de Uso
   - Política de Cookies
   - Sobre Nós

2. **Criar Conta Google AdSense**
   - Cadastro em: https://www.google.com/adsense
   - Adicionar site para aprovação
   - Aguardar validação (7-14 dias)

3. **Implementar Detecção de Usuário Premium**
   - Verificar se usuário tem assinatura ativa
   - Criar hook `useIsPremium()`
   - Condicionar exibição de ads

---

### **Fase 2: Implementação Técnica (2-3 dias)**

#### **Biblioteca Recomendada:**
```bash
npm install @ctrl/react-adsense
```

#### **Componente de Anúncio:**
```typescript
// src/components/ads/AdBanner.tsx
import { Adsense } from '@ctrl/react-adsense';
import { useIsPremium } from '@/hooks/useIsPremium';

interface AdBannerProps {
  slot: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  responsive?: boolean;
}

export function AdBanner({ slot, format = 'auto', responsive = true }: AdBannerProps) {
  const isPremium = useIsPremium();
  
  // Não mostrar ads para usuários premium
  if (isPremium) return null;
  
  return (
    <div className="ad-container my-4">
      <Adsense
        client={import.meta.env.VITE_ADSENSE_CLIENT_ID}
        slot={slot}
        format={format}
        responsive={responsive}
        style={{ display: 'block' }}
      />
    </div>
  );
}
```

#### **Hook de Detecção Premium:**
```typescript
// src/hooks/useIsPremium.ts
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useIsPremium() {
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkPremiumStatus() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsPremium(false);
          setLoading(false);
          return;
        }

        // Verificar se tem assinatura ativa
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('status, end_date')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .gte('end_date', new Date().toISOString())
          .single();

        setIsPremium(!!subscription);
      } catch (error) {
        console.error('Erro ao verificar premium:', error);
        setIsPremium(false);
      } finally {
        setLoading(false);
      }
    }

    checkPremiumStatus();
  }, []);

  return { isPremium, loading };
}
```

---

### **Fase 3: Posicionamento Estratégico de Anúncios**

#### **📍 Locais Recomendados:**

1. **Topo da Página (Leaderboard 728x90)**
   - Páginas: Home, Simulados, Questões
   - Alta visibilidade
   - Não intrusivo

2. **Sidebar Direita (Medium Rectangle 300x250)**
   - Páginas: Durante simulado, Questões
   - Sempre visível durante scroll
   - Bom CPM

3. **Entre Questões (In-Feed Ads)**
   - A cada 5-10 questões
   - Formato nativo
   - Menos intrusivo

4. **Rodapé (Horizontal Banner 728x90)**
   - Todas as páginas
   - Baixa intrusividade

#### **❌ Locais a EVITAR:**
- Durante resolução de questão (prejudica UX)
- Modais e popups (contra políticas AdSense)
- Sobre conteúdo importante
- Mais de 3 ads por página

---

### **Fase 4: Otimização e Testes (Contínuo)**

#### **Métricas a Monitorar:**
- **CTR (Click-Through Rate):** Meta > 1%
- **CPM (Custo por Mil Impressões):** R$ 1-5
- **Viewability:** Meta > 70%
- **Taxa de Rejeição:** Não aumentar > 5%

#### **Testes A/B:**
- Posicionamento de ads
- Tamanhos de banner
- Cores e estilos
- Frequência de exibição

---

## 💰 Projeção de Receita

### **Cenário Conservador:**
- 1.000 usuários free/mês
- 10 pageviews/usuário = 10.000 pageviews
- 2 ads/página = 20.000 impressões
- CPM R$ 2,00
- **Receita: R$ 40/mês**

### **Cenário Otimista:**
- 10.000 usuários free/mês
- 20 pageviews/usuário = 200.000 pageviews
- 2 ads/página = 400.000 impressões
- CPM R$ 4,00
- **Receita: R$ 1.600/mês**

### **Cenário Realista (após 6 meses):**
- 5.000 usuários free/mês
- 15 pageviews/usuário = 75.000 pageviews
- 2 ads/página = 150.000 impressões
- CPM R$ 3,00
- **Receita: R$ 450/mês**

---

## 🚀 Plano de Implementação

### **Semana 1: Preparação**
- [ ] Criar páginas legais (Privacidade, Termos)
- [ ] Cadastrar no Google AdSense
- [ ] Aguardar aprovação

### **Semana 2-3: Desenvolvimento**
- [ ] Instalar `@ctrl/react-adsense`
- [ ] Criar componente `AdBanner`
- [ ] Implementar hook `useIsPremium`
- [ ] Adicionar ads em locais estratégicos
- [ ] Testar em desenvolvimento (adTest='on')

### **Semana 4: Deploy e Monitoramento**
- [ ] Deploy em produção
- [ ] Configurar ads no AdSense Dashboard
- [ ] Monitorar métricas diariamente
- [ ] Ajustar posicionamento baseado em dados

---

## ⚠️ Considerações Importantes

### **Experiência do Usuário:**
- ✅ Ads não devem prejudicar usabilidade
- ✅ Manter site rápido (lazy load ads)
- ✅ Respeitar usuários premium (sem ads)
- ✅ Não exagerar na quantidade

### **Políticas do AdSense:**
- ❌ Não clicar nos próprios ads
- ❌ Não pedir para usuários clicarem
- ❌ Não colocar ads em conteúdo proibido
- ❌ Não modificar código dos ads

### **Compliance:**
- ✅ LGPD: Consentimento para cookies
- ✅ Política de Privacidade atualizada
- ✅ Banner de cookies (GDPR/LGPD)

---

## 🎯 Próximos Passos Imediatos

1. **Você decide:** Quer implementar agora ou aguardar mais tráfego?
2. **Se sim:** Começamos pelas páginas legais
3. **Se não:** Focamos em crescer base de usuários primeiro

---

## 📚 Recursos Úteis

- **AdSense:** https://www.google.com/adsense
- **Biblioteca React:** https://github.com/hustcc/react-adsense
- **Políticas:** https://support.google.com/adsense/answer/48182
- **Tamanhos de Ads:** https://support.google.com/admanager/answer/1100453

---

**Recomendação Final:** Comece com Google AdSense em 2-3 locais estratégicos, monitore métricas e otimize baseado em dados reais. Priorize sempre a experiência do usuário premium como diferencial competitivo.
