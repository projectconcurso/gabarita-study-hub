import { useEffect, useState } from 'react';
import { useIsPremium } from '@/hooks/useIsPremium';
import { supabase } from '@/integrations/supabase/client';

export function MonetagVignette() {
  const { isPremium, loading } = useIsPremium();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar se usuário está autenticado
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    
    checkAuth();

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Não carregar se não estiver autenticado
    if (!isAuthenticated) return;
    
    // Não carregar se for premium ou ainda estiver carregando
    if (loading || isPremium) return;

    // Verificar se o script já foi carregado
    const existingScript = document.querySelector('script[src*="izcle.com/vignette.min.js"]');
    if (existingScript) return;

    try {
      // Criar e adicionar script do Monetag Vignette
      const script = document.createElement('script');
      script.dataset.zone = '10781786';
      script.src = 'https://izcle.com/vignette.min.js';
      
      // Adicionar ao body
      const target = document.body || document.documentElement;
      target.appendChild(script);
      
      console.log('Monetag Vignette carregado para usuário autenticado');
    } catch (error) {
      console.error('Erro ao carregar Monetag Vignette:', error);
    }

    // Cleanup não é necessário pois o Vignette deve persistir durante toda a sessão
  }, [loading, isPremium, isAuthenticated]);

  // Componente não renderiza nada visível
  return null;
}
