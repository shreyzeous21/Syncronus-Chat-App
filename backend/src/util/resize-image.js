import sharp from "sharp";
import fs from "fs";
import path from "path";

const resizeImage = async (filePath) => {
  const resizedFilePath = filePath.replace(
    path.extname(filePath),
    "-small.jpg"
  );
  await sharp(filePath)
    .resize(200, 200) // Resolusi terkecil yang diinginkan
    .toFile(resizedFilePath);
  return resizedFilePath;
};

export default resizeImage;
