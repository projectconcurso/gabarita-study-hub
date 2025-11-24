import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Brain, Heart, MessageCircle, Trophy } from "lucide-react";
import { toast } from "sonner";

interface Post {
  id: string;
  conteudo: string;
  tipo: string;
  created_at: string;
  user_id: string;
  profiles: {
    nome: string;
    sobrenome: string;
  };
  reacoes_count?: number;
  comentarios_count?: number;
}

export default function Mural() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState("");

  useEffect(() => {
    loadPosts();
    
    // Realtime subscription
    const channel = supabase
      .channel('mural-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts_mural'
        },
        () => loadPosts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadPosts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("posts_mural")
      .select(`
        id,
        conteudo,
        tipo,
        created_at,
        user_id,
        profiles:profiles!posts_mural_user_id_fkey(nome, sobrenome)
      `)
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error && data) {
      setPosts(data as any);
    }
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
        tipo: "texto"
      });

    if (error) {
      toast.error("Erro ao criar post");
    } else {
      toast.success("Post publicado!");
      setNewPost("");
      loadPosts();
    }
  };

  const reactToPost = async (postId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("reacoes_mural")
      .insert({
        post_id: postId,
        user_id: user.id,
        tipo: "like"
      });

    if (error) {
      if (error.code === '23505') {
        toast.info("Você já reagiu a este post");
      } else {
        toast.error("Erro ao reagir");
      }
    } else {
      toast.success("Reação adicionada!");
      loadPosts();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    return `${diffDays}d atrás`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mural</h1>
        <p className="text-muted-foreground mt-2">
          Veja as conquistas dos seus amigos
        </p>
      </div>

      {/* Criar Post */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Compartilhe suas conquistas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder="O que você está estudando hoje?"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            rows={3}
          />
          <Button onClick={createPost} className="w-full bg-gradient-hero">
            Publicar
          </Button>
        </CardContent>
      </Card>

      {/* Feed */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Trophy className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                Nenhum post ainda. Seja o primeiro a compartilhar!
              </p>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {post.profiles.nome[0]}{post.profiles.sobrenome[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">
                      {post.profiles.nome} {post.profiles.sobrenome}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(post.created_at)}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>{post.conteudo}</p>
                <div className="flex items-center gap-4 pt-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => reactToPost(post.id)}
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Curtir
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Comentar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
