import axios from 'axios';

const root = import.meta.env.VITE_API_BASE_URL;
const API_URL = root
  ? `${String(root).replace(/\/$/, '')}/api/dashboard`
  : '/api/dashboard';

const DashboardService = {
  getOverview: async () => {
    const res = await axios.get(API_URL);
    return res.data;
  },
};

export default DashboardService;
