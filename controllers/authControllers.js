import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import gravatar from "gravatar";
import path from "path";
import fs from "fs/promises";
import Jimp from "jimp";
import { nanoid } from "nanoid";

import HttpError from "../helpers/HttpError.js";
import sendEmail from "../helpers/sendEmail.js";

import {
  userSigninSchema,
  userSignupSchema,
  updateSubscriptionSchema,
  userEmailSchema,
} from "../schemas/usersSchemas.js";

import { findUser, signup, updateUser } from "../services/authServices.js";

const { JWT_SECRET, PROJECT_URL } = process.env;

const avatarsDir = path.resolve("public", "avatars");

export const register = async (req, res, next) => {
  try {
    const { error } = userSignupSchema.validate(req.body);
    if (error) {
      throw HttpError(400, error.message);
    }

    const { email, password } = req.body;
    const user = await findUser({ email });
    if (user) {
      throw HttpError(409, "Email in use");
    }

    const avatarURL = gravatar.url(email);

    const hashed = await bcrypt.hash(password, 10);

    const verificationToken = nanoid();

    const newUser = await signup({
      ...req.body,
      password: hashed,
      avatarURL,
      verificationToken,
    });

    const verifyEmail = {
      to: email,
      subject: "Verify email",
      html: `<a target="_blank" href="${PROJECT_URL}/api/users/verify/${verificationToken}">Click to verify</a>`,
    };

    await sendEmail(verifyEmail);

    res.status(201).json({
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { error } = userSigninSchema.validate(req.body);
    if (error) {
      throw HttpError(400, error.message);
    }

    const { email, password } = req.body;
    const user = await findUser({ email });
    if (!user) {
      throw HttpError(401, "Email or password is wrong");
    }

    if (!user.verify) {
      throw HttpError(401, "Email is not verified");
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      throw HttpError(401, "Email or password is wrong");
    }

    const { _id: id, subscription } = user;
    const payload = { id };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "23h" });

    await updateUser({ _id: id }, { token });
    res.status(201).json({
      token,
      user: {
        email,
        subscription,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  const { _id } = req.user;
  await updateUser({ _id }, { token: "" });
  res.status(204).json();
};

export const getCurrent = async (req, res) => {
  const { email, subscription } = req.user;
  res.status(200).json({ email, subscription });
};

export const updateUserSubscription = async (req, res, next) => {
  try {
    const { error } = updateSubscriptionSchema.validate(req.body);
    if (error) {
      throw HttpError(400, error.message);
    }
    const { email: emailToFind } = req.body;
    const user = await findUser({ email: emailToFind });
    if (!user) {
      throw HttpError(404);
    }
    const updatedUser = await updateUser({ email: emailToFind }, req.body);
    const { email, subscription } = updatedUser;
    res.status(200).json({ user: { email, subscription } });
  } catch (error) {
    next(error);
  }
};

export const updateUserAvatar = async (req, res, next) => {
  try {
    const { _id } = req.user;
    if (!req.file) {
      throw HttpError(400, "Image not found");
    }
    const { path: tempUpload, originalname } = req.file;

    try {
      const image = await Jimp.read(tempUpload);
      await image.resize(250, 250).writeAsync(tempUpload);
    } catch (error) {
      throw HttpError(500, "File writing error");
    }

    const filename = `${_id}_${originalname}`;
    const resultUpload = path.join(avatarsDir, filename);
    await fs.rename(tempUpload, resultUpload);
    const avatarURL = path.join("avatars", filename);
    await updateUser({ _id }, { avatarURL });

    res.json({
      avatarURL,
    });
  } catch (error) {
    next(error);
  }
};

export const verify = async (req, res, next) => {
  try {
    const { verificationToken } = req.params;
    const user = await findUser({ verificationToken });
    if (!user) {
      throw HttpError(404, "User not found");
    }
    await updateUser(
      { _id: user._id },
      { verify: true, verificationToken: null }
    );
    res.status(200).json({ message: "Verification successful" });
  } catch (error) {
    next(error);
  }
};

export const resendVerify = async (req, res, next) => {
  try {
    const { error } = userEmailSchema.validate(req.body);
    if (error) {
      throw HttpError(400, "missing required field email");
    }
    const { email } = req.body;
    const user = await findUser({ email });
    if (!user) {
      throw HttpError(404, "Email not found");
    }
    if (user.verify) {
      throw HttpError(400, "Verification has already been passed");
    }

    const verifyEmail = {
      to: email,
      subject: "Verify email",
      html: `<a target="_blank" href="${PROJECT_URL}/api/users/verify/${user.verificationToken}">Click to verify</a>`,
    };

    await sendEmail(verifyEmail);

    res.status(200).json({ message: "Verification email sent" });
  } catch (error) {
    next(error);
  }
};
