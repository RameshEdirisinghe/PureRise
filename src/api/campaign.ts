import api from './axios';

/**
 * Campaign API Client
 * Handles all campaign-related API calls with proper error handling
 */

export interface IMilestone {
  title: string;
  description: string;
  percentage: number;
}

export interface CreateCampaignPayload {
  title: string;
  summary: string;
  description: string;
  category: 'startup' | 'medical' | 'education' | 'social' | 'technology' | 'personal';
  coverImage: string;
  goalDescription: string;
  milestones: IMilestone[];
}

export interface CampaignResponse {
  id: string;
  title: string;
  status: 'draft' | 'pending_approval' | 'active' | 'paused' | 'completed' | 'rejected';
  category: string;
  createdAt: string;
}

/**
 * Create a new campaign
 * 
 * @param payload Campaign data including title, description, category, image, and milestones
 * @returns Campaign data with ID and status
 * @throws Error if validation fails or user is not a projectOwner
 */
export const createCampaignApi = async (
  payload: CreateCampaignPayload
): Promise<{ campaign: CampaignResponse }> => {
  try {
    const { data } = await api.post<{ success: boolean; message: string; data: { campaign: CampaignResponse } }>(
      '/campaigns/create',
      payload
    );
    return data.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Upload campaign cover image or media
 * 
 * @param file File to upload
 * @returns Object containing file path in Supabase
 * @throws Error with helpful diagnostic messages if connection fails
 */
export const uploadCampaignMediaApi = async (
  file: File
): Promise<{ filePath: string }> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post<{
      success: boolean;
      message: string;
      data: { filePath: string };
    }>('/campaigns/media-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return data.data;
  } catch (error: any) {
    // Provide helpful error messages for common issues
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      const errorMsg = `
🔌 Backend Connection Failed
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✗ Cannot connect to: http://localhost:5000/api

FIX: Make sure backend server is running:

1. Open new terminal
2. Run: cd backend && npm run dev
3. You should see: 🚀 PureRaise API running on http://localhost:5000

Then try uploading again.

TROUBLESHOOT:
• Is Node.js installed? (node --version)
• Is MongoDB running? 
• Is port 5000 already in use? (netstat -ano | findstr :5000)

See: BACKEND_CONNECTION_TROUBLESHOOT.md
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `.trim();
      error.userFriendlyMessage = errorMsg;
    }

    console.error('Campaign API Error:', error);
    throw error;
  }
};

/**
 * Get all campaigns created by the current user
 * 
 * @returns Array of campaigns
 */
export const getMyCampaignsApi = async (): Promise<CampaignResponse[]> => {
  try {
    const { data } = await api.get<{
      success: boolean;
      message: string;
      data: CampaignResponse[];
    }>('/campaigns/my-campaigns');
    return data.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch all pending campaigns (Admin only)
 */
export const getPendingCampaignsApi = async (): Promise<any[]> => {
  try {
    const { data } = await api.get<{
      success: boolean;
      message: string;
      data: any[];
    }>('/campaigns/pending');
    return data.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Review a campaign (Admin only)
 */
export const reviewCampaignApi = async (
  campaignId: string,
  status: 'active' | 'rejected',
  notes?: string
): Promise<any> => {
  try {
    const { data } = await api.patch<{
      success: boolean;
      message: string;
      data: any;
    }>(`/campaigns/${campaignId}/review`, { status, notes });
    return data.data;
  } catch (error) {
    throw error;
  }
};
