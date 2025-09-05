import express from "express";
import { createEvent, getEvents, getAvailability, purchaseTickets } from "../controllers/eventController";

const router = express.Router();

router.post("/events", createEvent);
router.get("/events", getEvents);
router.get("/events/:id/availability", getAvailability);
router.post("/events/:id/purchase", purchaseTickets);

export default router;
