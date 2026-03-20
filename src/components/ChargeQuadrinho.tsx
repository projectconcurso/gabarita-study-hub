import { MessageSquare } from "lucide-react";

interface ChargeQuadrinhoProps {
  content: string;
}

interface DialogLine {
  character: string;
  emoji: string;
  text: string;
  type: 'speech' | 'thought' | 'shout';
}

export function ChargeQuadrinho({ content }: ChargeQuadrinhoProps) {
  const parseDialog = (text: string): DialogLine[] => {
    const lines = text.split('\n').filter(line => line.trim());
    const dialogs: DialogLine[] = [];
    
    for (const line of lines) {
      const match = line.match(/^([^:]+):\s*"(.+)"$/);
      if (match) {
        const [, character, text] = match;
        const cleanChar = character.trim();
        
        // Extrair emoji se houver
        const emojiMatch = cleanChar.match(/([\u{1F300}-\u{1F9FF}])/u);
        const emoji = emojiMatch ? emojiMatch[1] : '👤';
        const charName = cleanChar.replace(/([\u{1F300}-\u{1F9FF}])/gu, '').trim();
        
        // Determinar tipo de balão baseado no texto
        let type: 'speech' | 'thought' | 'shout' = 'speech';
        if (text.includes('...') || text.toLowerCase().includes('pensando')) {
          type = 'thought';
        } else if (text.includes('!') || text === text.toUpperCase()) {
          type = 'shout';
        }
        
        dialogs.push({
          character: charName || 'Personagem',
          emoji,
          text: text.trim(),
          type
        });
      }
    }
    
    return dialogs;
  };
  
  const dialogs = parseDialog(content);
  
  const getBalloonStyle = (type: string) => {
    switch (type) {
      case 'thought':
        return {
          container: 'bg-white border-4 border-dashed border-purple-400 rounded-[2rem]',
          tail: 'thought-tail',
          textColor: 'text-purple-900'
        };
      case 'shout':
        return {
          container: 'bg-yellow-100 border-4 border-red-500 rounded-lg',
          tail: 'shout-tail',
          textColor: 'text-red-900 font-bold'
        };
      default:
        return {
          container: 'bg-white border-4 border-gray-800 rounded-3xl',
          tail: 'speech-tail',
          textColor: 'text-gray-900'
        };
    }
  };
  
  return (
    <div className="my-4 rounded-[1.5rem] border-2 border-border bg-gradient-to-br from-yellow-50 to-orange-50 p-4">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-border bg-orange-500 text-white">
            <MessageSquare className="h-5 w-5" />
          </div>
          <span className="font-semibold text-foreground">Charge</span>
        </div>
        
        <div className="rounded-lg border-2 border-orange-200 bg-gradient-to-b from-sky-100 to-green-100 p-6 relative overflow-hidden">
          {/* Fundo de quadrinho */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-1 bg-gray-800"></div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-800"></div>
            <div className="absolute top-0 left-0 w-1 h-full bg-gray-800"></div>
            <div className="absolute top-0 right-0 w-1 h-full bg-gray-800"></div>
          </div>
          
          {/* Diálogos em formato de quadrinho */}
          <div className="relative space-y-6">
            {dialogs.map((dialog, index) => {
              const style = getBalloonStyle(dialog.type);
              const isLeft = index % 2 === 0;
              
              return (
                <div key={index} className={`flex ${isLeft ? 'justify-start' : 'justify-end'} items-start gap-3`}>
                  {/* Personagem à esquerda */}
                  {isLeft && (
                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                      <div className="text-5xl sm:text-6xl filter drop-shadow-lg">
                        {dialog.emoji}
                      </div>
                      <div className="text-[10px] font-bold text-gray-700 bg-white px-2 py-0.5 rounded-full border-2 border-gray-800">
                        {dialog.character}
                      </div>
                    </div>
                  )}
                  
                  {/* Balão de fala */}
                  <div className="relative max-w-[70%] sm:max-w-[60%]">
                    <div className={`${style.container} px-4 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] relative`}>
                      <p className={`${style.textColor} text-sm sm:text-base leading-relaxed font-comic`}>
                        {dialog.text}
                      </p>
                      
                      {/* Rabinho do balão */}
                      <div className={`absolute ${isLeft ? '-left-3' : '-right-3'} bottom-4`}>
                        {dialog.type === 'thought' ? (
                          <div className="flex flex-col gap-1">
                            <div className="w-2 h-2 bg-white border-2 border-purple-400 rounded-full"></div>
                            <div className="w-3 h-3 bg-white border-2 border-purple-400 rounded-full"></div>
                            <div className="w-4 h-4 bg-white border-2 border-purple-400 rounded-full"></div>
                          </div>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 20 20" className={isLeft ? '' : 'scale-x-[-1]'}>
                            <path 
                              d="M0,0 L20,10 L0,20 Z" 
                              fill={dialog.type === 'shout' ? '#fef3c7' : 'white'}
                              stroke={dialog.type === 'shout' ? '#ef4444' : '#1f2937'}
                              strokeWidth="3"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Personagem à direita */}
                  {!isLeft && (
                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                      <div className="text-5xl sm:text-6xl filter drop-shadow-lg">
                        {dialog.emoji}
                      </div>
                      <div className="text-[10px] font-bold text-gray-700 bg-white px-2 py-0.5 rounded-full border-2 border-gray-800">
                        {dialog.character}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Linhas de ação (efeito quadrinho) */}
          <div className="absolute top-2 right-2 text-yellow-400 opacity-30 text-4xl font-bold transform rotate-12">
            ★
          </div>
          <div className="absolute bottom-2 left-2 text-red-400 opacity-30 text-3xl font-bold">
            💥
          </div>
        </div>
      </div>
    </div>
  );
}
