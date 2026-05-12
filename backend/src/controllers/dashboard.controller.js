import * as DashboardService from "../services/dashboard.service.js";

export const getDashboard = async (req, res) => {
  try {
    const data = await DashboardService.getDashboardOverview();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
