import { MapPin } from "lucide-react";

interface RelevoData {
  tipo: 'perfil';
  titulo: string;
  elementos: Array<{
    nome: string;
    altitude: number;
    cor: string;
    largura: number;
  }>;
}

interface RelevoMapProps {
  data: RelevoData;
}

export function RelevoMap({ data }: RelevoMapProps) {
  const maxAltitude = Math.max(...data.elementos.map(e => e.altitude));
  
  return (
    <div className="my-4 rounded-[1.5rem] border-2 border-border bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-border bg-green-600 text-white">
            <MapPin className="h-5 w-5" />
          </div>
          <span className="font-semibold text-foreground">{data.titulo}</span>
        </div>
        
        <div className="rounded-lg border-2 border-green-200 bg-white p-6 overflow-hidden">
          {/* Perfil topográfico */}
          <div className="relative h-72 flex items-end pt-12 pb-4">
            {data.elementos.map((elemento, index) => {
              const heightPercentage = (elemento.altitude / maxAltitude) * 100;
              const minHeight = elemento.altitude === 0 ? 8 : 15;
              
              return (
                <div
                  key={index}
                  className="relative flex flex-col items-center justify-end transition-all hover:opacity-90"
                  style={{
                    width: `${elemento.largura}%`,
                    height: `${Math.max(heightPercentage, minHeight)}%`,
                    backgroundColor: elemento.cor,
                    borderRight: index < data.elementos.length - 1 ? '2px solid rgba(255,255,255,0.3)' : 'none'
                  }}
                >
                  {/* Label de altitude - acima da barra */}
                  {elemento.altitude > 0 && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-10">
                      <div className="text-xs font-bold whitespace-nowrap bg-white px-2 py-1 rounded-md shadow-md border-2 border-gray-200">
                        {elemento.altitude}m
                      </div>
                    </div>
                  )}
                  
                  {/* Nome do elemento - dentro da barra */}
                  <div className="absolute inset-0 flex items-end justify-center pb-1 px-0.5">
                    <div className="text-[9px] sm:text-[10px] font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-center leading-[1.1] break-words hyphens-auto w-full">
                      {elemento.nome}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Linha de base */}
          <div className="mt-2 border-t-4 border-gray-800 relative">
            <div className="absolute -bottom-6 left-0 text-xs font-semibold text-gray-700">
              Nível do Mar (0m)
            </div>
          </div>
          
          {/* Legenda */}
          <div className="mt-10 pt-4 border-t-2 border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {data.elementos.map((elemento, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded border-2 border-gray-300 flex-shrink-0"
                    style={{ backgroundColor: elemento.cor }}
                  />
                  <span className="text-xs text-gray-700 font-medium break-words">
                    {elemento.nome} ({elemento.altitude}m)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
