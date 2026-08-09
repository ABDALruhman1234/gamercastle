import { Cpu, HardDrive, MemoryStick, MonitorPlay, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice, whatsappLink, type Laptop } from "@/lib/laptops";

export function LaptopCard({ laptop }: { laptop: Laptop }) {
  const specs = [
    { icon: Cpu, label: laptop.cpu },
    { icon: MonitorPlay, label: laptop.gpu },
    { icon: MemoryStick, label: laptop.ram },
    { icon: HardDrive, label: laptop.storage },
  ];

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card/60 transition-all duration-300 hover:-translate-y-1 hover:border-secondary hover:shadow-[0_0_30px_-4px_var(--secondary)]">
      <div className="relative aspect-16/10 overflow-hidden bg-muted">
        <img
          src={laptop.image_url}
          alt={`${laptop.model} gaming laptop`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full border border-primary/60 bg-background/80 px-3 py-1 font-display text-[10px] uppercase tracking-widest text-primary">
          {laptop.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-base font-bold leading-tight text-foreground">
            {laptop.model}
          </h3>
          <span className="whitespace-nowrap font-display text-lg font-black text-secondary drop-shadow-[0_0_10px_var(--secondary)]">
            {formatPrice(laptop.price)}
          </span>
        </div>

        <ul className="flex flex-1 flex-col gap-1.5 text-sm text-muted-foreground">
          {specs.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2">
              <Icon className="size-4 text-accent" />
              <span>{label}</span>
            </li>
          ))}
        </ul>

        <Button variant="whatsapp" className="w-full" asChild>
          <a href={whatsappLink(laptop.model)} target="_blank" rel="noopener noreferrer">
            <MessageCircle />
            Order on WhatsApp
          </a>
        </Button>
      </div>
    </article>
  );
}
