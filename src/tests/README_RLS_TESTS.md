# 🛡️ Testes Automatizados de RLS (Row Level Security)

## 📋 **O que é este script?**

Este script testa automaticamente todas as políticas RLS (Row Level Security) do banco de dados Supabase para garantir que os dados estão protegidos contra acessos não autorizados.

## 🎯 **O que ele testa?**

### **Tabelas Críticas Testadas:**

1. **`profiles`** - Perfis de usuários
   - ✅ Usuário pode ver próprio perfil
   - ✅ Usuário pode atualizar próprio perfil
   - ❌ Usuário NÃO pode atualizar perfil de outros

2. **`amizades`** - Sistema de amizades
   - ✅ Usuário vê apenas próprias amizades
   - ❌ Usuário NÃO pode criar auto-amizade

3. **`mensagens`** - Chat/mensagens
   - ✅ Usuário vê apenas mensagens próprias (enviadas ou recebidas)
   - ❌ Usuário NÃO vê mensagens de outros

4. **`simulados`** - Simulados e provas
   - ✅ Usuário vê próprios simulados
   - ✅ Usuário vê simulados de amigos (concluídos)
   - ✅ Usuário vê simulados compartilhados no mural

5. **`user_gabaritos`** - Saldo de moeda virtual (CRÍTICO)
   - ✅ Usuário vê apenas próprio saldo
   - ❌ Usuário NÃO vê saldo de outros
   - ❌ Usuário NÃO pode modificar saldo de outros

6. **`concursos`** - Sistema Meus Estudos
   - ✅ Usuário vê apenas próprios concursos
   - ❌ Usuário NÃO vê concursos de outros

7. **`posts_mural`** - Posts do mural social
   - ✅ Usuários autenticados veem posts (público)
   - ❌ Usuário NÃO pode atualizar posts de outros

---

## 🚀 **Como Executar**

### **Opção 1: Usando npm script (Recomendado)**

```bash
npm run test:rls
```

### **Opção 2: Usando tsx diretamente**

```bash
npx tsx src/tests/rls-security-test.ts
```

### **Opção 3: Usando ts-node**

```bash
npx ts-node src/tests/rls-security-test.ts
```

---

## 📦 **Pré-requisitos**

### **1. Instalar dependências**

```bash
npm install
```

Se `tsx` não estiver instalado:

```bash
npm install -D tsx
```

### **2. Configurar variáveis de ambiente**

Certifique-se de que o arquivo `.env` contém:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
```

### **3. Estar autenticado**

⚠️ **IMPORTANTE**: Para executar os testes completos, você precisa estar autenticado no aplicativo.

**Como autenticar:**

1. Inicie o aplicativo: `npm run dev`
2. Faça login no navegador
3. Execute os testes em outra aba do terminal

**Ou use o script de autenticação** (se disponível):

```bash
npm run auth:test
```

---

## 📊 **Interpretando os Resultados**

### **Exemplo de Saída:**

```
🛡️  INICIANDO TESTES DE SEGURANÇA RLS
============================================================

📋 Testando tabela: profiles
✅ Profiles - SELECT próprio: Usuário pode ver próprio perfil
✅ Profiles - SELECT todos: Retornou 1 perfil(is). Inclui próprio perfil
✅ Profiles - UPDATE próprio: Usuário pode atualizar próprio perfil
✅ Profiles - UPDATE outros (bloqueado): RLS bloqueou atualização de perfil de outro usuário ✅

👥 Testando tabela: amizades
✅ Amizades - SELECT próprias: Retornou 3 amizade(s) própria(s)
✅ Amizades - Auto-amizade bloqueada: RLS bloqueou auto-amizade ✅

💰 Testando tabela: user_gabaritos (CRÍTICO)
✅ User Gabaritos - SELECT próprio: Saldo: 100 gabaritos
✅ User Gabaritos - SELECT todos (bloqueado): ✅ Retornou apenas próprio saldo (1 registro)
✅ User Gabaritos - UPDATE outros (bloqueado): ✅ RLS bloqueou atualização de saldo de outro usuário

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

