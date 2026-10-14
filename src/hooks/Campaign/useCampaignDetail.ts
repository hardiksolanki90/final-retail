import { getCampaignDetails } from '../../api/CampaignApi';
import { detailKey, useEntityDetail } from '../useEntityDetail';

/** Cache key prefix for single-campaign details; invalidate it when campaigns change. */
export const CAMPAIGN_DETAIL_KEY = detailKey('campaign');

/** One campaign's full details (null uuid = nothing selected, no request). */
export function useCampaignDetail(uuid: string | null) {
  return useEntityDetail('campaign', getCampaignDetails, uuid);
}
