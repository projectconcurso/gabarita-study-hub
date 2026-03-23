import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RewardedVideoAdProps {
  apiKey: string;
  zoneId: string;
  rewardAmount: number;
  onRewardGranted?: () => void;
  onError?: (error: string) => void;
  onVideoStart?: () => void;
  className?: string;
  disabled?: boolean;
}

// Tipos globais do AppLixir v6
declare global {
  interface Window {
    initializeAndOpenPlayer?: (options: {
      apiKey: string;
      injectionElementId: string;
      adStatusCallbackFn?: (status: string) => void;
      adErrorCallbackFn?: (error: any) => void;
    }) => void;
  }
}

export const RewardedVideoAd: React.FC<RewardedVideoAdProps> = ({
  apiKey,
  zoneId,
  rewardAmount,
  onRewardGranted,
  onError,
  onVideoStart,
  className = '',
  disabled = false
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleWatchVideo = async () => {
    if (!window.initializeAndOpenPlayer) {
      toast.error('Sistema de vídeos não está disponível no momento');
      onError?.('SDK não carregado');
      return;
    }

    setIsLoading(true);
    let videoCompleted = false;

    // Obter token ANTES de iniciar o vídeo
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      console.error('❌ Token de autenticação não encontrado');
      toast.error('Erro de autenticação. Faça login novamente.');
      setIsLoading(false);
      return;
    }

    const authToken = session.access_token;
    console.log('🔑 Token obtido antes do vídeo:', authToken.substring(0, 20) + '...');

    try {
      // Configurar callbacks do AppLixir v6
      const options = {
        apiKey: apiKey,
        injectionElementId: 'applixir-player-container',
        
        adStatusCallbackFn: async (status: any) => {
          console.log('🎬 AppLixir Status RAW:', status);
          console.log('🎬 AppLixir Status TYPE:', typeof status);
          console.log('🎬 AppLixir Status JSON:', JSON.stringify(status));
          
          // Evitar processar múltiplas vezes
          if (videoCompleted) {
            console.log('⚠️ Vídeo já foi processado, ignorando status duplicado:', status);
            return;
          }
          
          // Detectar conclusão: apenas quando o vídeo foi realmente assistido
          // 'ad-watched' ou 'allAdsCompleted' indicam que o usuário assistiu o vídeo completo
          const isCompleted = 
            status === 'ad-watched' || 
            status === 'allAdsCompleted' ||
            (typeof status === 'object' && status !== null && 
             (status.type === 'ad-watched' || status.type === 'allAdsCompleted'));
          
          if (isCompleted) {
            console.log('✅ VÍDEO COMPLETO - Concedendo recompensa!');
            videoCompleted = true;
            
            try {
              // Obter usuário atual
              const { data: { user } } = await supabase.auth.getUser();
              
              if (!user) {
                console.error('❌ Usuário não autenticado');
                toast.error('Usuário não autenticado');
                setIsLoading(false);
                return;
              }

              console.log('👤 Usuário:', user.id);
              console.log('💰 Quantidade:', rewardAmount);
              console.log('🔄 Chamando Edge Function add-video-reward...');

              // Chamar Edge Function para adicionar Gabaritos de forma segura
              const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
              const edgeFunctionUrl = `${supabaseUrl}/functions/v1/add-video-reward`;
              
              console.log('🌐 URL da Edge Function:', edgeFunctionUrl);
              console.log('🔑 Usando token obtido antes do vídeo');
              
              const response = await fetch(edgeFunctionUrl, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${authToken}`,
                  'Content-Type': 'application/json',
                },
              });

              console.log('📡 Status da resposta:', response.status, response.statusText);
              
              const result = await response.json();
              console.log('📊 Resposta Edge Function:', result);

              if (!response.ok) {
                console.error('❌ Erro da Edge Function:', result.error);
                toast.error(result.error || 'Erro ao conceder recompensa. Tente novamente.');
                onError?.(result.error || 'Erro ao adicionar Gabaritos');
              } else {
                console.log('✅ Gabaritos adicionados com sucesso!');
                toast.success(`Você ganhou ${rewardAmount} Gabaritos! 🎉`, {
                  duration: 4000,
                });
                onRewardGranted?.();
              }
              
              // Limpar container do player após 2 segundos
              setTimeout(() => {
                const container = document.getElementById('applixir-player-container');
                if (container) {
                  container.innerHTML = '';
                  console.log('🧹 Container do AppLixir limpo');
                }
              }, 2000);
              
            } catch (error) {
              console.error('❌ Erro ao processar recompensa:', error);
              toast.error('Erro ao processar recompensa');
              onError?.('Erro ao processar recompensa');
            } finally {
              setIsLoading(false);
            }
          } else if (status === 'ad-closed' || status === 'player-closed') {
            console.log('⚠️ Player fechado - Status:', status, '- Vídeo completo?', videoCompleted);
            
            // Só mostra erro se o vídeo NÃO foi completado
            if (!videoCompleted) {
              console.log('❌ Vídeo fechado ANTES de completar');
              toast.error('Assista o vídeo completo para ganhar Gabaritos');
            }
            
            // Limpar container do player
            setTimeout(() => {
              const container = document.getElementById('applixir-player-container');
              if (container) {
                container.innerHTML = '';
                console.log('🧹 Container do AppLixir limpo (fechado)');
              }
            }, 500);
            
            setIsLoading(false);
          } else if (status === 'ad-started') {
            console.log('▶️ Vídeo iniciado');
            onVideoStart?.();
          } else {
            console.log('ℹ️ Status desconhecido:', status);
          }
        },
        
        adErrorCallbackFn: (error: any) => {
          console.error('❌ Erro AppLixir:', error);
          const errorData = error?.getError?.()?.data || 'Erro desconhecido';
          console.error('Detalhes do erro:', errorData);
          toast.error('Erro ao carregar vídeo. Tente novamente mais tarde.');
          onError?.(`Erro: ${errorData}`);
          setIsLoading(false);
        }
      };

      console.log('🚀 Iniciando player AppLixir com API Key:', apiKey.substring(0, 8) + '...');
      
      // Invocar player do AppLixir
      window.initializeAndOpenPlayer(options);
    } catch (error) {
      console.error('❌ Erro ao invocar vídeo:', error);
      toast.error('Erro ao iniciar vídeo');
      onError?.('Erro ao invocar vídeo');
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleWatchVideo}
      disabled={disabled || isLoading}
      className={className}
      variant="default"
      size="lg"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Carregando vídeo...
        </>
      ) : (
        <>
          <Play className="mr-2 h-5 w-5" />
          Assistir vídeo e ganhar {rewardAmount} Gabaritos
        </>
      )}
    </Button>
  );
};
