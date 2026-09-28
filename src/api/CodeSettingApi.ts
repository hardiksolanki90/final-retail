import axiosInstance from '../lib/axios';
import type { CodeSettingData, NextCode } from '../types/CodeSetting';

export const getCodeSetting = async (entityKey: string): Promise<CodeSettingData> => {
  const response = await axiosInstance.get(`/code-setting/${entityKey}`);
  return response.data?.data;
};

export const saveCodeSetting = async (
  entityKey: string,
  data: { isCodeAuto: boolean; prefixCode?: string; startCode?: string }
): Promise<CodeSettingData> => {
  const response = await axiosInstance.post('/code-setting', { entityKey, ...data });
  return response.data?.data;
};

export const getNextCode = async (entityKey: string): Promise<NextCode> => {
  const response = await axiosInstance.post('/get-next-comming-code', { entityKey });
  return response.data?.data;
};

/**
 * Reserves the next auto-generated code at the moment the form's
 * Create/Update button is clicked — not earlier. Called from each Add
 * form's onFormSubmit, before the create/update request. Leaves
 * currentValue untouched if it's already set (manual entry) or if the
 * entity has no auto-numbering configured.
 */
export const reserveCodeIfAuto = async (
  entityKey: string,
  currentValue: string | undefined
): Promise<string | undefined> => {
  if (currentValue) return currentValue;
  const next = await getNextCode(entityKey);
  return next.code ?? currentValue;
};
