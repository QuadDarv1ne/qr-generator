import { create } from 'zustand';
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

export const useQRStore = create<QRStore>((set) => ({
  dataType: 'url',
  setDataType: (dataType) => set({ dataType }),

  formData: defaultFormData,
  updateFormData: (key, value) =>
    set((state) => ({ formData: { ...state.formData, [key]: value } })),

  colors: defaultColors,
  updateColors: (partial) =>
    set((state) => ({ colors: { ...state.colors, ...partial } })),

  logo: { dataUrl: null, name: '' },
  setLogo: (logo) => set({ logo }),

  dotShape: 'square',
  setDotShape: (dotShape) => set({ dotShape }),

  eyeFrame: 'square',
  setEyeFrame: (eyeFrame) => set({ eyeFrame }),

  eyeBall: 'square',
  setEyeBall: (eyeBall) => set({ eyeBall }),

  errorCorrection: 'M',
  setErrorCorrection: (errorCorrection) => set({ errorCorrection }),

  resolution: 1024,
  setResolution: (resolution) => set({ resolution }),

  printPreset: 'none',
  setPrintPreset: (printPreset) => set({ printPreset }),

  // Reset all settings to defaults
  reset: () => set({
    dataType: 'url',
    formData: defaultFormData,
    colors: defaultColors,
    logo: { dataUrl: null, name: '' },
    dotShape: 'square',
    eyeFrame: 'square',
    eyeBall: 'square',
    errorCorrection: 'M',
    resolution: 1024,
    printPreset: 'none',
  }),
}));
