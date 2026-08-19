**Список задач для проекта:**
1. ✅ Улучшить проект для публикации на *Amvera* — добавлены `Dockerfile`, `.dockerignore` и `amvera.yml`
2. ✅ Написать *Dockerfile* для правильной сборки проекта — многоступенчатая сборка (Bun + Next.js standalone)
3. ✅ Экспорт в JPG, вывод PNG из REST API (sharp), исправление ошибки `logoShape` в рендерере, кроссплатформенный скрипт сборки, правки текстов (12 типов / 11 форм точек), полупрозрачная подложка логотипа при прозрачном фоне
4. ✅ Сканер QR-кодов (фото/камера через jsQR) с импортом распознанного содержимого в генератор: URL, Wi-Fi, vCard, MECARD, VEVENT, Telegram, WhatsApp, криптовалюта и др.
5. ✅ Юнит-тесты (Bun): `qr-encoders.test.ts` и `qr-importer.test.ts` — 43 теста
6. ✅ PWA-подготовка: манифест (`manifest.ts`), иконки 192/512/maskable/apple-touch (генерация через sharp), метаданные PWA в layout
7. ✅ SEO: Open Graph, Twitter Cards, канонический URL, `sitemap.ts`, расширенные метаданные
8. ✅ REST API: поддержка JPG в `GET`/`POST /api/qr` (sharp)
9. ✅ Исправления: баг индикатора загрузки в сканере (finally срабатывал до загрузки изображения), утечка object URL, парсинг MECARD вместо vCard-парсера, VEVENT-импорт, детекция t.me/wa.me, нормализация переводов строк в vCard/VEVENT, формат дат iCalendar (YYYYMMDDTHHMMSS)

**Дата:** 19.08.2026