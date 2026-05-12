const KEYS = {
  profile: 'tth_settings_profile',
  system: 'tth_settings_system',
  apis: 'tth_settings_apis',
} as const;

export type ProfileSettings = {
  hoten: string;
  email: string;
  sodienthoai: string;
  chucdanh: string;
  ghichu: string;
  /** Địa chỉ liên hệ (lưu cục bộ). */
  diaChi: string;
  /** Zalo, Skype, mạng xã hội… (lưu cục bộ). */
  lienHePhu: string;
};

export type SystemSettings = {
  tenBenhVien: string;
  diaChi: string;
  hotline: string;
  emailTiepNhan: string;
  ngonNgu: string;
  timezone: string;
};

export type PayosApiForm = {
  clientId: string;
  apiKey: string;
  checksumKey: string;
  partnerCode: string;
  enabled: boolean;
};

export type GeminiApiForm = {
  apiKey: string;
  enabled: boolean;
};

export type SmsApiForm = {
  apiUrl: string;
  apiKey: string;
  brandName: string;
  enabled: boolean;
};

export type BhytApiForm = {
  apiBaseUrl: string;
  username: string;
  password: string;
  maCoSoKcb: string;
  enabled: boolean;
};

export type ApiIntegrationsSettings = {
  payos: PayosApiForm;
  gemini: GeminiApiForm;
  sms: SmsApiForm;
  bhyt: BhytApiForm;
};

export const defaultProfile = (): ProfileSettings => ({
  hoten: '',
  email: '',
  sodienthoai: '',
  chucdanh: '',
  ghichu: '',
  diaChi: '',
  lienHePhu: '',
});

export const defaultSystem = (): SystemSettings => ({
  tenBenhVien: 'Bệnh viện TTH',
  diaChi: '',
  hotline: '',
  emailTiepNhan: '',
  ngonNgu: 'vi',
  timezone: 'Asia/Ho_Chi_Minh',
});

export const defaultApis = (): ApiIntegrationsSettings => ({
  payos: {
    clientId: '',
    apiKey: '',
    checksumKey: '',
    partnerCode: '',
    enabled: false,
  },
  gemini: { apiKey: '', enabled: false },
  sms: { apiUrl: '', apiKey: '', brandName: '', enabled: false },
  bhyt: {
    apiBaseUrl: '',
    username: '',
    password: '',
    maCoSoKcb: '',
    enabled: false,
  },
});

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) } as T;
  } catch {
    return fallback;
  }
}

export function loadProfile(): ProfileSettings {
  return readJson(KEYS.profile, defaultProfile());
}

export function saveProfile(v: ProfileSettings) {
  localStorage.setItem(KEYS.profile, JSON.stringify(v));
}

export function loadSystem(): SystemSettings {
  const d = defaultSystem();
  return readJson(KEYS.system, d);
}

export function saveSystem(v: SystemSettings) {
  localStorage.setItem(KEYS.system, JSON.stringify(v));
}

export function loadApis(): ApiIntegrationsSettings {
  const d = defaultApis();
  const raw = readJson(KEYS.apis, d);
  return {
    payos: { ...d.payos, ...raw.payos },
    gemini: { ...d.gemini, ...raw.gemini },
    sms: { ...d.sms, ...raw.sms },
    bhyt: { ...d.bhyt, ...raw.bhyt },
  };
}

export function saveApis(v: ApiIntegrationsSettings) {
  localStorage.setItem(KEYS.apis, JSON.stringify(v));
}
