import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { criarConcurso } from "@/lib/meus-estudos";
import type { ConcursoFormData } from "@/types/meus-estudos";

interface CriarConcursoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onSuccess: () => void;
}

const ESCOLARIDADES = [
  { value: "fundamental", label: "Fundamental" },
  { value: "medio", label: "Médio" },
  { value: "superior", label: "Superior" },
];

export function CriarConcursoDialog({ open, onOpenChange, userId, onSuccess }: CriarConcursoDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ConcursoFormData>({
    nome: "",
    data_prova: "",
    descricao: "",
    escolaridade: "",
    materias: [
      {
        nome: "",
        ordem: 0,
        assuntos: [{ nome: "", ordem: 0 }],
      },
    ],
  });

  const adicionarMateria = () => {
    setFormData({
      ...formData,
      materias: [
        ...formData.materias,
        {
          nome: "",
          ordem: formData.materias.length,
          assuntos: [{ nome: "", ordem: 0 }],
        },
      ],
    });
  };

  const removerMateria = (index: number) => {
    if (formData.materias.length === 1) {
      toast.error("Você precisa ter pelo menos uma matéria");
      return;
    }
    const novasMaterias = formData.materias.filter((_, i) => i !== index);
    setFormData({ ...formData, materias: novasMaterias });
  };

  const atualizarMateria = (index: number, nome: string) => {
    const novasMaterias = [...formData.materias];
    novasMaterias[index].nome = nome;
    setFormData({ ...formData, materias: novasMaterias });
  };

  const adicionarAssunto = (materiaIndex: number) => {
    const novasMaterias = [...formData.materias];
    novasMaterias[materiaIndex].assuntos.push({
      nome: "",
      ordem: novasMaterias[materiaIndex].assuntos.length,
    });
    setFormData({ ...formData, materias: novasMaterias });
  };

  const removerAssunto = (materiaIndex: number, assuntoIndex: number) => {
    const novasMaterias = [...formData.materias];
    if (novasMaterias[materiaIndex].assuntos.length === 1) {
      toast.error("Cada matéria precisa ter pelo menos um assunto");
      return;
    }
    novasMaterias[materiaIndex].assuntos = novasMaterias[materiaIndex].assuntos.filter(
      (_, i) => i !== assuntoIndex
    );
    setFormData({ ...formData, materias: novasMaterias });
  };

  const atualizarAssunto = (materiaIndex: number, assuntoIndex: number, nome: string) => {
    const novasMaterias = [...formData.materias];
    novasMaterias[materiaIndex].assuntos[assuntoIndex].nome = nome;
    setFormData({ ...formData, materias: novasMaterias });
  };

  const handleSubmit = async () => {
    if (!formData.nome.trim()) {
      toast.error("Digite o nome do concurso/prova");
      return;
    }

    const materiasValidas = formData.materias.filter(
      (m) => m.nome.trim() && m.assuntos.some((a) => a.nome.trim())
    );

    if (materiasValidas.length === 0) {
      toast.error("Adicione pelo menos uma matéria com um assunto");
      return;
    }

    try {
      setLoading(true);
      await criarConcurso(formData, userId);
      toast.success("Concurso criado com sucesso!");
      onOpenChange(false);
      setFormData({
        nome: "",
        data_prova: "",
        descricao: "",
        escolaridade: "",
        materias: [{ nome: "", ordem: 0, assuntos: [{ nome: "", ordem: 0 }] }],
      });
      onSuccess();
    } catch (error) {
      console.error("Erro ao criar concurso:", error);
      toast.error("Erro ao criar concurso");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="rounded-full border-2 border-border bg-primary text-primary-foreground font-black uppercase shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">
          <Plus className="w-4 h-4 mr-2" />
          Crie Cronograma de Estudos
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[2rem] border-4 border-border bg-white shadow-strong sm:max-w-2xl sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase">Criar Cronograma de Estudos</DialogTitle>
          <DialogDescription className="font-semibold text-muted-foreground">
            Configure seu plano de estudos completo
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto overflow-x-hidden py-4 pr-1">
          {/* Informações Básicas */}
          <div className="space-y-4 rounded-[1.5rem] border-2 border-border bg-muted p-3 sm:p-4">
            <h3 className="text-sm font-black uppercase">Informações Básicas</h3>
            
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Concurso/Prova *</Label>
              <Input
                id="nome"
                placeholder="Ex: ENEM 2024"
                className="h-12 rounded-2xl border-2 border-border bg-white"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="escolaridade">Escolaridade *</Label>
              <Select value={formData.escolaridade} onValueChange={(value) => setFormData({ ...formData, escolaridade: value })}>
                <SelectTrigger className="h-12 rounded-2xl border-2 border-border bg-white">
                  <SelectValue placeholder="Selecione a escolaridade" />
                </SelectTrigger>
                <SelectContent>
                  {ESCOLARIDADES.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_prova">Data da Prova</Label>
              <Input
                id="data_prova"
                type="date"
                className="h-12 rounded-2xl border-2 border-border bg-white"
                value={formData.data_prova}
                onChange={(e) => setFormData({ ...formData, data_prova: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição (opcional)</Label>
              <Textarea
                id="descricao"
                placeholder="Observações..."
                className="min-h-20 rounded-2xl border-2 border-border bg-white"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              />
            </div>
          </div>

          {/* Matérias e Assuntos */}
          <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-sm font-black uppercase">Matérias e Assuntos</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={adicionarMateria}
                className="rounded-full border-2 border-border font-bold text-xs sm:text-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Adicionar Matéria
              </Button>
            </div>

            {formData.materias.map((materia, materiaIndex) => (
              <div
                key={materiaIndex}
                className="space-y-3 rounded-[1.5rem] border-2 border-border bg-muted p-3 sm:p-4"
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1 space-y-2">
                    <Label>Matéria {materiaIndex + 1}</Label>
                    <Input
                      placeholder="Ex: Matemática"
                      className="h-12 rounded-2xl border-2 border-border bg-white"
                      value={materia.nome}
                      onChange={(e) => atualizarMateria(materiaIndex, e.target.value)}
                    />
                  </div>
                  {formData.materias.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removerMateria(materiaIndex)}
                      className="mt-7 rounded-full border-2 border-border hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>

                <div className="space-y-2 pl-2 sm:pl-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Assuntos</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => adicionarAssunto(materiaIndex)}
                      className="h-7 rounded-full border border-border text-xs font-bold"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Assunto
                    </Button>
                  </div>

                  {materia.assuntos.map((assunto, assuntoIndex) => (
                    <div key={assuntoIndex} className="flex items-center gap-2">
                      <Input
                        placeholder="Ex: Álgebra"
                        className="h-10 rounded-xl border-2 border-border bg-white text-sm"
                        value={assunto.nome}
                        onChange={(e) =>
                          atualizarAssunto(materiaIndex, assuntoIndex, e.target.value)
                        }
                      />
                      {materia.assuntos.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removerAssunto(materiaIndex, assuntoIndex)}
                          className="h-10 w-10 rounded-full border border-border p-0 hover:bg-destructive/10"
                        >
                          <X className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t-2 border-border pt-4 sm:flex-row sm:gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 rounded-full border-2 border-border font-bold"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 rounded-full border-2 border-border bg-primary font-black uppercase shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            disabled={loading}
          >
            {loading ? "Criando..." : "Criar Concurso"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
