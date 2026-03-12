import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  foto_url: string | null;
  cargo_desejado: string | null;
  cidade?: string | null;
  estado?: string | null;
  email?: string | null;
}

interface Friendship {
  id: string;
  status: string;
  amigo_id: string;
  user_id: string;
}

interface ResolvedFriendship {
  id: string;
  status: string;
  amigo_id: string;
  user_id: string;
  profile: Profile;
}

const dedupeResolvedFriendships = (items: ResolvedFriendship[]) => {
  const uniqueByProfile = new Map<string, ResolvedFriendship>();

  items.forEach((item) => {
    const existing = uniqueByProfile.get(item.profile.id);
    if (!existing || item.status === "aceito") {
      uniqueByProfile.set(item.profile.id, item);
    }
  });

  return Array.from(uniqueByProfile.values());
};

const getOtherProfile = (friendship: Friendship, currentUserId: string) => {
  return friendship.user_id === currentUserId ? friendship.amigo_id : friendship.user_id;
};

const fetchProfilesMap = async (profileIds: string[]) => {
  if (profileIds.length === 0) {
    return new Map<string, Profile>();
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, nome, sobrenome, foto_url, cargo_desejado")
    .in("id", profileIds);

  if (error) {
    throw error;
  }

  return new Map((data ?? []).map((profile) => [profile.id, profile]));
};

const getProfileDisplayEmail = (profile: Profile) => profile.email ?? "";
const normalizeSearchValue = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export default function Amigos() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [friends, setFriends] = useState<ResolvedFriendship[]>([]);
  const [pendingRequests, setPendingRequests] = useState<ResolvedFriendship[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (!currentUserId) return;

    void loadFriends(currentUserId);
    void loadPendingRequests(currentUserId);

    const channel = supabase
      .channel("amizades-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "amizades",
        },
        () => {
          void loadFriends(currentUserId);
          void loadPendingRequests(currentUserId);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  const loadCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setCurrentUserId(user.id);
  };

  const loadFriends = async (userId: string) => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("amizades")
      .select("id, status, amigo_id, user_id")
      .eq("status", "aceito")
      .or(`user_id.eq.${userId},amigo_id.eq.${userId}`);

    if (error) {
      console.error("Erro ao carregar amigos:", error);
      return;
    }

    const friendships = (data ?? []) as Friendship[];
    const otherUserIds = Array.from(new Set(friendships.map((friendship) => getOtherProfile(friendship, userId))));

    try {
      const profilesMap = await fetchProfilesMap(otherUserIds);
      const resolvedFriends = friendships
        .map((friendship) => {
          const otherUserId = getOtherProfile(friendship, userId);
          const profile = profilesMap.get(otherUserId);
          if (!profile) return null;

          return {
            id: friendship.id,
            status: friendship.status,
            amigo_id: friendship.amigo_id,
            user_id: friendship.user_id,
            profile,
          } satisfies ResolvedFriendship;
        })
        .filter((friendship): friendship is ResolvedFriendship => Boolean(friendship));

      setFriends(dedupeResolvedFriendships(resolvedFriends));
    } catch (profileError) {
      console.error("Erro ao resolver perfis de amigos:", profileError);
    }
  };

  const loadPendingRequests = async (userId: string) => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("amizades")
      .select("id, status, amigo_id, user_id")
      .eq("amigo_id", userId)
      .eq("status", "pendente");

    if (error) {
      console.error("Erro ao carregar solicitações pendentes:", error);
      return;
    }

    const friendships = (data ?? []) as Friendship[];
    const requesterIds = Array.from(new Set(friendships.map((friendship) => friendship.user_id)));

    try {
      const profilesMap = await fetchProfilesMap(requesterIds);
      const resolvedRequests = friendships
        .map((friendship) => {
          const profile = profilesMap.get(friendship.user_id);
          if (!profile) return null;

          return {
            id: friendship.id,
            status: friendship.status,
            amigo_id: friendship.amigo_id,
            user_id: friendship.user_id,
            profile,
          } satisfies ResolvedFriendship;
        })
        .filter((friendship): friendship is ResolvedFriendship => Boolean(friendship));

      setPendingRequests(dedupeResolvedFriendships(resolvedRequests));
    } catch (profileError) {
      console.error("Erro ao resolver perfis das solicitações:", profileError);
    }
  };

  const searchUsers = async () => {
    const normalizedSearch = searchTerm.trim();
    if (!normalizedSearch) {
      setSearchResults([]);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const relatedUserIds = new Set<string>([
      ...friends.map((friend) => friend.profile.id),
      ...pendingRequests.map((request) => request.user_id),
      ...pendingRequests.map((request) => request.amigo_id),
    ]);

    const searchTokens = normalizedSearch
      .split(/\s+/)
      .map((token) => token.trim())
      .filter(Boolean);

    const uniqueTokens = Array.from(new Set(searchTokens));
    const searchClauses = uniqueTokens.flatMap((token) => [
      `nome.ilike.%${token}%`,
      `sobrenome.ilike.%${token}%`,
      `cidade.ilike.%${token}%`,
      `estado.ilike.%${token}%`,
    ]);

    const { data, error } = await supabase
      .from("profiles")
      .select("id, nome, sobrenome, foto_url, cargo_desejado, cidade, estado")
      .neq("id", user.id)
      .or(searchClauses.join(","))
      .limit(30);

    if (error) {
      console.error("Erro ao buscar usuários:", error);
      toast.error("Erro ao buscar usuários");
      setSearchResults([]);
      return;
    }

    const normalizedFullSearch = normalizeSearchValue(normalizedSearch);
    const availableUsers = (data ?? [])
      .filter((profile) => !relatedUserIds.has(profile.id))
      .filter((profile) => {
        const searchableText = normalizeSearchValue(
          [profile.nome, profile.sobrenome, profile.cidade ?? "", profile.estado ?? ""].join(" ")
        );
        return searchableText.includes(normalizedFullSearch);
      });

    setSearchResults(availableUsers);

    if (availableUsers.length === 0) {
      toast.info("Nenhum usuário disponível encontrado para adicionar");
    }
  };

  const sendFriendRequest = async (amigoId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const existingFriend = friends.some((friend) => friend.profile.id === amigoId);

    if (existingFriend) {
      toast.error("Esse usuário já está na sua lista de amigos");
      return;
    }

    const { data: existingFriendships, error: existingFriendshipsError } = await supabase
      .from("amizades")
      .select("id, status, user_id, amigo_id")
      .or(`and(user_id.eq.${user.id},amigo_id.eq.${amigoId}),and(user_id.eq.${amigoId},amigo_id.eq.${user.id})`);

    if (existingFriendshipsError) {
      console.error("Erro ao verificar amizade existente:", existingFriendshipsError);
      toast.error("Erro ao verificar amizade existente");
      return;
    }

    const friendships = (existingFriendships ?? []) as Friendship[];
    const acceptedFriendship = friendships.find((friendship) => friendship.status === "aceito");

    if (acceptedFriendship) {
      toast.error("Esse usuário já está na sua lista de amigos");
      void loadFriends(user.id);
      return;
    }

    const reversePendingRequest = friendships.find(
      (friendship) => friendship.status === "pendente" && friendship.user_id === amigoId && friendship.amigo_id === user.id
    );

    if (reversePendingRequest) {
      const { error: acceptError } = await supabase
        .from("amizades")
        .update({ status: "aceito" })
        .eq("id", reversePendingRequest.id);

      if (acceptError) {
        console.error("Erro ao aceitar solicitação reversa:", acceptError);
        toast.error("Erro ao concluir amizade");
        return;
      }

      toast.success("Vocês agora são amigos!");
      setSearchResults([]);
      setSearchTerm("");
      void loadFriends(user.id);
      void loadPendingRequests(user.id);
      return;
    }

    const sentPendingRequest = friendships.find(
      (friendship) => friendship.status === "pendente" && friendship.user_id === user.id && friendship.amigo_id === amigoId
    );

    if (sentPendingRequest) {
      toast.error("Você já enviou uma solicitação para esse usuário");
      return;
    }

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
      void loadFriends(user.id);
      void loadPendingRequests(user.id);
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
      void loadFriends(currentUserId);
      void loadPendingRequests(currentUserId);
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
      void loadPendingRequests(currentUserId);
    }
  };

  const removeFriend = async (friendshipId: string) => {
    const shouldRemove = window.confirm("Deseja realmente desfazer esta amizade?");
    if (!shouldRemove) {
      return;
    }

    const { data, error } = await supabase
      .from("amizades")
      .delete()
      .eq("id", friendshipId)
      .select("id");

    if (error) {
      toast.error("Erro ao desfazer amizade");
      return;
    }

    if (!data || data.length === 0) {
      toast.error("A amizade não foi removida no servidor");
      void loadFriends(currentUserId);
      void loadPendingRequests(currentUserId);
      return;
    }

    toast.success("Amizade desfeita");
    void loadFriends(currentUserId);
    void loadPendingRequests(currentUserId);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="inline-flex rounded-full border-2 border-border bg-[#f7cf3d] px-4 py-2 text-xs font-black uppercase tracking-wide text-foreground shadow-soft">
          Rede de apoio
        </div>
        <h1 className="text-3xl font-black uppercase md:text-4xl">Amigos</h1>
        <p className="text-base font-semibold text-muted-foreground md:text-lg">
          Conecte-se com outros estudantes
        </p>
      </div>

      {/* Busca */}
      <Card className="rounded-[2rem] border-4 border-border bg-white shadow-medium">
        <CardHeader className="border-b-4 border-border bg-muted rounded-t-[1.7rem]">
          <CardTitle className="flex items-center gap-2 text-xl font-black uppercase md:text-2xl">
            <Search className="w-5 h-5" />
            Buscar Usuários
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-5 md:p-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              placeholder="Buscar por nome, sobrenome, cidade ou estado..."
              className="h-12 rounded-2xl border-2 border-border bg-white px-4"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && void searchUsers()}
            />
            <Button onClick={() => void searchUsers()} className="h-12 rounded-full border-2 border-border bg-primary text-primary-foreground font-black uppercase shadow-soft sm:w-auto hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">
              <Search className="w-4 h-4" />
            </Button>
          </div>
          {searchResults.length > 0 && (
            <div className="mt-4 space-y-2">
              {searchResults.map((profile) => (
                <div key={profile.id} className="flex flex-col gap-3 rounded-[1.2rem] border-2 border-border bg-white p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="border-2 border-border">
                      {profile.foto_url ? (
                        <img src={profile.foto_url} alt={`${profile.nome} ${profile.sobrenome}`} className="h-full w-full object-cover" />
                      ) : (
                        <AvatarFallback className="bg-[#f7cf3d] font-black text-foreground">{profile.nome[0]}{profile.sobrenome[0]}</AvatarFallback>
                      )}
                    </Avatar>
                    <div className="min-w-0">
                      <button
                        type="button"
                        onClick={() => navigate(`/dashboard/amigos/${profile.id}`)}
                        className="text-left font-black uppercase hover:underline"
                      >
                        {profile.nome} {profile.sobrenome}
                      </button>
                      {profile.cargo_desejado && (
                        <p className="text-sm font-semibold text-muted-foreground">{profile.cargo_desejado}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => sendFriendRequest(profile.id)}
                    className="w-full rounded-full border-2 border-border bg-secondary text-secondary-foreground font-black uppercase shadow-soft sm:w-auto hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              ))}
            </div>
          )}
          {searchTerm.trim() && searchResults.length === 0 && (
            <p className="mt-4 text-sm font-semibold text-muted-foreground">
              Nenhum usuário disponível encontrado com esse termo.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Solicitações Pendentes */}
      {pendingRequests.length > 0 && (
        <Card className="rounded-[2rem] border-4 border-border bg-white shadow-medium">
          <CardHeader>
            <CardTitle className="font-black uppercase">Solicitações Pendentes</CardTitle>
            <CardDescription className="font-semibold text-muted-foreground">{pendingRequests.length} solicitação(ões) aguardando</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingRequests.map((request) => (
              <div key={request.id} className="flex flex-col gap-3 rounded-[1.2rem] border-2 border-border bg-white p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar className="border-2 border-border">
                    {request.profile.foto_url ? (
                      <img src={request.profile.foto_url} alt={`${request.profile.nome} ${request.profile.sobrenome}`} className="h-full w-full object-cover" />
                    ) : (
                      <AvatarFallback className="bg-accent font-black text-accent-foreground">
                        {request.profile.nome[0]}{request.profile.sobrenome[0]}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="min-w-0">
                    <button
                      type="button"
                      onClick={() => navigate(`/dashboard/amigos/${request.profile.id}`)}
                      className="text-left font-black uppercase hover:underline"
                    >
                      {request.profile.nome} {request.profile.sobrenome}
                    </button>
                    {request.profile.cargo_desejado && (
                      <p className="text-sm font-semibold text-muted-foreground">{request.profile.cargo_desejado}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:flex">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full rounded-full border-2 border-border bg-white font-black uppercase shadow-soft sm:w-auto hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                    onClick={() => acceptRequest(request.id)}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Aceitar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full rounded-full border-2 border-border bg-white font-black uppercase text-destructive shadow-soft sm:w-auto hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
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
      <Card className="rounded-[2rem] border-4 border-border bg-white shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-black uppercase md:text-2xl">
            <Users className="w-5 h-5 text-secondary" />
            Meus Amigos ({friends.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 md:p-6">
          {friends.length === 0 ? (
            <p className="text-muted-foreground text-center py-8 font-semibold">
              Você ainda não tem amigos. Use a busca acima para encontrar outros estudantes!
            </p>
          ) : (
            <div className="grid gap-3">
              {friends.map((friend) => {
                const profile = friend.profile;
                return (
                  <div key={friend.id} className="flex flex-col gap-4 rounded-[1.2rem] border-2 border-border bg-white p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar className="h-14 w-14 border-2 border-border">
                        {profile.foto_url ? (
                          <img src={profile.foto_url} alt={`${profile.nome} ${profile.sobrenome}`} className="h-full w-full object-cover" />
                        ) : (
                          <AvatarFallback className="bg-secondary font-black text-secondary-foreground">{profile.nome[0]}{profile.sobrenome[0]}</AvatarFallback>
                        )}
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => navigate(`/dashboard/amigos/${profile.id}`)}
                          className="text-left font-black uppercase hover:underline"
                        >
                          {profile.nome} {profile.sobrenome}
                        </button>
                        {profile.cargo_desejado && (
                          <p className="text-sm font-semibold text-muted-foreground">{profile.cargo_desejado}</p>
                        )}
                        {getProfileDisplayEmail(profile) && (
                          <p className="truncate text-sm font-semibold text-muted-foreground">{getProfileDisplayEmail(profile)}</p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full rounded-full border-2 border-border bg-white font-black uppercase shadow-soft sm:w-auto hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                        onClick={() => navigate(`/dashboard/chat?friend=${profile.id}`)}
                      >
                        Chat
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full rounded-full border-2 border-border bg-white font-black uppercase text-destructive shadow-soft sm:w-auto hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                        onClick={() => void removeFriend(friend.id)}
                      >
                        Desfazer amizade
                      </Button>
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
