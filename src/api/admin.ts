import api from './axios';

export const getPendingRequests = async () => {
  const response = await api.get('/admin/requests');
  return response.data;
};

export const reviewRequest = async (requestId: string, status: 'approved' | 'rejected', notes: string) => {
  const response = await api.post(`/admin/requests/${requestId}/review`, { status, notes });
  return response.data;
};

export const getSignedUrl = async (filePath: string, bucket: string = 'kyc-documents') => {
  const response = await api.get(`/admin/signed-url`, { params: { filePath, bucket } });
  return response.data;
};
