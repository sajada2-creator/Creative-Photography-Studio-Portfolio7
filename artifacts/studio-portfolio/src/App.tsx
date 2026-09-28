import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Instagram,
  Menu,
  MoveUpLeft,
  Send,
  X,
} from 'lucide-react';
import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { IMAGE_MANIFEST } from './generated/imageManifest';

type WorkItem = {
  id: string;
  title: string;
  note: string;
  ratio: string;
  src: string;
  tone: string;
};

type Category = {
  slug: string;
  name: string;
  latin: string;
  description: string;
  works: WorkItem[];
};

function detectedWorks(slug: string, fallback: WorkItem[]): WorkItem[] {
  const detected = IMAGE_MANIFEST[slug] ?? [];
  if (!detected.length) return fallback;

  return detected.map((src, index) => {
    const fallbackItem = fallback[index % Math.max(fallback.length, 1)];
    return {
      id: `${slug}-${index + 1}`,
      title: `عمل ${String(index + 1).padStart(2, '0')}`,
      note: 'من أرشيف المجموعة',
      ratio: index % 3 === 0 ? 'portrait' : index % 3 === 1 ? 'landscape' : 'square',
      src,
      tone: fallbackItem?.tone ?? `empty-${slug}`,
    };
  });
}

const CATEGORIES: Category[] = [
  {
    slug: 'weddings',
    name: 'الأعراس',
    latin: 'Weddings',
    description: 'تفاصيل اليوم كما عُشناه — بطيئاً، صادقاً، وقريباً.',
    works: detectedWorks('weddings', [
      { id: 'wedding-01', title: 'بين خطوتين', note: 'لحظة • ضوء طبيعي', ratio: 'portrait', src: '/images/weddings/between-steps.jpg', tone: 'wedding-a' },
      { id: 'wedding-02', title: 'قبل أن يبدأ الضوء', note: 'تحضير • ظلال هادئة', ratio: 'landscape', src: '/images/weddings/before-light.jpg', tone: 'wedding-b' },
      { id: 'wedding-03', title: 'وعد صغير', note: 'احتفال • لقطة صريحة', ratio: 'square', src: '/images/weddings/small-promise.jpg', tone: 'wedding-c' },
    ]),
  },
  {
    slug: 'events',
    name: 'الفعاليات',
    latin: 'Events',
    description: 'نحفظ طاقة المكان، والأشخاص الذين ملأوه حياة.',
    works: [],
  },
  {
    slug: 'products',
    name: 'المنتجات',
    latin: 'Products',
    description: 'الصورة التي تجعل الفكرة ملموسة، حتى قبل لمسها.',
    works: detectedWorks('products', [
      { id: 'product-01', title: 'مادة أولى', note: 'طبيعة صامتة • تركيب', ratio: 'landscape', src: '/images/products/first-material.jpg', tone: 'product-a' },
      { id: 'product-02', title: 'في التفاصيل', note: 'هوية • ضوء استوديو', ratio: 'portrait', src: '/images/products/in-the-detail.jpg', tone: 'product-b' },
    ]),
  },
  {
    slug: 'sports',
    name: 'الرياضة',
    latin: 'Sports',
    description: 'السرعة حين تتوقف في إطار، والجهد حين يصبح شكلاً.',
    works: [],
  },
  {
    slug: 'portraits',
    name: 'البورتريه',
    latin: 'Portraits',
    description: 'لا نبحث عن ملامح مثالية، بل عن حضور حقيقي.',
    works: detectedWorks('portraits', [
      { id: 'portrait-01', title: 'كما أنت', note: 'بورتريه • ضوء جانبي', ratio: 'portrait', src: '/images/portraits/as-you-are.jpg', tone: 'portrait-a' },
      { id: 'portrait-02', title: 'مسافة قريبة', note: 'شخصي • أبيض وظلال', ratio: 'square', src: '/images/portraits/close-distance.jpg', tone: 'portrait-b' },
    ]),
  },
  {
    slug: 'designs',
    name: 'التصاميم',
    latin: 'Designs',
    description: 'أفكار بصرية تبدأ من ورقة، ولا تنتهي عند الشاشة.',
    works: [],
  },
  {
    slug: 'editing',
    name: 'المونتاج',
    latin: 'Editing',
    description: 'نمنح اللقطة إيقاعها الأخير، دون أن نفقد صدقها الأول.',
    works: [],
  },
];

