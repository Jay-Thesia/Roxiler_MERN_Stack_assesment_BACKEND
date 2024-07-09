import { Request, Response } from "express";

export const generalResponse = async (
    request: Request,
    response: Response,
    data: any = null,
    message: any,
    toast = false,
    responseType = 'success',
    statusCode = 200,
  ) => {
    
    response.status(statusCode).send({
      data,
      message,
      toast,
      responseType,
    });
  };
  