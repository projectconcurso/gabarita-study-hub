import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Brain, Heart, MessageCircle, Trash2, Trophy, Users } from "lucide-react";
import { toast } from "sonner";

interface PostProfile {
  nome: string;
  sobrenome: string;
  foto_url?: string | null;
}

interface SharedSimulado {
  id: string;
  titulo: string;
  tema: string;
  materia: string;
  total_questoes: number;
}

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  conteudo: string;
  created_at: string;
  profile: PostProfile;
}

interface Post {
  id: string;
  conteudo: string;
  tipo: string;
  created_at: string;
  user_id: string;
  simulado_id?: string | null;
  profiles: PostProfile;
  reacoes_count: number;
  comentarios_count: number;
  liked_by_current_user: boolean;
  comments: Comment[];
  sharedSimulado?: SharedSimulado | null;
}

interface MuralPostRow {
  id: string;
  conteudo: string;
  tipo: string;
  created_at: string;
  user_id: string;
  simulado_id?: string | null;
}

interface ProfileRow {
  id: string;
  nome: string;
  sobrenome: string;
  foto_url: string | null;
}

interface ReactionRow {
  post_id: string;
  user_id: string;
}

interface CommentRow {
  id: string;
  post_id: string;
  user_id: string;
  conteudo: string;
  created_at: string;
}

interface SharedSimuladoRow {
  id: string;
  titulo: string;
  tema: string;
  materia: string;
  total_questoes: number;
}

type SortMode = "recentes" | "curtidos";