const CONTACT_LINKS = {
  whatsapp: '[WHATSAPP LINK]',
  instagram: '[INSTAGRAM LINK]',
  tiktok: '[TIKTOK LINK]',
};

const queryClient = new QueryClient();

function VisualFrame({ item, index, onOpen }: { item: WorkItem; index: number; onOpen: () => void }) {
  const [imageFailed, setImageFailed] = useState(false);
  const isPortrait = item.ratio === 'portrait';
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`فتح عمل ${item.title}`}
      data-testid={`button-open-work-${item.id}`}
      className={`gallery-button group relative block w-full overflow-hidden border-0 bg-primary p-0 text-right ${isPortrait ? 'aspect-[3/4]' : item.ratio === 'square' ? 'aspect-square' : 'aspect-[4/3]'}`}
    >
      <div className={`category-visual visual-surface absolute inset-0 ${item.tone}`}>
        <div className="visual-ring left-[14%] top-[15%] h-[56%] w-[56%]" />
        <div className="visual-ring bottom-[-22%] right-[-8%] h-[75%] w-[75%]" />
        <div className="visual-bar bottom-[16%] left-[-8%] h-[12%] w-[74%]" />
        <div className="absolute bottom-[12%] right-[17%] h-3 w-3 rounded-full bg-accent/70" />
        {!imageFailed && (
          <img
            src={item.src}
            alt={item.title}
            loading={index < 2 ? 'eager' : 'lazy'}
            onError={() => setImageFailed(true)}
            className="reveal-image absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="gallery-shade absolute inset-0 bg-primary" />
        <div className="absolute inset-x-0 bottom-0 z-10 translate-y-3 p-5 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="inline-flex items-center gap-2 border border-accent/50 bg-primary/80 px-3 py-2 text-xs text-accent backdrop-blur-sm">
            عرض العمل <MoveUpLeft size={14} strokeWidth={1.5} />
          </span>
        </div>
      </div>
    </button>
  );
}

function CategoryVisual({ category, onClick }: { category: Category; onClick: () => void }) {
  const firstTone = category.works[0]?.tone ?? `empty-${category.slug}`;
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={`button-category-${category.slug}`}
      className="category-card group flex min-w-[220px] snap-start flex-col text-right text-primary/65 md:min-w-0"
    >
      <div className={`category-visual visual-surface relative mb-5 aspect-[4/3] w-full border border-primary/15 ${firstTone}`}>
        <span className="absolute right-5 top-5 z-10 font-mono text-[10px] tracking-[.2em] text-accent/80">0{CATEGORIES.indexOf(category) + 1}</span>
        <div className="visual-ring left-[18%] top-[18%] h-[48%] w-[48%]" />
        <div className="visual-ring bottom-[-18%] right-[-6%] h-[72%] w-[72%]" />
        <div className="visual-bar bottom-[20%] left-[-10%] h-[10%] w-[78%]" />
        {category.works.length === 0 && (
          <span className="absolute bottom-5 right-5 z-10 border border-accent/40 px-2 py-1 text-[10px] tracking-wider text-accent/80">قريباً</span>
        )}
        <span className="absolute bottom-5 left-5 z-10 text-accent/80 transition-transform duration-500 group-hover:-translate-x-1"><ArrowLeft size={17} strokeWidth={1.2} /></span>
      </div>
      <span className="display-font text-xl">{category.name}</span>
      <span className="mt-1 text-[11px] tracking-[.12em] opacity-70" dir="ltr">{category.latin}</span>
      <span className="mt-3 h-px w-5 bg-primary transition-all duration-500 group-hover:w-12" />
    </button>
  );
}

function ComingSoon({ category }: { category: Category }) {
  return (
    <div className="flex min-h-[310px] flex-col items-center justify-center border border-primary/15 px-6 text-center">
      <div className="mb-7 h-16 w-16 rounded-full border border-primary/25 p-2">
        <div className="flex h-full w-full items-center justify-center rounded-full border border-primary/20">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
        </div>
      </div>
      <span className="eyebrow text-primary/55">قيد التحضير</span>
      <h3 className="display-font mt-4 text-2xl">شيء جميل يقترب</h3>
      <p className="mt-3 max-w-sm text-sm leading-8 text-primary/65">نرتب هذه المساحة لـ {category.name}. ستظهر هنا أعمالها حين يحين وقتها.</p>
    </div>
  );
}

