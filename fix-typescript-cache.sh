#!/bin/bash
# Script para limpar completamente o cache do TypeScript

echo "🧹 Limpando cache do TypeScript..."

# Limpar cache do TypeScript
rm -rf .tsbuildinfo
rm -rf tsconfig.tsbuildinfo
rm -rf node_modules/.cache
rm -rf node_modules/.vite
rm -rf dist

# Limpar cache do VS Code
rm -rf .vscode/.tsbuildinfo

echo "✅ Cache limpo!"
echo ""
echo "📝 PRÓXIMOS PASSOS:"
echo "1. No VS Code, pressione: Cmd + Shift + P"
echo "2. Digite: 'TypeScript: Restart TS Server'"
echo "3. Pressione Enter"
echo "4. Depois pressione: Cmd + Shift + P novamente"
echo "5. Digite: 'Developer: Reload Window'"
echo "6. Pressione Enter"
echo ""
echo "Os erros devem desaparecer após esses passos! 🚀"
