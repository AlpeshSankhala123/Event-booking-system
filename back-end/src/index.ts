import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import eventRoutes from "./routes/eventRoutes";
import errorHandler from "./middleware/errorHandler";
import connectDB from "./config/dbConnection";
import Event from "./model/event";

const PORT = process.env.PORT || 5000;

connectDB();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", eventRoutes);

app.use(errorHandler);

app.listen(PORT, () => console.log(`express running at ${PORT}`));