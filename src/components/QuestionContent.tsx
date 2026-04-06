import { FileImage, BarChart3, Table2, ImageIcon, MapPin } from "lucide-react";
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ScatterController,
} from 'chart.js';
import { RelevoMap } from './RelevoMap';
import { MapaVisual } from './MapaVisual';
import { ChargeQuadrinho } from './ChargeQuadrinho';

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ScatterController
);

interface QuestionContentProps {
  content: string;
  imageUrl?: string | null;
}

interface ChartData {
  tipo: 'line' | 'bar' | 'pie' | 'scatter';
  titulo: string;
  labels: string[];
  datasets: Array<{ label: string; data: number[] | Array<{x: number; y: number}> }>;
  eixoX?: string;
  eixoY?: string;
}

interface TableData {
  titulo: string;
  colunas: string[];
  linhas: string[][];
}

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

export function QuestionContent({ content, imageUrl }: QuestionContentProps) {
  // Função para processar o conteúdo e identificar elementos visuais
  const processContent = (text: string) => {
    const parts: Array<{ 
      type: 'text' | 'visual' | 'image' | 'chart' | 'table' | 'charge_ascii' | 'mapa_ascii' | 'relevo' | 'mapa'; 
      content: string; 
      visualType?: string; 
      imageUrl?: string; 
      data?: ChartData | TableData | RelevoData | MapaData;
    }> = [];
    
    let processedText = text;
    let currentIndex = 0;
    
    // Processar gráficos estruturados - usar regex que captura JSON completo
    const chartMatches: Array<{ index: number; length: number; data: any }> = [];
    let chartStartIndex = 0;
    
    // Procurar por ambas as formas: com e sem acento
    const findNextChart = (startPos: number): { index: number; tagLength: number } | null => {
      const withAccent = text.indexOf('[GRÁFICO_DATA:', startPos);
      const withoutAccent = text.indexOf('[GRAFICO_DATA:', startPos);
      
      if (withAccent === -1 && withoutAccent === -1) return null;
      if (withAccent === -1) return { index: withoutAccent, tagLength: '[GRAFICO_DATA:'.length };
      if (withoutAccent === -1) return { index: withAccent, tagLength: '[GRÁFICO_DATA:'.length };
      
      return withAccent < withoutAccent 
        ? { index: withAccent, tagLength: '[GRÁFICO_DATA:'.length }
        : { index: withoutAccent, tagLength: '[GRAFICO_DATA:'.length };
    };
    
    let chartInfo = findNextChart(0);
    while (chartInfo !== null) {
      chartStartIndex = chartInfo.index;
      const jsonStart = chartStartIndex + chartInfo.tagLength;
      let braceCount = 0;
      let jsonEnd = jsonStart;
      let foundEnd = false;
      
      for (let i = jsonStart; i < text.length; i++) {
        if (text[i] === '{') braceCount++;
        if (text[i] === '}') braceCount--;
        if (braceCount === 0 && text[i] === '}') {
          jsonEnd = i + 1;
          foundEnd = true;
          break;
        }
      }
      
      if (foundEnd && text[jsonEnd] === ']') {
        try {
          const jsonStr = text.substring(jsonStart, jsonEnd);
          const chartData = JSON.parse(jsonStr);
          chartMatches.push({
            index: chartStartIndex,
            length: jsonEnd - chartStartIndex + 1,
            data: chartData
          });
        } catch (e) {
          console.error('Erro ao parsear dados do gráfico:', e, text.substring(jsonStart, jsonEnd));
        }
      }
      
      chartInfo = findNextChart(jsonEnd + 1);
    }
    
    // Processar tabelas estruturadas - usar regex que captura JSON completo
    const tableMatches: Array<{ index: number; length: number; data: any }> = [];
    let tableStartIndex = 0;
    
    while ((tableStartIndex = text.indexOf('[TABELA_DATA:', tableStartIndex)) !== -1) {
      const jsonStart = tableStartIndex + '[TABELA_DATA:'.length;
      let braceCount = 0;
      let jsonEnd = jsonStart;
      let foundEnd = false;
      
      for (let i = jsonStart; i < text.length; i++) {
        if (text[i] === '{') braceCount++;
        if (text[i] === '}') braceCount--;
        if (braceCount === 0 && text[i] === '}') {
          jsonEnd = i + 1;
          foundEnd = true;
          break;
        }
      }
      
      if (foundEnd && text[jsonEnd] === ']') {
        try {
          const jsonStr = text.substring(jsonStart, jsonEnd);
          const tableData = JSON.parse(jsonStr);
          tableMatches.push({
            index: tableStartIndex,
            length: jsonEnd - tableStartIndex + 1,
            data: tableData
          });
        } catch (e) {
          console.error('Erro ao parsear dados da tabela:', e, text.substring(jsonStart, jsonEnd));
        }
      }
      
      tableStartIndex = jsonEnd + 1;
    }
    
    // Processar elementos visuais ASCII
    const chargeAsciiMatches: Array<{ index: number; length: number; content: string }> = [];
    let chargeStartIndex = 0;
    
    while ((chargeStartIndex = text.indexOf('[CHARGE_ASCII:', chargeStartIndex)) !== -1) {
      const contentStart = chargeStartIndex + '[CHARGE_ASCII:'.length;
      const contentEnd = text.indexOf(']', contentStart);
      
      if (contentEnd !== -1) {
        const content = text.substring(contentStart, contentEnd);
        chargeAsciiMatches.push({
          index: chargeStartIndex,
          length: contentEnd - chargeStartIndex + 1,
          content: content
        });
      }
      
      chargeStartIndex = contentEnd + 1;
    }
    
    // Processar mapas ASCII
    const chargeAsciiMatches2: Array<{ index: number; length: number; content: string }> = [];
    let mapaStartIndex = 0;
    
    while ((mapaStartIndex = text.indexOf('[MAPA_ASCII:', mapaStartIndex)) !== -1) {
      const contentStart = mapaStartIndex + '[MAPA_ASCII:'.length;
      const contentEnd = text.indexOf(']', contentStart);
      
      if (contentEnd !== -1) {
        const content = text.substring(contentStart, contentEnd);
        chargeAsciiMatches2.push({
          index: mapaStartIndex,
          length: contentEnd - mapaStartIndex + 1,
          content: content
        });
      }
      
      mapaStartIndex = contentEnd + 1;
    }
    
    // Processar relevos estruturados
    const relevoMatches: Array<{ index: number; length: number; data: any }> = [];
    let relevoStartIndex = 0;
    
    while ((relevoStartIndex = text.indexOf('[RELEVO_DATA:', relevoStartIndex)) !== -1) {
      const jsonStart = relevoStartIndex + '[RELEVO_DATA:'.length;
      let braceCount = 0;
      let jsonEnd = jsonStart;
      let foundEnd = false;
      
      for (let i = jsonStart; i < text.length; i++) {
        if (text[i] === '{') braceCount++;
        if (text[i] === '}') braceCount--;
        if (braceCount === 0 && text[i] === '}') {
          jsonEnd = i + 1;
          foundEnd = true;
          break;
        }
      }
      
      if (foundEnd && text[jsonEnd] === ']') {
        try {
          const jsonStr = text.substring(jsonStart, jsonEnd);
          const relevoData = JSON.parse(jsonStr);
          relevoMatches.push({
            index: relevoStartIndex,
            length: jsonEnd - relevoStartIndex + 1,
            data: relevoData
          });
        } catch (e) {
          console.error('Erro ao parsear dados do relevo:', e);
        }
      }
      
      relevoStartIndex = jsonEnd + 1;
    }
    
    // Processar mapas estruturados
    const mapaMatches: Array<{ index: number; length: number; data: any }> = [];
    let mapaDataStartIndex = 0;
    
    while ((mapaDataStartIndex = text.indexOf('[MAPA_DATA:', mapaDataStartIndex)) !== -1) {
      const jsonStart = mapaDataStartIndex + '[MAPA_DATA:'.length;
      let braceCount = 0;
      let jsonEnd = jsonStart;
      let foundEnd = false;
      
      for (let i = jsonStart; i < text.length; i++) {
        if (text[i] === '{') braceCount++;
        if (text[i] === '}') braceCount--;
        if (braceCount === 0 && text[i] === '}') {
          jsonEnd = i + 1;
          foundEnd = true;
          break;
        }
      }
      
      if (foundEnd && text[jsonEnd] === ']') {
        try {
          const jsonStr = text.substring(jsonStart, jsonEnd);
          const mapaData = JSON.parse(jsonStr);
          mapaMatches.push({
            index: mapaDataStartIndex,
            length: jsonEnd - mapaDataStartIndex + 1,
            data: mapaData
          });
        } catch (e) {
          console.error('Erro ao parsear dados do mapa:', e);
        }
      }
      
      mapaDataStartIndex = jsonEnd + 1;
    }
    
    // Combinar todos os matches e ordenar por índice
    const allMatches = [
      ...chartMatches.map(m => ({ ...m, matchType: 'chart' as const })),
      ...tableMatches.map(m => ({ ...m, matchType: 'table' as const })),
      ...chargeAsciiMatches.map(m => ({ ...m, matchType: 'charge_ascii' as const })),
      ...chargeAsciiMatches2.map(m => ({ ...m, matchType: 'mapa_ascii' as const })),
      ...relevoMatches.map(m => ({ ...m, matchType: 'relevo' as const })),
      ...mapaMatches.map(m => ({ ...m, matchType: 'mapa' as const }))
    ].sort((a, b) => a.index - b.index);
    
    // Construir parts
    let lastIndex = 0;
    
    for (const match of allMatches) {
      // Adicionar texto antes do match
      if (match.index > lastIndex) {
        const textContent = text.substring(lastIndex, match.index).trim();
        if (textContent) {
          parts.push({
            type: 'text',
            content: textContent
          });
        }
      }
      
      // Adicionar o elemento visual
      if (match.matchType === 'chart') {
        parts.push({
          type: 'chart',
          content: '',
          data: match.data
        });
      } else if (match.matchType === 'table') {
        parts.push({
          type: 'table',
          content: '',
          data: match.data
        });
      } else if (match.matchType === 'charge_ascii') {
        parts.push({
          type: 'charge_ascii' as any,
          content: (match as any).content
        });
      } else if (match.matchType === 'mapa_ascii') {
        parts.push({
          type: 'mapa_ascii' as any,
          content: (match as any).content
        });
      } else if (match.matchType === 'relevo') {
        parts.push({
          type: 'relevo' as any,
          content: '',
          data: (match as any).data
        });
      } else if (match.matchType === 'mapa') {
        parts.push({
          type: 'mapa' as any,
          content: '',
          data: (match as any).data
        });
      }
      
      lastIndex = match.index + match.length;
    }
    
    // Adicionar texto restante
    if (lastIndex < text.length) {
      const textContent = text.substring(lastIndex).trim();
      if (textContent) {
        parts.push({
          type: 'text',
          content: textContent
        });
      }
    }
    
    return parts;
  };
  
  const getVisualIcon = (type: string) => {
    switch (type) {
      case 'IMAGEM':
      case 'CHARGE':
        return <ImageIcon className="h-5 w-5" />;
      case 'GRÁFICO':
      case 'DADOS':
        return <BarChart3 className="h-5 w-5" />;
      case 'TABELA':
        return <Table2 className="h-5 w-5" />;
      case 'MAPA':
        return <MapPin className="h-5 w-5" />;
      case 'ESQUEMA':
        return <FileImage className="h-5 w-5" />;
      default:
        return <ImageIcon className="h-5 w-5" />;
    }
  };
  
  const getVisualLabel = (type: string) => {
    switch (type) {
      case 'IMAGEM':
        return 'Imagem';
      case 'GRÁFICO':
        return 'Gráfico';
      case 'TABELA':
        return 'Tabela';
      case 'CHARGE':
        return 'Charge';
      case 'MAPA':
        return 'Mapa';
      case 'DADOS':
        return 'Dados';
      case 'ESQUEMA':
        return 'Esquema';
      default:
        return 'Elemento Visual';
    }
  };
  
  const renderChart = (chartData: ChartData) => {
    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];
    
    const data = {
      labels: chartData.labels,
      datasets: chartData.datasets.map((dataset, index) => ({
        label: dataset.label,
        data: dataset.data,
        backgroundColor: chartData.tipo === 'pie' 
          ? COLORS.slice(0, chartData.labels.length)
          : COLORS[index % COLORS.length] + '80',
        borderColor: COLORS[index % COLORS.length],
        borderWidth: 2,
      })),
    };

    const isMobile = window.innerWidth < 640;
    const isVerySmall = window.innerWidth < 400;
    
    const options = {
      responsive: true,
      maintainAspectRatio: true,
      layout: {
        padding: {
          left: isMobile ? 10 : 10,
          right: isMobile ? 10 : 10,
          top: isMobile ? 10 : 10,
          bottom: isMobile ? 20 : 10,
        },
      },
      plugins: {
        legend: {
          position: 'top' as const,
          display: !isVerySmall,
          labels: {
            font: {
              size: isMobile ? 9 : 12,
            },
            padding: isMobile ? 6 : 10,
            boxWidth: isMobile ? 10 : 15,
          },
        },
        title: {
          display: !isMobile,
          text: chartData.titulo,
          font: {
            size: 16,
            weight: 'bold' as const,
          },
          padding: {
            top: 10,
            bottom: 15,
          },
        },
      },
      scales: chartData.tipo !== 'pie' ? {
        x: {
          ticks: {
            font: {
              size: isMobile ? 7 : 11,
            },
            maxRotation: isMobile ? 90 : 0,
            minRotation: isMobile ? 90 : 0,
            autoSkip: true,
            maxTicksLimit: isMobile ? 4 : 10,
            padding: isMobile ? 5 : 0,
          },
          title: {
            display: !isMobile && !!chartData.eixoX,
            text: chartData.eixoX || '',
            font: {
              size: 12,
            },
          },
        },
        y: {
          ticks: {
            font: {
              size: isMobile ? 7 : 11,
            },
            maxTicksLimit: isMobile ? 4 : 8,
            padding: isMobile ? 5 : 0,
          },
          title: {
            display: false,
            text: chartData.eixoY || '',
            font: {
              size: 12,
            },
            padding: {
              bottom: 10,
            },
          },
        },
      } : undefined,
    };

    return (
      <div className="my-4 rounded-[1.5rem] border-2 border-border bg-white p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-border bg-primary text-primary-foreground">
              <BarChart3 className="h-5 w-5" />
            </div>
            <p className="text-sm font-black uppercase text-foreground">
              Gráfico
            </p>
          </div>
          <div className="w-full overflow-x-auto" style={{ maxHeight: window.innerWidth < 640 ? '400px' : '400px', minHeight: window.innerWidth < 640 ? '350px' : '300px' }}>
            {chartData.tipo === 'line' && <Line data={data} options={options} />}
            {chartData.tipo === 'bar' && <Bar data={data} options={options} />}
            {chartData.tipo === 'pie' && <Pie data={data} options={options} />}
            {chartData.tipo === 'scatter' && <Line data={data} options={{...options, showLine: false}} />}
          </div>
        </div>
      </div>
    );
  };

  const renderTable = (tableData: TableData) => {
    return (
      <div className="my-4 rounded-[1.5rem] border-2 border-border bg-white p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-border bg-primary text-primary-foreground">
              <Table2 className="h-5 w-5" />
            </div>
            <p className="text-sm font-black uppercase text-foreground">
              {tableData.titulo}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted">
                  {tableData.colunas.map((col, index) => (
                    <th key={index} className="border-2 border-border px-3 py-2 text-left text-sm font-black uppercase">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.linhas.map((linha, rowIndex) => (
                  <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-muted/30'}>
                    {linha.map((cell, cellIndex) => (
                      <td key={cellIndex} className="border-2 border-border px-3 py-2 text-sm font-semibold">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const processedParts = processContent(content);

  return (
    <div className="space-y-4">
      {processedParts.map((part, index) => {
        if (part.type === 'text') {
          return (
            <p key={index} className="text-base leading-relaxed whitespace-pre-wrap">
              {part.content}
            </p>
          );
        }
        
        if (part.type === 'chart' && part.data) {
          return <div key={index}>{renderChart(part.data as ChartData)}</div>;
        }
        
        if (part.type === 'table' && part.data) {
          return <div key={index}>{renderTable(part.data as TableData)}</div>;
        }
        
        if (part.type === 'charge_ascii') {
          return <div key={index}><ChargeQuadrinho content={part.content} /></div>;
        }
        
        if (part.type === 'mapa_ascii') {
          return (
            <div key={index} className="my-4 rounded-[1.5rem] border-2 border-border bg-gradient-to-br from-blue-50 to-green-50 p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-border bg-green-600 text-white">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <span className="font-semibold text-foreground">Mapa/Relevo</span>
                </div>
                <div className="rounded-lg border-2 border-green-200 bg-white p-4">
                  <pre className="font-mono text-sm leading-relaxed whitespace-pre-wrap">
                    {part.content}
                  </pre>
                </div>
              </div>
            </div>
          );
        }
        
        if (part.type === 'relevo' && part.data) {
          return <div key={index}><RelevoMap data={part.data as unknown as RelevoData} /></div>;
        }
        
        if (part.type === 'mapa' && part.data) {
          return <div key={index}><MapaVisual data={part.data as unknown as MapaData} /></div>;
        }
        
        return null;
      })}
    </div>
  );
}