export default function Mural() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>("recentes");
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

  useEffect(() => {
    void loadPosts();

    const channel = supabase
      .channel("mural-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "posts_mural" }, () => {
        void loadPosts();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "reacoes_mural" }, () => {
        void loadPosts();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "comentarios_mural" }, () => {
        void loadPosts();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const sortedPosts = useMemo(() => {
    const items = [...posts];

    if (sortMode === "curtidos") {
      return items.sort((a, b) => {
        if (b.reacoes_count !== a.reacoes_count) {
          return b.reacoes_count - a.reacoes_count;
        }

        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    }

    return items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [posts, sortMode]);

  const loadPosts = async () => {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
    setCurrentUserId(user.id);

    const { data, error } = await supabase
      .from("posts_mural")
      .select("id, conteudo, tipo, created_at, user_id, simulado_id")
      .limit(50);

    if (error) {
      console.error("Erro ao carregar posts do mural:", error);
      toast.error("Erro ao carregar o mural");
      setLoading(false);
      return;
    }

    const postRows = (data ?? []) as MuralPostRow[];
    const postIds = postRows.map((post) => post.id);
    const sharedSimuladoIds = Array.from(
      new Set(postRows.map((post) => post.simulado_id).filter((value): value is string => Boolean(value)))
    );

    const [
      profilesResponse,
      reactionsResponse,
      commentsResponse,
      sharedSimuladosResponse,
    ] = await Promise.all([
      supabase.from("profiles").select("id, nome, sobrenome, foto_url"),
      postIds.length > 0
        ? supabase.from("reacoes_mural").select("post_id, user_id").in("post_id", postIds)
        : Promise.resolve({ data: [], error: null }),
      postIds.length > 0
        ? supabase.from("comentarios_mural").select("id, post_id, user_id, conteudo, created_at").in("post_id", postIds)
        : Promise.resolve({ data: [], error: null }),
      sharedSimuladoIds.length > 0
        ? supabase.from("simulados").select("id, titulo, tema, materia, total_questoes").in("id", sharedSimuladoIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (profilesResponse.error) {
      console.error("Erro ao carregar perfis do mural:", profilesResponse.error);
    }

    if (reactionsResponse.error) {
      console.error("Erro ao carregar reações do mural:", reactionsResponse.error);
    }

    if (commentsResponse.error) {
      console.error("Erro ao carregar comentários do mural:", commentsResponse.error);
    }

    if (sharedSimuladosResponse.error) {
      console.error("Erro ao carregar simulados compartilhados:", sharedSimuladosResponse.error);
    }

    const profilesMap = new Map(
      ((profilesResponse.data ?? []) as ProfileRow[]).map((profile) => [profile.id, profile])
    );

    const reactions = (reactionsResponse.data ?? []) as ReactionRow[];
    const comments = (commentsResponse.data ?? []) as CommentRow[];
    const sharedSimulados = new Map(
      ((sharedSimuladosResponse.data ?? []) as SharedSimuladoRow[]).map((simulado) => [simulado.id, simulado])
    );

    const reactionsByPost = new Map<string, ReactionRow[]>();
    reactions.forEach((reaction) => {
      const current = reactionsByPost.get(reaction.post_id) ?? [];
      current.push(reaction);
      reactionsByPost.set(reaction.post_id, current);
    });

    const commentsByPost = new Map<string, Comment[]>();
    comments.forEach((comment) => {
      const profile = profilesMap.get(comment.user_id);
      const current = commentsByPost.get(comment.post_id) ?? [];
      current.push({
        ...comment,
        profile: {
          nome: profile?.nome ?? "Usuário",
          sobrenome: profile?.sobrenome ?? "",
          foto_url: profile?.foto_url ?? null,
        },
      });
      commentsByPost.set(comment.post_id, current);
    });

    setPosts(
      postRows.map((post) => {
        const profile = profilesMap.get(post.user_id);
        const postReactions = reactionsByPost.get(post.id) ?? [];
        const postComments = (commentsByPost.get(post.id) ?? []).sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

        return {
          ...post,
          profiles: {
            nome: profile?.nome ?? "Usuário",
            sobrenome: profile?.sobrenome ?? "",
            foto_url: profile?.foto_url ?? null,
          },
          reacoes_count: postReactions.length,
          comentarios_count: postComments.length,
          liked_by_current_user: postReactions.some((reaction) => reaction.user_id === user.id),
          comments: postComments,
          sharedSimulado: post.simulado_id ? sharedSimulados.get(post.simulado_id) ?? null : null,
        };
      })
    );

    setLoading(false);
  };

  const createPost = async () => {
    if (!newPost.trim()) {
      toast.error("Digite algo para postar");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("posts_mural")
      .insert({
        user_id: user.id,
        conteudo: newPost,
        tipo: "texto",
      });

    if (error) {
      toast.error("Erro ao criar post");
      return;
    }

    toast.success("Post publicado!");
    setNewPost("");
    void loadPosts();
  };

  const reactToPost = async (post: Post) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (post.liked_by_current_user) {
      const { error } = await supabase
        .from("reacoes_mural")
        .delete()
        .eq("post_id", post.id)
        .eq("user_id", user.id);

      if (error) {
        toast.error("Erro ao remover curtida");
        return;
      }

      void loadPosts();
      return;
    }

    const { error } = await supabase
      .from("reacoes_mural")
      .insert({
        post_id: post.id,
        user_id: user.id,
        tipo: "like",
      });

    if (error) {
      toast.error("Erro ao reagir");
      return;
    }

    void loadPosts();
  };

  const addComment = async (postId: string) => {
    const conteudo = commentInputs[postId]?.trim();
    if (!conteudo) {
      toast.error("Digite um comentário");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("comentarios_mural")
      .insert({
        post_id: postId,
        user_id: user.id,
        conteudo,
      });

    if (error) {
      toast.error("Erro ao comentar");
      return;
    }

    setCommentInputs((current) => ({ ...current, [postId]: "" }));
    setExpandedComments((current) => ({ ...current, [postId]: true }));
    void loadPosts();
  };

  const duplicateSharedSimulado = async (post: Post) => {
    if (!post.sharedSimulado || !post.simulado_id) {
      toast.error("Simulado compartilhado não encontrado");
      return;
    }

    if (!confirm("Deseja adicionar este simulado à sua lista de simulados?")) {
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: sourceQuestions, error: sourceQuestionsError } = await supabase
      .from("questoes")
      .select("enunciado, alternativas, resposta_correta, explicacao, ordem")
      .eq("simulado_id", post.simulado_id)
      .order("ordem", { ascending: true });

    if (sourceQuestionsError || !sourceQuestions || sourceQuestions.length === 0) {
      toast.error("Erro ao carregar questões do simulado compartilhado");
      return;
    }

    const { data: newSimulado, error: newSimuladoError } = await supabase
      .from("simulados")
      .insert({
        user_id: user.id,
        titulo: post.sharedSimulado.titulo,
        tema: post.sharedSimulado.tema,
        materia: post.sharedSimulado.materia,
        total_questoes: post.sharedSimulado.total_questoes,
        status: "em_andamento",
        acertos: 0,
      })
      .select()
      .single();

    if (newSimuladoError || !newSimulado) {
      toast.error("Erro ao criar cópia do simulado");
      return;
    }

    const { error: copyQuestionsError } = await supabase
      .from("questoes")
      .insert(
        sourceQuestions.map((question) => ({
          simulado_id: newSimulado.id,
          enunciado: question.enunciado,
          alternativas: question.alternativas,
          resposta_correta: question.resposta_correta,
          explicacao: question.explicacao,
          ordem: question.ordem,
          resposta_usuario: null,
        }))
      );

    if (copyQuestionsError) {
      toast.error("Erro ao copiar questões do simulado");
      return;
    }

    toast.success("Simulado adicionado à sua lista!");
    navigate(`/dashboard/simular/${newSimulado.id}`);
  };

  const deletePost = async (postId: string) => {
    if (!confirm("Deseja realmente excluir esta postagem?")) {
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("posts_mural")
      .delete()
      .eq("id", postId)
      .eq("user_id", user.id)
      .select("id");

    if (error) {
      toast.error("Erro ao excluir postagem");
      return;
    }

    if (!data || data.length === 0) {
      toast.error("A postagem não foi excluída no servidor");
      void loadPosts();
      return;
    }

    setPosts((current) => current.filter((post) => post.id !== postId));
    toast.success("Postagem excluída!");
  };

  const deleteComment = async (commentId: string) => {
    if (!confirm("Deseja realmente excluir este comentário?")) {
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("comentarios_mural")
      .delete()
      .eq("id", commentId)
      .eq("user_id", user.id)
      .select("id");

    if (error) {
      toast.error("Erro ao excluir comentário");
      return;
    }

    if (!data || data.length === 0) {
      toast.error("O comentário não foi excluído no servidor");
      void loadPosts();
      return;
    }

    void loadPosts();
    toast.success("Comentário excluído!");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${Math.max(diffMins, 1)}m atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    return `${diffDays}d atrás`;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="inline-flex rounded-full border-2 border-border bg-[#f7cf3d] px-4 py-2 text-xs font-black uppercase tracking-wide text-foreground shadow-soft">
          Comunidade em foco
        </div>
        <h1 className="text-3xl font-black uppercase md:text-4xl">Mural</h1>
        <p className="text-base font-semibold text-muted-foreground md:text-lg">
          Veja as conquistas dos seus amigos
        </p>
      </div>

      <Card className="rounded-[2rem] border-4 border-border bg-white shadow-medium">
        <CardHeader className="border-b-4 border-border bg-muted rounded-t-[1.7rem]">
          <CardTitle className="flex items-center gap-2 text-xl font-black uppercase md:text-2xl">
            <Users className="w-5 h-5 text-primary" />
            Compartilhe suas conquistas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-5 md:p-6">
          <Textarea
            placeholder="O que você está estudando hoje?"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            rows={3}
            className="rounded-[1.5rem] border-2 border-border bg-white px-4 py-3"
          />
          <Button onClick={createPost} className="w-full rounded-full border-2 border-border bg-primary text-primary-foreground font-black uppercase shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">
            Publicar
          </Button>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button
          variant={sortMode === "recentes" ? "default" : "outline"}
          onClick={() => setSortMode("recentes")}
          className="rounded-full border-2 border-border font-black uppercase shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
        >
          Mais recentes
        </Button>
        <Button
          variant={sortMode === "curtidos" ? "default" : "outline"}
          onClick={() => setSortMode("curtidos")}
          className="rounded-full border-2 border-border font-black uppercase shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
        >
          Mais curtidos
        </Button>
      </div>

      <div className="space-y-4">
        {!loading && sortedPosts.length === 0 ? (
          <Card className="rounded-[2rem] border-4 border-border bg-white shadow-medium">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Trophy className="mb-4 h-16 w-16 text-muted-foreground" />
              <p className="text-center font-semibold text-muted-foreground">
                Nenhum post ainda. Seja o primeiro a compartilhar!
              </p>
            </CardContent>
          </Card>
        ) : (
          sortedPosts.map((post) => (
            <Card key={post.id} className="rounded-[2rem] border-4 border-border bg-white shadow-medium">
              <CardHeader className="border-b-2 border-border/70">
                <div className="flex items-start gap-3">
                  <Avatar className="border-2 border-border">
                    {post.profiles.foto_url ? (
                      <img src={post.profiles.foto_url} alt={`${post.profiles.nome} ${post.profiles.sobrenome}`.trim()} className="h-full w-full object-cover" />
                    ) : (
                      <AvatarFallback className="bg-[#f7cf3d] font-black text-foreground">
                        {post.profiles.nome[0]}{post.profiles.sobrenome[0] || ""}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-black uppercase">
                      {post.profiles.nome} {post.profiles.sobrenome}
                    </p>
                    <p className="text-sm font-semibold text-muted-foreground">
                      {formatDate(post.created_at)}
                    </p>
                  </div>
                  {post.user_id === currentUserId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => void deletePost(post.id)}
                      className="rounded-full border-2 border-border bg-white font-black uppercase shadow-soft hover:bg-white hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="font-medium leading-relaxed">{post.conteudo}</p>

                {post.sharedSimulado && (
                  <Card className="rounded-[1.5rem] border-2 border-border bg-muted shadow-soft">
                    <CardContent className="space-y-3 p-4">
                      <div>
                        <p className="text-sm font-black uppercase text-muted-foreground">
                          {post.tipo === "resultado" ? "Resultado compartilhado" : "Simulado compartilhado"}
                        </p>
                        <h3 className="text-lg font-black uppercase">{post.sharedSimulado.titulo}</h3>
                        <p className="text-sm font-semibold text-muted-foreground">
                          {post.sharedSimulado.tema} • {post.sharedSimulado.materia} • {post.sharedSimulado.total_questoes} questões
                        </p>
                      </div>
                      <Button
                        onClick={() => void duplicateSharedSimulado(post)}
                        className="w-full rounded-full border-2 border-border bg-secondary font-black uppercase text-secondary-foreground shadow-soft sm:w-auto hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                      >
                        Testar simulado
                      </Button>
                    </CardContent>
                  </Card>
                )}

                <div className="flex flex-wrap items-center gap-3 border-t-2 border-border pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => void reactToPost(post)}
                    className="rounded-full border-2 border-border bg-white font-black uppercase shadow-soft hover:bg-white hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    {post.liked_by_current_user ? "Descurtir" : "Curtir"} ({post.reacoes_count})
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedComments((current) => ({ ...current, [post.id]: !current[post.id] }))}
                    className="rounded-full border-2 border-border bg-white font-black uppercase shadow-soft hover:bg-white hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Comentários ({post.comentarios_count})
                  </Button>
                </div>

                {expandedComments[post.id] && (
                  <div className="space-y-3 rounded-[1.5rem] border-2 border-border bg-muted p-4">
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Input
                        value={commentInputs[post.id] ?? ""}
                        onChange={(e) => setCommentInputs((current) => ({ ...current, [post.id]: e.target.value }))}
                        placeholder="Escreva um comentário"
                        className="rounded-full border-2 border-border bg-white"
                      />
                      <Button
                        onClick={() => void addComment(post.id)}
                        className="w-full rounded-full border-2 border-border bg-primary font-black uppercase text-primary-foreground shadow-soft sm:w-auto hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                      >
                        Enviar
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {post.comments.length === 0 ? (
                        <p className="text-sm font-semibold text-muted-foreground">
                          Nenhum comentário ainda.
                        </p>
                      ) : (
                        post.comments.map((comment) => (
                          <div key={comment.id} className="rounded-[1rem] border-2 border-border bg-white p-3">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <p className="font-black uppercase">
                                {comment.profile.nome} {comment.profile.sobrenome}
                              </p>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-muted-foreground">
                                  {formatDate(comment.created_at)}
                                </span>
                                {comment.user_id === currentUserId && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => void deleteComment(comment.id)}
                                    className="rounded-full border-2 border-border bg-white font-black uppercase shadow-soft hover:bg-white hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                            <p className="mt-2 text-sm font-medium">{comment.conteudo}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
