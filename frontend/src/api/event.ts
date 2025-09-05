import axios from "axios";

const API_URL = "http://localhost:5000/api"; // backend base URL

// ✅ Get all events
export const fetchEvents = async () => {
    try {
        const res = await axios.get(`${API_URL}/events`);
        return res.data;
    } catch (error: any) {
        console.error("❌ Error fetching events:", error.message);
        return { success: false, message: error.message };
    }
};

// ✅ Get event availability
export const fetchAvailability = async (id: string) => {
    try {
        const res = await axios.get(`${API_URL}/events/${id}/availability`);
        return res.data;
    } catch (error: any) {
        console.error("❌ Error fetching availability:", error.message);
        return { success: false, message: error.message };
    }
};

// ✅ Purchase tickets
export const purchaseTickets = async (
    id: string,
    sectionName: string,
    rowName: string,
    quantity: number,
    seatNumbers?: number[]
) => {
    try {
        const res = await axios.post(`${API_URL}/events/${id}/purchase`, {
            sectionName,
            rowName,
            quantity,
            seatNumbers
        });
        return res.data;
    } catch (error: any) {
        console.error("❌ Error purchasing tickets:", error.message);
        if (error.response) return error.response.data; // backend error
        return { success: false, message: error.message };
    }
};

// ✅ Create new event
export const createEvent = async (payload: any) => {
    try {
        const res = await axios.post(`${API_URL}/events`, payload);
        return res.data;
    } catch (error: any) {
        if (error.response) return error.response.data;
        return { success: false, message: error.message };
    }
};