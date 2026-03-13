import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, FileText, Users, MessageCircle, User, LogOut, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { FocaLogo } from "@/components/FocaMascot";

interface SidebarProfile {
  nome: string | null;
  sobrenome: string | null;
  foto_url: string | null;
}

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<SidebarProfile | null>(null);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  
  const menuItems = [
    { path: "/dashboard", icon: Home, label: "Início" },
    { path: "/dashboard/simulados", icon: FileText, label: "Simulados" },
    { path: "/dashboard/mural", icon: Sparkles, label: "Mural" },
    { path: "/dashboard/amigos", icon: Users, label: "Amigos" },
    { path: "/dashboard/chat", icon: MessageCircle, label: "Chat" },
    { path: "/dashboard/perfil", icon: User, label: "Perfil" },
  ];

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Erro ao sair");
    } else {
      toast.success("Logout realizado!");
      navigate("/");
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("nome, sobrenome, foto_url")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(data);
      }
    };

    void loadProfile();
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadChatUnreadCount = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { count, error } = await supabase
        .from("mensagens")
        .select("id", { count: "exact", head: true })
        .eq("destinatario_id", user.id)
        .eq("lida", false);

      if (error || !mounted) {
        return;
      }

      setChatUnreadCount(count ?? 0);
    };

    void loadChatUnreadCount();

    const channel = supabase
      .channel("sidebar-chat-unread")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "mensagens",
        },
        () => {
          void loadChatUnreadCount();
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      void supabase.removeChannel(channel);
    };
  }, []);

  return (
    <>
      <div className="sticky top-0 z-30 flex items-center justify-between border-b-4 border-border bg-[#f7cf3d] px-4 py-3 lg:hidden">
        <Link to="/dashboard" className="min-w-0">
          <FocaLogo />
        </Link>
        <Button
          type="button"
          variant="outline"
          className="h-11 rounded-full border-2 border-border bg-white px-4 font-black uppercase shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </div>

      <aside className="hidden shrink-0 lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-72 lg:flex-col lg:overflow-hidden lg:border-r-4 lg:border-border lg:bg-sidebar">
        <div className="hidden border-b-4 border-border bg-[#f7cf3d] p-5 lg:block">
          <Link to="/dashboard">
            <FocaLogo />
          </Link>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 pt-4">
          <div className="mx-auto flex w-full max-w-sm flex-col space-y-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              const showChatUnreadBadge = item.path === "/dashboard/chat" && chatUnreadCount > 0;
              
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "default" : "outline"}
                    className={`w-full justify-between rounded-[1.2rem] border-2 border-border px-4 py-5 text-sm font-black uppercase shadow-soft transition-all lg:py-6 lg:text-base hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none ${isActive ? 'bg-primary text-primary-foreground' : 'bg-white text-foreground hover:bg-muted hover:text-foreground'}`}
                  >
                    <span className="flex items-center">
                      <Icon className="mr-2 h-5 w-5" />
                      {item.label}
                    </span>
                    {showChatUnreadBadge && (
                      <span className="inline-flex min-w-7 items-center justify-center rounded-full border-2 border-border bg-accent px-2 py-1 text-xs font-black text-accent-foreground shadow-soft">
                        {chatUnreadCount}
                      </span>
                    )}
                  </Button>
                </Link>
              );
            })}
          </div>
        </nav>
        
        <div className="border-t-4 border-border bg-white p-4">
          <div className="mx-auto w-full max-w-sm">
            <Button
              variant="ghost"
              className="w-full justify-start rounded-[1.2rem] border-2 border-border bg-white px-4 py-5 text-sm font-black uppercase text-destructive shadow-soft lg:py-6 lg:text-base hover:bg-white hover:text-destructive hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-5 w-5" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t-4 border-border bg-white px-2 py-2 shadow-strong lg:hidden">
        <div className="grid grid-cols-6 gap-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const showChatUnreadBadge = item.path === "/dashboard/chat" && chatUnreadCount > 0;

            return (
              <Link key={item.path} to={item.path} className="min-w-0">
                <Button
                  variant="ghost"
                  className={`relative flex h-auto w-full flex-col items-center gap-1 rounded-[1.2rem] border-2 px-2 py-2 text-[11px] font-black uppercase leading-tight shadow-soft transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none ${isActive ? "border-border bg-primary text-primary-foreground" : "border-border bg-white text-foreground hover:bg-muted hover:text-foreground"}`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                  {showChatUnreadBadge && (
                    <span className="absolute right-1 top-1 inline-flex min-w-5 items-center justify-center rounded-full border-2 border-border bg-accent px-1 text-[10px] font-black text-accent-foreground">
                      {chatUnreadCount}
                    </span>
                  )}
                </Button>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
