# 🎯 Sistema de Anúncios - Implementação Completa

## ✅ Status: Implementado e Configurável

**Plataforma:** Monetag  
**Zone ID:** `10781786` (Vignette Banner)

---

## 📦 O que foi implementado:

### **1. Vignette Banner Automático** ✅
**Arquivo:** `index.html` (linha 22)

```html
<!-- Monetag Vignette Banner (Não invasivo) -->
<script>(function(s){s.dataset.zone='10781786',s.src='https://izcle.com/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))</script>
```

**Quando aparece:**
- ✅ Ao trocar de página (Home → Simulados, Simulados → Mural, etc.)
- ✅ Gerenciado automaticamente pelo Monetag
- ✅ Não invasivo, fácil de fechar

---

### **2. Anúncios Durante Simulado** ✅
**A cada 5 questões respondidas**

**Arquivos criados:**
- `src/components/ads/MontagInterstitial.tsx` - Componente de anúncio modal
- `src/hooks/useAdTrigger.ts` - Hook para controlar quando mostrar anúncios
- `src/pages/dashboard/Simular.tsx` - Integração no simulado

**Como funciona:**
1. Usuário responde questão
2. Contador incrementa
3. A cada 5 questões, anúncio aparece
4. Usuário fecha anúncio (botão X)
5. Continua respondendo questões

---

## 🎨 Componentes Criados:

### **1. MontagInterstitial**
**Arquivo:** `src/components/ads/MontagInterstitial.tsx`

```tsx
import { MontagInterstitial } from '@/components/ads/MontagInterstitial';

<MontagInterstitial 
  show={showAd}           // Quando mostrar
  onClose={closeAd}       // Função ao fechar
  zoneId="10781786"       // Zone ID do Monetag
/>
```

**Características:**
- ✅ Modal full-screen com overlay
- ✅ Botão X para fechar
- ✅ Não mostra para usuários premium
- ✅ Loading state enquanto carrega anúncio
- ✅ CTA para assinar Premium

---

### **2. useAdTrigger Hook**
**Arquivo:** `src/hooks/useAdTrigger.ts`

```tsx
import { useAdTrigger } from '@/hooks/useAdTrigger';

const { 
  showAd,              // Boolean: mostrar anúncio?
  closeAd,             // Função: fechar anúncio
  incrementQuestions,  // Função: incrementar contador
  questionsAnswered,   // Number: quantas questões respondidas
  reset                // Função: resetar contador
} = useAdTrigger({ 
  questionsInterval: 5,  // A cada quantas questões
  enabled: true          // Sistema ativo?
});
```

**Uso:**
```tsx
// Quando usuário responde questão
const handleResposta = async (resposta: string) => {
  // ... salvar resposta
  incrementQuestions(); // Incrementa contador
};

// No JSX
<MontagInterstitial show={showAd} onClose={closeAd} />
```

---

## 🎯 Configuração:

### **Mudar Intervalo de Questões:**

**Arquivo:** `src/pages/dashboard/Simular.tsx` (linha ~112)

```tsx
// A cada 5 questões (padrão)
const { showAd, closeAd, incrementQuestions } = useAdTrigger({ 
  questionsInterval: 5,
  enabled: true 
});

// A cada 10 questões
const { showAd, closeAd, incrementQuestions } = useAdTrigger({ 
  questionsInterval: 10,
  enabled: true 
});

// A cada 3 questões
const { showAd, closeAd, incrementQuestions } = useAdTrigger({ 
  questionsInterval: 3,
  enabled: true 
});
```

### **Desabilitar Anúncios Durante Simulado:**

```tsx
const { showAd, closeAd, incrementQuestions } = useAdTrigger({ 
  questionsInterval: 5,
  enabled: false  // Desabilita sistema
});
```

---

## 📍 Onde os Anúncios Aparecem:

### **1. Navegação Entre Páginas** ✅
**Vignette Banner automático**

- Home → Simulados
- Simulados → Mural
- Mural → Amigos
- Qualquer mudança de página

**Gerenciado por:** Script Vignette no `index.html`

---

### **2. Durante Simulado** ✅
**Modal a cada 5 questões**

- Questão 5: Anúncio aparece
- Questão 10: Anúncio aparece
- Questão 15: Anúncio aparece
- E assim por diante...

**Gerenciado por:** `useAdTrigger` + `MontagInterstitial`

---

## 🔒 Usuários Premium:

### **Comportamento Atual:**

**Vignette Banner:**
- ⚠️ Aparece para todos (incluindo premium)
- 📝 Para bloquear, precisa implementar lógica condicional

**Modal Durante Simulado:**
- ✅ **Já bloqueado para premium**
- ✅ Hook `useIsPremium` integrado
- ✅ Se `isPremium = true`, não mostra anúncio

### **Como Bloquear Vignette para Premium:**

**Opção 1: Carregar Script Condicionalmente**

Remover script do `index.html` e criar componente:

