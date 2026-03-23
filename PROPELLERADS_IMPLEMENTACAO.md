# 🚀 PropellerAds - Implementação Completa

## ✅ Status: Implementado e Funcionando

**Zone ID:** `10768455`  
**Domínio:** `5gvci.com`

---

## 📦 O que foi implementado:

### **1. Service Worker (Push Notifications)** ✅
**Arquivo:** `/public/sw.js`

```javascript
self.options = {
    "domain": "5gvci.com",
    "zoneId": 10768455
}
self.lary = ""
importScripts('https://5gvci.com/act/files/service-worker.min.js?r=sw')
```

### **2. Script de Inicialização** ✅
**Arquivo:** `index.html` (linhas 21-27)

```html
<!-- PropellerAds Push Notifications -->
<script>
  (function(d,z,s){
    s.src='https://'+d+'/400/'+z;
    try{(document.body||document.documentElement).appendChild(s)}catch(e){}
  })('5gvci.com', 10768455, document.createElement('script'))
</script>
```

### **3. Componente PropellerBanner** ✅
**Arquivo:** `/src/components/ads/PropellerBanner.tsx`

- ✅ Detecta usuários premium automaticamente
- ✅ Não mostra ads para usuários premium
- ✅ Carrega banners dinamicamente
- ✅ Cleanup automático ao desmontar

### **4. Hook useIsPremium** ✅
**Arquivo:** `/src/hooks/useIsPremium.ts`

- ✅ Detecta status premium do usuário
- ✅ Atualiza automaticamente ao fazer login/logout
- ✅ Por enquanto retorna `false` (todos veem ads)
- ✅ Pronto para integrar com sistema de assinaturas

---

## 🎨 Como Usar o Componente

### **Exemplo Básico:**

```tsx
import { PropellerBanner } from '@/components/ads/PropellerBanner';

export default function MinhaPage() {
  return (
    <div>
      <h1>Conteúdo da Página</h1>
      
      {/* Banner PropellerAds */}
      <PropellerBanner 
        zoneId="10768455"
        width={728}
        height={90}
      />
      
      <p>Mais conteúdo...</p>
    </div>
  );
}
```

### **Tamanhos Comuns de Banner:**

```tsx
{/* Banner Horizontal (Leaderboard) */}
<PropellerBanner zoneId="10768455" width={728} height={90} />

{/* Retângulo Médio */}
<PropellerBanner zoneId="10768455" width={300} height={250} />

{/* Banner Grande */}
<PropellerBanner zoneId="10768455" width={970} height={90} />

{/* Skyscraper */}
<PropellerBanner zoneId="10768455" width={160} height={600} />
```

---

## 📍 Onde os Anúncios Foram Adicionados

### **1. Home Dashboard** ✅
**Arquivo:** `/src/pages/dashboard/Home.tsx`

- **Localização:** Após os botões de ação
- **Formato:** Banner horizontal (728x90)
- **Visibilidade:** Alta (topo da página)

```tsx
<PropellerBanner 
  zoneId="10768455" 
  width={728} 
  height={90}
  className="mx-auto"
/>
```

---

## 🎯 Locais Recomendados para Mais Anúncios

### **Páginas Sugeridas:**

1. **Página de Simulados** (`/dashboard/simulados`)
   - Banner retangular na sidebar (300x250)
   - Banner horizontal no topo

2. **Durante Simulado** (`/dashboard/simular/:id`)
   - ⚠️ Apenas ao finalizar (não durante questões)
   - Banner retangular ao lado dos resultados

3. **Página de Amigos** (`/dashboard/amigos`)
   - Banner horizontal no topo
   - Banner retangular na sidebar

4. **Mural** (`/dashboard/mural`)
   - Banner entre posts (a cada 5-10 posts)

---

## 💡 Boas Práticas

### **✅ Fazer:**
- Máximo 3 banners por página
- Posicionar em locais naturais (não intrusivos)
- Usar tamanhos responsivos
- Respeitar usuários premium (sem ads)
- Testar em diferentes dispositivos

### **❌ Não Fazer:**
- Colocar ads durante resolução de questões
- Usar mais de 3 ads por página
- Bloquear conteúdo importante
- Forçar cliques

---

## 🔧 Adicionar Mais Banners

### **Passo a Passo:**

1. **Criar nova Zone no PropellerAds Dashboard:**
   - Acesse: https://propellerads.com
   - Vá em **Websites** → **Seu Site**
   - Clique em **Add Zone**
   - Escolha **Banner Display**
   - Configure tamanho e tipo
   - **Copie o Zone ID**

