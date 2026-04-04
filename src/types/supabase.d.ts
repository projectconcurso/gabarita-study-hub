// Ignora erros da edge function em desenvolvimento
declare module "https://deno.land/std@0.168.0/http/server.ts" {
  export const serve: any;
}

declare module "https://esm.sh/@supabase/supabase-js@2" {
  export const createClient: any;
}

declare global {
  const Deno: {
    env: {
      get: (key: string) => string | undefined;
    };
  };
}
