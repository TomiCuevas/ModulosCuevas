import express from "express";
import { readFile, writeFile } from "fs/promises";

const app = express();
const PORT = 3001;

app.use(express.json());

/* =========================
   FUNCIONES PARA LEER JSON
========================= */

const getProducts = async () => {
  const data = await readFile("./data/products.json", "utf-8");
  return JSON.parse(data);
};

const getUsers = async () => {
  const data = await readFile("./data/usuarios.json", "utf-8");
  return JSON.parse(data);
};

const getSales = async () => {
  const data = await readFile("./data/ventas.json", "utf-8");
  return JSON.parse(data);
};

/* =========================
   GET BÁSICOS
========================= */

app.get("/products", async (req, res) => {
  const products = await getProducts();
  res.json(products);
});

app.get("/users", async (req, res) => {
  const users = await getUsers();
  res.json(users);
});

app.get("/sales", async (req, res) => {
  const sales = await getSales();
  res.json(sales);
});

/* =========================
   GET AVANZADO 1
========================= */

app.get("/sales/detail/:id", async (req, res) => {
  const sales = await getSales();
  const users = await getUsers();
  const products = await getProducts();

  const sale = sales.find(s => s.id === Number(req.params.id));

  if (!sale) {
    return res.status(404).json({ error: "Venta no encontrada" });
  }

  const user = users.find(u => u.id === sale.id_usuario);

  const productsDetail = sale.productos.map(prodId =>
    products.find(p => p.id === prodId)
  );

  res.status(200).json({
    venta_id: sale.id,
    cliente: user ? `${user.nombre} ${user.apellido}` : "No encontrado",
    productos: productsDetail,
    total: sale.total
  });
});

/* =========================
   GET AVANZADO 2
========================= */

app.get("/products/most-sold", async (req, res) => {
  const sales = await getSales();
  const products = await getProducts();

  const contador = {};

  sales.forEach(sale => {
    sale.productos.forEach(prodId => {
      contador[prodId] = (contador[prodId] || 0) + 1;
    });
  });

  const maxCantidad = Math.max(...Object.values(contador));

  const productosMasVendidos = Object.keys(contador)
    .filter(prodId => contador[prodId] === maxCantidad)
    .map(prodId => products.find(p => p.id === prodId));

  res.status(200).json({
    mensaje: "Producto/s más vendido/s",
    vecesVendidos: maxCantidad,
    productos: productosMasVendidos
  });
});

/* =========================
   POST 1 - LOGIN
========================= */

app.post("/login", async (req, res) => {
  const users = await getUsers();

  const { email, password } = req.body;

  const user = users.find(
    u => u.email === email && u.password === password
  );

  if (!user) {
    return res.status(401).json({ error: "Credenciales incorrectas" });
  }

  res.status(200).json({
    mensaje: "Login exitoso",
    usuario: {
      id: user.id,
      nombre: `${user.nombre} ${user.apellido}`,
      email: user.email,
      activo: user.activo
    }
  });
});

/* =========================
   POST 2 - CREAR USUARIO (usa writeFile)
========================= */

app.post("/users/create", async (req, res) => {
  try {
    const users = await getUsers();

    const { nombre, apellido, email, password, direccion } = req.body;

    const nuevoUsuario = {
      id: users.length + 1,
      nombre,
      apellido,
      email,
      password,
      activo: true,
      direccion
    };

    users.push(nuevoUsuario);

    await writeFile(
      "./data/usuarios.json",
      JSON.stringify(users, null, 2)
    );

    res.status(201).json({
      mensaje: "Usuario creado correctamente",
      usuario: nuevoUsuario
    });

  } catch (error) {
    res.status(500).json({ error: "Error al crear usuario" });
  }
});

/* =========================
   POST 3 - Ventas de usuario (con productos completos)
========================= */

