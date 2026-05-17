import express from "express";
import fs from "fs/promises";

const router = express.Router();

router.get("/", async (req, res) => {

    try {

        const data = await fs.readFile(
            "./data/products.json",
            "utf-8"
        );

        const products = JSON.parse(data);

        res.status(200).json(products);

    } catch (error) {

        res.status(500).json({
            message: "Error al obtener productos"
        });

    }

});

// FILTRAR PRODUCTOS POR QUERY PARAMS
router.get("/filter", async (req, res) => {

    try {

        const data = await fs.readFile(
            "./data/products.json",
            "utf-8"
        );

        let products = JSON.parse(data);

        const {
            category,
            maxPrice
        } = req.query;

        if (category && category !== "all") {

            products = products.filter(
                product => product.category === category
            );

        }

        if (maxPrice) {

            const priceLimit = Number(maxPrice);

            if (!Number.isFinite(priceLimit) || priceLimit <= 0) {

                return res.status(400).json({
                    message: "Precio máximo inválido"
                });

            }

            products = products.filter(
                product => Number(product.price) <= priceLimit
            );

        }

        res.status(200).json(products);

    } catch (error) {

        res.status(500).json({
            message: "Error filtrando productos"
        });

    }

});

router.get("/category/:category", async (req, res) => {

    try {

        const data = await fs.readFile(
            "./data/products.json",
            "utf-8"
        );

        const products = JSON.parse(data);

        const filteredProducts = products.filter(
            product =>
                product.category === req.params.category
        );

        res.status(200).json(filteredProducts);

    } catch (error) {

        res.status(500).json({
            message: "Error al filtrar productos"
        });

    }

});

// PRODUCTO MÁS VENDIDO
router.get("/most-sold", async (req, res) => {

    try {

        const productsData = await fs.readFile(
            "./data/products.json",
            "utf-8"
        );

        const salesData = await fs.readFile(
            "./data/ventas.json",
            "utf-8"
        );

        const products = JSON.parse(productsData);
        const sales = JSON.parse(salesData);

        const counter = {};

        sales.forEach(sale => {

            if (Array.isArray(sale.productos)) {

                sale.productos.forEach(id => {

                    counter[id] =
                        (counter[id] || 0) + 1;

                });

            }

        });

        const soldValues = Object.values(counter);

        if (soldValues.length === 0) {

            return res.status(200).json([]);

        }

        const maxSold = Math.max(...soldValues);

        const mostSoldIds = Object.keys(counter)
            .filter(id => counter[id] === maxSold);

        const mostSoldProducts = products.filter(
            product =>
                mostSoldIds.includes(product.id)
        );

        res.status(200).json(mostSoldProducts);

    } catch (error) {

        res.status(500).json({
            message: "Error obteniendo producto más vendido"
        });

    }

});

// ACTUALIZAR PRECIO
router.put("/price/update/:id", async (req, res) => {

    try {

        const productsData = await fs.readFile(
            "./data/products.json",
            "utf-8"
        );

        const salesData = await fs.readFile(
            "./data/ventas.json",
            "utf-8"
        );

        let products = JSON.parse(productsData);
        let sales = JSON.parse(salesData);

        const productId = req.params.id;
        const newPrice = Number(req.body.price);

        if (!Number.isFinite(newPrice) || newPrice <= 0) {

            return res.status(400).json({
                message: "Precio inválido"
            });

        }

        const product = products.find(
            p => p.id === productId
        );

        if (!product) {

            return res.status(404).json({
                message: "Producto no encontrado"
            });

        }

        const relatedProducts = products.filter(
            p =>
                p.id === productId ||
                p.originalId === productId ||
                product.originalId === p.id
        );

        relatedProducts.forEach(product => {
            product.price = newPrice;
        });

        sales.forEach(sale => {

            let newTotal = 0;

            sale.productos.forEach(productId => {

                const product = products.find(
                    p => p.id === productId
                );

                if (product) {
                    newTotal += Number(product.price);
                }

            });

            sale.total = newTotal;

        });

        await fs.writeFile(
            "./data/products.json",
            JSON.stringify(products, null, 2)
        );

        await fs.writeFile(
            "./data/ventas.json",
            JSON.stringify(sales, null, 2)
        );

        res.status(200).json({
            message: "Precio actualizado correctamente",
            updatedProducts: relatedProducts
        });

    } catch (error) {

        res.status(500).json({
            message: "Error actualizando precio"
        });

    }

});

export default router;