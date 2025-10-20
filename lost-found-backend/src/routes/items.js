import { Router } from "express";
import Item from "../models/Item.js";

const router = Router();

router.post("/", async (req, res, next) => {
    try {
        const item = await Item.create(req.body);
        res.status(201).json(item);
    } catch (err) { next(err); }
});

router.get("/", async (req, res, next) => {
    try {
        const {
            q,
            category,
            type,
            location,
            sort = "newest",
            page = 1,
            limit = 10
        } = req.query;

        const filter = {};
        if (category) filter.category = category;
        if (type) filter.type = type;
        if (location) filter.location = new RegExp(location, "i");
        if (q) filter.$text = { $search: q };

        const sortMap = { newest: { createdAt: -1 }, oldest: { createdAt: 1 } };

        const skip = (Number(page) - 1) * Number(limit);

        const [items, total] = await Promise.all([
            Item.find(filter).sort(sortMap[sort] || sortMap.newest).skip(skip).limit(Number(limit)),
            Item.countDocuments(filter)
        ]);

        res.json({ items, total, page: Number(page), limit: Number(limit) });
    } catch (err) { next(err); }
});

router.get("/:id", async (req, res, next) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ error: "Not found" });
        res.json(item);
    } catch (err) { next(err); }
});

router.put("/:id", async (req, res, next) => {
    try {
        const item = await Item.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!item) return res.status(404).json({ error: "Not found" });
        res.json(item);
    } catch (err) { next(err); }
});

router.delete("/:id", async (req, res, next) => {
    try {
        const item = await Item.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ error: "Not found" });
        res.json({ ok: true });
    } catch (err) { next(err); }
});

export default router;