function PortfolioOverlay({ category, onClose, onOpen }: { category: Category; onClose: () => void; onOpen: (index: number) => void }) {
  return (
    <div className="portfolio-overlay fixed inset-0 z-[80] overflow-y-auto bg-background" role="dialog" aria-modal="true" aria-label={`أعمال ${category.name}`}>
      <div className="sticky top-0 z-10 border-b border-primary/15 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-[1400px] items-center justify-between px-5 md:h-[88px] md:px-10">
          <button type="button" onClick={onClose} data-testid="button-back-to-categories" className="group flex items-center gap-3 text-sm text-primary transition-colors hover:text-primary/65">
            <span className="flex h-9 w-9 items-center justify-center border border-primary/35 transition-transform duration-300 group-hover:-translate-x-1"><ArrowRight size={16} strokeWidth={1.3} /></span>
            رجوع للتصنيفات
          </button>
          <span className="eyebrow text-primary/45" dir="ltr">ATHAR / PORTFOLIO</span>
          <button type="button" onClick={onClose} data-testid="button-close-portfolio" aria-label="إغلاق معرض الأعمال" className="flex h-10 w-10 items-center justify-center border border-primary/25 text-primary transition-colors hover:bg-primary hover:text-accent">
            <X size={18} strokeWidth={1.3} />
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-5 py-16 md:px-10 md:py-24">
        <div className="mb-14 max-w-3xl">
          <span className="eyebrow text-primary/50" dir="ltr">{category.latin}</span>
          <h2 className="display-font mt-5 text-5xl leading-[1.35] md:text-8xl">{category.name}</h2>
          <p className="mt-6 max-w-md text-sm leading-8 text-primary/65">{category.description}</p>
        </div>

        {category.works.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
            {category.works.map((item, index) => (
              <VisualFrame key={item.id} item={item} index={index} onOpen={() => onOpen(index)} />
            ))}
          </div>
        ) : (
          <ComingSoon category={category} />
        )}
      </div>
    </div>
  );
}

function Lightbox({ items, activeIndex, onClose, onChange }: { items: WorkItem[]; activeIndex: number; onClose: () => void; onChange: (next: number) => void }) {
  const item = items[activeIndex];
  const [imageFailed, setImageFailed] = useState(false);
  useEffect(() => setImageFailed(false), [item.id]);
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft') onChange((activeIndex + 1) % items.length);
      if (event.key === 'ArrowRight') onChange((activeIndex - 1 + items.length) % items.length);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeIndex, items.length, onChange, onClose]);
  return (
    <div className="lightbox-backdrop lightbox-enter fixed inset-0 z-[100] flex min-h-[100dvh] items-center justify-center p-4 md:p-10" role="dialog" aria-modal="true" aria-label="عارض الأعمال">
      <button type="button" onClick={onClose} data-testid="button-close-lightbox" aria-label="إغلاق العارض" className="absolute right-5 top-5 z-20 flex h-12 w-12 items-center justify-center border border-accent/35 text-accent transition-colors hover:bg-accent hover:text-primary md:right-10 md:top-10">
        <X size={20} strokeWidth={1.3} />
      </button>
      <button type="button" onClick={() => onChange((activeIndex + 1) % items.length)} data-testid="button-lightbox-next" aria-label="العمل التالي" className="absolute left-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center border border-accent/30 text-accent transition-colors hover:bg-accent hover:text-primary md:left-10">
        <ArrowLeft size={20} strokeWidth={1.3} />
      </button>
      <button type="button" onClick={() => onChange((activeIndex - 1 + items.length) % items.length)} data-testid="button-lightbox-previous" aria-label="العمل السابق" className="absolute right-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center border border-accent/30 text-accent transition-colors hover:bg-accent hover:text-primary md:right-10">
        <ArrowRight size={20} strokeWidth={1.3} />
      </button>
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col items-center justify-center">
        <div className={`visual-surface relative w-full overflow-hidden ${item.ratio === 'portrait' ? 'max-w-[500px] aspect-[3/4]' : item.ratio === 'square' ? 'max-w-[620px] aspect-square' : 'aspect-[4/3]'}`}>
          <div className={`category-visual absolute inset-0 ${item.tone}`}>
            <div className="visual-ring left-[14%] top-[15%] h-[56%] w-[56%]" />
            <div className="visual-ring bottom-[-22%] right-[-8%] h-[75%] w-[75%]" />
            <div className="visual-bar bottom-[16%] left-[-8%] h-[12%] w-[74%]" />
            {!imageFailed && <img src={item.src} alt={item.title} onError={() => setImageFailed(true)} className="absolute inset-0 h-full w-full object-cover" />}
          </div>
        </div>
        <div className="mt-5 flex w-full max-w-5xl items-end justify-between px-1 text-accent">
          <div>
            <h2 className="display-font text-2xl">{item.title}</h2>
            <p className="mt-1 text-xs text-accent/60">{item.note}</p>
          </div>
          <span className="font-mono text-xs tracking-[.2em] text-accent/60">{String(activeIndex + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}</span>
        </div>
      </div>
    </div>
  );
}

