import jwt from 'jsonwebtoken';
import { HttpException } from "../helper/response/httpException";
import { NextFunction, Request, Response } from 'express';
import _ from 'lodash';
import passport from 'passport';
import { FRONT_URL, SECRET_KEY } from '@/configs/env.config';
import Auth from '@/models/Auth.model';
// By Pass Url
const byPassUrls = ['test'];

const checkInclude = (req: Request) => {
  return byPassUrls.find((a) => req.url.includes(a));
};

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {

    if (
      req.headers?.authorization &&
      req.headers?.authorization.startsWith("Bearer")
    ) {
      const token = req.headers.authorization.split(" ")[1];

      const userData: any = jwt.verify(token, SECRET_KEY);
     
      const email = userData.email;
      if (!userData) {
        return res.redirect(`${FRONT_URL}/`);
      }

      const portal = await Auth.findOne({email});

      if (!portal) {
        // flash portal not found
        return res.redirect(`${FRONT_URL}/`);
      }


      return next();
    } else {
      return res.redirect(`${FRONT_URL}/`);
    }
  } catch (error) {
    throw new HttpException(401, 'INVALID_TOKEN', true);
  }
};

const setUserData = (req: any, user: any) => {
  const byPassVerifications = ['/2FA/verify', '/2FA/qr', 'set-password'];

  if (user && !user?.verified && !byPassVerifications.find((a) => req.url.includes(a)))
    throw new HttpException(401, 'INVALID_TOKEN');

  req.tokenData = {
    email: user,
  };
};

export default authMiddleware;