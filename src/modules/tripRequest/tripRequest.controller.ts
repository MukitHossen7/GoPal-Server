import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { IJwtPayload } from "../../types/common";
import sendResponse from "../../utils/sendResponse";
import { TripRequestService } from "./tripRequest.service";

const sendTripRequest = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const user = req.user as IJwtPayload;
    const { travelPlanId } = req.body;
    const result = await TripRequestService.requestToJoin(user, travelPlanId);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Request sent successfully",
      data: result,
    });
  }
);

const getIncomingRequests = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const user = req.user as IJwtPayload;
    const result = await TripRequestService.getIncomingRequests(user);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Incoming requests retrieved",
      data: result,
    });
  }
);

const respondToRequest = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const user = req.user as IJwtPayload;
    const { requestId, status } = req.body; // status: APPROVED | REJECTED
    const result = await TripRequestService.respondToRequest(
      user,
      requestId,
      status
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Request ${status.toLowerCase()} successfully`,
      data: result,
    });
  }
);

export const TripRequestController = {
  sendTripRequest,
  getIncomingRequests,
  respondToRequest,
};
