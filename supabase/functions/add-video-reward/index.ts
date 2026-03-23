import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Log dos headers recebidos
    const authHeader = req.headers.get('Authorization')
    console.log('📨 Authorization header:', authHeader ? 'Presente' : 'Ausente')
    
    if (!authHeader) {
      console.error('❌ Authorization header ausente')
      return new Response(
        JSON.stringify({ error: 'Token de autenticação não fornecido' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      )
    }
    
    // Extrair token do header "Bearer <token>"
    const token = authHeader.replace('Bearer ', '')
    console.log('🔑 Token extraído:', token.substring(0, 30) + '...')
    
    // Criar cliente admin para validar o token JWT
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('🔍 Validando token JWT...')
    
    // Verificar token JWT usando Service Role
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token)
    
    console.log('👤 User:', user?.id)
    console.log('❌ User Error:', userError)

    if (userError || !user) {
      console.error('❌ Token inválido ou expirado:', userError)
      return new Response(
        JSON.stringify({ error: 'Não autenticado' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      )
    }

    console.log('👤 Usuário autenticado:', user.id)

    // Verificar se já assistiu vídeo hoje
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    
    console.log('📅 Data/hora atual:', now.toISOString())
    console.log('📅 Verificando vídeos desde:', todayStart)
    console.log('👤 User ID:', user.id)
    
    // Buscar todas as transações de vídeo do usuário hoje
    const { data: transactions, count, error: checkError } = await supabaseAdmin
      .from('gabaritos_transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .gte('created_at', todayStart)
      .eq('type', 'reward')
      .ilike('description', '%vídeo%')
    
    console.log('🎬 Transações encontradas:', transactions)
    console.log('🎬 Vídeos assistidos hoje:', count)

    if (checkError) {
      console.error('❌ Erro ao verificar limite diário:', checkError)
      return new Response(
        JSON.stringify({ error: 'Erro ao verificar limite diário' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    if ((count || 0) > 0) {
      console.log('⚠️ Usuário já assistiu vídeo hoje')
      return new Response(
        JSON.stringify({ error: 'Você já assistiu seu vídeo grátis hoje. Volte amanhã!' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    const rewardAmount = 10

    // Buscar saldo atual (usando supabaseAdmin já criado acima)
    const { data: currentBalance, error: balanceError } = await supabaseAdmin
      .from('user_gabaritos')
      .select('gabaritos')
      .eq('user_id', user.id)
      .single()

    console.log('💰 Saldo atual:', currentBalance)

    let updateError = null

    if (balanceError && balanceError.code !== 'PGRST116') {
      // Erro diferente de "não encontrado"
      console.error('❌ Erro ao buscar saldo:', balanceError)
      updateError = balanceError
    } else if (currentBalance) {
      // Atualizar saldo existente
      console.log('🔄 Atualizando saldo existente...')
      const { error } = await supabaseAdmin
        .from('user_gabaritos')
        .update({ 
          gabaritos: currentBalance.gabaritos + rewardAmount,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
      
      updateError = error
    } else {
      // Criar novo registro
      console.log('➕ Criando novo registro de Gabaritos...')
      const { error } = await supabaseAdmin
        .from('user_gabaritos')
        .insert({ 
          user_id: user.id, 
          gabaritos: rewardAmount 
        })
      
      updateError = error
    }

    if (updateError) {
      console.error('❌ Erro ao atualizar Gabaritos:', updateError)
      return new Response(
        JSON.stringify({ error: 'Erro ao adicionar Gabaritos' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    // Registrar transação
    console.log('📝 Registrando transação...')
    const { error: transactionError } = await supabaseAdmin
      .from('gabaritos_transactions')
      .insert({
        user_id: user.id,
        amount: rewardAmount,
        type: 'reward',
        description: `Recompensa por assistir vídeo (+${rewardAmount} Gabaritos)`
      })

    if (transactionError) {
      console.error('⚠️ Erro ao registrar transação:', transactionError)
      // Não bloqueia o fluxo
    }

    console.log('✅ Gabaritos adicionados com sucesso!')

    return new Response(
      JSON.stringify({ 
        success: true, 
        amount: rewardAmount,
        message: `Você ganhou ${rewardAmount} Gabaritos!`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('❌ Erro geral:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