function Home() {
  const [portfolioSlug, setPortfolioSlug] = useState<string | null>(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const workRef = useRef<HTMLElement>(null);
  const contactRef = useRef<HTMLElement>(null);
  const aboutPanelRef = useRef<HTMLDivElement>(null);
  const portfolioCategory = useMemo(() => CATEGORIES.find((category) => category.slug === portfolioSlug) ?? null, [portfolioSlug]);

  useEffect(() => {
    document.documentElement.lang = 'ar';
    document.documentElement.dir = 'rtl';
    document.title = 'أثر — استوديو للتصوير والإنتاج البصري';
    const description = 'أثر — جماعة تصوير وإنتاج بصري توثق اللحظات، الأشخاص، والأفكار بعيون سينمائية.';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', description);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('no-scroll', lightboxIndex !== null || mobileOpen || portfolioSlug !== null);
    return () => document.body.classList.remove('no-scroll');
  }, [lightboxIndex, mobileOpen, portfolioSlug]);

  useEffect(() => {
    if (!aboutOpen) return;
    const handleOutsidePointer = (event: PointerEvent) => {
      if (aboutPanelRef.current && !aboutPanelRef.current.contains(event.target as Node)) {
        setAboutOpen(false);
      }
    };
    document.addEventListener('pointerdown', handleOutsidePointer);
    return () => document.removeEventListener('pointerdown', handleOutsidePointer);
  }, [aboutOpen]);

  const scrollTo = (element: HTMLElement | null) => {
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMobileOpen(false);
  };

  return (
    <main className="studio-shell min-h-[100dvh]">
      <div className="intro-curtain fixed inset-0 z-[120] flex items-center justify-center bg-primary text-accent" aria-label="مقدمة شعار RX-MOMENT">
        <div className="text-center">
          <img
            src="/rx-moment-logo.png"
            alt="RX-MOMENT"
            className="mx-auto w-[min(19rem,76vw)] object-contain brightness-125 md:w-[25rem]"
          />
          <div className="mx-auto mt-5 h-px w-16 bg-accent/55" />
          <p className="mt-4 text-[10px] tracking-[.35em] text-accent/70" dir="ltr">RX-MOMENT</p>
        </div>
      </div>

      <header className="glass-nav fixed inset-x-0 top-0 z-40 border-b border-primary/10">
        <div className="mx-auto flex h-[76px] max-w-[1400px] items-center justify-between px-5 md:h-[88px] md:px-10">
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} data-testid="button-brand-home" className="group flex items-center gap-3 text-right">
            <img src="/rx-moment-logo.png" alt="RX-MOMENT" className="h-9 w-16 object-contain" />
            <span className="hidden text-xs tracking-[.18em] text-primary/70 sm:inline" dir="ltr">RX-MOMENT / VISUALS</span>
          </button>
          <nav className="hidden items-center gap-8 md:flex" aria-label="التنقل الرئيسي">
            <button type="button" onClick={() => scrollTo(workRef.current)} data-testid="button-nav-work" className="text-sm text-primary/75 transition-colors hover:text-primary">الأعمال</button>
            <button type="button" onClick={() => scrollTo(contactRef.current)} data-testid="button-nav-contact" className="flex items-center gap-2 text-sm text-primary/75 transition-colors hover:text-primary">لنتحدث <ArrowLeft size={15} /></button>
          </nav>
          <button type="button" onClick={() => setMobileOpen(true)} data-testid="button-open-mobile-menu" aria-label="فتح القائمة" className="flex h-10 w-10 items-center justify-center border border-primary/25 md:hidden">
            <Menu size={19} strokeWidth={1.3} />
          </button>
        </div>
      </header>

      <div ref={aboutPanelRef} className="fixed right-0 top-1/2 z-50 -translate-y-1/2">
        <button type="button" onClick={() => setAboutOpen((open) => !open)} data-testid="button-floating-about" aria-expanded={aboutOpen} className="about-tab group flex h-40 w-11 items-center justify-center border border-primary/30 bg-background/90 text-primary shadow-[0_16px_40px_hsl(202_81%_20%/.12)] backdrop-blur-md transition-all duration-300 hover:w-14 md:h-48 md:w-12">
          <span className="about-tab-label text-xs tracking-[.15em]">نبذة عن المجموعة</span>
        </button>
        <div className={`absolute right-14 top-1/2 w-[min(21rem,calc(100vw-5.5rem))] -translate-y-1/2 origin-right border border-primary/25 bg-background/90 p-6 text-right shadow-[0_20px_60px_hsl(202_81%_20%/.18)] backdrop-blur-xl transition-all duration-300 md:right-16 md:p-8 ${aboutOpen ? 'pointer-events-auto scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'}`} aria-hidden={!aboutOpen}>
          <div className="mb-6 flex items-center justify-between gap-4 border-b border-primary/15 pb-4">
            <span className="eyebrow text-primary/45">منذ ٢٠٢٤ / القاهرة</span>
            <button type="button" onClick={() => setAboutOpen(false)} data-testid="button-close-floating-about" aria-label="إغلاق النبذة" className="flex h-8 w-8 items-center justify-center border border-primary/20 text-primary transition-colors hover:bg-primary hover:text-accent">
              <X size={15} strokeWidth={1.3} />
            </button>
          </div>
          <h2 className="display-font text-2xl text-primary">نبذة عن المجموعة</h2>
          <p className="mt-5 text-sm leading-8 text-primary/70">أثر جماعة صغيرة تعمل من قلب التفاصيل. نصنع صوراً تشبه أصحابها، ونترك للمشهد مساحة كي يتنفس. من المناسبة إلى الفكرة، نقترب بلا ضجيج.</p>
        </div>
      </div>

      <section className="hero-grid relative flex min-h-[760px] items-end overflow-hidden px-5 pb-16 pt-36 md:min-h-[900px] md:px-10 md:pb-24">
        <div className="hero-orb pointer-events-none absolute -left-32 top-32 h-[420px] w-[420px] rounded-full border border-primary/10 md:h-[640px] md:w-[640px]" />
        <div className="pointer-events-none absolute right-[12%] top-[28%] h-2 w-2 rounded-full bg-primary/50" />
        <div className="pointer-events-none absolute right-[26%] top-[38%] h-px w-24 bg-primary/20" />
        <div className="relative mx-auto w-full max-w-[1400px]">
          <div className="rise-in mb-8 flex items-center gap-4">
            <span className="eyebrow text-primary/55">استوديو تصوير وإنتاج بصري</span>
            <span className="h-px w-14 bg-primary/35" />
          </div>
          <h1 className="display-font rise-in max-w-5xl text-[clamp(3.5rem,10vw,9.5rem)] font-medium leading-[1.12] tracking-[-.06em] [animation-delay:.1s]">
            نرى ما<br /><span className="mr-[.7em] text-primary/55">لا يُقال.</span>
          </h1>
          <div className="mt-12 flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <p className="rise-in max-w-sm text-base leading-9 text-primary/70 [animation-delay:.25s]">نلتقط الأثر الذي تتركه اللحظة بعد مرورها.<br />صور هادئة، لها ما تقوله.</p>
            <button type="button" onClick={() => scrollTo(workRef.current)} data-testid="button-hero-explore" className="line-in group flex items-center gap-5 self-start border-b border-primary/35 pb-3 text-sm text-primary transition-colors hover:border-primary md:self-auto">
              اكتشف الأعمال <span className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/35 transition-transform duration-300 group-hover:-translate-x-1"><ArrowLeft size={15} strokeWidth={1.2} /></span>
            </button>
          </div>
        </div>
        <span className="absolute bottom-7 left-5 text-[10px] tracking-[.28em] text-primary/40 md:left-10" dir="ltr">SCROLL TO BEGIN</span>
      </section>

      <section className="border-y border-primary/10 px-5 py-7 md:px-10">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <span className="eyebrow text-primary/45">اختياراتنا البصرية</span>
          <p className="text-sm text-primary/60">سبع طرق لرؤية العالم، وطريقة واحدة لقولها.</p>
        </div>
      </section>

      <section ref={workRef} id="work" className="mx-auto max-w-[1400px] scroll-mt-24 px-5 py-24 md:px-10 md:py-36">
        <div className="mb-14 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <span className="eyebrow text-primary/50">المجموعة / ٠١</span>
            <h2 className="display-font mt-5 text-4xl md:text-6xl">الأعمال</h2>
          </div>
          <p className="max-w-xs text-sm leading-8 text-primary/65">كل مشروع يبدأ باستماع طويل، ثم لقطة واحدة تشبهه تماماً.</p>
        </div>

        <div className="-mx-5 mb-20 flex snap-x gap-5 overflow-x-auto px-5 pb-4 md:mx-0 md:grid md:grid-cols-7 md:gap-5 md:overflow-visible md:px-0">
          {CATEGORIES.map((category) => <CategoryVisual key={category.slug} category={category} onClick={() => setPortfolioSlug(category.slug)} />)}
        </div>
      </section>

      <section className="relative overflow-hidden bg-primary px-5 py-28 text-accent md:px-10 md:py-40">
        <div className="pointer-events-none absolute -left-24 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full border border-accent/15" />
        <div className="pointer-events-none absolute -left-10 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full border border-accent/15" />
        <div className="relative mx-auto grid max-w-[1400px] gap-14 md:grid-cols-[1fr_.7fr] md:items-end">
          <div>
            <span className="eyebrow text-accent/55">كيف نعمل</span>
            <h2 className="display-font mt-6 max-w-3xl text-4xl leading-[1.5] md:text-6xl">نترك للمشهد<br /><span className="text-accent/50">مساحته.</span></h2>
          </div>
          <div className="border-r border-accent/25 pr-6 md:pr-8">
            <p className="text-sm leading-9 text-accent/70">لا نطارد الصورة المثالية. ننتظر اللحظة التي تصبح فيها الصورة صادقة. نعمل مع الضوء، المكان، والأشخاص أمامنا — لا ضدهم.</p>
          </div>
        </div>
      </section>

      <section ref={contactRef} id="contact" className="scroll-mt-20 px-5 py-28 md:px-10 md:py-40">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid gap-16 md:grid-cols-[1.1fr_.9fr] md:gap-24">
            <div>
              <span className="eyebrow text-primary/50">الباب مفتوح</span>
              <h2 className="display-font mt-6 max-w-2xl text-5xl leading-[1.45] md:text-7xl">لديك حكاية<br /><span className="text-primary/50">لنصورها؟</span></h2>
              <p className="mt-8 max-w-md text-sm leading-9 text-primary/65">أخبرنا عن الفكرة، الموعد، أو حتى الشعور الذي تريد الاحتفاظ به. سنعود إليك من هنا.</p>
              <a href={CONTACT_LINKS.whatsapp} data-testid="link-contact-whatsapp-primary" aria-label="التواصل عبر واتساب" className="mt-8 inline-flex items-center gap-3 border-b border-primary/40 pb-3 text-sm text-primary transition-colors hover:border-primary">
                تواصل معنا عبر واتساب <ArrowLeft size={14} strokeWidth={1.4} />
              </a>
            </div>
            <div className="flex flex-col justify-end border-t border-primary/20 pt-8 md:border-t-0 md:border-r md:pr-10">
              <span className="eyebrow mb-6 text-primary/50">تواصل معنا</span>
              <a href={CONTACT_LINKS.whatsapp} data-testid="link-contact-whatsapp" className="group flex items-center justify-between border-b border-primary/20 py-5 text-lg transition-colors hover:border-primary">
                واتساب <span className="flex items-center gap-3 text-xs text-primary/55 transition-transform group-hover:-translate-x-1">[WHATSAPP LINK] <ArrowLeft size={16} /></span>
              </a>
              <a href={CONTACT_LINKS.instagram} data-testid="link-contact-instagram" className="group flex items-center justify-between border-b border-primary/20 py-5 text-lg transition-colors hover:border-primary">
                إنستغرام <span className="flex items-center gap-3 text-xs text-primary/55 transition-transform group-hover:-translate-x-1">[INSTAGRAM LINK] <Instagram size={15} strokeWidth={1.3} /></span>
              </a>
              <a href={CONTACT_LINKS.tiktok} data-testid="link-contact-tiktok" className="group flex items-center justify-between border-b border-primary/20 py-5 text-lg transition-colors hover:border-primary">
                تيك توك <span className="flex items-center gap-3 text-xs text-primary/55 transition-transform group-hover:-translate-x-1">[TIKTOK LINK] <Send size={14} strokeWidth={1.3} /></span>
              </a>
            </div>
          </div>
          <footer className="mt-28 flex flex-col gap-5 border-t border-primary/15 pt-7 text-[11px] text-primary/50 md:flex-row md:items-center md:justify-between">
            <span>© ٢٠٢٤ أثر. كل صورة لها قصة.</span>
            <span className="tracking-[.18em]" dir="ltr">RX-MOMENT / VISUAL PRODUCTION</span>
          </footer>
        </div>
      </section>

      <a href={CONTACT_LINKS.whatsapp} data-testid="link-floating-whatsapp" aria-label="التواصل عبر واتساب" className="fixed bottom-5 right-5 z-30 flex items-center gap-3 border border-primary/30 bg-background/90 px-4 py-3 text-xs text-primary shadow-[0_12px_30px_hsl(202_81%_20%/.12)] backdrop-blur-md transition-transform hover:-translate-y-1 md:bottom-8 md:right-8">
        <span className="h-2 w-2 rounded-full bg-primary" /> ابدأ محادثة
      </a>

      {mobileOpen && (
        <div className="fixed inset-0 z-[90] flex flex-col justify-end bg-primary/35 backdrop-blur-sm md:hidden">
          <div className="rounded-t-[2rem] bg-background px-6 pb-10 pt-5">
            <div className="mb-8 flex items-center justify-between">
              <span className="eyebrow text-primary/50">القائمة</span>
              <button type="button" onClick={() => setMobileOpen(false)} data-testid="button-close-mobile-menu" aria-label="إغلاق القائمة" className="flex h-10 w-10 items-center justify-center border border-primary/25"><X size={18} strokeWidth={1.3} /></button>
            </div>
            <nav className="flex flex-col" aria-label="قائمة الهاتف">
              <button type="button" onClick={() => scrollTo(workRef.current)} data-testid="button-mobile-work" className="border-b border-primary/15 py-5 text-right text-2xl">الأعمال</button>
              <button type="button" onClick={() => scrollTo(contactRef.current)} data-testid="button-mobile-contact" className="flex items-center justify-between py-5 text-right text-2xl">لنتحدث <ArrowLeft size={22} strokeWidth={1.2} /></button>
            </nav>
            <p className="mt-8 text-xs leading-7 text-primary/55">صورة • أثر • حكاية</p>
          </div>
        </div>
      )}

      {portfolioCategory && (
        <PortfolioOverlay category={portfolioCategory} onClose={() => { setPortfolioSlug(null); setLightboxIndex(null); }} onOpen={setLightboxIndex} />
      )}

      {lightboxIndex !== null && portfolioCategory && portfolioCategory.works.length > 0 && (
        <Lightbox items={portfolioCategory.works} activeIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} onChange={setLightboxIndex} />
      )}
    </main>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;