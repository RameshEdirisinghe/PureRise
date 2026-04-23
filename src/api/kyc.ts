import api from './axios';

/**
 * Upload an image for KYC verification
 * @param file The file to upload
 * @returns The file path/URL from Supabase
 */
export const uploadKYCImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/kyc/kyc-upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to upload image');
  }

  return response.data.data.filePath;
};

/**
 * Submit the final onboarding application
 * @param data The complete onboarding data
 */
export const submitOnboarding = async (data: any) => {
  const response = await api.post('/onboarding/campaign-owner', data);
  return response.data;
};