---

## 🚨 **Níveis de Severidade**

| Ícone | Severidade | Descrição | Ação |
|-------|-----------|-----------|------|
| 🔴 | **CRÍTICO** | Vulnerabilidade grave que permite acesso/modificação de dados sensíveis | Corrigir IMEDIATAMENTE |
| 🟠 | **ALTO** | Vulnerabilidade que pode comprometer segurança | Corrigir o mais rápido possível |
| 🟡 | **MÉDIO** | Vulnerabilidade que pode causar problemas | Corrigir quando possível |
| 🟢 | **BAIXO** | Vulnerabilidade de baixo impacto | Corrigir em manutenção |
| ℹ️ | **INFO** | Informação, não é vulnerabilidade | Nenhuma ação necessária |

---

## 🔧 **Integração com CI/CD**

### **GitHub Actions**

Adicione ao `.github/workflows/security.yml`:

```yaml
name: Security Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  rls-security:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm install
        
      - name: Run RLS Security Tests
        env:
          VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
        run: npm run test:rls
```

---

## 📝 **Adicionando Novos Testes**

Para adicionar testes para uma nova tabela:

1. Abra `src/tests/rls-security-test.ts`
2. Crie um novo método `private async testMinhaTabela()`
3. Adicione os testes seguindo o padrão:

```typescript
private async testMinhaTabela() {
  this.log('\n📦 Testando tabela: minha_tabela', 'cyan');

  const user = await this.getCurrentUser();
  if (!user) {
    this.addResult({
      name: 'Minha Tabela - Skip',
      passed: true,
      message: 'Testes pulados (usuário não autenticado)',
      severity: 'info',
    });
    return;
  }

  // Teste 1: Usuário pode ver próprios registros
  try {
    const { data, error } = await this.supabase
      .from('minha_tabela')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      this.addResult({
        name: 'Minha Tabela - SELECT próprios',
        passed: false,
        message: `Erro: ${error.message}`,
        severity: 'high',
      });
    } else {
      this.addResult({
        name: 'Minha Tabela - SELECT próprios',
        passed: true,
        message: `Retornou ${data?.length || 0} registro(s)`,
        severity: 'info',
      });
    }
  } catch (error) {
    this.addResult({
      name: 'Minha Tabela - SELECT próprios',
      passed: false,
      message: `Exceção: ${error}`,
      severity: 'high',
    });
  }
}
```

4. Adicione a chamada em `runAllTests()`:

```typescript
await this.testMinhaTabela();
```

---

## 🐛 **Troubleshooting**

### **Erro: "Nenhum usuário autenticado"**

**Solução**: Execute o aplicativo e faça login antes de rodar os testes.

```bash
# Terminal 1
npm run dev

# Terminal 2 (após fazer login no navegador)
npm run test:rls
```

---

### **Erro: "VITE_SUPABASE_URL não encontrada"**

**Solução**: Verifique se o arquivo `.env` existe e contém as variáveis corretas.

```bash
cat .env
```

---

### **Erro: "tsx: command not found"**

**Solução**: Instale o tsx:

```bash
npm install -D tsx
```

---

### **Testes falhando inesperadamente**

**Solução**: Verifique se as políticas RLS estão habilitadas no Supabase:

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

---

## 📚 **Recursos Adicionais**

- [Documentação Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Relatório de Auditoria RLS](../RLS_SECURITY_REPORT.md)

---

## 🤝 **Contribuindo**

Para adicionar novos testes ou melhorar os existentes:

1. Fork o repositório
2. Crie uma branch: `git checkout -b feature/novos-testes-rls`
3. Adicione seus testes
4. Commit: `git commit -m 'feat: adicionar testes RLS para tabela X'`
5. Push: `git push origin feature/novos-testes-rls`
6. Abra um Pull Request

---

**Última atualização**: 2026-04-07  
**Versão**: 1.0.0  
**Autor**: Cascade AI
