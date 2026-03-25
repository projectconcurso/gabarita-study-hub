# 🎯 Adsterra Native Banner - Implementação nos Simulados

## ✅ Status: Aguardando Código do Dashboard

**Plataforma:** Adsterra  
**Formato:** Native Banner (bloco de 3-4 anúncios nativos)  
**Localização:** Durante simulados, entre questões

---

## 📋 Requisitos:

### **Lógica de Exibição:**

1. **Se simulado tem MAIS de 5 questões:**
   - Mostrar Native Banner **a cada 5 questões**
   - Exemplo: 20 questões → banners após questões 5, 10, 15

2. **Se simulado tem EXATAMENTE 5 questões:**
   - Mostrar Native Banner **a cada 3 questões**
   - Exemplo: 5 questões → banners após questões 3

3. **Usuários Premium:**
   - ❌ Não veem anúncios
   - ✅ Hook `useIsPremium` já implementado

---

## 📦 Implementação:

### **1. Componente AdsterraNativeBanner** ✅
**Arquivo:** `/src/components/ads/AdsterraNativeBanner.tsx`

```tsx
import { AdsterraNativeBanner } from '@/components/ads/AdsterraNativeBanner';

// Uso:
<AdsterraNativeBanner adKey="SEU-AD-KEY-AQUI" />
```

**Características:**
- Detecta usuários premium automaticamente
- Não mostra ads para usuários premium
- Carrega Native Banner da Adsterra
- Cleanup automático ao desmontar
- Evita carregar script múltiplas vezes

---

## 🎨 Como Obter o Código:

### **No Dashboard da Adsterra:**

1. **Acesse:** https://beta.publishers.adsterra.com/
2. **Faça login** ou crie uma conta
3. **Adicione seu website:**
   - Vá em **Websites** → **Add Website**
   - Digite: `gabarit.com.br`
   - Categoria: Education / E-learning
   - Marque: **Native Banners**
   - Clique **Add**

4. **Aguarde aprovação** (até 10 minutos)

5. **Obtenha o código:**
   - Vá em **Websites** → Seu site
   - Clique em **Get Code**
   - Copie o código que aparece

6. **Extraia o Ad Key:**
   - O código será algo como:
   ```html
   <script type="text/javascript">
     atOptions = {
       'key' : 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
       'format' : 'iframe',
       'height' : 250,
       'width' : 300,
       'params' : {}
     };
   </script>
   <script type="text/javascript" src="//pl24322018.profitablecpmrate.com/XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/invoke.js"></script>
   ```
   - O **Ad Key** é o valor em `'key'` e no final da URL

---

## 🔧 Próximos Passos (Após Obter o Código):

### **1. Atualizar Componente com Ad Key Real**

```tsx
// src/components/ads/AdsterraNativeBanner.tsx
// Linha 33: Atualizar URL com domínio correto
script.src = `//DOMINIO-CORRETO.com/${adKey}/invoke.js`;
```

### **2. Integrar na Página Simular.tsx**

```tsx
import { AdsterraNativeBanner } from '@/components/ads/AdsterraNativeBanner';

// Dentro do map de questões:
{questoes.map((questao, index) => (
  <>
    {/* Renderizar questão */}
    <QuestionCard key={questao.id} questao={questao} />
    
    {/* Mostrar Native Banner a cada 5 questões (ou 3 se total = 5) */}
    {shouldShowAd(index + 1, totalQuestoes) && (
      <AdsterraNativeBanner adKey="SEU-AD-KEY" />
    )}
  </>
))}

