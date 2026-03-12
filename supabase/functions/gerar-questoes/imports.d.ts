declare module "std/http/server" {
  export function serve(handler: (req: Request) => Response | Promise<Response>): void;
}

declare module "@supabase/supabase-js" {
  export function createClient(url: string, key: string): {
    from: (table: string) => {
      insert: (values: unknown) => Promise<{ error: unknown }>;
    };
  };
}
