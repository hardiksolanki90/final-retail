export interface CodeSettingData {
  entityKey: string;
  isCodeAuto: boolean;
  prefixCode?: string | null;
  startCode?: string | null;
  isLocked: boolean;
  nextCommingNumber?: string | null;
}

export interface NextCode {
  code: string | null;
}
