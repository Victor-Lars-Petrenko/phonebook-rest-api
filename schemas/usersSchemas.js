import Joi from "joi";

export const userSignupSchema = Joi.object({
  password: Joi.string().required(),
  email: Joi.string().required(),
});

export const userSigninSchema = Joi.object({
  password: Joi.string().required(),
  email: Joi.string().required(),
});

export const updateSubscriptionSchema = Joi.object({
  email: Joi.string().required(),
  subscription: Joi.string().valid("starter", "pro", "business").required(),
});

export const userEmailSchema = Joi.object({
  email: Joi.string().required(),
});
