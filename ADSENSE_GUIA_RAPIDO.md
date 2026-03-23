# 🚀 Guia Rápido: Google AdSense Configurado

## ✅ Status: AdSense Aprovado!

**Client ID:** `ca-pub-6935980559364656`

---

## 📋 Próximos Passos

### **1. Criar Unidades de Anúncio no Dashboard**

1. Acesse: https://www.google.com/adsense
2. Vá em **Anúncios** → **Por unidade de anúncio**
3. Clique em **+ Nova unidade de anúncio**
4. Escolha **Anúncio display**
5. Configure:
   - **Nome:** "Banner Topo Home" (ou outro descritivo)
   - **Tamanho:** Responsivo
   - **Tipo:** Anúncio display
6. Clique em **Criar**
7. **Copie o Slot ID** (número de 10 dígitos, ex: `1234567890`)

**Crie pelo menos 3 unidades:**
- Banner Topo (horizontal)
- Banner Sidebar (retângulo)
- Banner Rodapé (horizontal)

---

## 🎨 Como Usar no Código

### **Exemplo Simples:**

```tsx
import { AdBanner } from '@/components/ads/AdBanner';

export default function MinhaPage() {
  return (
    <div>
      <h1>Título da Página</h1>
      
      {/* Substitua "1234567890" pelo Slot ID real */}
      <AdBanner slot="1234567890" />
      
      <p>Conteúdo da página...</p>
    </div>
  );
}
```

### **Formatos Disponíveis:**

```tsx
{/* Banner horizontal (728x90, 970x90) */}
<AdBanner slot="1234567890" format="horizontal" />

{/* Retângulo médio (300x250) */}
<AdBanner slot="0987654321" format="rectangle" />

{/* Banner vertical (120x600) */}
<AdBanner slot="5555555555" format="vertical" />

{/* Responsivo automático (recomendado) */}
<AdBanner slot="9999999999" format="auto" />
```

---

## 📍 Onde Adicionar (Recomendações)

### **✅ Locais Ideais:**

1. **Home Dashboard** - Banner horizontal no topo
2. **Página de Simulados** - Banner retangular na sidebar
3. **Entre conteúdo** - Banner responsivo a cada 10 questões
4. **Rodapé** - Banner horizontal em todas as páginas

### **❌ Evitar:**

- Durante resolução de questões (prejudica UX)
- Modais e popups
- Mais de 3 ads por página
- Sobre conteúdo importante

---

## 💡 Importante

### **Usuários Premium:**
- **Não veem anúncios** (diferencial competitivo)
- O componente `AdBanner` já verifica automaticamente via `useIsPremium()`

### **Modo Desenvolvimento:**
- Ads podem não aparecer localmente
- Use `adTest` para testar (já configurado)
- Em produção, ads aparecem normalmente

### **Políticas AdSense:**
- ❌ Nunca clique nos próprios ads
- ❌ Nunca peça para usuários clicarem
- ✅ Mantenha conteúdo original e de qualidade
- ✅ Respeite as políticas do Google

---

## 🔧 Exemplo Prático: Adicionar na Home

```tsx
// src/pages/dashboard/Home.tsx
import { AdBanner } from '@/components/ads/AdBanner';

export default function DashboardHome() {
  return (
    <div className="space-y-6">
      {/* Banner horizontal no topo */}
      <AdBanner 
        slot="SEU-SLOT-ID-AQUI" 
        format="horizontal"
        className="mb-6"
      />
      
      {/* Resto do conteúdo da página */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_360px]">
        <div>
          {/* Conteúdo principal */}
        </div>
        
        {/* Sidebar com banner retangular */}
        <aside>
          <AdBanner 
            slot="SEU-OUTRO-SLOT-ID" 
            format="rectangle"
          />
        </aside>
      </div>
    </div>
  );
}
```

---

## 📊 Monitoramento

### **Dashboard AdSense:**
- Acesse diariamente para ver métricas
- **CPM:** Receita por 1000 impressões (meta: R$ 2-5)
- **CTR:** Taxa de cliques (meta: > 1%)
- **Viewability:** Visibilidade dos ads (meta: > 70%)

### **Otimização:**
- Teste diferentes posições
- Remova ads com baixo desempenho
- Ajuste formatos baseado em dados

---

## ✅ Checklist Rápido

Antes de adicionar ads em produção:

- [ ] Criar 3-4 unidades de anúncio no AdSense
- [ ] Copiar Slot IDs
- [ ] Adicionar componentes `<AdBanner />` nas páginas
- [ ] Testar em desenvolvimento
- [ ] Fazer deploy
- [ ] Aguardar 24-48h para ads começarem a aparecer
- [ ] Monitorar métricas no Dashboard

---

## 🆘 Problemas Comuns

**Ads não aparecem:**
- Aguarde 24-48h após adicionar o código
- Verifique se Slot ID está correto
- Desabilite ad blockers
- Verifique console do navegador por erros

**Erro "adsbygoogle.push() error":**
- Normal em desenvolvimento (React Strict Mode)
- Não afeta produção

---

## 🎯 Próximo Passo

**Agora você precisa:**

1. Criar unidades de anúncio no Dashboard do AdSense
2. Copiar os Slot IDs
3. Adicionar `<AdBanner slot="SEU-SLOT-ID" />` nas páginas desejadas
4. Fazer deploy e aguardar ads aparecerem

**Quer que eu adicione os banners em alguma página específica agora?**
