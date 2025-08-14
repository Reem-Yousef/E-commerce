import mongoose from "mongoose";

const db_connection = async () => {
  await mongoose
    .connect(process.env.atlas_URL)
    .then(() => {
      console.log("MongoDB connected successfully");
    })
    .catch((error) => {
      console.error("MongoDB connection error:", error);
    });
};

export default db_connection;
