# 🚀 Monetag Multitag - Implementação Completa

## ✅ Status: Implementado e Simplificado

**Plataforma:** Monetag (antigo PropellerAds)  
**Domínio:** `quge5.com`  
**Zone ID:** `222618` (Multitag)

---

## 🎯 O que é Multitag?

**Multitag** é uma solução **all-in-one** do Monetag que ativa **4 formatos de anúncio** com apenas **um código**:

1. ✅ **Push Notifications** - Notificações no navegador
2. ✅ **In-Page Push** - Notificações dentro da página
3. ✅ **Vignette Banner** - Banners visuais
4. ✅ **OnClick (Popunder)** - Anúncios ao clicar

**Vantagem:** Ao invés de gerenciar 4 zones separadas, você usa um único script que gerencia tudo automaticamente.

---

## 📦 O que foi implementado:

### **1. Script Multitag no `<head>`** ✅
**Arquivo:** `index.html` (linha 22)

```html
<!-- Monetag Multitag (Push, In-Page Push, Vignette, OnClick) -->
<script src="https://quge5.com/88/tag.min.js" data-zone="222618" async data-cfasync="false"></script>
```

### **2. Service Worker (Push Notifications)** ✅
**Arquivo:** `/public/sw.js`

```javascript
self.options = {
    "domain": "quge5.com",
    "zoneId": 222618
}
self.lary = ""
importScripts('https://quge5.com/act/files/service-worker.min.js?r=sw')
```

### **3. Hook useIsPremium** ✅
**Arquivo:** `/src/hooks/useIsPremium.ts`

- ✅ Detecta status premium do usuário
- ✅ Por enquanto retorna `false` (todos veem ads)
- ✅ Pronto para integrar com sistema de assinaturas

---

## 🎨 Como Funciona:

### **Automático!**

Com o Multitag, você **não precisa** adicionar componentes manualmente em cada página. O script gerencia tudo automaticamente:

- **Push Notifications:** Aparecem automaticamente após permissão do usuário
- **In-Page Push:** Aparecem em locais estratégicos da página
- **Vignette Banner:** Aparecem entre navegações
- **OnClick:** Ativado ao clicar em elementos da página

---

## 💡 Vantagens do Multitag:

### **✅ Simplicidade**
- Um único código
- Sem necessidade de componentes React
- Gerenciamento automático

### **✅ Otimização**
- Monetag otimiza automaticamente qual formato mostrar
- Maximiza receita sem prejudicar UX
- Testes A/B automáticos

### **✅ Menos Código**
- Não precisa de componentes `PropellerBanner`
- Não precisa gerenciar múltiplas zones
- Menos manutenção

---

## 🔒 Usuários Premium:

### **Comportamento Atual:**
- ⚠️ Por enquanto, **todos os usuários veem anúncios**
- ✅ Hook `useIsPremium` está implementado
- 📝 Quando implementar sistema de assinaturas, você pode:

### **Opção 1: Bloquear Script Completamente (Recomendado)**

Criar um componente wrapper que só carrega o script para não-premium:

```tsx
// src/components/MontagScript.tsx
import { useIsPremium } from '@/hooks/useIsPremium';
import { useEffect } from 'react';

export function MontagScript() {
  const { isPremium, loading } = useIsPremium();
  
  useEffect(() => {
    // Se for premium, não carregar script
    if (loading || isPremium) return;
    
    // Carregar script Multitag dinamicamente
    const script = document.createElement('script');
    script.src = 'https://quge5.com/88/tag.min.js';
    script.setAttribute('data-zone', '222618');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
    };
  }, [isPremium, loading]);
  
  return null;
}
```

Depois adicionar no `App.tsx`:

```tsx
import { MontagScript } from '@/components/MontagScript';

function App() {
  return (
    <>
      <MontagScript />
      {/* Resto do app */}
    </>
  );
}
```

### **Opção 2: Manter Script, Bloquear Exibição via CSS**

Adicionar classe CSS para esconder anúncios de usuários premium:

```css
.user-premium .monetag-ad,
.user-premium [data-monetag] {
  display: none !important;
}
```

---

## 📊 Monitoramento:

### **Dashboard Monetag:**
1. Acesse: https://monetag.com
2. Vá em **Statistics**
3. Monitore:
   - **Impressões:** Quantas vezes ads foram exibidos
   - **Cliques:** Quantos usuários clicaram
   - **CTR:** Taxa de cliques
   - **Receita:** Quanto você ganhou por formato

### **Métricas por Formato:**
O Multitag cria 4 zones automaticamente, todas marcadas com **"MULTI"**:
- Push Notifications
- In-Page Push
- Vignette Banner
- OnClick

Você pode ver o desempenho de cada formato separadamente no Dashboard.

---

## 💰 Estimativa de Receita:

### **Cenário Realista (após 6 meses):**
- 5.000 usuários/mês
- 4 formatos ativos
- CPM médio: R$ 2,00
- **Receita estimada: R$ 300-500/mês**

### **Cenário Otimista:**
- 10.000 usuários/mês
- 4 formatos otimizados
- CPM médio: R$ 3,00
- **Receita estimada: R$ 800-1.200/mês**

---

## 🆘 Troubleshooting:

### **Anúncios não aparecem:**

1. **Aguardar aprovação:** 24-48h após criar Multitag
2. **Testar em produção:** Não funciona em `localhost`
3. **Verificar status:** Dashboard → Websites → Verificar se está "ATIVO"
4. **Desabilitar ad blockers:** Testar em modo anônimo

### **Erros de conexão em localhost:**

**Normal e esperado!** Monetag bloqueia requisições de `localhost` por segurança.

**Solução:** Fazer deploy em produção e testar no domínio real.

---

## ✅ Checklist de Implementação:

- [x] Multitag criado no Dashboard Monetag
- [x] Script adicionado no `<head>` do `index.html`
- [x] Service Worker configurado (`/public/sw.js`)
- [x] Hook `useIsPremium` implementado
- [ ] Fazer deploy em produção
- [ ] Aguardar 24-48h para aprovação
- [ ] Verificar anúncios no domínio real
- [ ] Monitorar métricas no Dashboard
- [ ] (Opcional) Implementar bloqueio para usuários premium

---

## 🚀 Próximos Passos:

1. **Fazer deploy em produção**
2. **Aguardar aprovação do Monetag** (24-48h)
3. **Testar no domínio real** (gabarit.com.br)
4. **Monitorar métricas** no Dashboard
5. **Otimizar** baseado em dados reais
6. **Implementar bloqueio para premium** quando tiver sistema de assinaturas

---

## 📚 Recursos Úteis:

- **Dashboard:** https://monetag.com
- **Documentação Multitag:** https://help.monetag.com/en/articles/6726670-multitag-all-in-one
- **Suporte:** support@monetag.com

---

**Implementação completa e simplificada! Pronto para gerar receita com 4 formatos de anúncio.** 🎉
