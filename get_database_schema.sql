-- Script para extrair schema completo do banco de dados
-- Execute este comando no Supabase SQL Editor e me envie o resultado

-- 1. Listar todas as tabelas
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- 2. Listar todas as funções RPC
SELECT 
    routine_name,
    routine_type,
    data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- 3. Listar parâmetros das funções
SELECT 
    r.routine_name,
    p.parameter_name,
    p.data_type,
    p.parameter_mode
FROM information_schema.routines r
LEFT JOIN information_schema.parameters p 
    ON r.specific_name = p.specific_name
WHERE r.routine_schema = 'public'
AND r.routine_type = 'FUNCTION'
ORDER BY r.routine_name, p.ordinal_position;
