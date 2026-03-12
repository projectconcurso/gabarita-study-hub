import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "group toast rounded-[1.4rem] border-4 border-border bg-white text-foreground shadow-medium",
          title: "text-sm font-black uppercase text-foreground",
          description: "text-sm font-semibold text-muted-foreground",
          actionButton:
            "rounded-full border-2 border-border bg-primary px-4 font-black uppercase text-primary-foreground shadow-soft hover:bg-primary/90",
          cancelButton:
            "rounded-full border-2 border-border bg-white px-4 font-black uppercase text-foreground shadow-soft hover:bg-muted hover:text-foreground",
          closeButton:
            "border-2 border-border bg-white text-foreground hover:bg-muted hover:text-foreground",
          success:
            "border-4 border-border bg-white text-foreground",
          error:
            "border-4 border-border bg-white text-foreground",
          warning:
            "border-4 border-border bg-white text-foreground",
          info:
            "border-4 border-border bg-white text-foreground",
          icon: "text-primary",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
