import { getPlanogramDetails } from '../../api/PlanogramApi';
import { detailKey, useEntityDetail } from '../useEntityDetail';

/** Cache key prefix for single-planogram details; invalidate it when planograms change. */
export const PLANOGRAM_DETAIL_KEY = detailKey('planogram');

/** One planogram's full details (null uuid = nothing selected, no request). */
export function usePlanogramDetail(uuid: string | null) {
  return useEntityDetail('planogram', getPlanogramDetails, uuid);
}
