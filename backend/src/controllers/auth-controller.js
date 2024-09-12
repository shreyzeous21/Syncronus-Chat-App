import ResponseError from "../error/response-error.js";
import User from "../models/user-model.js";
import jwt from "jsonwebtoken";
import { validate } from "../validations/validation.js";
import {
  signUpValidate,
  signInValidate,
  updateProvileValidate,
} from "../validations/auth-validation.js";
import { compare } from "bcrypt";
import fs from "fs";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3 from "../util/aws.js";
import dotenv from "dotenv";
import resizeImage from "../util/resize-image.js";

dotenv.config();

const maxAge = 24 * 60 * 60 * 1000;

const createToken = (email, userId) => {
  const secret = process.env.JWT_KEY;
  if (!secret) {
    throw new Error("JWT_KEY is not defined");
  }
  const jwtExpiration = 24 * 60 * 60;
  return jwt.sign({ email, userId }, secret, { expiresIn: jwtExpiration });
};

export const signup = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    validate(signUpValidate, req.body);

    const alreadyExist = await User.findOne({ email });

    if (alreadyExist) {
      throw new ResponseError(400, "Email has been taken");
    }

    // const user = await User.create({ email, password });

    const newUser = new User({
      email,
      password,
    });

    const user = await newUser.save();
    res.cookie("jwt", createToken(email, user._id), {
      maxAge: maxAge,
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.status(201).json({
      user: {
        _id: user.id,
        email: user.email,
        profileSetup: user.profileSetup,
      },
      message: "Successfully created account",
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    validate(signInValidate, req.body);

    const user = await User.findOne({ email });

    if (!user) {
      throw new ResponseError(404, "Email or Password is wrong");
    }

    const isMatch = await compare(password, user.password);

    if (!isMatch) {
      throw new ResponseError(400, "Email or Password is wrong");
    }

    res.cookie("jwt", createToken(email, user.id), {
      maxAge,
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    const {
      _id,
      email: emails,
      profileSetup,
      firstName,
      lastName,
      image,
      color,
    } = user._doc;

    res.status(200).json({
      success: true,
      message: "Login Succesfully",
      user: {
        _id,
        email: emails,
        profileSetup,
        firstName,
        lastName,
        image,
        color,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserData = async (req, res, next) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      throw new ResponseError(404, "User is not found.");
    }

    user._id = userId;

    res.status(200).json({
      succes: true,
      message: "success get data",
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { userId } = req;
    const { firstName, lastName, color } = req.body;

    validate(updateProvileValidate, req.body);

    const user = await User.findByIdAndUpdate(
      userId,
      {
        firstName,
        lastName,
        color,
        profileSetup: true,
      },
      { new: true, runValidators: true }
    );

    res
      .status(200)
      .json({ success: true, message: "Successfuly save changes", user });
  } catch (error) {
    next(error);
  }
};

export const addProfileImage = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: "File is required." });
  }

  const file = req.file;
  const filePath = file.path;

  try {
    const resizedFilePath = await resizeImage(filePath);

    const fileStream = fs.createReadStream(resizedFilePath);

    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `profiles/${Date.now().toString()}-${file.originalname}`,
      Body: fileStream,
      ACL: "public-read",
    };

    const data = await s3.send(new PutObjectCommand(uploadParams));

    const fileName = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;

    const userUpdate = await User.findByIdAndUpdate(
      { _id: req.userId },
      { image: fileName },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Success upload image profile",
      image: userUpdate.image,
    });
  } catch (error) {
    console.error("Upload error:", error);
    next(error);
  }
};

export const removeProfileImage = async (req, res, next) => {
  try {
    const { userId } = req;

    const user = await User.findById(userId);

    if (!user) {
      throw new ResponseError(404, "User is not found");
    }

    user.image = null;

    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Successfully remove image" });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    res.cookie("jwt", "", {
      maxAge: 1,
      secure: true,
      sameSite: "None",
    });

    res.status(200).json({ success: true, message: "Succsesfully logout." });
  } catch (error) {
    next(error);
  }
};
