import { Cpu, HardDrive, MemoryStick, MonitorPlay, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { safeImageUrl } from "@/lib/laptop-schema";
import { formatPrice, whatsappLink, type Laptop } from "@/lib/laptops";


export function LaptopCard({ laptop }: { laptop: Laptop }) {
  const specs = [
    { icon: Cpu, label: laptop.cpu },
    { icon: MonitorPlay, label: laptop.gpu },
    { icon: MemoryStick, label: laptop.ram },
    { icon: HardDrive, label: laptop.storage },
  ];

  return (
    <article className="group relative flex min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-card/60 transition-all duration-300 hover:-translate-y-1 hover:border-secondary hover:shadow-[0_0_30px_-4px_var(--secondary)]">
      <div className="relative aspect-16/10 overflow-hidden bg-muted">
        <img
          src={safeImageUrl(laptop.image_url)}
          alt={`${laptop.model} gaming laptop`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-2 top-2 rounded-full border border-primary/60 bg-background/80 px-2 py-0.5 font-display text-[9px] uppercase tracking-widest text-primary sm:left-3 sm:top-3 sm:px-3 sm:py-1 sm:text-[10px]">
          {laptop.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-3 sm:gap-4 sm:p-4">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
          <h3 className="min-w-0 flex-1 font-display text-sm font-bold leading-tight text-foreground sm:text-base">
            {laptop.model}
          </h3>
          <span className="shrink-0 whitespace-nowrap font-display text-sm font-black text-secondary drop-shadow-[0_0_10px_var(--secondary)] min-[360px]:text-base sm:text-lg">
            {formatPrice(laptop.price)}
          </span>
        </div>

        <ul className="flex flex-1 flex-col gap-1.5 text-xs text-muted-foreground sm:text-sm">
          {specs.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2">
              <Icon className="size-3.5 shrink-0 text-accent sm:size-4" />
              <span className="truncate">{label}</span>
            </li>
          ))}
        </ul>

        <Button variant="whatsapp" className="h-11 w-full text-xs sm:text-sm" asChild>
          <a href={whatsappLink(laptop.model)} target="_blank" rel="noopener noreferrer">
            <MessageCircle />
            Order on WhatsApp
          </a>
        </Button>

      </div>
    </article>
  );
}
