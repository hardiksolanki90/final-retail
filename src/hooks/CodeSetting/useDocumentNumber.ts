import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { reserveCodeIfAuto } from '../../api/CodeSettingApi';
import { useCodeSetting } from './useCodeSetting';

/**
 * A form's document-number field driven by the entity's numbering setting.
 * Auto: shows the next number as a preview and locks the field; the number is only claimed (reserve) on submit,
 * and a claimed number is reused if the submit fails so a retry doesn't burn another one.
 * Manual: `manual` is true and the field stays as typed. Not configured: nothing shown, the server generates on save.
 * `active` = false (e.g. editing a saved record) leaves the field alone.
 */
export function useDocumentNumber(entityKey: string, setNumber: (value: string) => void, active = true) {
  const queryClient = useQueryClient();
  const { codeSetting } = useCodeSetting(entityKey, active);
  const manual = codeSetting?.isCodeAuto === false;
  const next = codeSetting?.isCodeAuto ? codeSetting.nextCommingNumber : null;
  const preview = next ? `${codeSetting?.prefixCode ?? ''}${next}` : null;
  const claimed = useRef<string | undefined>(undefined);
  const wasPreviewing = useRef(false);
  const setNumberRef = useRef(setNumber);
  useEffect(() => {
    setNumberRef.current = setNumber;
  });

  useEffect(() => {
    if (!active) {
      // A closed drawer forgets its claimed number so the next opening starts fresh.
      claimed.current = undefined;
      wasPreviewing.current = false;
      return;
    }
    if (!preview) {
      claimed.current = undefined;
      if (wasPreviewing.current) setNumberRef.current('');
      wasPreviewing.current = false;
      return;
    }
    if (claimed.current) return;
    wasPreviewing.current = true;
    setNumberRef.current(preview);
  }, [active, preview]);

  const reserve = async (typed?: string) => {
    if (claimed.current) return claimed.current;
    const code = await reserveCodeIfAuto(entityKey, preview ? undefined : typed);
    if (preview && code) {
      claimed.current = code;
      setNumberRef.current(code);
      queryClient.invalidateQueries({ queryKey: ['code-setting', entityKey] });
    }
    return code;
  };

  return { manual, preview, locked: Boolean(preview), reserve };
}
