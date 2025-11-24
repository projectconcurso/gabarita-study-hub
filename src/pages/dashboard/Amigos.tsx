import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, UserPlus, Check, X, Search } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Profile {
  id: string;
  nome: string;
  sobrenome: string;
  cargo_desejado: string | null;
}

interface Friendship {
  id: string;
  status: string;
  amigo_id: string;
  user_id: string;
  profiles: Profile;
}

export default function Amigos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friendship[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    loadCurrentUser();
    loadFriends();
    loadPendingRequests();
  }, []);

  const loadCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setCurrentUserId(user.id);
  };

  const loadFriends = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("amizades")
      .select(`
        id,
        status,
        amigo_id,
        user_id,
        profiles:profiles!amizades_amigo_id_fkey(id, nome, sobrenome, cargo_desejado)
      `)
      .eq("status", "aceito")
      .or(`user_id.eq.${user.id},amigo_id.eq.${user.id}`);

    if (!error && data) {
      setFriends(data as any);
    }
  };

  const loadPendingRequests = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("amizades")
      .select(`
        id,
        status,
        amigo_id,
        user_id,
        profiles:profiles!amizades_user_id_fkey(id, nome, sobrenome, cargo_desejado)
      `)
      .eq("amigo_id", user.id)
      .eq("status", "pendente");

    if (!error && data) {
      setPendingRequests(data as any);
    }
  };

  const searchUsers = async () => {
    if (!searchTerm.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("id, nome, sobrenome, cargo_desejado")
      .neq("id", user.id)
      .or(`nome.ilike.%${searchTerm}%,sobrenome.ilike.%${searchTerm}%,cargo_desejado.ilike.%${searchTerm}%`)
      .limit(10);

    if (!error && data) {
      setSearchResults(data);
    }
  };

  const sendFriendRequest = async (amigoId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("amizades")
      .insert({
        user_id: user.id,
        amigo_id: amigoId,
        status: "pendente"
      });

    if (error) {
      toast.error("Erro ao enviar solicitação");
    } else {
      toast.success("Solicitação enviada!");
      setSearchResults([]);
      setSearchTerm("");
    }
  };

  const acceptRequest = async (requestId: string) => {
    const { error } = await supabase
      .from("amizades")
      .update({ status: "aceito" })
      .eq("id", requestId);

    if (error) {
      toast.error("Erro ao aceitar solicitação");
    } else {
      toast.success("Amizade aceita!");
      loadFriends();
      loadPendingRequests();
    }
  };

  const rejectRequest = async (requestId: string) => {
    const { error } = await supabase
      .from("amizades")
      .update({ status: "rejeitado" })
      .eq("id", requestId);

    if (error) {
      toast.error("Erro ao rejeitar solicitação");
    } else {
      toast.success("Solicitação rejeitada");
      loadPendingRequests();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Amigos</h1>
        <p className="text-muted-foreground mt-2">
          Conecte-se com outros estudantes
        </p>
      </div>

      {/* Busca */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Buscar Usuários
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Busque por nome ou cargo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
            />
            <Button onClick={searchUsers} className="bg-gradient-success">
              <Search className="w-4 h-4" />
            </Button>
          </div>
          {searchResults.length > 0 && (
            <div className="mt-4 space-y-2">
              {searchResults.map((profile) => (
                <div key={profile.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{profile.nome[0]}{profile.sobrenome[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{profile.nome} {profile.sobrenome}</p>
                      {profile.cargo_desejado && (
                        <p className="text-sm text-muted-foreground">{profile.cargo_desejado}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => sendFriendRequest(profile.id)}
                    className="bg-gradient-success"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Solicitações Pendentes */}
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Solicitações Pendentes</CardTitle>
            <CardDescription>{pendingRequests.length} solicitação(ões) aguardando</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {request.profiles.nome[0]}{request.profiles.sobrenome[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{request.profiles.nome} {request.profiles.sobrenome}</p>
                    {request.profiles.cargo_desejado && (
                      <p className="text-sm text-muted-foreground">{request.profiles.cargo_desejado}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => acceptRequest(request.id)}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Aceitar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => rejectRequest(request.id)}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Recusar
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Lista de Amigos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-secondary" />
            Meus Amigos ({friends.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {friends.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Você ainda não tem amigos. Use a busca acima para encontrar outros estudantes!
            </p>
          ) : (
            <div className="space-y-2">
              {friends.map((friend) => {
                const profile = friend.profiles;
                return (
                  <div key={friend.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <Avatar>
                      <AvatarFallback>{profile.nome[0]}{profile.sobrenome[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{profile.nome} {profile.sobrenome}</p>
                      {profile.cargo_desejado && (
                        <p className="text-sm text-muted-foreground">{profile.cargo_desejado}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
