# 🎯 Monetag - Vignette Banner (Solução Ideal)

## ✅ Status: Implementado - Não Invasivo e Profissional

**Plataforma:** Monetag  
**Domínio:** `izcle.com`  
**Zone ID:** `10781786`  
**Formato:** Vignette Banner

---

## 🌟 O que é Vignette Banner?

**Vignette Banner** é um formato de anúncio **não invasivo** que:

- ✅ **Aparece entre navegações** (quando usuário muda de página)
- ✅ **Fácil de fechar** (botão X visível)
- ✅ **Não abre abas automaticamente**
- ✅ **Não mostra notificações intrusivas**
- ✅ **Experiência profissional**
- ✅ **Gerenciamento automático** (sem componentes React necessários)

### **Por que é melhor que Multitag?**

| Aspecto | Multitag | Vignette Banner |
|---------|----------|-----------------|
| **Invasividade** | ❌ Muito alta | ✅ Baixa |
| **Abas automáticas** | ❌ Sim (OnClick) | ✅ Não |
| **Notificações** | ❌ Sim (In-Page Push) | ✅ Não |
| **UX** | ❌ Ruim | ✅ Profissional |
| **Retenção** | ❌ Baixa | ✅ Alta |
| **Implementação** | ⚠️ Complexa | ✅ Simples |

---

## 📦 Implementação:

### **Script no `<head>`** ✅
**Arquivo:** `index.html` (linha 22)

```html
<!-- Monetag Vignette Banner (Não invasivo) -->
<script>(function(s){s.dataset.zone='10781786',s.src='https://izcle.com/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))</script>
```

**Isso é tudo!** Não precisa de mais nada.

---

## 🎨 Como Funciona:

### **Automático e Inteligente:**

1. **Carrega automaticamente** quando página é aberta
2. **Detecta navegações** entre páginas
3. **Mostra banner** em momentos estratégicos
4. **Não interrompe** a experiência do usuário
5. **Fácil de fechar** (botão X sempre visível)

### **Quando Aparece:**
- Entre mudanças de página (ex: Home → Simulados)
- Após tempo de inatividade
- Em momentos não intrusivos
- **NUNCA durante uso ativo** (ex: resolvendo questões)

---

## 💡 Vantagens:

### **Para o Usuário:**
- ✅ Não atrapalha navegação
- ✅ Fácil de fechar
- ✅ Não abre abas indesejadas
- ✅ Experiência profissional

### **Para Você (Desenvolvedor):**
- ✅ Implementação simples (1 linha de código)
- ✅ Sem componentes React necessários
- ✅ Gerenciamento automático
- ✅ Sem manutenção

### **Para o Negócio:**
- ✅ Mantém profissionalismo da plataforma
- ✅ Não prejudica retenção de usuários
- ✅ Usuários mais propensos a assinar premium
- ✅ Receita consistente sem sacrificar UX

---

## 💰 Estimativa de Receita:

### **Vignette Banner:**

**Cenário Conservador:**
- 5.000 usuários/mês
- 10 navegações/usuário = 50.000 navegações
- 50% de exibição = 25.000 impressões
- CPM R$ 2,00
- **Receita: R$ 50/mês**

**Cenário Realista:**
- 5.000 usuários/mês
- 15 navegações/usuário = 75.000 navegações
- 60% de exibição = 45.000 impressões
- CPM R$ 2,50
- **Receita: R$ 112/mês**

**Cenário Otimista:**
- 10.000 usuários/mês
- 20 navegações/usuário = 200.000 navegações
- 70% de exibição = 140.000 impressões
- CPM R$ 3,00
- **Receita: R$ 420/mês**

---

## 🔒 Usuários Premium:

### **Implementação Futura:**

Quando tiver sistema de assinaturas, você pode bloquear o Vignette para usuários premium:

**Opção 1: Bloquear Script Completamente**

