-- Adicionar campos de subscription Stripe à tabela profiles
ALTER TABLE public.profiles
ADD COLUMN stripe_customer_id TEXT,
ADD COLUMN stripe_subscription_id TEXT,
ADD COLUMN subscription_status TEXT DEFAULT 'trial',
ADD COLUMN trial_ends_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN subscription_started_at TIMESTAMP WITH TIME ZONE;

-- Criar índices para melhor performance
CREATE INDEX idx_profiles_stripe_customer_id ON public.profiles(stripe_customer_id);
CREATE INDEX idx_profiles_subscription_status ON public.profiles(subscription_status);
