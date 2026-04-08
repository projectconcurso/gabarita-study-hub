# 🚀 Quick Start - Testes RLS

## ⚡ **Execução Rápida**

```bash
# 1. Instalar dependências (apenas primeira vez)
npm install

# 2. Executar testes RLS
npm run test:rls
```

---

## 📋 **Pré-requisitos**

### **Estar autenticado no aplicativo:**

```bash
# Terminal 1: Iniciar aplicativo
npm run dev

# Terminal 2: Após fazer login no navegador, executar testes
npm run test:rls
```

---

## 📊 **Exemplo de Resultado**

### **✅ Tudo OK:**

```
🛡️  INICIANDO TESTES DE SEGURANÇA RLS
============================================================

📋 Testando tabela: profiles
✅ Profiles - SELECT próprio: Usuário pode ver próprio perfil
✅ Profiles - UPDATE próprio: Usuário pode atualizar próprio perfil
✅ Profiles - UPDATE outros (bloqueado): RLS bloqueou atualização ✅

💰 Testando tabela: user_gabaritos (CRÍTICO)
✅ User Gabaritos - SELECT próprio: Saldo: 100 gabaritos
✅ User Gabaritos - SELECT todos (bloqueado): ✅ Retornou apenas próprio saldo
✅ User Gabaritos - UPDATE outros (bloqueado): ✅ RLS bloqueou atualização

============================================================
📊 RELATÓRIO DE TESTES RLS
============================================================

📈 Resumo:
   Total de testes: 21
   ✅ Passou: 21
   ❌ Falhou: 0
   ⏱️  Tempo: 2.34s

============================================================
✅ STATUS: EXCELENTE - Nenhuma vulnerabilidade encontrada!
🎉 Parabéns! Seu banco de dados está seguro!
============================================================
```

### **❌ Vulnerabilidade Encontrada:**

```
💰 Testando tabela: user_gabaritos (CRÍTICO)
❌ User Gabaritos - SELECT todos (bloqueado): 🚨 CRÍTICO: Retornou 5 saldos! Vazamento de dados!

============================================================
📊 RELATÓRIO DE TESTES RLS
============================================================

📈 Resumo:
   Total de testes: 21
   ✅ Passou: 20
   ❌ Falhou: 1
   ⏱️  Tempo: 2.45s

🚨 Falhas por Severidade:
   🔴 CRÍTICO: 1

❌ Testes que Falharam:
   🔴 User Gabaritos - SELECT todos (bloqueado): 🚨 CRÍTICO: Retornou 5 saldos! Vazamento de dados!

============================================================
🚨 STATUS: CRÍTICO - Vulnerabilidades graves encontradas!
⚠️  AÇÃO NECESSÁRIA: Corrija as vulnerabilidades CRÍTICAS imediatamente!
============================================================
```

---

## 🔍 **O que é testado?**

| Tabela | Testes |
|--------|--------|
| **profiles** | ✅ Ver próprio perfil<br>❌ Não modificar perfis de outros |
| **user_gabaritos** | ✅ Ver próprio saldo<br>❌ Não ver/modificar saldo de outros |
| **amizades** | ✅ Ver próprias amizades<br>❌ Não criar auto-amizade |
| **mensagens** | ✅ Ver próprias mensagens<br>❌ Não ver mensagens de outros |
| **simulados** | ✅ Ver próprios simulados<br>✅ Ver simulados de amigos |
| **concursos** | ✅ Ver próprios concursos<br>❌ Não ver concursos de outros |
| **posts_mural** | ✅ Ver posts públicos<br>❌ Não modificar posts de outros |

---

## 📚 **Documentação Completa**

- **Guia Completo**: `src/tests/README_RLS_TESTS.md`
- **Relatório de Auditoria**: `RLS_SECURITY_REPORT.md`
- **Guia de Auditoria**: `SECURITY_RLS_AUDIT.md`

---

## 🆘 **Problemas Comuns**

### **"Nenhum usuário autenticado"**
➡️ Faça login no aplicativo antes de executar os testes

### **"tsx: command not found"**
➡️ Execute `npm install`

### **"VITE_SUPABASE_URL não encontrada"**
➡️ Verifique o arquivo `.env`

---

**Última atualização**: 2026-04-07
