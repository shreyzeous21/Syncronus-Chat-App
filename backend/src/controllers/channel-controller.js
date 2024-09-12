import mongoose from "mongoose";
import ResponseError from "../error/response-error.js";
import Channel from "../models/channel-model.js";
import User from "../models/user-model.js";

export const createChannels = async (req, res, next) => {
  try {
    const { name, members } = req.body;
    const userId = req.userId;

    // Validasi input
    if (!name || !members || !Array.isArray(members) || members.length === 0) {
      throw new ResponseError(
        400,
        "Invalid input: name and members are required."
      );
    }

    // Cek admin
    const admin = await User.findById(userId);
    if (!admin) {
      throw new ResponseError(400, "Admin user not found.");
    }

    // Validasi anggota
    const validMembers = await User.find({ _id: { $in: members } });
    if (validMembers.length !== members.length) {
      throw new ResponseError(400, "Some members are not valid users.");
    }

    // Buat channel baru
    const newChannel = new Channel({
      name,
      members,
      admin: userId,
    });

    await newChannel.save();

    res.status(201).json({
      success: true,
      message: "Successfully created channel",
      channel: newChannel,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getChannels = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);

    const channel = await Channel.find({
      $or: [{ admin: userId }, { members: userId }],
    }).sort({ updatedAt: -1 });

    res.status(201).json({
      success: true,
      message: "Successfully get channel",
      channel,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getChannelMessages = async (req, res, next) => {
  try {
    const { channelId } = req.params;

    const channel = await Channel.findById(channelId).populate({
      path: "messages",
      populate: {
        path: "sender",
        select: "firstName lastName email _id image color",
      },
    });

    if (!channel) {
      throw new ResponseError(400, "Channel is not found");
    }

    const messages = channel.messages;

    res.status(200).json({ success: true, messages });
  } catch (error) {
    next(error);
  }
};
