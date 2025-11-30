import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { TravelService } from "./travelPlans.service";
import sendResponse from "../../utils/sendResponse";

const createTravelPlan = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await TravelService.createTravelPlan(payload);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Create Travel Plane successfully",
    data: result,
  });
});

const getTravelPlanById = catchAsync(async (req: Request, res: Response) => {
  const travelPlanId = req.params.id;
  const result = await TravelService.getTravelPlanById(travelPlanId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Get by Id Travel Plane successfully",
    data: result,
  });
});

const getAllTravelPlans = catchAsync(async (req: Request, res: Response) => {
  const result = await TravelService.getAllTravelPlans();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Get All Travel Plane successfully",
    data: result,
  });
});

const updateTravelPlan = catchAsync(async (req: Request, res: Response) => {
  const travelPlanId = req.params.id;
  const payload = req.body;
  const result = await TravelService.updateTravelPlan(travelPlanId, payload);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Get All Travel Plane successfully",
    data: result,
  });
});

const deleteTravelPlan = catchAsync(async (req: Request, res: Response) => {
  const travelPlanId = req.params.id;
  const result = await TravelService.deleteTravelPlan(travelPlanId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Get All Travel Plane successfully",
    data: result,
  });
});

export const TravelController = {
  createTravelPlan,
  getTravelPlanById,
  getAllTravelPlans,
  updateTravelPlan,
  deleteTravelPlan,
};