```tsx
// src/components/MontagVignette.tsx
import { useIsPremium } from '@/hooks/useIsPremium';
import { useEffect } from 'react';

export function MontagVignette() {
  const { isPremium, loading } = useIsPremium();
  
  useEffect(() => {
    // Se for premium, não carregar script
    if (loading || isPremium) return;
    
    // Carregar script Vignette dinamicamente
    const script = document.createElement('script');
    script.text = `(function(s){s.dataset.zone='10781786',s.src='https://izcle.com/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`;
    
    document.head.appendChild(script);
    
    return () => {
      // Cleanup se necessário
    };
  }, [isPremium, loading]);
  
  return null;
}
```

Depois adicionar no `App.tsx`:

```tsx
import { MontagVignette } from '@/components/MontagVignette';

function App() {
  return (
    <>
      <MontagVignette />
      {/* Resto do app */}
    </>
  );
}
```

**Opção 2: Manter Script, Bloquear via CSS**

```css
.user-premium .vignette-banner,
.user-premium [data-monetag-vignette] {
  display: none !important;
}
```

---

## 📊 Monitoramento:

### **Dashboard Monetag:**

1. Acesse: https://monetag.com
2. Vá em **Statistics**
3. Procure pela zone **10781786** (Vignette)
4. Monitore:
   - **Impressões:** Quantas vezes o banner foi exibido
   - **Cliques:** Quantos usuários clicaram
   - **CTR:** Taxa de cliques (meta: > 1%)
   - **Receita:** Quanto você ganhou

### **Otimização:**
- Vignette tem CTR naturalmente mais alto que banners estáticos
- Usuários estão mais receptivos entre navegações
- Menos "banner blindness" que banners fixos

---

## 🆘 Troubleshooting:

### **Vignette não aparece:**

1. **Aguardar aprovação:** 24-48h após criar zone
2. **Testar em produção:** Não funciona em `localhost`
3. **Navegar entre páginas:** Vignette aparece em transições
4. **Verificar status:** Dashboard → Zone 10781786 → Status "ATIVO"

### **Aparece muito frequentemente:**

- Monetag controla frequência automaticamente
- Geralmente 1 exibição a cada 2-3 navegações
- Configurável no Dashboard (Frequency Capping)

### **Erros de conexão em localhost:**

**Normal!** Monetag bloqueia `localhost`. Teste em produção.

---

## ✅ Checklist:

- [x] Vignette script adicionado no `index.html`
- [x] Zone ID configurado (10781786)
- [ ] Fazer deploy em produção
- [ ] Aguardar 24-48h para aprovação
- [ ] Testar no domínio real (gabarit.com.br)
- [ ] Navegar entre páginas para ver Vignette
- [ ] Monitorar métricas no Dashboard
- [ ] (Opcional) Implementar bloqueio para usuários premium

---

## 🚀 Próximos Passos:

1. **Fazer deploy em produção**
2. **Aguardar aprovação do Monetag** (24-48h)
3. **Testar no domínio real** navegando entre páginas
4. **Monitorar métricas** no Dashboard
5. **Ajustar frequência** se necessário (via Dashboard)
6. **Implementar bloqueio para premium** quando tiver assinaturas

---

## 📚 Recursos Úteis:

- **Dashboard:** https://monetag.com
- **Documentação Vignette:** https://help.monetag.com/en/articles/6725606-vignette-banners
- **Suporte:** support@monetag.com

---

## 🎯 Conclusão:

**Vignette Banner é a solução ideal para plataformas educacionais:**

- ✅ **Não invasivo** - Mantém profissionalismo
- ✅ **Boa receita** - CPM competitivo
- ✅ **Fácil implementação** - 1 linha de código
- ✅ **Boa UX** - Usuários não reclamam
- ✅ **Alta conversão** - Mais propensos a assinar premium

**Implementação completa e otimizada para melhor equilíbrio entre receita e experiência do usuário!** 🎉
