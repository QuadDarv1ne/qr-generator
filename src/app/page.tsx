'use client';

import { TypeSelector } from '@/components/qr/type-selector';
import { DataForm } from '@/components/qr/data-forms';
import { ColorPanel } from '@/components/qr/color-panel';
import { LogoPanel } from '@/components/qr/logo-panel';
import { DesignPanel } from '@/components/qr/design-panel';
import { SettingsPanel } from '@/components/qr/settings-panel';
import { QRPreview } from '@/components/qr/qr-preview';
import { QRDataPreview } from '@/components/qr/qr-data-preview';
import { ExportPanel } from '@/components/qr/export-panel';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  QrCode,
  Palette,
  ImageIcon,
  Shapes,
  Settings2,
  Sparkles,
  Download,
  Zap,
  Shield,
  MonitorSmartphone,
  ExternalLink,
} from 'lucide-react';
import { motion, type Variants } from 'framer-motion';

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors py-1.5 px-2 rounded-md hover:bg-accent/50"
    >
      <ExternalLink className="h-3 w-3 shrink-0" />
      <span>{label}</span>
    </a>
  );
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      variants={fadeUp}
      className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card hover:bg-accent/50 transition-colors group"
    >
      <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <h3 className="font-semibold text-sm">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  return (
    <AccordionItem value={q} className="border-border">
      <AccordionTrigger className="text-sm font-medium text-left">
        {q}
      </AccordionTrigger>
      <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
        {a}
      </AccordionContent>
    </AccordionItem>
  );
}