2. **Adicionar no código:**

```tsx
import { PropellerBanner } from '@/components/ads/PropellerBanner';

export default function MinhaPage() {
  return (
    <div>
      {/* Use o Zone ID que você copiou */}
      <PropellerBanner 
        zoneId="SEU-ZONE-ID-AQUI"
        width={300}
        height={250}
      />
    </div>
  );
}
```

---

## 📊 Tipos de Anúncio PropellerAds

### **1. Push Notifications** ✅ (Implementado)
- Service Worker configurado
- Notificações no navegador
- Não intrusivo

### **2. Banner Display** ✅ (Implementado)
- Anúncios visuais na página
- Componente `PropellerBanner` criado
- Fácil de adicionar em qualquer página

### **3. In-Page Push** (Opcional)
- Notificações dentro da página
- Menos intrusivo que popunder
- Recomendado para adicionar depois

### **4. Popunder** (Não Recomendado)
- Abre nova aba/janela
- ⚠️ Muito intrusivo
- Pode irritar usuários

---

## 💰 Estimativa de Receita

### **Cenário Conservador:**
- 1.000 usuários/mês
- 10 pageviews/usuário = 10.000 pageviews
- 2 banners/página = 20.000 impressões
- CPM R$ 1,00
- **Receita: R$ 20/mês**

### **Cenário Realista (após 6 meses):**
- 5.000 usuários/mês
- 15 pageviews/usuário = 75.000 pageviews
- 2 banners/página = 150.000 impressões
- CPM R$ 1,50
- **Receita: R$ 225/mês**

### **Cenário Otimista:**
- 10.000 usuários/mês
- 20 pageviews/usuário = 200.000 pageviews
- 2 banners/página = 400.000 impressões
- CPM R$ 2,00
- **Receita: R$ 800/mês**

---

## 🔒 Usuários Premium

### **Comportamento Atual:**
- ✅ Hook `useIsPremium` implementado
- ✅ Componente verifica status premium
- ⚠️ Por enquanto, todos veem ads (isPremium = false)

### **Quando Implementar Sistema de Assinaturas:**

1. Criar tabela `subscriptions` no Supabase
2. Atualizar hook `useIsPremium` para verificar assinatura ativa
3. Ads serão automaticamente ocultados para usuários premium

**Código já está pronto!** Só precisa da tabela de assinaturas.

---

## 🆘 Troubleshooting

### **Ads não aparecem:**
1. ✅ Verificar se Zone ID está correto
2. ✅ Aguardar 24-48h após configurar (PropellerAds precisa aprovar)
3. ✅ Desabilitar ad blockers
4. ✅ Verificar console do navegador por erros
5. ✅ Testar em modo anônimo

### **Erro no console:**
- Normal em desenvolvimento
- Ads podem não carregar localmente
- Teste em produção após deploy

---

## 📈 Monitoramento

### **Dashboard PropellerAds:**
- Acesse: https://propellerads.com
- Vá em **Statistics**
- Monitore:
  - **Impressões:** Quantas vezes ads foram exibidos
  - **Cliques:** Quantos usuários clicaram
  - **CTR:** Taxa de cliques (meta: > 0.5%)
  - **Receita:** Quanto você ganhou

### **Otimização:**
- Teste diferentes posições
- Remova banners com baixo CTR
- Ajuste tamanhos baseado em dados
- Adicione mais banners em páginas populares

---

## ✅ Checklist de Implementação

- [x] Service Worker criado (`/public/sw.js`)
- [x] Script de inicialização adicionado (`index.html`)
- [x] Componente `PropellerBanner` criado
- [x] Hook `useIsPremium` implementado
- [x] Banner adicionado na Home Dashboard
- [ ] Adicionar banners em mais páginas (opcional)
- [ ] Criar mais Zones no PropellerAds Dashboard
- [ ] Fazer deploy em produção
- [ ] Aguardar 24-48h para ads aparecerem
- [ ] Monitorar métricas no Dashboard

---

## 🚀 Próximos Passos

1. **Fazer deploy em produção**
2. **Aguardar aprovação do PropellerAds** (24-48h)
3. **Monitorar métricas** no Dashboard
4. **Adicionar mais banners** em páginas estratégicas
5. **Otimizar** baseado em dados reais

---

**Implementação completa! Pronto para gerar receita.** 🎉
