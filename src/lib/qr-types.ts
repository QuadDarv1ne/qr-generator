// QR Code data type definitions

export type QRDataType =
  | 'url'
  | 'text'
  | 'email'
  | 'phone'
  | 'sms'
  | 'wifi'
  | 'vcard'
  | 'location'
  | 'event'
  | 'crypto'
  | 'telegram'
  | 'whatsapp';

export interface QRDataForms {
  url: string;
  text: string;
  email: { to: string; subject: string; body: string };
  phone: string;
  sms: { phone: string; message: string };
  wifi: { ssid: string; password: string; encryption: 'NOPASS' | 'WEP' | 'WPA'; hidden: boolean };
  vcard: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    organization: string;
    title: string;
    url: string;
    address: string;
    note: string;
  };
  location: { latitude: string; longitude: string; query: string };
  event: {
    title: string;
    location: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    description: string;
  };
  crypto: { currency: CryptoCurrency; address: string; amount: string; label: string };
  telegram: { username: string; text: string };
  whatsapp: { phone: string; message: string };
}

export type CryptoCurrency = 'BTC' | 'ETH' | 'USDT' | 'LTC' | 'DOGE' | 'BCH';

export const CRYPTO_CURRENCY_LABELS: Record<CryptoCurrency, string> = {
  BTC: 'Bitcoin (BTC)',
  ETH: 'Ethereum (ETH)',
  USDT: 'Tether (USDT, TRC-20)',
  LTC: 'Litecoin (LTC)',
  DOGE: 'Dogecoin (DOGE)',
  BCH: 'Bitcoin Cash (BCH)',
};

export interface QRColorSettings {
  mode: 'solid' | 'gradient';
  foregroundColor: string;
  backgroundColor: string;
  gradientType: 'linear' | 'radial';
  gradientStartColor: string;
  gradientEndColor: string;
  gradientRotation: number;
  useSeparateDotColor: boolean;
  dotColor: string;
  transparentBackground: boolean;
  useSeparateEyeColor: boolean;
  eyeFrameColor: string;
  eyeBallColor: string;
}

export type DotShape =
  | 'square'
  | 'rounded'
  | 'dots'
  | 'classy'
  | 'classy-rounded'
  | 'diamond'
  | 'star'
  | 'extra-rounded';

export type EyeFrameShape =
  | 'square'
  | 'dot'
  | 'rounded'
  | 'extra-rounded'
  | 'circle';

export type EyeBallShape =
  | 'square'
  | 'dot'
  | 'rounded'
  | 'circle';

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export type PrintPreset =
  | 'none'
  | 'business-card'
  | 'plastic-card'
  | 'sticker'
  | 'badge'
  | 'menu'
  | 'packaging';

export const QR_DATA_TYPE_LABELS: Record<QRDataType, string> = {
  url: 'URL',
  text: 'Текст',
  email: 'Email',
  phone: 'Телефон',
  sms: 'SMS',
  wifi: 'Wi-Fi',
  vcard: 'Контакт (vCard)',
  location: 'Геолокация',
  event: 'Событие',
  crypto: 'Криптовалюта',
  telegram: 'Telegram',
  whatsapp: 'WhatsApp',
};

export const QR_DATA_TYPE_ICONS: Record<QRDataType, string> = {
  url: 'Link',
  text: 'Type',
  email: 'Mail',
  phone: 'Phone',
  sms: 'MessageSquare',
  wifi: 'Wifi',
  vcard: 'Contact',
  location: 'MapPin',
  event: 'Calendar',
  crypto: 'Coins',
  telegram: 'Send',
  whatsapp: 'MessageCircle',
};

export const PRINT_PRESET_LABELS: Record<PrintPreset, string> = {
  none: 'Без печати',
  'business-card': 'Визитка',
  'plastic-card': 'Пластиковая карта',
  sticker: 'Наклейка',
  badge: 'Бейдж',
  menu: 'Меню / тейбл-тент',
  packaging: 'Упаковка / коробка',
};

export const DOT_SHAPE_LABELS: Record<DotShape, string> = {
  square: 'Квадрат',
  rounded: 'Скруглённый',
  dots: 'Круги',
  classy: 'Классический',
  'classy-rounded': 'Класс. скруглённый',
  diamond: 'Ромб',
  star: 'Звезда',
  'extra-rounded': 'Макс. скруглённый',
};

export const EYE_FRAME_LABELS: Record<EyeFrameShape, string> = {
  square: 'Квадрат',
  dot: 'Точка',
  rounded: 'Скруглённый',
  'extra-rounded': 'Макс. скруглённый',
  circle: 'Круг',
};

export const EYE_BALL_LABELS: Record<EyeBallShape, string> = {
  square: 'Квадрат',
  dot: 'Точка',
  rounded: 'Скруглённый',
  circle: 'Круг',
};
