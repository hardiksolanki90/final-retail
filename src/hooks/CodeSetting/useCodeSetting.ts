import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCodeSetting, saveCodeSetting } from '../../api/CodeSettingApi';

export function useCodeSetting(entityKey?: string, enabled: boolean = true) {
    const queryClient = useQueryClient();

    const query = useQuery({ queryKey: ['code-setting', entityKey], queryFn: () => getCodeSetting(entityKey!), enabled: !!entityKey && enabled });

    const saveMutation = useMutation({
        mutationFn: (data: { isCodeAuto: boolean; prefixCode?: string; startCode?: string }) => saveCodeSetting(entityKey!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['code-setting', entityKey] });
        },
    });

    return { codeSetting: query.data, isLoading: query.isLoading, save: saveMutation.mutateAsync, isSaving: saveMutation.isPending };
}
