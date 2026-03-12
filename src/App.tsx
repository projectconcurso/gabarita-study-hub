import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ConfirmEmail from "./pages/ConfirmEmail";
import ResetPassword from "./pages/ResetPassword";
import CompleteProfile from "./pages/CompleteProfile";
import Dashboard from "./pages/Dashboard";
import DashboardHome from "./pages/dashboard/Home";
import Simulados from "./pages/dashboard/Simulados";
import Mural from "./pages/dashboard/Mural";
import Amigos from "./pages/dashboard/Amigos";
import Chat from "./pages/dashboard/Chat";
import Simular from "./pages/dashboard/Simular.tsx";
import Perfil from "./pages/dashboard/Perfil";
import PerfilAmigo from "./pages/dashboard/PerfilAmigo";
import Billing from "./pages/dashboard/Billing";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/confirm-email" element={<ConfirmEmail />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/complete-profile" element={<CompleteProfile />} />
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<DashboardHome />} />
            <Route path="simulados" element={<Simulados />} />
            <Route path="simular/:id" element={<Simular />} />
            <Route path="mural" element={<Mural />} />
            <Route path="amigos" element={<Amigos />} />
            <Route path="amigos/:id" element={<PerfilAmigo />} />
            <Route path="chat" element={<Chat />} />
            <Route path="perfil" element={<Perfil />} />
            <Route path="billing" element={<Billing />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
