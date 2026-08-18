import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  QRDataType,
  QRDataForms,
  QRColorSettings,
  DotShape,
  EyeFrameShape,
  EyeBallShape,
  ErrorCorrectionLevel,
  PrintPreset,
} from './qr-types';

interface LogoState {
  dataUrl: string | null;
  name: string;
}

interface QRStore {
  // Data type
  dataType: QRDataType;
  setDataType: (t: QRDataType) => void;

  // Form data
  formData: QRDataForms;
  updateFormData: <K extends keyof QRDataForms>(key: K, value: QRDataForms[K]) => void;

  // Colors
  colors: QRColorSettings;
  updateColors: (partial: Partial<QRColorSettings>) => void;

  // Logo
  logo: LogoState;
  setLogo: (logo: LogoState) => void;
  logoSize: number;
  setLogoSize: (s: number) => void;

  // Design
  dotShape: DotShape;
  setDotShape: (s: DotShape) => void;
  eyeFrame: EyeFrameShape;
  setEyeFrame: (s: EyeFrameShape) => void;
  eyeBall: EyeBallShape;
  setEyeBall: (s: EyeBallShape) => void;

  // Settings
  errorCorrection: ErrorCorrectionLevel;
  setErrorCorrection: (l: ErrorCorrectionLevel) => void;
  resolution: number;
  setResolution: (r: number) => void;
  printPreset: PrintPreset;
  setPrintPreset: (p: PrintPreset) => void;

  // Reset all settings to defaults
  reset: () => void;
}

const defaultFormData: QRDataForms = {
  url: 'https://example.com',
  text: '',
  email: { to: '', subject: '', body: '' },
  phone: '',
  sms: { phone: '', message: '' },
  wifi: { ssid: '', password: '', encryption: 'WPA', hidden: false },
  vcard: {
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    organization: '',
    title: '',
    url: '',
    address: '',
    note: '',
  },
  location: { latitude: '', longitude: '', query: '' },
  event: {
    title: '',
    location: '',
    startDate: '',
    startTime: '09:00',
    endDate: '',
    endTime: '10:00',
    description: '',
  },
  crypto: { currency: 'BTC', address: '', amount: '', label: '' },
  telegram: { username: '', text: '' },
  whatsapp: { phone: '', message: '' },
};

const defaultColors: QRColorSettings = {
  mode: 'solid',
  foregroundColor: '#000000',
  backgroundColor: '#FFFFFF',
  gradientType: 'linear',
  gradientStartColor: '#000000',
  gradientEndColor: '#4F46E5',
  gradientRotation: 0,
  useSeparateDotColor: false,
  dotColor: '#000000',
};

const initialState = {
  dataType: 'url' as QRDataType,
  formData: defaultFormData,
  colors: defaultColors,
  logo: { dataUrl: null as string | null, name: '' },
  logoSize: 22,
  dotShape: 'square' as DotShape,
  eyeFrame: 'square' as EyeFrameShape,
  eyeBall: 'square' as EyeBallShape,
  errorCorrection: 'M' as ErrorCorrectionLevel,
  resolution: 1024,
  printPreset: 'none' as PrintPreset,
};

export const useQRStore = create<QRStore>()(
  persist(
    (set) => ({
      ...initialState,

      setDataType: (dataType) => set({ dataType }),

      updateFormData: (key, value) =>
        set((state) => ({ formData: { ...state.formData, [key]: value } })),

      updateColors: (partial) =>
        set((state) => ({ colors: { ...state.colors, ...partial } })),

      setLogo: (logo) => set({ logo }),

      setLogoSize: (logoSize) => set({ logoSize }),

      setDotShape: (dotShape) => set({ dotShape }),

      setEyeFrame: (eyeFrame) => set({ eyeFrame }),

      setEyeBall: (eyeBall) => set({ eyeBall }),

      setErrorCorrection: (errorCorrection) => set({ errorCorrection }),

      setResolution: (resolution) => set({ resolution }),

      setPrintPreset: (printPreset) => set({ printPreset }),

      // Reset all settings to defaults
      reset: () => set({ ...initialState }),
    }),
    {
      name: 'qr-generator-settings',
      // SSR-safe: on the server there is no localStorage, so persistence is skipped
      storage:
        typeof window !== 'undefined'
          ? createJSONStorage(() => localStorage)
          : undefined,
      partialize: (state) => ({
        ...state,
        // Do not persist the logo (large data URL may exceed localStorage quota)
        logo: { dataUrl: null, name: '' },
      }),
    }
  )
);
