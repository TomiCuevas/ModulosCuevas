import express from "express";
import { readFile, writeFile } from "fs/promises";

const router = express.Router();

router.post("/create", async (req, res) => {
    try {
        const salesData = await readFile("./data/ventas.json", "utf-8");
        const productsData = await readFile("./data/products.json", "utf-8");

        const sales = JSON.parse(salesData);
        const products = JSON.parse(productsData);

        const { id_usuario, productos, direccion } = req.body;

        if (!id_usuario || !productos || !Array.isArray(productos) || productos.length === 0) {
            return res.status(400).json({
                message: "Faltan datos para generar la compra"
            });
        }

        let total = 0;

        productos.forEach(item => {
            const productId = typeof item === "string" ? item : item.id;
            const qty = typeof item === "string" ? 1 : Number(item.qty) || 1;

            const product = products.find(p => p.id === productId);

            if (product) {
                total += product.price * qty;
            }
        });

        const newSale = {
            id: sales.length + 1,
            id_usuario: Number(id_usuario),
            fecha: new Date().toISOString().split("T")[0],
            total,
            direccion: direccion || "Dirección pendiente",
            entregado: false,
            productos: productos.map(item =>
                typeof item === "string" ? item : item.id
            )
        };

        sales.push(newSale);

        await writeFile(
            "./data/ventas.json",
            JSON.stringify(sales, null, 2)
        );

        res.status(201).json({
            message: "Compra realizada correctamente",
            sale: newSale
        });

    } catch (error) {
        res.status(500).json({
            message: "Error al generar venta"
        });
    }
});

export default router;