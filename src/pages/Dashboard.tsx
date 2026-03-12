import { useEffect, useState } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Sidebar from "@/components/dashboard/Sidebar";
import type { User } from "@supabase/supabase-js";
import { isProfileComplete } from "@/lib/profileCompletion";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("nome, sobrenome, escolaridade, data_nascimento, cidade, estado, area_forte, area_fraca")
        .eq("id", session.user.id)
        .single();

      const onboardingPath = "/complete-profile";

      if (!isProfileComplete(profileData)) {
        navigate(onboardingPath, { replace: true });
        setUser(session.user);
        setLoading(false);
        return;
      }

      setUser(session.user);
      setLoading(false);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/login");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [location.pathname, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="rounded-full border-4 border-border bg-[#f7cf3d] px-6 py-3 text-sm font-black uppercase text-foreground shadow-soft animate-pulse">
          Carregando...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background lg:flex lg:items-start">
      <Sidebar />
      <main className="flex-1 min-h-0">
        <div className="p-4 md:p-6 lg:p-8">
        <Outlet />
        </div>
      </main>
    </div>
  );
}
