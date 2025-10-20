import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, default: "" },
        category: {
            type: String,
            enum: ["electronics", "clothing", "accessories", "documents", "other"],
            default: "other"
        },
        location: { type: String, default: "" },
        type: { type: String, enum: ["lost", "found"], required: true },
        images: [{ type: String }]
    },
    { timestamps: true }
);

ItemSchema.index({ title: "text", description: "text" });

export default mongoose.model("Item", ItemSchema);
