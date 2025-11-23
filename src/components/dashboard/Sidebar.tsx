import { Link, useLocation } from "react-router-dom";
import { Brain, Home, FileText, Users, MessageCircle, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const menuItems = [
    { path: "/dashboard", icon: Home, label: "Início" },
    { path: "/dashboard/simulados", icon: FileText, label: "Simulados" },
    { path: "/dashboard/mural", icon: Brain, label: "Mural" },
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

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <Link to="/dashboard" className="flex items-center gap-2">
          <Brain className="w-8 h-8 text-primary" />
          <span className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            Gabarita
          </span>
        </Link>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link key={item.path} to={item.path}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start ${isActive ? 'bg-gradient-hero' : ''}`}
              >
                <Icon className="w-5 h-5 mr-2" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-2" />
          Sair
        </Button>
      </div>
    </aside>
  );
}