```tsx
// src/components/MontagVignette.tsx
import { useIsPremium } from '@/hooks/useIsPremium';
import { useEffect } from 'react';

export function MontagVignette() {
  const { isPremium, loading } = useIsPremium();
  
  useEffect(() => {
    if (loading || isPremium) return;
    
    const script = document.createElement('script');
    script.innerHTML = `(function(s){s.dataset.zone='10781786',s.src='https://izcle.com/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`;
    document.body.appendChild(script);
    
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [isPremium, loading]);
  
  return null;
}
```

Adicionar no `App.tsx`:
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

---

## 💰 Estimativa de Receita:

### **Cenário Realista (5.000 usuários/mês):**

**Vignette (navegações):**
- 15 navegações/usuário = 75.000 navegações
- 60% exibição = 45.000 impressões
- CPM R$ 2,50
- **Receita: R$ 112/mês**

**Modal (simulados):**
- 3 simulados/usuário = 15.000 simulados
- 10 questões/simulado = 150.000 questões
- 1 anúncio a cada 5 questões = 30.000 impressões
- CPM R$ 2,00
- **Receita: R$ 60/mês**

**Total: ~R$ 172/mês**

### **Cenário Otimista (10.000 usuários/mês):**

**Vignette + Modal:**
- **Receita: ~R$ 400-500/mês**

---

## 🎨 Personalização:

### **Mudar Aparência do Modal:**

**Arquivo:** `src/components/ads/MontagInterstitial.tsx`

```tsx
// Mudar cor do overlay
className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50"
// Para: bg-black/70 (mais escuro) ou bg-black/30 (mais claro)

// Mudar tamanho do modal
className="relative max-w-2xl w-full"
// Para: max-w-4xl (maior) ou max-w-xl (menor)

// Mudar cor do botão fechar
className="absolute top-4 right-4 z-10 p-2 bg-white/90"
// Para: bg-red-500 text-white (vermelho)
```

### **Mudar Mensagem do Rodapé:**

```tsx
<p className="text-sm text-gray-600 text-center">
  💡 <strong>Dica:</strong> Assine o plano Premium para remover anúncios!
</p>
```

---

## 📊 Monitoramento:

### **Dashboard Monetag:**

1. Acesse: https://monetag.com
2. Vá em **Statistics**
3. Procure pela zone **10781786**
4. Monitore:
   - **Impressões:** Total de exibições
   - **Cliques:** Quantos clicaram
   - **CTR:** Taxa de cliques
   - **Receita:** Ganhos

### **Métricas Importantes:**

- **CTR > 1%:** Bom desempenho
- **CTR < 0.5%:** Considerar ajustar posicionamento
- **Receita/dia:** Acompanhar crescimento

---

## 🆘 Troubleshooting:

### **Anúncios não aparecem:**

1. **Aguardar aprovação:** 24-48h após criar zone
2. **Testar em produção:** Não funciona em `localhost`
3. **Verificar Zone ID:** Deve ser `10781786`
4. **Verificar console:** Erros de carregamento?

### **Anúncio aparece muito frequentemente:**

**Durante simulado:**
```tsx
// Mudar de 5 para 10 questões
const { showAd, closeAd, incrementQuestions } = useAdTrigger({ 
  questionsInterval: 10, // Era 5
  enabled: true 
});
```

**Vignette:**
- Frequência controlada pelo Monetag
- Configurável no Dashboard (Frequency Capping)

### **Anúncio não fecha:**

- Verificar se `onClose` está sendo chamado
- Verificar se `setShowAd(false)` está funcionando
- Testar botão X manualmente

---

## ✅ Checklist:

- [x] Vignette Banner implementado (navegações)
- [x] Modal de anúncio implementado (simulados)
- [x] Hook useAdTrigger criado
- [x] Integração no componente Simular
- [x] Sistema a cada 5 questões funcionando
- [x] Bloqueio para usuários premium (modal)
- [ ] Fazer deploy em produção
- [ ] Testar no domínio real
- [ ] Monitorar métricas
- [ ] (Opcional) Bloquear Vignette para premium

---

## 🚀 Próximos Passos:

1. **Fazer deploy em produção**
2. **Testar navegação** entre páginas (Vignette)
3. **Testar simulado** (anúncio a cada 5 questões)
4. **Monitorar métricas** no Dashboard Monetag
5. **Ajustar intervalo** se necessário
6. **Implementar bloqueio Vignette** para premium (quando tiver assinaturas)

---

## 📚 Arquivos Modificados/Criados:

### **Criados:**
- `src/components/ads/MontagInterstitial.tsx`
- `src/hooks/useAdTrigger.ts`
- `SISTEMA_ANUNCIOS.md` (este arquivo)

### **Modificados:**
- `index.html` - Adicionado script Vignette
- `src/pages/dashboard/Simular.tsx` - Integração de anúncios

---

**Sistema completo de anúncios implementado com controle total sobre quando e onde aparecem!** 🎉
