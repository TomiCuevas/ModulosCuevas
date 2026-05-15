import express from "express";
import fs from "fs/promises";

const router = express.Router();

router.post("/login", async (req, res) => {

    try {

        const data = await fs.readFile(
            "./data/usuarios.json",
            "utf-8"
        );

        const users = JSON.parse(data);

        const user = users.find(
            u =>
                u.email === req.body.email &&
                u.password === req.body.password
        );

        if (!user) {

            return res.status(401).json({
                message: "Credenciales inválidas"
            });

        }

        res.status(200).json(user);

    } catch (error) {

        res.status(500).json({
            message: "Error en login"
        });

    }

});

// PUT actualizar usuario
router.put("/update/:id", async (req, res) => {

    try {

        const data = await fs.readFile(
            "./data/usuarios.json",
            "utf-8"
        );

        let users = JSON.parse(data);

        const userId = Number(req.params.id);

        const userIndex = users.findIndex(
            u => u.id === userId
        );

        if (userIndex === -1) {

            return res.status(404).json({
                message: "Usuario no encontrado"
            });

        }

        users[userIndex] = {
            ...users[userIndex],
            ...req.body
        };

        await fs.writeFile(
            "./data/usuarios.json",
            JSON.stringify(users, null, 2)
        );

        res.status(200).json({
            message: "Usuario actualizado correctamente",
            user: users[userIndex]
        });

    } catch (error) {

        res.status(500).json({
            message: "Error actualizando usuario"
        });

    }

});

// DELETE usuario y sus ventas asociadas
router.delete("/delete/:id", async (req, res) => {
    try {
        const usersData = await fs.readFile("./data/usuarios.json", "utf-8");
        const salesData = await fs.readFile("./data/ventas.json", "utf-8");

        let users = JSON.parse(usersData);
        let sales = JSON.parse(salesData);

        const userId = Number(req.params.id);

        const user = users.find(u => u.id === userId);

        if (!user) {
            return res.status(404).json({
                message: "Usuario no encontrado"
            });
        }

        const ventasDelUsuario = sales.filter(sale => sale.id_usuario === userId);

        users = users.filter(u => u.id !== userId);
        sales = sales.filter(sale => sale.id_usuario !== userId);

        await fs.writeFile(
            "./data/usuarios.json",
            JSON.stringify(users, null, 2)
        );

        await fs.writeFile(
            "./data/ventas.json",
            JSON.stringify(sales, null, 2)
        );

        res.status(200).json({
            message: "Usuario eliminado correctamente junto con sus ventas asociadas",
            usuarioEliminado: `${user.nombre} ${user.apellido}`,
            ventasEliminadas: ventasDelUsuario.length
        });

    } catch (error) {
        res.status(500).json({
            message: "Error eliminando usuario y sus ventas asociadas"
        });
    }
});


export default router;