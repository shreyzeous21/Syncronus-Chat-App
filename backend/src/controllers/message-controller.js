import ResponseError from "../error/response-error.js";
import Message from "../models/message-model.js";
import fs from "fs";
import s3 from "../util/aws.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export const getMessage = async (req, res, next) => {
  try {
    const user1 = req.userId;
    const user2 = req.body.id;

    if (!user1 || !user2) {
      throw new ResponseError(400).json("Both user Id's are required");
    }

    const messages = await Message.find({
      $or: [
        { sender: user1, recipient: user2 },
        { sender: user2, recipient: user1 },
      ],
    }).sort({ timestamp: 1 });

    res.status(200).json({ success: true, messages });
  } catch (error) {
    next(error);
  }
};
export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ResponseError(400, "File is required");
    }

    const file = req.file;
    const fileStream = fs.createReadStream(file.path);

    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `file/${Date.now().toString()}-${file.originalname}`,
      Body: fileStream,
      ACL: "public-read", // Pertimbangkan kembali apakah ini benar-benar diperlukan
    };

    // Menggunakan `await` langsung pada `send` untuk mendapatkan response
    const data = await s3.send(new PutObjectCommand(uploadParams));

    const fileName = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;

    // Tutup stream setelah upload selesai
    fileStream.close();

    res.status(200).json({
      success: true,
      message: "Successfully uploaded file.",
      filePath: fileName,
    });
  } catch (error) {
    next(error);
  }
};
