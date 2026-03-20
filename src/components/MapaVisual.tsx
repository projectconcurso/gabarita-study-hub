import { MapPin } from "lucide-react";

interface MapaData {
  tipo: 'vegetacao' | 'clima' | 'hidrografia';
  titulo: string;
  regioes?: Array<{
    nome: string;
    cor: string;
    icone: string;
    percentual?: number;
    caracteristica?: string;
  }>;
  elementos?: Array<{
    tipo: string;
    nome: string;
    extensao?: string;
    lado?: string;
    local?: string;
    altitude?: string;
    tipo_foz?: string;
  }>;
}

interface MapaVisualProps {
  data: MapaData;
}

export function MapaVisual({ data }: MapaVisualProps) {
  if (data.tipo === 'hidrografia') {
    return (
      <div className="my-4 rounded-[1.5rem] border-2 border-border bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-border bg-blue-600 text-white">
              <MapPin className="h-5 w-5" />
            </div>
            <span className="font-semibold text-foreground">{data.titulo}</span>
          </div>
          
          <div className="rounded-lg border-2 border-blue-200 bg-white p-6">
            <div className="space-y-4">
              {data.elementos?.map((elemento, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="text-2xl">
                    {elemento.tipo === 'rio_principal' && '💧'}
                    {elemento.tipo === 'afluente' && '〰️'}
                    {elemento.tipo === 'nascente' && '⛰️'}
                    {elemento.tipo === 'foz' && '🌊'}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-blue-900">
                      {elemento.tipo.replace('_', ' ').toUpperCase()}
                    </div>
                    <div className="text-sm text-gray-700 mt-1">
                      <strong>{elemento.nome}</strong>
                      {elemento.extensao && ` - ${elemento.extensao}`}
                      {elemento.lado && ` (${elemento.lado})`}
                      {elemento.local && ` - ${elemento.local}`}
                      {elemento.altitude && ` - ${elemento.altitude}`}
                      {elemento.tipo_foz && ` - Tipo: ${elemento.tipo_foz}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Para vegetação e clima - mostrar como mapa de regiões
  return (
    <div className="my-4 rounded-[1.5rem] border-2 border-border bg-gradient-to-br from-green-50 to-yellow-50 p-4">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-border bg-green-600 text-white">
            <MapPin className="h-5 w-5" />
          </div>
          <span className="font-semibold text-foreground">{data.titulo}</span>
        </div>
        
        <div className="rounded-lg border-2 border-green-200 bg-white p-6 overflow-hidden">
          {/* Mapa visual com barras proporcionais */}
          <div className="space-y-3 mb-6">
            {data.regioes?.map((regiao, index) => (
              <div key={index} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-lg sm:text-xl flex-shrink-0">{regiao.icone}</span>
                    <span className="font-semibold text-gray-800 text-xs sm:text-sm break-words">{regiao.nome}</span>
                  </div>
                  {regiao.percentual && (
                    <span className="text-xs sm:text-sm font-bold text-gray-700 flex-shrink-0">{regiao.percentual}%</span>
                  )}
                </div>
                
                {regiao.percentual && (
                  <div className="w-full h-7 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                    <div
                      className="h-full flex items-center justify-center text-xs font-bold text-white transition-all"
                      style={{
                        width: `${regiao.percentual}%`,
                        backgroundColor: regiao.cor,
                        minWidth: regiao.percentual < 5 ? '12%' : undefined
                      }}
                    >
                      {regiao.percentual}%
                    </div>
                  </div>
                )}
                
                {regiao.caracteristica && (
                  <div className="text-xs text-gray-600 italic ml-6 sm:ml-8 break-words">
                    {regiao.caracteristica}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Representação visual do mapa - Grid responsivo */}
          <div className="border-t-2 pt-6 border-gray-200">
            <div className="w-full max-w-full overflow-hidden">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 auto-rows-fr">
                {data.regioes?.map((regiao, index) => {
                  const size = regiao.percentual || 16;
                  // Calcular colunas baseado no percentual - apenas para desktop
                  let colsClass = '';
                  if (size >= 40) colsClass = 'md:col-span-3';
                  else if (size >= 20) colsClass = 'md:col-span-2';
                  else colsClass = 'md:col-span-1';
                  
                  return (
                    <div
                      key={index}
                      className={`${colsClass} rounded-xl p-3 sm:p-4 flex flex-col items-center justify-center text-center transition-all hover:scale-105 border-2 border-white shadow-md min-h-[90px] sm:min-h-[100px]`}
                      style={{ backgroundColor: regiao.cor }}
                    >
                      <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">{regiao.icone}</div>
                      <div className="text-[10px] sm:text-xs font-bold text-white drop-shadow-lg leading-tight break-words px-1">
                        {regiao.nome}
                      </div>
                      {regiao.percentual && (
                        <div className="text-[10px] sm:text-xs font-semibold text-white/95 mt-0.5 sm:mt-1">
                          {regiao.percentual}%
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
