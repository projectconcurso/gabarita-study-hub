import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, Send, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Friend {
  id: string;
  nome: string;
  sobrenome: string;
}

interface FriendshipRow {
  id: string;
  user_id: string;
  amigo_id: string;
}

const getOtherFriendId = (friendship: FriendshipRow, currentUserId: string) => {
  return friendship.user_id === currentUserId ? friendship.amigo_id : friendship.user_id;
};

const fetchFriendsMap = async (friendIds: string[]) => {
  if (friendIds.length === 0) {
    return new Map<string, Friend>();
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, nome, sobrenome")
    .in("id", friendIds);

  if (error) {
    throw error;
  }

  return new Map((data ?? []).map((friend) => [friend.id, friend]));
};

const dedupeFriends = (items: Friend[]) => {
  return Array.from(new Map(items.map((friend) => [friend.id, friend])).values());
};

interface Message {
  id: string;
  mensagem: string;
  remetente_id: string;
  destinatario_id: string;
  created_at: string;
  lida: boolean;
}

interface FriendWithLastMessage extends Friend {
  lastMessageTime?: string;
  lastMessagePreview?: string;
}

interface SharedSimuladoMessagePayload {
  type: "shared_simulado";
  shareMode: "simulado" | "resultado";
  simulado: {
    id: string;
    titulo: string;
    tema: string;
    materia: string;
    total_questoes: number;
    percentual_acerto: number | null;
  };
  text: string;
}

const parseSharedSimuladoMessage = (message: string): SharedSimuladoMessagePayload | null => {
  try {
    const parsed = JSON.parse(message) as SharedSimuladoMessagePayload;
    if (parsed?.type !== "shared_simulado" || !parsed?.simulado?.id || !parsed?.text) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

export default function Chat() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [friends, setFriends] = useState<FriendWithLastMessage[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (!currentUserId) return;

    void loadFriends(currentUserId);
    void loadUnreadCounts(currentUserId);

    const channel = supabase
      .channel("chat-friendships")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "amizades",
        },
        () => {
          void loadFriends(currentUserId);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId) return;

    const unreadChannel = supabase
      .channel(`chat-unread-${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "mensagens",
        },
        () => {
          void loadUnreadCounts(currentUserId);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(unreadChannel);
    };
  }, [currentUserId]);

  useEffect(() => {
    if (!selectedFriend || !currentUserId) return;

    void loadMessages(selectedFriend.id, currentUserId);

    const channel = supabase
      .channel(`chat-messages-${currentUserId}-${selectedFriend.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "mensagens"
        },
        (payload) => {
          const record = (payload.new || payload.old) as Message;
          const isCurrentConversation =
            (record.remetente_id === currentUserId && record.destinatario_id === selectedFriend.id) ||
            (record.remetente_id === selectedFriend.id && record.destinatario_id === currentUserId);

          if (isCurrentConversation) {
            void loadMessages(selectedFriend.id, currentUserId);
          } else {
            void loadUnreadCounts(currentUserId);
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [selectedFriend, currentUserId]);

  const loadCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setCurrentUserId(user.id);
  };

  const loadFriends = async (userId: string) => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("amizades")
      .select("id, user_id, amigo_id")
      .eq("status", "aceito")
      .or(`user_id.eq.${userId},amigo_id.eq.${userId}`);

    if (error) {
      console.error("Erro ao carregar amigos do chat:", error);
      return;
    }

    const friendships = (data ?? []) as FriendshipRow[];
    const otherFriendIds = Array.from(new Set(friendships.map((friendship) => getOtherFriendId(friendship, userId))));

    try {
      const friendsMap = await fetchFriendsMap(otherFriendIds);
      const friendsList = dedupeFriends(otherFriendIds
        .map((friendId) => friendsMap.get(friendId) ?? null)
        .filter((friend): friend is Friend => Boolean(friend)));

      // Buscar última mensagem de cada amigo
      const friendsWithLastMessage: FriendWithLastMessage[] = await Promise.all(
        friendsList.map(async (friend) => {
          const { data: lastMsg } = await supabase
            .from("mensagens")
            .select("mensagem, created_at")
            .or(`and(remetente_id.eq.${userId},destinatario_id.eq.${friend.id}),and(remetente_id.eq.${friend.id},destinatario_id.eq.${userId})`)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          return {
            ...friend,
            lastMessageTime: lastMsg ? (lastMsg as any).created_at : undefined,
            lastMessagePreview: lastMsg ? (lastMsg as any).mensagem : undefined,
          };
        })
      );

      // Ordenar por mensagem mais recente
      const sortedFriends = friendsWithLastMessage.sort((a, b) => {
        if (!a.lastMessageTime) return 1;
        if (!b.lastMessageTime) return -1;
        return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
      });

      setFriends(sortedFriends);

      const friendFromQuery = searchParams.get("friend");
      if (friendFromQuery) {
        const matchedFriend = friendsList.find((friend) => friend.id === friendFromQuery);
        if (matchedFriend) {
          setSelectedFriend(matchedFriend);
          return;
        }
      }

      if (friendsList.length > 0 && !selectedFriend) {
        setSelectedFriend(friendsList[0]);
      }

      if (selectedFriend && !friendsList.some((friend) => friend.id === selectedFriend.id)) {
        setSelectedFriend(friendsList[0] ?? null);
      }
    } catch (profileError) {
      console.error("Erro ao resolver perfis do chat:", profileError);
    }
  };

  const loadMessages = async (friendId = selectedFriend?.id, userId = currentUserId) => {
    if (!friendId || !userId) return;

    const { data, error } = await supabase
      .from("mensagens")
      .select("*")
      .or(`and(remetente_id.eq.${userId},destinatario_id.eq.${friendId}),and(remetente_id.eq.${friendId},destinatario_id.eq.${userId})`)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setMessages(data);
      
      const { error: markAsReadError } = await (supabase
        .from("mensagens") as any)
        .update({ lida: true })
        .eq("destinatario_id", userId)
        .eq("remetente_id", friendId)
        .eq("lida", false);

      await loadUnreadCounts(userId);
    }
  };

  const loadUnreadCounts = async (userId = currentUserId) => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("mensagens")
      .select("remetente_id")
      .eq("destinatario_id", userId)
      .eq("lida", false);

    if (error) return;

    const counts = (data ?? []).reduce<Record<string, number>>((acc, message) => {
      acc[message.remetente_id] = (acc[message.remetente_id] ?? 0) + 1;
      return acc;
    }, {});

    setUnreadCounts(counts);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedFriend) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await (supabase
      .from("mensagens") as any)
      .insert({
        remetente_id: user.id,
        destinatario_id: selectedFriend.id,
        mensagem: newMessage.trim(),
      });

    if (error) {
      toast.error("Erro ao enviar mensagem");
    } else {
      setNewMessage("");
      void loadMessages(selectedFriend.id, user.id);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoje';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ontem';
    } else {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    }
  };

  const shouldShowDateSeparator = (currentMsg: Message, prevMsg: Message | undefined) => {
    if (!prevMsg) return true;
    const currentDate = new Date(currentMsg.created_at).toDateString();
    const prevDate = new Date(prevMsg.created_at).toDateString();
    return currentDate !== prevDate;
  };

  const selectedFriendUnreadCount = selectedFriend ? unreadCounts[selectedFriend.id] ?? 0 : 0;

  const duplicateSharedSimuladoFromChat = async (payload: SharedSimuladoMessagePayload) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Calcular custo em gabaritos (2 gabaritos por questão)
    const custoGabaritos = payload.simulado.total_questoes * 2;

    // Verificar saldo de gabaritos
    const { data: userGabaritos } = await supabase
      .from('user_gabaritos')
      .select('gabaritos')
      .eq('user_id', user.id)
      .single();

    const saldoAtual = userGabaritos && typeof (userGabaritos as any).gabaritos === 'number' 
      ? (userGabaritos as any).gabaritos 
      : 0;

    if (saldoAtual < custoGabaritos) {
      toast.error(`Gabaritos insuficientes. Necessário: ${custoGabaritos}, Disponível: ${saldoAtual}`);
      return;
    }

    const shouldDuplicate = window.confirm(
      `Deseja adicionar este simulado à sua lista?\n\n` +
      `Custo: ${custoGabaritos} Gabaritos (${payload.simulado.total_questoes} questões × 2)\n` +
      `Saldo atual: ${saldoAtual} Gabaritos`
    );
    if (!shouldDuplicate) {
      return;
    }

    const { data: existingQuestions, error: questionsError } = await supabase
      .from("questoes")
      .select("enunciado, alternativas, resposta_correta, explicacao, ordem")
      .eq("simulado_id", payload.simulado.id)
      .order("ordem", { ascending: true });

    if (questionsError || !existingQuestions || existingQuestions.length === 0) {
      toast.error("Não foi possível copiar este simulado");
      return;
    }

    const { data: newSimulado, error: simuladoError } = await (supabase
      .from("simulados") as any)
      .insert({
        user_id: user.id,
        titulo: payload.simulado.titulo,
        tema: payload.simulado.tema,
        materia: payload.simulado.materia,
        total_questoes: payload.simulado.total_questoes,
        status: "em_andamento",
        acertos: 0,
      })
      .select("id")
      .single();

    if (simuladoError || !newSimulado) {
      toast.error("Erro ao salvar o simulado compartilhado");
      return;
    }

    const questionsToInsert = (existingQuestions as any[]).map((question) => ({
      simulado_id: (newSimulado as any).id,
      enunciado: question.enunciado,
      alternativas: question.alternativas,
      resposta_correta: question.resposta_correta,
      explicacao: question.explicacao,
      ordem: question.ordem,
    }));

    const { error: insertQuestionsError } = await (supabase
      .from("questoes") as any)
      .insert(questionsToInsert);

    if (insertQuestionsError) {
      toast.error("Erro ao copiar questões do simulado");
      return;
    }

    // Descontar gabaritos após sucesso
    const { error: deductError } = await (supabase as any).rpc('deduct_gabaritos_manual', {
      p_user_id: user.id,
      p_simulado_id: (newSimulado as any).id,
      p_total_questoes: payload.simulado.total_questoes
    });

    if (deductError) {
      console.error('Erro ao descontar gabaritos:', deductError);
      toast.warning('Simulado adicionado, mas houve erro ao descontar gabaritos');
    } else {
      toast.success(`Simulado salvo na sua lista! (${custoGabaritos} Gabaritos descontados)`);
    }

    navigate(`/dashboard/simular/${(newSimulado as any).id}`);
  };

  const handleSelectFriend = (friend: Friend) => {
    setSelectedFriend(friend);
    setShowChat(true);
  };

  const handleBackToContacts = () => {
    setShowChat(false);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="inline-flex rounded-full border-2 border-border bg-[#f7cf3d] px-4 py-2 text-xs font-black uppercase tracking-wide text-foreground shadow-soft">
          Conversa em tempo real
        </div>
        <h1 className="text-3xl font-black uppercase md:text-4xl">Chat</h1>
        <p className="text-base font-semibold text-muted-foreground md:text-lg">
          Converse com seus amigos em tempo real
        </p>
      </div>

      <Card className="overflow-hidden rounded-[2rem] border-4 border-border bg-white shadow-medium h-[calc(100svh-15rem)]">
        {!showChat ? (
          <>
            <CardHeader className="border-b-4 border-border bg-muted rounded-t-[1.7rem]">
              <CardTitle className="flex items-center gap-2 text-xl font-black uppercase md:text-2xl">
                <MessageCircle className="w-5 h-5" />
                Conversas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-[calc(100%-5.5rem)]">
              <ScrollArea className="h-full">
                {friends.length === 0 ? (
                  <p className="text-muted-foreground text-center p-4 font-semibold">
                    Nenhum amigo ainda
                  </p>
                ) : (
                  friends.map((friend) => (
                    <button
                      key={friend.id}
                      onClick={() => handleSelectFriend(friend)}
                      className="w-full p-4 flex items-center gap-3 transition-all border-b-2 border-border bg-white hover:bg-muted/50"
                    >
                      <Avatar className="border-2 border-border">
                        <AvatarFallback className="bg-[#f7cf3d] font-black text-foreground">
                          {friend.nome[0]}{friend.sobrenome[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1 text-left">
                        <p className="font-black uppercase">{friend.nome} {friend.sobrenome}</p>
                      </div>
                      {(unreadCounts[friend.id] ?? 0) > 0 && (
                        <span className="inline-flex min-w-7 items-center justify-center rounded-full border-2 border-border bg-primary px-2 py-1 text-xs font-black text-primary-foreground shadow-soft">
                          {unreadCounts[friend.id]}
                        </span>
                      )}
                    </button>
                  ))
                )}
              </ScrollArea>
            </CardContent>
          </>
        ) : selectedFriend ? (
            <>
              <CardHeader className="border-b-4 border-border bg-muted rounded-t-[1.7rem]">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleBackToContacts}
                    className="h-10 w-10 shrink-0 rounded-full border-2 border-border bg-white text-foreground hover:bg-muted hover:text-foreground"
                  >
                    <ArrowLeft className="h-5 w-5 text-foreground" />
                  </Button>
                  <Avatar className="border-2 border-border">
                    <AvatarFallback className="bg-accent font-black text-accent-foreground">
                      {selectedFriend.nome[0]}{selectedFriend.sobrenome[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-black uppercase">{selectedFriend.nome} {selectedFriend.sobrenome}</p>
                  </div>
                  {selectedFriendUnreadCount > 0 && (
                    <span className="inline-flex min-w-7 items-center justify-center rounded-full border-2 border-border bg-primary px-2 py-1 text-xs font-black text-primary-foreground shadow-soft">
                      {selectedFriendUnreadCount}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex flex-col p-0 h-[calc(100%-5.5rem)]">
                <ScrollArea className="h-full p-4">
                  <div className="space-y-4">
                    {messages.map((msg, index) => {
                      const prevMsg = index > 0 ? messages[index - 1] : undefined;
                      const showDateSeparator = shouldShowDateSeparator(msg, prevMsg);
                      const isFromMe = msg.remetente_id === currentUserId;
                      const sharedSimuladoPayload = parseSharedSimuladoMessage(msg.mensagem);
                      return (
                        <>
                          {showDateSeparator && (
                            <div className="flex justify-center my-4">
                              <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                                {formatDate(msg.created_at)}
                              </span>
                            </div>
                          )}
                          <div
                            key={msg.id}
                            className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}
                          >
                          <div
                            className={`max-w-[85%] rounded-[1.2rem] border-2 border-border p-3 font-semibold shadow-soft md:max-w-[70%] ${
                              isFromMe
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-white'
                            }`}
                          >
                            {sharedSimuladoPayload ? (
                              <div className="space-y-3">
                                <p>{sharedSimuladoPayload.text}</p>
                                <Card className={`rounded-[1.2rem] border-2 border-border shadow-soft ${
                                  isFromMe ? "bg-primary-foreground/10" : "bg-muted"
                                }`}>
                                  <CardContent className="space-y-3 p-4">
                                    <div>
                                      <p className={`text-sm font-black uppercase ${
                                        isFromMe ? "text-primary-foreground/80" : "text-muted-foreground"
                                      }`}>
                                        {sharedSimuladoPayload.shareMode === "resultado" ? "Resultado compartilhado" : "Simulado compartilhado"}
                                      </p>
                                      <h3 className="text-lg font-black uppercase">
                                        {sharedSimuladoPayload.simulado.titulo}
                                      </h3>
                                      <p className={`text-sm font-semibold ${
                                        isFromMe ? "text-primary-foreground/80" : "text-muted-foreground"
                                      }`}>
                                        {sharedSimuladoPayload.simulado.tema} • {sharedSimuladoPayload.simulado.materia} • {sharedSimuladoPayload.simulado.total_questoes} questões
                                      </p>
                                    </div>
                                    <Button
                                      type="button"
                                      onClick={() => void duplicateSharedSimuladoFromChat(sharedSimuladoPayload)}
                                      className="w-full rounded-full border-2 border-border bg-secondary font-black uppercase text-secondary-foreground shadow-soft sm:w-auto hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                                    >
                                      Testar simulado
                                    </Button>
                                  </CardContent>
                                </Card>
                              </div>
                            ) : (
                              <p>{msg.mensagem}</p>
                            )}
                            <p className="text-xs mt-1 opacity-70">
                              {formatTime(msg.created_at)}
                            </p>
                          </div>
                          </div>
                        </>
                      );
                    })}
                  </div>
                </ScrollArea>
                <div className="border-t-4 border-border bg-white p-4">
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                      placeholder="Digite sua mensagem..."
                      className="h-12 min-w-0 flex-1 rounded-2xl border-2 border-border bg-white"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <Button onClick={sendMessage} className="h-12 w-full shrink-0 rounded-full border-2 border-border bg-primary text-primary-foreground font-black uppercase shadow-soft sm:w-auto hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex h-full flex-col items-center justify-center">
              <MessageCircle className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground font-semibold">
                Selecione um amigo para conversar
              </p>
            </CardContent>
          )}
      </Card>
    </div>
  );
}