app.post("/sales/user", async (req, res) => {
  const users = await getUsers();
  const sales = await getSales();
  const products = await getProducts();

  const { id_usuario } = req.body;

  const user = users.find(u => u.id === Number(id_usuario));

  if (!user) {
    return res.status(404).json({ error: "Usuario no encontrado" });
  }

  const userSales = sales
    .filter(s => s.id_usuario === Number(id_usuario))
    .map(sale => {
      const productosCompletos = sale.productos.map(prodId =>
        products.find(p => p.id === prodId)
      );

      return {
        ...sale,
        productos: productosCompletos
      };
    });

  res.status(200).json({
    usuario: `${user.nombre} ${user.apellido}`,
    cantidadVentas: userSales.length,
    ventas: userSales
  });
});

/* =========================
   PUT
========================= */

app.put("/products/price/update/:id", async (req, res) => {
  try {
    const products = await getProducts();
    const sales = await getSales();

    const productId = req.params.id;
    const nuevoPrecio = Number(req.body.price);

    const productIndex = products.findIndex(p => p.id === productId);

    if (productIndex === -1) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    if (!nuevoPrecio || nuevoPrecio <= 0) {
      return res.status(400).json({
        error: "El precio debe ser un número mayor a 0"
      });
    }

    const productoBase = products[productIndex];
    const tituloProducto = productoBase.title;
    const precioAnterior = productoBase.price;

    // Actualiza el producto elegido y los destacados/duplicados con el mismo título
    const productosActualizados = [];

    products.forEach(product => {
      if (product.title === tituloProducto) {
        product.price = nuevoPrecio;
        productosActualizados.push({
          id: product.id,
          title: product.title,
          category: product.category
        });
      }
    });

    // IDs afectados: producto original + duplicados destacados
    const idsProductosActualizados = productosActualizados.map(p => p.id);

    // Recalcula ventas que contengan alguno de esos productos
    const ventasActualizadas = sales.map(sale => {
      const ventaTieneProductoActualizado = sale.productos.some(prodId =>
        idsProductosActualizados.includes(prodId)
      );

      if (!ventaTieneProductoActualizado) {
        return sale;
      }

      const nuevoTotal = sale.productos.reduce((acc, prodId) => {
        const productoEncontrado = products.find(p => p.id === prodId);
        return acc + (productoEncontrado ? productoEncontrado.price : 0);
      }, 0);

      return {
        ...sale,
        total: nuevoTotal
      };
    });

    await writeFile("./data/products.json", JSON.stringify(products, null, 2));
    await writeFile("./data/ventas.json", JSON.stringify(ventasActualizadas, null, 2));

    const ventasModificadas = ventasActualizadas.filter(sale =>
      sale.productos.some(prodId => idsProductosActualizados.includes(prodId))
    );

    res.status(200).json({
      mensaje: "Precio actualizado correctamente",
      producto: tituloProducto,
      precioAnterior,
      nuevoPrecio,
      productosActualizados: productosActualizados.length,
      ventasAfectadas: ventasModificadas.length,
      detalle: "Se actualizaron el producto original y sus destacados relacionados. También se recalcularon las ventas afectadas."
    });

  } catch (error) {
    res.status(500).json({
      error: "Error al actualizar el precio del producto"
    });
  }
});
/* =========================
   DELETE
========================= */

app.delete("/users/delete/:id", async (req, res) => {
  try {
    const users = await getUsers();
    const sales = await getSales();

    const userId = Number(req.params.id);

    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({
        error: "Usuario no encontrado"
      });
    }

    const ventasDelUsuario = sales.filter(s => s.id_usuario === userId);

    const ventasRestantes = sales.filter(s => s.id_usuario !== userId);

    const usuarioEliminado = users.splice(userIndex, 1)[0];

    await writeFile(
      "./data/ventas.json",
      JSON.stringify(ventasRestantes, null, 2)
    );

    await writeFile(
      "./data/usuarios.json",
      JSON.stringify(users, null, 2)
    );

    res.status(200).json({
      mensaje: "Usuario eliminado correctamente junto con sus ventas asociadas",
      usuarioEliminado: `${usuarioEliminado.nombre} ${usuarioEliminado.apellido}`,
      ventasEliminadas: ventasDelUsuario.length
    });

  } catch (error) {
    res.status(500).json({
      error: "Error al eliminar usuario"
    });
  }
});

/* =========================
   SERVER
========================= */

app.listen(PORT, () => {
  console.log(`Servidor levantado en puerto ${PORT}`);
});