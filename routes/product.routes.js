import express from "express";
import fs from "fs/promises";

const router = express.Router();

router.get("/", async (req, res) => {

    try {

        const data = await fs.readFile("./data/products.json", "utf-8");

        const products = JSON.parse(data);

        res.status(200).json(products);

    } catch (error) {

        res.status(500).json({
            message: "Error al obtener productos"
        });

    }

});

router.get("/category/:category", async (req, res) => {

    try {

        const data = await fs.readFile("./data/products.json", "utf-8");

        const products = JSON.parse(data);

        const filteredProducts = products.filter(
            p => p.category === req.params.category
        );

        res.status(200).json(filteredProducts);

    } catch (error) {

        res.status(500).json({
            message: "Error al filtrar productos"
        });

    }

});

export default router;