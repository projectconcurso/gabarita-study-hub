import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Friend {
  id: string;
  nome: string;
  sobrenome: string;
}

interface Message {
  id: string;
  mensagem: string;
  remetente_id: string;
  destinatario_id: string;
  created_at: string;
  lida: boolean;
}

export default function Chat() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");

  useEffect(() => {
    loadCurrentUser();
    loadFriends();
  }, []);

  useEffect(() => {
    if (selectedFriend) {
      loadMessages();
      
      // Realtime subscription
      const channel = supabase
        .channel('chat-messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'mensagens'
          },
          () => loadMessages()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedFriend]);

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
        profiles:profiles!amizades_amigo_id_fkey(id, nome, sobrenome)
      `)
      .eq("user_id", user.id)
      .eq("status", "aceito");

    if (!error && data) {
      const friendsList = data.map((item: any) => item.profiles).filter(Boolean);
      setFriends(friendsList);
    }
  };

  const loadMessages = async () => {
    if (!selectedFriend) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("mensagens")
      .select("*")
      .or(`and(remetente_id.eq.${user.id},destinatario_id.eq.${selectedFriend.id}),and(remetente_id.eq.${selectedFriend.id},destinatario_id.eq.${user.id})`)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setMessages(data);
      
      // Marcar mensagens como lidas
      await supabase
        .from("mensagens")
        .update({ lida: true })
        .eq("destinatario_id", user.id)
        .eq("remetente_id", selectedFriend.id)
        .eq("lida", false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedFriend) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("mensagens")
      .insert({
        remetente_id: user.id,
        destinatario_id: selectedFriend.id,
        mensagem: newMessage
      });

    if (error) {
      toast.error("Erro ao enviar mensagem");
    } else {
      setNewMessage("");
      loadMessages();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Chat</h1>
        <p className="text-muted-foreground mt-2">
          Converse com seus amigos em tempo real
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Lista de Amigos */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Conversas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              {friends.length === 0 ? (
                <p className="text-muted-foreground text-center p-4">
                  Nenhum amigo ainda
                </p>
              ) : (
                friends.map((friend) => (
                  <button
                    key={friend.id}
                    onClick={() => setSelectedFriend(friend)}
                    className={`w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors border-b ${
                      selectedFriend?.id === friend.id ? 'bg-muted' : ''
                    }`}
                  >
                    <Avatar>
                      <AvatarFallback>
                        {friend.nome[0]}{friend.sobrenome[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="font-medium">{friend.nome} {friend.sobrenome}</p>
                    </div>
                  </button>
                ))
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Área de Mensagens */}
        <Card className="md:col-span-2">
          {selectedFriend ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {selectedFriend.nome[0]}{selectedFriend.sobrenome[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{selectedFriend.nome} {selectedFriend.sobrenome}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px] p-4">
                  <div className="space-y-4">
                    {messages.map((msg) => {
                      const isFromMe = msg.remetente_id === currentUserId;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              isFromMe
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p>{msg.mensagem}</p>
                            <p className="text-xs mt-1 opacity-70">
                              {formatTime(msg.created_at)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Digite sua mensagem..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <Button onClick={sendMessage} className="bg-gradient-hero">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex flex-col items-center justify-center h-[500px]">
              <MessageCircle className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Selecione um amigo para conversar
              </p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
