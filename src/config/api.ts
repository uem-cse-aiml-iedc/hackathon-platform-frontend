export const API_CONFIG = {
  BASE_URL: 'https://server.aimliedc.tech/h4b-backend',
  ENDPOINTS: {
    AUTH: '/auth',
    HACKATHON: '/hackathon',
  },
} as const;

export const API_URLS = {
  REQUEST_OTP: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH}?option=request`,
  VERIFY_OTP: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH}?option=verify`,
  UPDATE_NAME: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH}?option=update-name`,
  CREATE_HACKATHON: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.HACKATHON}?option=create`,
  UPDATE_HACKATHON: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.HACKATHON}?option=manage`,
  FETCH_MY_HACKATHONS: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.HACKATHON}?option=fetch-my-hackathons`,
  FETCH_SINGLE_HACKATHON: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.HACKATHON}?option=fetch-single`,
} as const;