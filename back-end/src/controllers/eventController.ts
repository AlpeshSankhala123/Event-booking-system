import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import Event from "../model/event";
import { validateEventPayload } from "../utils/validate";

// ✅ Create new event
export const createEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validation = validateEventPayload(req.body);
        if (!validation.valid) {
            return res.status(400).json({ message: validation.message });
        }

        const { name, date, sections } = req.body;

        const normalizedSections = sections.map((section: any) => ({
            name: section.name,
            rows: section.rows.map((row: any) => ({
                name: row.name,
                totalSeats: row.totalSeats,
                bookedSeats: 0
            }))
        }));

        const event = await Event.create({ name, date, sections: normalizedSections });
        res.status(201).json({ success: true, event });
    } catch (error) {
        next(error);
    }
};

// ✅ Get all events
export const getEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const events = await Event.find().select("name date sections.name");
        res.json({ success: true, events });
    } catch (error) {
        next(error);
    }
};

// ✅ Get event availability
export const getAvailability = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid Event ID" });
        }

        const event = await Event.findById(id);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        const availability = event.sections.map(section => ({
            name: section.name,
            rows: section.rows.map(row => ({
                name: row.name,
                totalSeats: row.totalSeats,
                bookedSeats: row.bookedSeats,
                availableSeats: row.totalSeats - row.bookedSeats,
                bookedIndices: row.bookedIndices || []
            }))
        }));

        res.json({ success: true, eventId: event._id, availability });
    } catch (error) {
        next(error);
    }
};

// ✅ Purchase tickets
export const purchaseTickets = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { sectionName, rowName, quantity, seatNumbers } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid Event ID" });
        }

        if (!sectionName || !rowName) {
            return res.status(400).json({ message: "Section and row are required" });
        }
        if ((!quantity || quantity <= 0) && (!Array.isArray(seatNumbers) || seatNumbers.length === 0)) {
            return res.status(400).json({ message: "Provide a valid quantity or specific seatNumbers" });
        }

        // ✅ Standalone-safe atomic booking using compare-and-set
        // 1) Read current seat counters
        const eventDoc = await Event.findById(id);
        if (!eventDoc) {
            return res.status(404).json({ message: "Event not found" });
        }
        const sec = eventDoc.sections.find(sec => sec.name === sectionName);
        if (!sec) {
            return res.status(404).json({ message: "Section not found" });
        }
        const targetRow = sec.rows.find(r => r.name === rowName);
        if (!targetRow) {
            return res.status(404).json({ message: "Row not found" });
        }

        // Seat selection mode
        if (Array.isArray(seatNumbers) && seatNumbers.length > 0) {
            // Validate ranges and availability
            const invalid = seatNumbers.find((n: number) => !Number.isInteger(n) || n < 1 || n > targetRow.totalSeats);
            if (invalid) {
                return res.status(400).json({ message: `Invalid seat number: ${invalid}` });
            }
            const alreadyBooked = (targetRow.bookedIndices || []).filter(idx => seatNumbers.includes(idx));
            if (alreadyBooked.length > 0) {
                return res.status(400).json({ message: `Seats already booked: ${alreadyBooked.join(", ")}` });
            }

            // Conditional update ensuring no race: require none of the seatNumbers to exist yet and bookedSeats unchanged
            const updateResult = await Event.updateOne(
                {
                    _id: id,
                    sections: {
                        $elemMatch: {
                            name: sectionName,
                            rows: {
                                $elemMatch: {
                                    name: rowName,
                                    bookedSeats: targetRow.bookedSeats,
                                    bookedIndices: { $nin: seatNumbers }
                                }
                            }
                        }
                    }
                },
                {
                    $inc: { "sections.$[s].rows.$[r].bookedSeats": seatNumbers.length },
                    $addToSet: { "sections.$[s].rows.$[r].bookedIndices": { $each: seatNumbers } }
                },
                { arrayFilters: [ { "s.name": sectionName }, { "r.name": rowName } ] }
            );

            if (updateResult.modifiedCount === 0) {
                return res.status(400).json({ message: "Seats changed, please try again" });
            }

            const groupDiscount = seatNumbers.length >= 4;
            return res.json({ success: true, message: "Tickets purchased successfully", groupDiscount, booked: { section: sectionName, row: rowName, quantity: seatNumbers.length, seatNumbers } });
        }

        // Quantity mode (no explicit seats)
        const availableSeats = targetRow.totalSeats - targetRow.bookedSeats;
        if (availableSeats < quantity) {
            return res.status(400).json({ message: "Not enough seats available" });
        }

        const updateResult = await Event.updateOne(
            {
                _id: id,
                sections: {
                    $elemMatch: {
                        name: sectionName,
                        rows: { $elemMatch: { name: rowName, bookedSeats: targetRow.bookedSeats } }
                    }
                }
            },
            { $inc: { "sections.$[s].rows.$[r].bookedSeats": quantity } },
            { arrayFilters: [ { "s.name": sectionName }, { "r.name": rowName } ] }
        );

        if (updateResult.modifiedCount === 0) {
            return res.status(400).json({ message: "Seats changed, please try again" });
        }

        const groupDiscount = quantity >= 4;

        res.json({
            success: true,
            message: "Tickets purchased successfully",
            groupDiscount,
            booked: { section: sectionName, row: rowName, quantity }
        });
    } catch (error) {
        next(error);
    }
};
