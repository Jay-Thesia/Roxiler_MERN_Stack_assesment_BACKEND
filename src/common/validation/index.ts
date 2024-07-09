import { errorMessage } from '@common/constants/validation.constant';
import Joi from 'joi';


const passwordRegEx = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])(?=.{8,})/
export const commonValidation = {
    passwordCommon: Joi.string()
      .min(8)
      .required()
      .pattern(new RegExp(passwordRegEx))
      .messages({
        ...errorMessage,
      }),
   
  };