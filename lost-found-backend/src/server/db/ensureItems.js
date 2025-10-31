import { getDb } from "./connection.js";

const validator = {
    $jsonSchema: {
        bsonType: "object",
        required: ["itemName", "description", "status", "contactInfo", "location", "date"],
        additionalProperties: false,
        properties: {
            _id: {},
            itemName: { bsonType: "string", minLength: 1 },
            description: { bsonType: "string", minLength: 1 },
            status: { bsonType: "string", enum: ["lost", "found", "claimed"] },
            contactInfo: { bsonType: "string" },
            location: { bsonType: "string" },
            date: { bsonType: "date" },

            category: { bsonType: "string" },
            imageURL: { bsonType: ["string", "null"] }, 

        }
    }
};

export async function ensureItemsCollection() {
    try {
        const db = await getDb();
        const exists = await db.listCollections({ name: "items" }).toArray();
        if (exists.length === 0) {
            await db.createCollection("items", { validator, validationLevel: "strict" });
        } else {
            await db.command({ collMod: "items", validator, validationLevel: "strict" })
        }
        const items = db.collection("items");
        await items.createIndex({ itemName: "text", description: "text", location: "text", category: "text" }, 
            { name: "text_search", default_language: "english" });
        await items.createIndex({ date: -1 }, { name: "by_date_desc" });
        await items.createIndex({ status: 1 }, { name: "by_status" });
        await items.createIndex({ category: 1 }, { name: "by_category" });
    } catch (err) {
        console.error("validation details:", err.errInfo?.details);
    }
}