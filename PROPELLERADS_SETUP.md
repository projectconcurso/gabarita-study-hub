# 🚀 PropellerAds - Configuração

## ✅ Arquivo Service Worker Criado

**Localização:** `/public/sw.js`

```javascript
self.options = {
    "domain": "5gvci.com",
    "zoneId": 10768455
}
self.lary = ""
importScripts('https://5gvci.com/act/files/service-worker.min.js?r=sw')
```

---

## 📋 Próximos Passos

### **1. Obter Scripts do Dashboard**

No Dashboard do PropellerAds, você precisa copiar mais 2 códigos:

#### **A) Script de Inicialização (Push Notifications)**
Procure por algo como:
```html
<script>
(function(d,z,s){
  s.src='https://'+d+'/400/'+z;
  try{(document.body||document.documentElement).appendChild(s)}catch(e){}
})('5gvci.com', 10768455, document.createElement('script'))
</script>
```

#### **B) Código de Banner Display**
Procure por:
```html
<script type="text/javascript">
  atOptions = {
    'key' : 'SEU_KEY_AQUI',
    'format' : 'iframe',
    'height' : 250,
    'width' : 300,
    'params' : {}
  };
</script>
<script type="text/javascript" src="//5gvci.com/SEU_ID/invoke.js"></script>
```

---

## 🔧 O que preciso de você:

**Vá no Dashboard do PropellerAds e me envie:**

1. **Script de Push Notification** (se houver)
2. **Código do Banner Display** (para anúncios visuais)
3. **Zone IDs** de cada tipo de anúncio que você criou

---

## 📍 Tipos de Anúncio PropellerAds

### **1. Push Notifications** ✅ (já configurado)
- Service Worker: `sw.js` criado
- Zone ID: `10768455`

### **2. Banner Display** (precisa configurar)
- Anúncios visuais na página
- Preciso do código do Dashboard

### **3. Popunder** (opcional)
- Abre nova aba/janela
- ⚠️ Pode irritar usuários

### **4. In-Page Push** (recomendado)
- Notificações dentro da página
- Menos intrusivo

---

## 💡 Recomendação

**Use apenas:**
- ✅ Push Notifications (já configurado)
- ✅ Banner Display (precisa do código)

**Evite:**
- ❌ Popunder (muito intrusivo)
- ❌ Interstitial (bloqueia tela)

---

## 🎯 Próxima Ação

**Me envie os códigos do Dashboard do PropellerAds para eu finalizar a implementação!**

Especificamente:
1. Script de inicialização das push notifications
2. Código dos banners display
3. Qualquer outro código que o PropellerAds forneceu
