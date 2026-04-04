// Este arquivo força o TypeScript a usar os tipos corretos do banco de dados
import type { Database as DatabaseComplete } from './types-complete';

export type Database = DatabaseComplete;
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];