export default function QRGeneratorPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <QrCode className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight">QR Generator</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="hidden sm:flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5" />
              Бесплатно
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" />
              Без водяных знаков
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero — compact on mobile */}
      <section className="border-b border-border bg-muted/30">
        <div className="container mx-auto px-4 md:px-6 py-5 md:py-10">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight">
              Профессиональный{' '}
              <span className="text-primary">QR-код генератор</span>
            </h1>
            <p className="mt-2 md:mt-3 text-muted-foreground text-sm md:text-lg leading-relaxed">
              Уникальный дизайн, логотипы, градиенты, экспорт для печати. 12 типов данных, 8 форм точек.
            </p>
          </div>
        </div>
      </section>

      {/* Type selector */}
      <section className="border-b border-border bg-card">
        <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
          <TypeSelector />
        </div>
      </section>

      {/* Main generator */}
      <main className="flex-1">
        <div className="container mx-auto px-4 md:px-6 py-4 md:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8">

            {/* Mobile: Preview first, then controls */}
            <div className="lg:hidden space-y-4">
              {/* Preview card (mobile) */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-card rounded-2xl border border-border shadow-sm p-4"
              >
                <h2 className="font-semibold text-center mb-3 flex items-center justify-center gap-2 text-sm">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Предпросмотр
                </h2>
                <QRPreview />
                <div className="mt-4">
                  <QRDataPreview />
                </div>
              </motion.div>
              {/* Export card (mobile) */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 }}
                className="bg-card rounded-2xl border border-border shadow-sm p-4"
              >
                <h2 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                  <Download className="h-4 w-4 text-primary" />
                  Экспорт
                </h2>
                <ExportPanel />
              </motion.div>
            </div>

            {/* Left panel — Controls (desktop: left, mobile: below preview) */}
            <div className="lg:col-span-7 xl:col-span-8">
              <div className="bg-card rounded-2xl border border-border shadow-sm">
                <Accordion
                  type="multiple"
                  defaultValue={['content', 'design']}
                  className="w-full"
                >
                  <AccordionItem value="content" className="border-border px-4 md:px-5">
                    <AccordionTrigger className="py-3.5 md:py-4 hover:no-underline">
                      <div className="flex items-center gap-2">
                        <QrCode className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-sm md:text-base">Содержимое</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 md:pb-5">
                      <DataForm />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="colors" className="border-border px-4 md:px-5">
                    <AccordionTrigger className="py-3.5 md:py-4 hover:no-underline">
                      <div className="flex items-center gap-2">
                        <Palette className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-sm md:text-base">Цвета</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 md:pb-5">
                      <ColorPanel />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="logo" className="border-border px-4 md:px-5">
                    <AccordionTrigger className="py-3.5 md:py-4 hover:no-underline">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-sm md:text-base">Логотип</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 md:pb-5">
                      <LogoPanel />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="design" className="border-border px-4 md:px-5">
                    <AccordionTrigger className="py-3.5 md:py-4 hover:no-underline">
                      <div className="flex items-center gap-2">
                        <Shapes className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-sm md:text-base">Дизайн</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 md:pb-5">
                      <DesignPanel />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="settings" className="border-border px-4 md:px-5">
                    <AccordionTrigger className="py-3.5 md:py-4 hover:no-underline">
                      <div className="flex items-center gap-2">
                        <Settings2 className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-sm md:text-base">Настройки</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 md:pb-5">
                      <SettingsPanel />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>

            {/* Right panel — Preview + Export (desktop only) */}
            <div className="hidden lg:block lg:col-span-5 xl:col-span-4">
              <div className="sticky top-20 space-y-5">
                <motion.div
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="bg-card rounded-2xl border border-border shadow-sm p-6"
                >
                  <h2 className="font-semibold text-center mb-4 flex items-center justify-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Предпросмотр
                  </h2>
                  <QRPreview />
                  <div className="mt-4">
                    <QRDataPreview />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="bg-card rounded-2xl border border-border shadow-sm p-5"
                >
                  <h2 className="font-semibold mb-3 flex items-center gap-2">
                    <Download className="h-4 w-4 text-primary" />
                    Экспорт
                  </h2>
                  <ExportPanel />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features */}
      <section className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-4 md:px-6 py-10 md:py-16">
          <h2 className="text-xl md:text-2xl font-bold text-center mb-6 md:mb-8">Возможности</h2>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4"
          >
            <FeatureCard
              icon={QrCode}
              title="12 типов данных"
              description="URL, текст, email, телефон, SMS, Wi-Fi, vCard, геолокация, события, криптовалюта, Telegram и WhatsApp."
            />
            <FeatureCard
              icon={Palette}
              title="Градиенты и цвета"
              description="Сплошные цвета, линейные и радиальные градиенты с настройкой угла поворота."
            />
            <FeatureCard
              icon={Shapes}
              title="8 форм точек"
              description="Квадраты, круги, ромбы, звёзды и другие формы для уникального дизайна QR-кода."
            />
            <FeatureCard
              icon={MonitorSmartphone}
              title="Готово к печати"
              description="Пресеты для визиток, наклеек, бейджей с автоматической коррекцией ошибок."
            />
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border">
        <div className="container mx-auto px-4 md:px-6 py-10 md:py-16">
          <h2 className="text-xl md:text-2xl font-bold text-center mb-6 md:mb-8">
            Часто задаваемые вопросы
          </h2>
          <div className="max-w-2xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <FAQItem
                q="Какие форматы экспорта доступны?"
                a="Вы можете скачать QR-код в форматах PNG (растровое изображение высокого разрешения), SVG (вектор) и PDF (формат A4 для печати с выбором размера). Также доступно копирование в буфер обмена."
              />
              <FAQItem
                q="Могу ли я добавить логотип в QR-код?"
                a="Да! Загрузите логотип в формате PNG, JPG, SVG или WEBP (до 2 МБ). Рекомендуется использовать максимальный уровень коррекции ошибок (H) для лучшей читаемости."
              />
              <FAQItem
                q="Какой уровень коррекции ошибок выбрать?"
                a="Низкий (L) — максимальная плотность данных. Средний (M) — хороший баланс. Высокий (Q) — для логотипов. Максимальный (H) — для печати и логотипов, до 30% кода может быть повреждено."
              />
              <FAQItem
                q="Для чего нужны пресеты печати?"
                a="Пресеты автоматически подбирают оптимальное разрешение и уровень коррекции ошибок для конкретного носителя: визитки, пластиковые карты, наклейки, бейджи, меню и упаковка."
              />
              <FAQItem
                q="Генератор бесплатный?"
                a="Да, полностью! Все функции бесплатны, нет водяных знаков, нет ограничений на количество генераций. QR-коды можно использовать в коммерческих целях."
              />
            </Accordion>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-auto">
        <div className="container mx-auto px-4 md:px-6 py-8 md:py-10">
          {/* Top row — author & project info */}
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 mb-6">
            <div className="flex flex-col items-center md:items-start gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                  <QrCode className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-bold text-sm tracking-tight">QR Generator</span>
              </div>
              <p className="text-xs text-muted-foreground text-center md:text-left">
                Школа программирования Maestro7IT
              </p>
              <p className="text-xs text-muted-foreground text-center md:text-left">
                Автор: <span className="font-medium text-foreground">Дуплей Максим Игоревич</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Дата создания проекта: 18.08.2026
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border pt-6">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 text-center">
              Школа программирования Maestro7IT — Полезные ссылки
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              <FooterLink href="https://school-maestro7it.ru/" label="Сайт школы" />
              <FooterLink href="https://via-antiqua-maestro7it.amvera.io/" label="Via Antiqua" />
              <FooterLink href="https://t.me/quadd4rv1n7" label="Telegram" />
              <FooterLink href="https://vk.com/maestro7it" label="VK" />
              <FooterLink href="https://wa.me/79150480249" label="WhatsApp" />
              <FooterLink href="https://www.youtube.com/channel/UCqA5pl9NkVDrirMDlNVmU7g" label="YouTube" />
              <FooterLink href="https://rutube.ru/channel/4218729/" label="RuTube" />
              <FooterLink href="https://plvideo.ru/@it-coders" label="PLVideo" />
              <FooterLink href="https://live.vkvideo.ru/quadd4rv1n7" label="VK Video" />
              <FooterLink href="https://github.com/QuadDarv1ne" label="GitHub" />
              <FooterLink href="https://github.com/QuadDarv1ne/maestro7it_education" label="GitHub Edu" />
              <FooterLink href="https://gitverse.ru/quadd4rv1n7/maestro7it_education" label="Gitverse" />
              <FooterLink href="https://orcid.org/0009-0007-7605-539X" label="ORCID" />
              <FooterLink href="https://stepik.org/users/150943726/teach" label="Stepik" />
              <FooterLink href="https://worldchess.com/profile/1094367" label="Chess" />
              <FooterLink href="https://taplink.cc/maestro7it" label="TapLink" />
              <FooterLink href="https://max.ru/u/f9LHodD0cOLxcVXpSMqTSZLCFG_q6uz0QRQKOhGSBc5RIx4h-KYqVRvzW3k" label="Макс.про" />
              <FooterLink href="http://school-maestro7it.tilda.ws/price-list" label="Прайс-лист" />
              <FooterLink href="http://school-maestro7it.tilda.ws/faq/ru" label="FAQ школы" />
              <FooterLink href="https://infourok.ru/user/duplej-maksim-igorevich" label="Инфоурок" />
            </div>
          </div>

          {/* Bottom row */}
          <div className="mt-6 pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              Бесплатно для коммерческого использования
            </p>
            <p className="text-xs text-muted-foreground">
              © 2026 Maestro7IT — Дуплей Максим Игоревич
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
