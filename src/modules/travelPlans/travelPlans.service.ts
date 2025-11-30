import { ITravelPlan } from "./travelPlans.interface";

const createTravelPlan = async (plan: ITravelPlan) => {};

const getTravelPlanById = (id: string) => {};

const getAllTravelPlans = () => {};

const updateTravelPlan = (id: string, payload: Partial<ITravelPlan>) => {};

const deleteTravelPlan = (id: string) => {};

export const TravelService = {
  createTravelPlan,
  getTravelPlanById,
  getAllTravelPlans,
  updateTravelPlan,
  deleteTravelPlan,
};
