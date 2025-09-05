import mongoose, { Schema, Document } from "mongoose";

interface IRow {
    name: string;
    totalSeats: number;
    bookedSeats: number;
    bookedIndices?: number[];
}

interface ISection {
    name: string;
    rows: IRow[];
}

export interface IEvent extends Document {
    name: string;
    date: Date;
    sections: ISection[];
}

const rowSchema = new Schema<IRow>({
    name: { type: String, required: true },
    totalSeats: { type: Number, required: true },
    bookedSeats: { type: Number, default: 0 },
    bookedIndices: { type: [Number], default: [] }
});

const sectionSchema = new Schema<ISection>({
    name: { type: String, required: true },
    rows: [rowSchema]
});

const eventSchema = new Schema<IEvent>({
    name: { type: String, required: true },
    date: { type: Date, required: true, default: Date.now() },
    sections: [sectionSchema]
});

const Event = mongoose.model<IEvent>("Event", eventSchema);

export default Event;
