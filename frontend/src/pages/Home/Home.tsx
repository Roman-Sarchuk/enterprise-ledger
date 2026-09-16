import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  BarChart3,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  PieChart,
  ReceiptText,
  Clock3,
  Briefcase,
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselDots,
} from "@/components/ui/carousel";

import { Button } from "@/components/ui/button";

import categories from "@/assets/categories.png";
import transactions from "@/assets/transactions.png";
import analyticsCircule from "@/assets/analytics-circule.png";
import analyticsLiqudity from "@/assets/analytics-liqudity.png";
import analyticsCashFlow from "@/assets/analytics-cash-flow.png";

const images = [analyticsCircule, analyticsLiqudity, analyticsCashFlow, categories, transactions];

const FEATURES = [
  {
    icon: BarChart3,
    color: "sky",
    title: "Корпоративна аналітика",
    desc: "Тижневі та місячні тренди операційних витрат і доходів у єдиному дашборді.",
  },
  {
    icon: ShieldCheck,
    color: "emerald",
    title: "Enterprise-безпека",
    desc: "Захищений доступ за допомогою JWT-токенів та ізольовані дані співробітників.",
  },
  {
    icon: PieChart,
    color: "amber",
    title: "Кастомні статті витрат",
    desc: "Гнучка маршрутизація фінансів: оренда, податки, зарплатний фонд та логістика.",
  },
  {
    icon: Briefcase,
    color: "violet",
    title: "Усі рахунки компанії",
    desc: "Поточні рахунки ФОП, готівкові каси та резервні фонди в одному вікні.",
  },
];

const colorMap: Record<
  string,
  { border: string; bg: string; icon: string; glow: string }
> = {
  sky: {
    border: "border-sky-500/25",
    bg: "bg-sky-500/8",
    icon: "text-sky-500",
    glow: "shadow-sky-500/20",
  },
  emerald: {
    border: "border-emerald-500/25",
    bg: "bg-emerald-500/8",
    icon: "text-emerald-500",
    glow: "shadow-emerald-500/20",
  },
  violet: {
    border: "border-violet-500/25",
    bg: "bg-violet-500/8",
    icon: "text-violet-500",
    glow: "shadow-violet-500/20",
  },
  amber: {
    border: "border-amber-500/25",
    bg: "bg-amber-500/8",
    icon: "text-amber-500",
    glow: "shadow-amber-500/20",
  },
};

const STEPS = [
  {
    icon: Briefcase,
    title: "Інтеграція рахунків",
    desc: "Додайте банківські рахунки підприємства та встановіть початкове сальдо.",
  },
  {
    icon: ReceiptText,
    title: "Облік транзакцій",
    desc: "Реєструйте операційні витрати та надходження за лічені секунди.",
  },
  {
    icon: TrendingUp,
    title: "Фінансовий моніторинг",
    desc: "Аналізуйте рентабельність та приймайте рішення на основі точних даних.",
  },
];

const QUICK_BENEFITS = [
  "Хмарна інфраструктура",
  "Детальні звіти",
  "Створено для бізнесу",
];

