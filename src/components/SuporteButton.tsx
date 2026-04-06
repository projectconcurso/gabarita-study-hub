import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Headphones } from "lucide-react";
import { SuporteModal } from "./SuporteModal";

export function SuporteButton() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setModalOpen(true)}
        className="fixed bottom-20 right-4 z-40 flex items-center gap-2 rounded-full border-2 border-border bg-[#4CAF50] px-4 py-3 font-bold uppercase text-white shadow-soft hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none lg:bottom-4"
        title="Suporte e Feedback"
      >
        <Headphones className="h-5 w-5" />
        <span className="hidden sm:inline text-sm">Suporte</span>
      </Button>

      <SuporteModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
