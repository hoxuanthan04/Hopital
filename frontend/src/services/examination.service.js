import axios from 'axios';

const root = import.meta.env.VITE_API_BASE_URL;
const API = root
  ? `${String(root).replace(/\/$/, '')}/api/examination`
  : '/api/examination';

const ExaminationService = {
  getSession: async (maluotkham) => {
    const res = await axios.get(`${API}/session`, { params: { maluotkham } });
    return res.data;
  },

  addChidinh: async (body) => {
    const res = await axios.post(`${API}/chidinh`, body);
    return res.data;
  },

  deleteChidinh: async (machidinh) => {
    const res = await axios.delete(`${API}/chidinh/${machidinh}`);
    return res.data;
  },

  markChidinhHoanThanh: async (machidinh) => {
    const res = await axios.patch(`${API}/chidinh/${machidinh}/hoanthanh`);
    return res.data;
  },

  complete: async (body) => {
    const res = await axios.post(`${API}/complete`, body);
    return res.data;
  },
};

export default ExaminationService;
