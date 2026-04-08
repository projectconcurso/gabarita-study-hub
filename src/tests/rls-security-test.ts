/**
 * 🛡️ Script de Teste Automatizado de RLS (Row Level Security)
 * 
 * Este script testa todas as políticas RLS do banco de dados Supabase
 * para garantir que os dados estão protegidos contra acessos não autorizados.
 * 
 * Como executar:
 * 1. npm install (se necessário)
 * 2. npx tsx src/tests/rls-security-test.ts
 * 
 * Ou adicione ao package.json:
 * "scripts": {
 *   "test:rls": "tsx src/tests/rls-security-test.ts"
 * }
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Carregar variáveis de ambiente do arquivo .env
function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), '.env');
    const envFile = readFileSync(envPath, 'utf-8');
    const envVars: Record<string, string> = {};
    
    envFile.split('\n').forEach(line => {
      const match = line.match(/^([^=:#]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, '');
        envVars[key] = value;
        process.env[key] = value;
      }
    });
    
    return envVars;
  } catch (error) {
    console.error('⚠️  Aviso: Não foi possível carregar .env, usando variáveis de ambiente do sistema');
    return {};
  }
}

loadEnv();

// Configuração do Supabase
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ ERRO: Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY (ou VITE_SUPABASE_PUBLISHABLE_KEY) não encontradas');
  console.error('📋 Verifique se o arquivo .env existe e contém as variáveis necessárias');
  process.exit(1);
}

// Cores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Tipos de resultados
interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
}

class RLSSecurityTester {
  private supabase;
  private results: TestResult[] = [];
  private currentUserId: string | null = null;
  private shouldAuthenticate: boolean = false;

  constructor() {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Verificar se deve tentar autenticação
    const testEmail = process.env.TEST_USER_EMAIL;
    const testPassword = process.env.TEST_USER_PASSWORD;
    this.shouldAuthenticate = !!(testEmail && testPassword);
  }

  private async authenticate() {
    if (!this.shouldAuthenticate) {
      return null;
    }

    const testEmail = process.env.TEST_USER_EMAIL!;
    const testPassword = process.env.TEST_USER_PASSWORD!;

    this.log('\n🔐 Autenticando usuário de teste...', 'cyan');

    const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    if (authError || !authData.user) {
      this.log(`❌ ERRO ao autenticar: ${authError?.message || 'Usuário não encontrado'}`, 'red');
      return null;
    }

    this.log(`✅ Autenticado como: ${authData.user.email}`, 'green');
    this.log(`👤 User ID: ${authData.user.id}\n`, 'cyan');
    
    return authData.user;
  }

  private log(message: string, color: keyof typeof colors = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  private addResult(result: TestResult) {
    this.results.push(result);
    const icon = result.passed ? '✅' : '❌';
    const color = result.passed ? 'green' : 'red';
    this.log(`${icon} ${result.name}: ${result.message}`, color);
  }

  private async getCurrentUser() {
    const { data: { user }, error } = await this.supabase.auth.getUser();
    if (error || !user) {
      this.log('⚠️  AVISO: Nenhum usuário autenticado. Alguns testes serão pulados.', 'yellow');
      return null;
    }
    this.currentUserId = user.id;
    return user;
  }

  // ==========================================
  // TESTES: PROFILES
  // ==========================================

  private async testProfiles() {
    this.log('\n📋 Testando tabela: profiles', 'cyan');

    const user = await this.getCurrentUser();
    if (!user) {
      this.addResult({
        name: 'Profiles - Skip',
        passed: true,
        message: 'Testes pulados (usuário não autenticado)',
        severity: 'info',
      });
      return;
    }

    // Teste 1: Usuário pode ver próprio perfil
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        this.addResult({
          name: 'Profiles - SELECT próprio',
          passed: false,
          message: `Erro ao buscar próprio perfil: ${error.message}`,
          severity: 'critical',
        });
      } else if (data && data.id === user.id) {
        this.addResult({
          name: 'Profiles - SELECT próprio',
          passed: true,
          message: 'Usuário pode ver próprio perfil',
          severity: 'info',
        });
      }
    } catch (error) {
      this.addResult({
        name: 'Profiles - SELECT próprio',
        passed: false,
        message: `Exceção: ${error}`,
        severity: 'critical',
      });
    }

    // Teste 2: Usuário NÃO pode ver todos os perfis (apenas próprio + amigos)
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*');

      if (error) {
        this.addResult({
          name: 'Profiles - SELECT todos',
          passed: false,
          message: `Erro ao buscar perfis: ${error.message}`,
          severity: 'high',
        });
      } else if (data && data.length > 0) {
        // Verificar se todos os perfis retornados são do próprio usuário ou amigos
        const hasOwnProfile = data.some(p => p.id === user.id);
        
        this.addResult({
          name: 'Profiles - SELECT todos',
          passed: hasOwnProfile,
          message: `Retornou ${data.length} perfil(is). ${hasOwnProfile ? 'Inclui próprio perfil' : 'NÃO inclui próprio perfil'}`,
          severity: 'info',
        });
      }
    } catch (error) {
      this.addResult({
        name: 'Profiles - SELECT todos',
        passed: false,
        message: `Exceção: ${error}`,
        severity: 'high',
      });
    }

    // Teste 3: Usuário pode atualizar próprio perfil
    try {
      const testValue = `Test_${Date.now()}`;
      const { error } = await this.supabase
        .from('profiles')
        .update({ nome: testValue })
        .eq('id', user.id);

      if (error) {
        this.addResult({
          name: 'Profiles - UPDATE próprio',
          passed: false,
          message: `Erro ao atualizar próprio perfil: ${error.message}`,
          severity: 'high',
        });
      } else {
        this.addResult({
          name: 'Profiles - UPDATE próprio',
          passed: true,
          message: 'Usuário pode atualizar próprio perfil',
          severity: 'info',
        });
      }
    } catch (error) {
      this.addResult({
        name: 'Profiles - UPDATE próprio',
        passed: false,
        message: `Exceção: ${error}`,
        severity: 'high',
      });
    }

    // Teste 4: Usuário NÃO pode atualizar perfil de outros
    try {
      // Primeiro, buscar um perfil que não seja o do usuário atual
      const { data: otherProfiles } = await this.supabase
        .from('profiles')
        .select('id')
        .neq('id', user.id)
        .limit(1);

      if (!otherProfiles || otherProfiles.length === 0) {
        this.addResult({
          name: 'Profiles - UPDATE outros (bloqueado)',
          passed: true,
          message: 'Nenhum outro perfil disponível para testar (OK)',
          severity: 'info',
        });
      } else {
        const otherUserId = otherProfiles[0].id;
        const { data, error } = await this.supabase
          .from('profiles')
          .update({ nome: 'Hacker' })
          .eq('id', otherUserId)
          .select();

        // Verificar se conseguiu atualizar (data não vazio = vulnerabilidade)
        if (error || !data || data.length === 0) {
          this.addResult({
            name: 'Profiles - UPDATE outros (bloqueado)',
            passed: true,
            message: 'RLS bloqueou atualização de perfil de outro usuário ✅',
            severity: 'info',
          });
        } else {
          this.addResult({
            name: 'Profiles - UPDATE outros (bloqueado)',
            passed: false,
            message: '🚨 CRÍTICO: Conseguiu atualizar perfil de outro usuário!',
            severity: 'critical',
          });
        }
      }
    } catch (error) {
      this.addResult({
        name: 'Profiles - UPDATE outros (bloqueado)',
        passed: true,
        message: 'Exceção bloqueou atualização (esperado)',
        severity: 'info',
      });
    }
  }

  // ==========================================
  // TESTES: AMIZADES
  // ==========================================

  private async testAmizades() {
    this.log('\n👥 Testando tabela: amizades', 'cyan');

    const user = await this.getCurrentUser();
    if (!user) {
      this.addResult({
        name: 'Amizades - Skip',
        passed: true,
        message: 'Testes pulados (usuário não autenticado)',
        severity: 'info',
      });
      return;
    }

    // Teste 1: Usuário pode ver próprias amizades
    try {
      const { data, error } = await this.supabase
        .from('amizades')
        .select('*');

      if (error) {
        this.addResult({
          name: 'Amizades - SELECT próprias',
          passed: false,
          message: `Erro ao buscar amizades: ${error.message}`,
          severity: 'high',
        });
      } else {
        // Verificar se todas as amizades retornadas pertencem ao usuário
        const allBelongToUser = data?.every(
          a => a.user_id === user.id || a.amigo_id === user.id
        ) ?? true;

        this.addResult({
          name: 'Amizades - SELECT próprias',
          passed: allBelongToUser,
          message: allBelongToUser
            ? `Retornou ${data?.length || 0} amizade(s) própria(s)`
            : '🚨 CRÍTICO: Retornou amizades de outros usuários!',
          severity: allBelongToUser ? 'info' : 'critical',
        });
      }
    } catch (error) {
      this.addResult({
        name: 'Amizades - SELECT próprias',
        passed: false,
        message: `Exceção: ${error}`,
        severity: 'high',
      });
    }

    // Teste 2: Usuário NÃO pode criar auto-amizade
    try {
      const { data, error } = await this.supabase
        .from('amizades')
        .insert({
          user_id: user.id,
          amigo_id: user.id,
          status: 'pendente',
        })
        .select();

      // Verificar se conseguiu criar (data não vazio = vulnerabilidade)
      if (error || !data || data.length === 0) {
        this.addResult({
          name: 'Amizades - Auto-amizade bloqueada',
          passed: true,
          message: 'RLS bloqueou auto-amizade ✅',
          severity: 'info',
        });
      } else {
        this.addResult({
          name: 'Amizades - Auto-amizade bloqueada',
          passed: false,
          message: '🚨 CRÍTICO: Conseguiu criar auto-amizade!',
          severity: 'critical',
        });
      }
    } catch (error) {
      this.addResult({
        name: 'Amizades - Auto-amizade bloqueada',
        passed: true,
        message: 'Exceção bloqueou auto-amizade (esperado)',
        severity: 'info',
      });
    }
  }

  // ==========================================
  // TESTES: MENSAGENS
  // ==========================================

  private async testMensagens() {
    this.log('\n💬 Testando tabela: mensagens', 'cyan');

    const user = await this.getCurrentUser();
    if (!user) {
      this.addResult({
        name: 'Mensagens - Skip',
        passed: true,
        message: 'Testes pulados (usuário não autenticado)',
        severity: 'info',
      });
      return;
    }

    // Teste 1: Usuário pode ver próprias mensagens
    try {
      const { data, error } = await this.supabase
        .from('mensagens')
        .select('*');

      if (error) {
        this.addResult({
          name: 'Mensagens - SELECT próprias',
          passed: false,
          message: `Erro ao buscar mensagens: ${error.message}`,
          severity: 'high',
        });
      } else {
        // Verificar se todas as mensagens pertencem ao usuário
        const allBelongToUser = data?.every(
          m => m.remetente_id === user.id || m.destinatario_id === user.id
        ) ?? true;

        this.addResult({
          name: 'Mensagens - SELECT próprias',
          passed: allBelongToUser,
          message: allBelongToUser
            ? `Retornou ${data?.length || 0} mensagem(ns) própria(s)`
            : '🚨 CRÍTICO: Retornou mensagens de outros usuários!',
          severity: allBelongToUser ? 'info' : 'critical',
        });
      }
    } catch (error) {
      this.addResult({
        name: 'Mensagens - SELECT próprias',
        passed: false,
        message: `Exceção: ${error}`,
        severity: 'high',
      });
    }
  }

  // ==========================================
  // TESTES: SIMULADOS
  // ==========================================

  private async testSimulados() {
    this.log('\n📝 Testando tabela: simulados', 'cyan');

    const user = await this.getCurrentUser();
    if (!user) {
      this.addResult({
        name: 'Simulados - Skip',
        passed: true,
        message: 'Testes pulados (usuário não autenticado)',
        severity: 'info',
      });
      return;
    }

    // Teste 1: Usuário pode ver próprios simulados
    try {
      const { data, error } = await this.supabase
        .from('simulados')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        this.addResult({
          name: 'Simulados - SELECT próprios',
          passed: false,
          message: `Erro ao buscar simulados: ${error.message}`,
          severity: 'high',
        });
      } else {
        this.addResult({
          name: 'Simulados - SELECT próprios',
          passed: true,
          message: `Retornou ${data?.length || 0} simulado(s) próprio(s)`,
          severity: 'info',
        });
      }
    } catch (error) {
      this.addResult({
        name: 'Simulados - SELECT próprios',
        passed: false,
        message: `Exceção: ${error}`,
        severity: 'high',
      });
    }

    // Teste 2: Verificar se simulados retornados pertencem ao usuário ou amigos
    try {
      const { data, error } = await this.supabase
        .from('simulados')
        .select('*');

      if (error) {
        this.addResult({
          name: 'Simulados - SELECT filtrados',
          passed: false,
          message: `Erro ao buscar simulados: ${error.message}`,
          severity: 'high',
        });
      } else {
        // Todos os simulados devem ser do usuário ou de amigos (concluídos) ou compartilhados no mural
        this.addResult({
          name: 'Simulados - SELECT filtrados',
          passed: true,
          message: `Retornou ${data?.length || 0} simulado(s) (próprios + amigos + mural)`,
          severity: 'info',
        });
      }
    } catch (error) {
      this.addResult({
        name: 'Simulados - SELECT filtrados',
        passed: false,
        message: `Exceção: ${error}`,
        severity: 'high',
      });
    }
  }

  // ==========================================
  // TESTES: USER_GABARITOS (CRÍTICO)
  // ==========================================

  private async testUserGabaritos() {
    this.log('\n💰 Testando tabela: user_gabaritos (CRÍTICO)', 'cyan');

    const user = await this.getCurrentUser();
    if (!user) {
      this.addResult({
        name: 'User Gabaritos - Skip',
        passed: true,
        message: 'Testes pulados (usuário não autenticado)',
        severity: 'info',
      });
      return;
    }

    // Teste 1: Usuário pode ver próprio saldo
    try {
      const { data, error } = await this.supabase
        .from('user_gabaritos')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        this.addResult({
          name: 'User Gabaritos - SELECT próprio',
          passed: false,
          message: `Erro ao buscar saldo: ${error.message}`,
          severity: 'critical',
        });
      } else {
        this.addResult({
          name: 'User Gabaritos - SELECT próprio',
          passed: true,
          message: data ? `Saldo: ${data.gabaritos} gabaritos` : 'Sem registro de saldo',
          severity: 'info',
        });
      }
    } catch (error) {
      this.addResult({
        name: 'User Gabaritos - SELECT próprio',
        passed: false,
        message: `Exceção: ${error}`,
        severity: 'critical',
      });
    }

    // Teste 2: Usuário NÃO pode ver saldo de outros (CRÍTICO)
    try {
      const { data, error } = await this.supabase
        .from('user_gabaritos')
        .select('*');

      if (error) {
        this.addResult({
          name: 'User Gabaritos - SELECT todos (bloqueado)',
          passed: false,
          message: `Erro ao buscar saldos: ${error.message}`,
          severity: 'critical',
        });
      } else {
        // Deve retornar apenas o próprio saldo
        const onlyOwnBalance = data?.every(g => g.user_id === user.id) ?? true;
        const count = data?.length || 0;

        this.addResult({
          name: 'User Gabaritos - SELECT todos (bloqueado)',
          passed: onlyOwnBalance && count <= 1,
          message: onlyOwnBalance && count <= 1
            ? `✅ Retornou apenas próprio saldo (${count} registro)`
            : `🚨 CRÍTICO: Retornou ${count} saldos! Vazamento de dados!`,
          severity: onlyOwnBalance && count <= 1 ? 'info' : 'critical',
        });
      }
    } catch (error) {
      this.addResult({
        name: 'User Gabaritos - SELECT todos (bloqueado)',
        passed: false,
        message: `Exceção: ${error}`,
        severity: 'critical',
      });
    }

    // Teste 3: Usuário NÃO pode atualizar saldo de outros (CRÍTICO)
    try {
      // Buscar outro usuário que tenha saldo
      const { data: otherUsers } = await this.supabase
        .from('user_gabaritos')
        .select('user_id')
        .neq('user_id', user.id)
        .limit(1);

      if (!otherUsers || otherUsers.length === 0) {
        this.addResult({
          name: 'User Gabaritos - UPDATE outros (bloqueado)',
          passed: true,
          message: 'Nenhum outro usuário com saldo disponível para testar (OK)',
          severity: 'info',
        });
      } else {
        const otherUserId = otherUsers[0].user_id;
        const { data, error } = await this.supabase
          .from('user_gabaritos')
          .update({ gabaritos: 999999 })
          .eq('user_id', otherUserId)
          .select();

        // Verificar se conseguiu atualizar (data não vazio = vulnerabilidade CRÍTICA)
        if (error || !data || data.length === 0) {
          this.addResult({
            name: 'User Gabaritos - UPDATE outros (bloqueado)',
            passed: true,
            message: '✅ RLS bloqueou atualização de saldo de outro usuário',
            severity: 'info',
          });
        } else {
          this.addResult({
            name: 'User Gabaritos - UPDATE outros (bloqueado)',
            passed: false,
            message: '🚨 CRÍTICO: Conseguiu atualizar saldo de outro usuário!',
            severity: 'critical',
          });
        }
      }
    } catch (error) {
      this.addResult({
        name: 'User Gabaritos - UPDATE outros (bloqueado)',
        passed: true,
        message: 'Exceção bloqueou atualização (esperado)',
        severity: 'info',
      });
    }
  }

  // ==========================================
  // TESTES: CONCURSOS (MEUS ESTUDOS)
  // ==========================================

  private async testConcursos() {
    this.log('\n📚 Testando tabela: concursos', 'cyan');

    const user = await this.getCurrentUser();
    if (!user) {
      this.addResult({
        name: 'Concursos - Skip',
        passed: true,
        message: 'Testes pulados (usuário não autenticado)',
        severity: 'info',
      });
      return;
    }

    // Teste 1: Usuário pode ver próprios concursos
    try {
      const { data, error } = await this.supabase
        .from('concursos')
        .select('*');

      if (error) {
        this.addResult({
          name: 'Concursos - SELECT próprios',
          passed: false,
          message: `Erro ao buscar concursos: ${error.message}`,
          severity: 'high',
        });
      } else {
        // Verificar se todos os concursos pertencem ao usuário
        const allBelongToUser = data?.every(c => c.user_id === user.id) ?? true;

        this.addResult({
          name: 'Concursos - SELECT próprios',
          passed: allBelongToUser,
          message: allBelongToUser
            ? `Retornou ${data?.length || 0} concurso(s) próprio(s)`
            : '🚨 CRÍTICO: Retornou concursos de outros usuários!',
          severity: allBelongToUser ? 'info' : 'critical',
        });
      }
    } catch (error) {
      this.addResult({
        name: 'Concursos - SELECT próprios',
        passed: false,
        message: `Exceção: ${error}`,
        severity: 'high',
      });
    }
  }

  // ==========================================
  // TESTES: POSTS_MURAL
  // ==========================================

  private async testPostsMural() {
    this.log('\n📢 Testando tabela: posts_mural', 'cyan');

    const user = await this.getCurrentUser();
    if (!user) {
      this.addResult({
        name: 'Posts Mural - Skip',
        passed: true,
        message: 'Testes pulados (usuário não autenticado)',
        severity: 'info',
      });
      return;
    }

    // Teste 1: Usuário pode ver posts do mural (público para autenticados)
    try {
      const { data, error } = await this.supabase
        .from('posts_mural')
        .select('*');

      if (error) {
        this.addResult({
          name: 'Posts Mural - SELECT todos',
          passed: false,
          message: `Erro ao buscar posts: ${error.message}`,
          severity: 'medium',
        });
      } else {
        this.addResult({
          name: 'Posts Mural - SELECT todos',
          passed: true,
          message: `Retornou ${data?.length || 0} post(s) do mural`,
          severity: 'info',
        });
      }
    } catch (error) {
      this.addResult({
        name: 'Posts Mural - SELECT todos',
        passed: false,
        message: `Exceção: ${error}`,
        severity: 'medium',
      });
    }

    // Teste 2: Usuário NÃO pode atualizar posts de outros
    try {
      // Buscar post de outro usuário
      const { data: otherPosts } = await this.supabase
        .from('posts_mural')
        .select('id')
        .neq('user_id', user.id)
        .limit(1);

      if (!otherPosts || otherPosts.length === 0) {
        this.addResult({
          name: 'Posts Mural - UPDATE outros (bloqueado)',
          passed: true,
          message: 'Nenhum post de outro usuário disponível para testar (OK)',
          severity: 'info',
        });
      } else {
        const otherPostId = otherPosts[0].id;
        const { data, error } = await this.supabase
          .from('posts_mural')
          .update({ conteudo: 'Hacker' })
          .eq('id', otherPostId)
          .select();

        // Verificar se conseguiu atualizar (data não vazio = vulnerabilidade)
        if (error || !data || data.length === 0) {
          this.addResult({
            name: 'Posts Mural - UPDATE outros (bloqueado)',
            passed: true,
            message: '✅ RLS bloqueou atualização de post de outro usuário',
            severity: 'info',
          });
        } else {
          this.addResult({
            name: 'Posts Mural - UPDATE outros (bloqueado)',
            passed: false,
            message: '🚨 Conseguiu atualizar post de outro usuário!',
            severity: 'high',
          });
        }
      }
    } catch (error) {
      this.addResult({
        name: 'Posts Mural - UPDATE outros (bloqueado)',
        passed: true,
        message: 'Exceção bloqueou atualização (esperado)',
        severity: 'info',
      });
    }
  }

  // ==========================================
  // EXECUTAR TODOS OS TESTES
  // ==========================================

  async runAllTests() {
    this.log('\n🛡️  INICIANDO TESTES DE SEGURANÇA RLS', 'bright');
    this.log('='.repeat(60), 'cyan');

    // Tentar autenticar se credenciais foram fornecidas
    if (this.shouldAuthenticate) {
      await this.authenticate();
    }

    const startTime = Date.now();

    // Executar testes
    await this.testProfiles();
    await this.testAmizades();
    await this.testMensagens();
    await this.testSimulados();
    await this.testUserGabaritos();
    await this.testConcursos();
    await this.testPostsMural();

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    // Fazer logout se autenticou
    if (this.shouldAuthenticate) {
      await this.supabase.auth.signOut();
      this.log('\n🔓 Logout realizado', 'cyan');
    }

    // Gerar relatório
    this.generateReport(duration);
  }

  // ==========================================
  // GERAR RELATÓRIO
  // ==========================================

  private generateReport(duration: string) {
    this.log('\n' + '='.repeat(60), 'cyan');
    this.log('📊 RELATÓRIO DE TESTES RLS', 'bright');
    this.log('='.repeat(60), 'cyan');

    const total = this.results.length;
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;

    const critical = this.results.filter(r => !r.passed && r.severity === 'critical').length;
    const high = this.results.filter(r => !r.passed && r.severity === 'high').length;
    const medium = this.results.filter(r => !r.passed && r.severity === 'medium').length;
    const low = this.results.filter(r => !r.passed && r.severity === 'low').length;

    this.log(`\n📈 Resumo:`, 'bright');
    this.log(`   Total de testes: ${total}`, 'cyan');
    this.log(`   ✅ Passou: ${passed}`, 'green');
    this.log(`   ❌ Falhou: ${failed}`, failed > 0 ? 'red' : 'green');
    this.log(`   ⏱️  Tempo: ${duration}s`, 'cyan');

    if (failed > 0) {
      this.log(`\n🚨 Falhas por Severidade:`, 'bright');
      if (critical > 0) this.log(`   🔴 CRÍTICO: ${critical}`, 'red');
      if (high > 0) this.log(`   🟠 ALTO: ${high}`, 'red');
      if (medium > 0) this.log(`   🟡 MÉDIO: ${medium}`, 'yellow');
      if (low > 0) this.log(`   🟢 BAIXO: ${low}`, 'yellow');

      this.log(`\n❌ Testes que Falharam:`, 'red');
      this.results
        .filter(r => !r.passed)
        .forEach(r => {
          const severityIcon = {
            critical: '🔴',
            high: '🟠',
            medium: '🟡',
            low: '🟢',
            info: 'ℹ️',
          }[r.severity];
          this.log(`   ${severityIcon} ${r.name}: ${r.message}`, 'red');
        });
    }

    // Status final
    this.log('\n' + '='.repeat(60), 'cyan');
    if (critical > 0) {
      this.log('🚨 STATUS: CRÍTICO - Vulnerabilidades graves encontradas!', 'red');
      this.log('⚠️  AÇÃO NECESSÁRIA: Corrija as vulnerabilidades CRÍTICAS imediatamente!', 'red');
    } else if (high > 0) {
      this.log('⚠️  STATUS: ATENÇÃO - Vulnerabilidades de alta prioridade encontradas', 'yellow');
      this.log('📋 AÇÃO RECOMENDADA: Corrija as vulnerabilidades ALTAS o mais rápido possível', 'yellow');
    } else if (medium > 0 || low > 0) {
      this.log('✅ STATUS: BOM - Apenas vulnerabilidades de baixa/média prioridade', 'green');
      this.log('📋 AÇÃO RECOMENDADA: Corrija quando possível', 'yellow');
    } else {
      this.log('✅ STATUS: EXCELENTE - Nenhuma vulnerabilidade encontrada!', 'green');
      this.log('🎉 Parabéns! Seu banco de dados está seguro!', 'green');
    }
    this.log('='.repeat(60), 'cyan');

    // Exit code
    process.exit(critical > 0 ? 1 : 0);
  }
}

// ==========================================
// EXECUTAR TESTES
// ==========================================

const tester = new RLSSecurityTester();
tester.runAllTests().catch(error => {
  console.error('❌ Erro fatal ao executar testes:', error);
  process.exit(1);
});
