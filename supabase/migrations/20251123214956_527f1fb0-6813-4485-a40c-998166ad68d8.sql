-- Criar tabela de perfis de usuário
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  sobrenome TEXT NOT NULL,
  foto_url TEXT,
  cargo_desejado TEXT,
  data_prova DATE,
  area_forte TEXT,
  area_fraca TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Usuários podem ver todos os perfis"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem inserir seu próprio perfil"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Função para criar perfil automaticamente ao cadastrar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, sobrenome)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', ''),
    COALESCE(NEW.raw_user_meta_data->>'sobrenome', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger para updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();