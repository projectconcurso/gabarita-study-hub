/**
 * 🛡️ Script de Teste RLS com Autenticação
 * 
 * Este script faz login automaticamente e executa os testes RLS
 * 
 * IMPORTANTE: Por segurança, as credenciais devem ser passadas via variáveis de ambiente:
 * 
 * TEST_USER_EMAIL=seu@email.com TEST_USER_PASSWORD=suasenha npm run test:rls:auth
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Carregar variáveis de ambiente do arquivo .env
function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), '.env');
    const envFile = readFileSync(envPath, 'utf-8');
    
    envFile.split('\n').forEach(line => {
      const match = line.match(/^([^=:#]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, '');
        process.env[key] = value;
      }
    });
  } catch (error) {
    console.error('⚠️  Aviso: Não foi possível carregar .env');
  }
}

loadEnv();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

// Credenciais de teste (via variáveis de ambiente)
const TEST_EMAIL = process.env.TEST_USER_EMAIL || '';
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ ERRO: Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

if (!TEST_EMAIL || !TEST_PASSWORD) {
  console.error('❌ ERRO: Credenciais de teste não fornecidas');
  console.error('📋 Use: TEST_USER_EMAIL=email@example.com TEST_USER_PASSWORD=senha npm run test:rls:auth');
  process.exit(1);
}

// Cores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function main() {
  log('\n🔐 AUTENTICANDO USUÁRIO...', 'cyan');
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  // Fazer login
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });

  if (authError || !authData.user) {
    log(`❌ ERRO ao autenticar: ${authError?.message || 'Usuário não encontrado'}`, 'red');
    process.exit(1);
  }

  log(`✅ Autenticado como: ${authData.user.email}`, 'green');
  log(`👤 User ID: ${authData.user.id}`, 'cyan');
  
  // Aguardar um pouco para garantir que a sessão está ativa
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  log('\n🛡️  INICIANDO TESTES DE SEGURANÇA RLS...', 'bright');
  log('='.repeat(60), 'cyan');
  
  // Importar e executar o script de testes principal
  // Nota: O script principal agora terá acesso à sessão autenticada
  const { execSync } = await import('child_process');
  
  try {
    // Exportar o token de sessão para o script de testes
    process.env.SUPABASE_AUTH_TOKEN = authData.session?.access_token || '';
    
    // Executar o script de testes
    execSync('npx tsx src/tests/rls-security-test.ts', {
      stdio: 'inherit',
      env: {
        ...process.env,
        SUPABASE_AUTH_TOKEN: authData.session?.access_token || '',
      },
    });
  } catch (error) {
    log('\n❌ Erro ao executar testes', 'red');
    process.exit(1);
  }
  
  // Fazer logout
  await supabase.auth.signOut();
  log('\n🔓 Logout realizado', 'cyan');
}

main().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
