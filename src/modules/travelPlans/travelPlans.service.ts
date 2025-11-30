import { prisma } from "../../config/db";
import AppError from "../../errorHelpers/AppError";
import { ITravelPlan } from "./travelPlans.interface";

const createTravelPlan = async (plan: ITravelPlan, travelerEmail: string) => {
  // Step 1: find the traveler using email
  const traveler = await prisma.traveler.findUnique({
    where: { email: travelerEmail },
  });

  if (!traveler) {
    throw new AppError(404, "Traveler profile not found");
  }

  // Step 2: Check profile completeness
  const isProfileComplete =
    traveler.contactNumber &&
    traveler.address &&
    traveler.profileImage &&
    traveler.bio &&
    traveler.currentLocation &&
    traveler.travelInterests.length > 0 &&
    traveler.visitedCountries.length > 0;

  if (!isProfileComplete) {
    throw new AppError(
      400,
      "Please complete your traveler profile before creating a travel plan"
    );
  }

  // Step 3: Create the travel plan
  const result = await prisma.travelPlan.create({
    data: {
      ...plan,
      travelerId: traveler.id,
    },
  });

  return result;
};

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