function Home() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.14),transparent_40%),radial-gradient(circle_at_85%_15%,hsl(var(--accent)/0.12),transparent_36%),radial-gradient(circle_at_50%_100%,hsl(var(--primary)/0.08),transparent_42%)]" />

      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex size-9 items-center justify-center rounded-xl bg-linear-to-br from-primary to-primary/70 text-primary-foreground shadow-lg shadow-primary/25">
              <Briefcase className="size-4" />
            </span>
            <span className="font-heading text-base font-bold tracking-tight">
              Enterprise-Ledger
            </span>
          </div>
          <nav className="flex items-center gap-2.5">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              asChild
            >
                <Link to="/login">Увійти</Link>
            </Button>
            <Button
              size="sm"
              className="shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40 hover:-translate-y-px"
              asChild
            >
              <Link to="/register">
                Реєстрація
                <ArrowRight className="ml-1.5 size-3.5" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col px-6">
        <section className="py-5 md:py-10">
          
          <div className="grid gap-10 lg:grid-cols-[1fr_460px] lg:items-center">
            <div className="space-y-7">
              <div style={{ animation: "fadeUp 0.45s 0.08s ease both" }}>
                <h1 className="max-w-2xl font-heading text-3xl font-extrabold leading-tight tracking-tight text-balance md:text-3xl lg:text-[3rem]">
                  Повний контроль над фінансами.
                  <span className="block bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
                    Впевненість у кожному рішенні.
                  </span>
                </h1>
                <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
                  Enterprise-Ledger допомагає бачити повну картину капіталу компанії: 
                  корпоративні рахунки, операційні витрати, історія транзакцій та 
                  глибока аналітика в єдиному захищеному порталі.
                </p>
              </div>

              <div
                className="flex flex-wrap gap-3"
                style={{ animation: "fadeUp 0.45s 0.16s ease both" }}
              >
                <Button
                  size="lg"
                  className="group shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5 hover:shadow-primary/45"
                  asChild
                >
                  <Link to="/register">
                    Впровадити систему
                    <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-border/60 bg-background/70"
                  asChild
                >
                  <Link to="/login">Корпоративний вхід</Link>
                </Button>
              </div>

              <div
                className="flex flex-wrap gap-2.5"
                style={{ animation: "fadeUp 0.45s 0.24s ease both" }}
              >
                {QUICK_BENEFITS.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/50 px-3 py-1 text-xs font-semibold text-foreground/80"
                  >
                    <CheckCircle2 className="size-3.5 text-emerald-500" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div
              className="rounded-3xl border border-border/60 bg-card/80 p-5 shadow-2xl shadow-primary/10 backdrop-blur md:p-6"
              style={{ animation: "fadeUp 0.5s 0.12s ease both" }}
            >
              <Carousel className="w-full relative">
                <CarouselContent className="h-80">
                  {images.map((src, index) => (
                    <CarouselItem key={index}>
                      <div className="h-80 w-full overflow-hidden rounded-2xl border border-border/40 shadow">
                        <img
                          src={src}
                          alt={`slide-${index}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselDots />
              </Carousel>
            </div>
          </div>
        </section>

        <section className="border-t border-border/50 py-16 md:py-20">
          <div className="mb-12 text-center">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-primary">
              <Sparkles className="size-3.5" /> Можливості
            </p>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-balance md:text-5xl">
              Усе необхідне для{" "}
              <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
                управління бізнесом
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Професійні інструменти, які допомагають оптимізувати ресурси 
              та мінімізувати фінансові ризики підприємства.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, color, title, desc }, i) => (
              <div
                key={title}
                className={`group rounded-2xl border bg-card/65 p-6 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${colorMap[color].border} ${colorMap[color].glow}`}
                style={{ animation: `fadeUp 0.45s ${0.08 * i}s ease both` }}
              >
                <div
                  className={`mb-4 inline-flex size-11 items-center justify-center rounded-xl border ${colorMap[color].border} ${colorMap[color].bg}`}
                >
                  <Icon className={`size-5 ${colorMap[color].icon}`} />
                </div>
                <h3 className="mb-2 font-heading text-base font-semibold text-foreground">
                  {title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-border/50 py-16 md:py-20">
          <div className="mb-10 text-center">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-primary">
              <Clock3 className="size-3.5" /> Робочий процес
            </p>
            <h2 className="font-heading text-3xl font-bold tracking-tight md:text-5xl">
              Три кроки до фінансового порядку
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={title}
                className="rounded-2xl border border-border/60 bg-card/65 p-6 backdrop-blur"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="inline-flex size-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <span className="text-xs font-bold tracking-[0.16em] text-muted-foreground">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mb-2 font-heading text-lg font-semibold">
                  {title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-border/50 py-16 md:py-20">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-primary">
                <Briefcase className="size-3.5" /> Про систему
              </p>
              <h2 className="font-heading text-3xl font-bold tracking-tight text-balance md:text-5xl">
                Enterprise-Ledger<br />
                <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
                  Внутрішній фінансовий портал
                </span>
              </h2>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                Веб-додаток для корпоративного обліку фінансів: управління рахунками, 
                статтями витрат, історією операцій та формування аналітичних звітів 
                для керівництва компанії.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["Node.js", "Express", "React", "TypeScript", "MongoDB", "Docker"].map(
                  (tech) => (
                    <span
                      key={tech}
                      className="rounded-full border border-border/60 bg-muted/50 px-3 py-1 text-xs font-semibold text-foreground/75"
                    >
                      {tech}
                    </span>
                  ),
                )}
              </div>
            </div>

          </div>
        </section>

        <section className="pb-24 pt-10 md:pb-28">
          <div className="relative overflow-hidden rounded-3xl border border-primary/25 bg-linear-to-br from-primary/12 via-background to-accent/10 p-10 text-center shadow-2xl md:p-16">
            <div className="pointer-events-none absolute -left-20 -top-20 size-64 rounded-full bg-primary/15 blur-3xl" />
            <div className="pointer-events-none absolute -right-20 -bottom-20 size-64 rounded-full bg-accent/15 blur-3xl" />
            <div className="relative">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-primary">
                <Sparkles className="size-3.5" /> Впровадження
              </p>
              <h2 className="font-heading text-3xl font-bold tracking-tight text-balance md:text-5xl">
                Готові оптимізувати облік{" "}
                <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
                  вже сьогодні?
                </span>
              </h2>
              <p className="mx-auto mt-4 mb-8 max-w-md text-muted-foreground">
                Створіть захищений акаунт адміністратора та почніть вести 
                корпоративний облік у сучасному інтерфейсі.
              </p>
              <Button
                size="lg"
                className="group px-8 shadow-xl shadow-primary/30 transition-all hover:-translate-y-0.5 hover:shadow-primary/50"
                asChild
              >
                <Link to="/register">
                  Зареєструвати компанію
                  <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40 bg-background/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex size-7 items-center justify-center rounded-lg bg-primary/15">
              <Briefcase className="size-3.5 text-primary" />
            </span>
            <span className="font-semibold text-foreground/70">
              Enterprise-Ledger
            </span>
            <span className="text-border">·</span>
            <span>{new Date().getFullYear()}</span>
          </div>
          <p className="text-xs">
            Корпоративна ERP-система фінансового обліку
          </p>
        </div>
      </footer>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default Home;