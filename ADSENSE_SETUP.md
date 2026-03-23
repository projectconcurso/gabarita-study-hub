# 🚀 Guia de Configuração do Google AdSense

## ✅ Implementação Concluída

### **O que foi feito:**

1. ✅ **Páginas Legais Criadas:**
   - `/privacy-policy` - Política de Privacidade
   - `/terms-of-service` - Termos de Uso

2. ✅ **Biblioteca Instalada:**
   - `@ctrl/react-adsense` instalada

3. ✅ **Componentes Criados:**
   - `useIsPremium()` - Hook para detectar usuários premium
   - `<AdBanner />` - Componente reutilizável de anúncios

4. ✅ **Script AdSense Adicionado:**
   - Script no `index.html` (precisa atualizar Client ID)

---

## 📋 Próximos Passos

### **1. Cadastrar no Google AdSense**

1. Acesse: https://www.google.com/adsense
2. Clique em "Começar"
3. Preencha informações do site:
   - URL: `https://seu-dominio.com.br`
   - Idioma: Português (Brasil)
4. Aceite os termos e condições
5. Aguarde aprovação (7-14 dias)

### **2. Obter Client ID**

Após aprovação:
1. Acesse o Dashboard do AdSense
2. Vá em **Anúncios** → **Visão geral**
3. Copie seu **Client ID** (formato: `ca-pub-XXXXXXXXXXXXXXXX`)

### **3. Configurar Variáveis de Ambiente**

Adicione no arquivo `.env`:

```bash
VITE_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX
```

### **4. Atualizar index.html**

Substitua `ca-pub-XXXXXXXXXXXXXXXX` pelo seu Client ID real na linha 22:

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-SEU-CLIENT-ID-AQUI"
 crossorigin="anonymous"></script>
```

---

## 🎨 Como Usar o Componente AdBanner

### **Exemplo Básico:**

```tsx
import { AdBanner } from '@/components/ads/AdBanner';

export default function MinhaPage() {
  return (
    <div>
      <h1>Conteúdo da Página</h1>
      
      {/* Banner horizontal no topo */}
      <AdBanner 
        slot="1234567890"
        format="horizontal"
      />
      
      <p>Mais conteúdo...</p>
      
      {/* Banner retangular na sidebar */}
      <AdBanner 
        slot="0987654321"
        format="rectangle"
      />
    </div>
  );
}
```

### **Formatos Disponíveis:**

- `auto` - Responsivo automático (padrão)
- `horizontal` - Banner horizontal (728x90, 970x90)
- `vertical` - Banner vertical (120x600, 160x600)
- `rectangle` - Retângulo médio (300x250, 336x280)

### **Criar Unidades de Anúncio no AdSense:**

1. Dashboard → **Anúncios** → **Por unidade de anúncio**
2. Clique em **Nova unidade de anúncio**
3. Escolha o tipo:
   - **Anúncio display** (recomendado)
   - Anúncio in-feed
   - Anúncio in-article
4. Configure:
   - Nome: "Banner Topo Home"
   - Tamanho: Responsivo
5. Clique em **Criar**
6. Copie o **Slot ID** (número de 10 dígitos)

---

## 📍 Locais Recomendados para Anúncios

### **1. Home Dashboard (`/dashboard`)**

```tsx
// src/pages/dashboard/Home.tsx
import { AdBanner } from '@/components/ads/AdBanner';

