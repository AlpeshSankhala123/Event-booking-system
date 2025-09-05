interface RowInput {
    name: string;
    totalSeats: number;
    bookedSeats?: number;
}

interface SectionInput {
    name: string;
    rows: RowInput[];
}

export interface CreateEventInput {
    name: string;
    date: string | Date;
    sections: SectionInput[];
}

export const validateEventPayload = (payload: any): { valid: boolean; message?: string } => {
    if (!payload || typeof payload !== "object") {
        return { valid: false, message: "Invalid payload" };
    }

    const { name, date, sections } = payload as CreateEventInput;

    if (!name || typeof name !== "string") {
        return { valid: false, message: "Event name is required" };
    }

    if (!date || isNaN(new Date(date as any).getTime())) {
        return { valid: false, message: "Valid event date is required" };
    }

    if (!Array.isArray(sections) || sections.length === 0) {
        return { valid: false, message: "At least one section is required" };
    }

    const sectionNames = new Set<string>();
    for (const section of sections) {
        if (!section || typeof section !== "object") {
            return { valid: false, message: "Invalid section format" };
        }
        if (!section.name || typeof section.name !== "string") {
            return { valid: false, message: "Section name is required" };
        }
        if (sectionNames.has(section.name)) {
            return { valid: false, message: `Duplicate section name: ${section.name}` };
        }
        sectionNames.add(section.name);

        if (!Array.isArray(section.rows) || section.rows.length === 0) {
            return { valid: false, message: `Section ${section.name} must have rows` };
        }

        const rowNames = new Set<string>();
        for (const row of section.rows) {
            if (!row || typeof row !== "object") {
                return { valid: false, message: `Invalid row in section ${section.name}` };
            }
            if (!row.name || typeof row.name !== "string") {
                return { valid: false, message: `Row name is required in section ${section.name}` };
            }
            if (rowNames.has(row.name)) {
                return { valid: false, message: `Duplicate row name ${row.name} in section ${section.name}` };
            }
            rowNames.add(row.name);

            if (typeof row.totalSeats !== "number" || row.totalSeats <= 0 || !Number.isFinite(row.totalSeats)) {
                return { valid: false, message: `Row ${row.name} in section ${section.name} must have positive totalSeats` };
            }
        }
    }

    return { valid: true };
};


