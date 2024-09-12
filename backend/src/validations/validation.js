import ResponseError from "../error/response-error.js";
import { ZodError } from "zod";

// Fungsi validasi yang menggunakan Zod
const validate = (schema, data) => {
  try {
    schema.parse(data); // Validasi data menggunakan Zod
  } catch (error) {
    if (error instanceof ZodError) {
      // Mengambil pesan kesalahan dari setiap item
      const errorMessages = error.errors.map((err) => err.message).join(" &  ");
      throw new ResponseError(400, errorMessages);
    }
    // Jika kesalahan bukan ZodError, lemparkan kesalahan tersebut
    throw error;
  }
};

export { validate };
