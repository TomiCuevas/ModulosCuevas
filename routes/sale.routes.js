import express from "express";
import { readFile, writeFile } from "fs/promises";

const router = express.Router();

// CREAR VENTA
router.post("/create", async (req, res) => {

    try {

        const salesData = await readFile(
            "./data/ventas.json",
            "utf-8"
        );

        const productsData = await readFile(
            "./data/products.json",
            "utf-8"
        );

        const sales = JSON.parse(salesData);
        const products = JSON.parse(productsData);

        const {
            id_usuario,
            productos,
            direccion
        } = req.body;

        if (
            !id_usuario ||
            !productos ||
            !Array.isArray(productos) ||
            productos.length === 0
        ) {

            return res.status(400).json({
                message: "Faltan datos para generar la compra"
            });

        }

        let total = 0;

        const productosFinales = [];

        productos.forEach(item => {

            const productId =
                typeof item === "string"
                    ? item
                    : item.id;

            let qty =
                typeof item === "string"
                    ? 1
                    : Math.floor(Number(item.qty));

            if (!Number.isFinite(qty) || qty < 1) {
                qty = 1;
            }

            const product = products.find(
                p => p.id === productId
            );

            if (product) {

                total += Number(product.price) * qty;

                for (let i = 0; i < qty; i++) {
                    productosFinales.push(productId);
                }

            }

        });

        if (productosFinales.length === 0) {

            return res.status(400).json({
                message: "No se encontraron productos válidos"
            });

        }

        const newSale = {
            id: sales.length
                ? Math.max(...sales.map(s => s.id)) + 1
                : 1,
            id_usuario: Number(id_usuario),
            fecha: new Date()
                .toISOString()
                .split("T")[0],
            total,
            direccion: direccion || "Dirección pendiente",
            entregado: false,
            productos: productosFinales
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

// DETALLE DE VENTA
router.get("/detail/:id", async (req, res) => {

    try {

        const salesData = await readFile(
            "./data/ventas.json",
            "utf-8"
        );

        const usersData = await readFile(
            "./data/usuarios.json",
            "utf-8"
        );

        const productsData = await readFile(
            "./data/products.json",
            "utf-8"
        );

        const sales = JSON.parse(salesData);
        const users = JSON.parse(usersData);
        const products = JSON.parse(productsData);

        const saleId = Number(req.params.id);

        const sale = sales.find(
            s => s.id === saleId
        );

        if (!sale) {

            return res.status(404).json({
                message: "Venta no encontrada"
            });

        }

        const user = users.find(
            u => u.id === sale.id_usuario
        );

        const detailProducts = sale.productos.map(id =>
            products.find(product => product.id === id)
        );

        res.status(200).json({
            venta: sale.id,
            cliente: user
                ? `${user.nombre} ${user.apellido}`
                : "Cliente desconocido",
            productos: detailProducts,
            total: sale.total
        });

    } catch (error) {

        res.status(500).json({
            message: "Error obteniendo detalle de venta"
        });

    }

});

// VENTAS POR USUARIO
router.post("/user", async (req, res) => {

    try {

        const salesData = await readFile(
            "./data/ventas.json",
            "utf-8"
        );

        const sales = JSON.parse(salesData);

        const { id_usuario } = req.body;

        if (!id_usuario) {

            return res.status(400).json({
                message: "Debe enviar un id_usuario"
            });

        }

        const userSales = sales.filter(
            sale =>
                sale.id_usuario === Number(id_usuario)
        );

        res.status(200).json(userSales);

    } catch (error) {

        res.status(500).json({
            message: "Error obteniendo ventas del usuario"
        });

    }

});

export default router;