// Função helper:
const shouldShowAd = (currentIndex: number, total: number): boolean => {
  // Se total = 5, mostrar a cada 3 questões
  if (total === 5) {
    return currentIndex % 3 === 0 && currentIndex < total;
  }
  
  // Se total > 5, mostrar a cada 5 questões
  if (total > 5) {
    return currentIndex % 5 === 0 && currentIndex < total;
  }
  
  return false;
};
```

---

## 💡 O que são Native Banners?

**Native Banners** são blocos de anúncios que:

- ✅ **Se adaptam ao design** da página
- ✅ **Parecem conteúdo nativo** (não intrusivos)
- ✅ **Bloco de 3-4 anúncios** com título e imagem
- ✅ **Responsivos** (adaptam a qualquer tela)
- ✅ **Alto CTR** (taxa de cliques)
- ✅ **Bypass AdBlock** (muitos ad blockers não bloqueiam)

**Exemplo visual:**
```
┌─────────────────────────────────┐
│  [Imagem]  Título do Anúncio 1  │
│  [Imagem]  Título do Anúncio 2  │
│  [Imagem]  Título do Anúncio 3  │
│  [Imagem]  Título do Anúncio 4  │
└─────────────────────────────────┘
```

---

## 💰 Estimativa de Receita:

### **Native Banners em Simulados:**

**Cenário Conservador:**
- 5.000 usuários/mês
- 3 simulados/usuário = 15.000 simulados
- 10 questões/simulado = 150.000 questões
- 1 banner a cada 5 questões = 30.000 impressões
- CPM R$ 2,00
- **Receita: R$ 60/mês**

**Cenário Realista:**
- 5.000 usuários/mês
- 5 simulados/usuário = 25.000 simulados
- 15 questões/simulado = 375.000 questões
- 1 banner a cada 5 questões = 75.000 impressões
- CPM R$ 2,50
- **Receita: R$ 187/mês**

**Cenário Otimista:**
- 10.000 usuários/mês
- 8 simulados/usuário = 80.000 simulados
- 20 questões/simulado = 1.600.000 questões
- 1 banner a cada 5 questões = 320.000 impressões
- CPM R$ 3,00
- **Receita: R$ 960/mês**

---

## 🎯 Vantagens dos Native Banners:

### **Para o Usuário:**
- ✅ Não interrompe resolução de questões
- ✅ Aparece entre questões (momento natural)
- ✅ Design integrado ao site
- ✅ Não invasivo

### **Para o Desenvolvedor:**
- ✅ Implementação simples
- ✅ Componente reutilizável
- ✅ Lógica clara (a cada X questões)
- ✅ Fácil manutenção

### **Para o Negócio:**
- ✅ Alto CPM (Native Banners pagam bem)
- ✅ Alto CTR (usuários clicam mais)
- ✅ Não prejudica UX
- ✅ Monetiza simulados (alto engajamento)

---

## 🆘 Troubleshooting:

### **Anúncios não aparecem:**

1. **Verificar Ad Key:**
   - Certifique-se de usar o Ad Key correto
   - Formato: string de 32 caracteres

2. **Verificar domínio do script:**
   - Pode ser `pl24322018.profitablecpmrate.com` ou outro
   - Usar exatamente como fornecido pela Adsterra

3. **Aguardar aprovação:**
   - Adsterra leva até 10 minutos para aprovar
   - Verificar status no Dashboard

4. **Testar em produção:**
   - Não funciona em `localhost`
   - Fazer deploy e testar no domínio real

### **Anúncios aparecem para usuários premium:**

- Verificar hook `useIsPremium`
- Confirmar que retorna `true` para usuários premium

---

## ✅ Checklist:

- [x] Componente AdsterraNativeBanner criado
- [ ] Criar conta na Adsterra
- [ ] Adicionar website no Dashboard
- [ ] Aguardar aprovação
- [ ] Obter código Native Banner
- [ ] Extrair Ad Key
- [ ] Atualizar componente com Ad Key real
- [ ] Integrar na página Simular.tsx
- [ ] Implementar lógica (a cada 5 ou 3 questões)
- [ ] Fazer deploy em produção
- [ ] Testar no domínio real
- [ ] Monitorar métricas no Dashboard

---

## 🚀 Próxima Ação:

**Me envie o código do Native Banner que você obteve no Dashboard da Adsterra!**

O código deve ser algo como:

```html
<script type="text/javascript">
  atOptions = {
    'key' : 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    'format' : 'iframe',
    'height' : 250,
    'width' : 300,
    'params' : {}
  };
</script>
<script type="text/javascript" src="//pl24322018.profitablecpmrate.com/XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/invoke.js"></script>
```

**Assim que você me enviar, eu finalizo a implementação!** 🎯
