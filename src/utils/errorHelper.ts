import { AxiosError } from 'axios';

export const getApiError = (error: any): string => {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || error.message || 'An unexpected error occurred';
  }
  return error.message || 'An unexpected error occurred';
};