export default function DashboardHome() {
  return (
    <div>
      {/* Banner horizontal no topo */}
      <AdBanner slot="SLOT-ID-1" format="horizontal" />
      
      {/* Conteúdo principal */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          {/* Conteúdo */}
        </div>
        
        {/* Sidebar com banner retangular */}
        <aside>
          <AdBanner slot="SLOT-ID-2" format="rectangle" />
        </aside>
      </div>
    </div>
  );
}
```

### **2. Página de Simulados (`/dashboard/simulados`)**

```tsx
// src/pages/dashboard/Simulados.tsx
import { AdBanner } from '@/components/ads/AdBanner';

export default function Simulados() {
  return (
    <div>
      <h1>Meus Simulados</h1>
      
      {/* Banner entre conteúdo */}
      <AdBanner slot="SLOT-ID-3" format="auto" />
      
      {/* Lista de simulados */}
    </div>
  );
}
```

### **3. Durante Simulado (Cuidado!)**

⚠️ **Não recomendado durante resolução de questões** - prejudica UX

✅ **Recomendado:** Apenas no final do simulado ou entre blocos

```tsx
// src/pages/dashboard/Simular.tsx
import { AdBanner } from '@/components/ads/AdBanner';

export default function Simular() {
  const [simuladoFinalizado, setSimuladoFinalizado] = useState(false);
  
  return (
    <div>
      {/* Questões */}
      
      {/* Mostrar ad apenas quando finalizar */}
      {simuladoFinalizado && (
        <div className="my-8">
          <AdBanner slot="SLOT-ID-4" format="rectangle" />
        </div>
      )}
    </div>
  );
}
```

---

## ⚠️ Boas Práticas

### **✅ Fazer:**
- Máximo 3 ads por página
- Posicionar ads em locais naturais
- Usar formatos responsivos
- Respeitar usuários premium (sem ads)
- Testar em diferentes dispositivos

### **❌ Não Fazer:**
- Clicar nos próprios ads
- Pedir para usuários clicarem
- Colocar ads sobre conteúdo importante
- Usar mais de 3 ads por página
- Modificar código dos ads

---

## 🧪 Modo de Teste

Em desenvolvimento, os ads aparecem como retângulos brancos (modo teste ativo).

Para testar ads reais localmente, remova `adTest` do componente:

```tsx
// src/components/ads/AdBanner.tsx
// Remova ou comente esta linha:
adTest={import.meta.env.DEV ? 'on' : undefined}
```

---

## 📊 Monitoramento

### **Métricas Importantes:**

1. **CPM** (Custo por Mil Impressões)
   - Meta: R$ 2-5
   - Onde ver: Dashboard AdSense → Relatórios

2. **CTR** (Taxa de Cliques)
   - Meta: > 1%
   - Onde ver: Dashboard AdSense → Desempenho

3. **Viewability** (Visibilidade)
   - Meta: > 70%
   - Onde ver: Dashboard AdSense → Otimização

### **Otimização:**

- Teste diferentes posições
- Ajuste tamanhos de banner
- Monitore páginas com melhor desempenho
- Remova ads com baixo CTR

---

## 🔒 Compliance LGPD

### **Banner de Cookies:**

Você precisará adicionar um banner de consentimento de cookies para estar em conformidade com LGPD/GDPR.

**Bibliotecas recomendadas:**
- `react-cookie-consent`
- `@cookiehub/react`

**Exemplo:**

```bash
npm install react-cookie-consent
```

```tsx
import CookieConsent from "react-cookie-consent";

function App() {
  return (
    <>
      {/* Seu app */}
      
      <CookieConsent
        location="bottom"
        buttonText="Aceitar"
        declineButtonText="Recusar"
        enableDeclineButton
        cookieName="gabarit-cookie-consent"
      >
        Este site usa cookies para melhorar sua experiência e exibir anúncios relevantes.
        Consulte nossa <a href="/privacy-policy">Política de Privacidade</a>.
      </CookieConsent>
    </>
  );
}
```

---

## 🆘 Troubleshooting

### **Ads não aparecem:**

1. ✅ Verificar se Client ID está correto
2. ✅ Verificar se Slot ID está correto
3. ✅ Aguardar aprovação do AdSense (pode levar 48h após aprovação inicial)
4. ✅ Verificar console do navegador por erros
5. ✅ Desabilitar ad blockers

### **Erro: "adsbygoogle.push() error":**

- Normal em desenvolvimento (React Strict Mode)
- Não afeta produção
- Pode ignorar

### **Conta suspensa:**

- Revisar políticas do AdSense
- Não clicar nos próprios ads
- Garantir conteúdo original
- Contatar suporte do AdSense

---

## 📚 Recursos Úteis

- **AdSense Help:** https://support.google.com/adsense
- **Políticas:** https://support.google.com/adsense/answer/48182
- **Tamanhos de Ads:** https://support.google.com/admanager/answer/1100453
- **Otimização:** https://support.google.com/adsense/answer/9183549

---

## ✅ Checklist Final

Antes de fazer deploy:

- [ ] Cadastro no AdSense aprovado
- [ ] Client ID configurado no `.env`
- [ ] Client ID atualizado no `index.html`
- [ ] Unidades de anúncio criadas no AdSense
- [ ] Slot IDs configurados nos componentes
- [ ] Páginas legais acessíveis (/privacy-policy, /terms-of-service)
- [ ] Banner de cookies implementado
- [ ] Testado em diferentes dispositivos
- [ ] Verificado que usuários premium não veem ads

---

**Pronto! Seu sistema de anúncios está configurado e pronto para gerar receita.** 🎉
