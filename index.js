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

  let maxId = null;
  let maxCantidad = 0;

  for (const id in contador) {
    if (contador[id] > maxCantidad) {
      maxCantidad = contador[id];
      maxId = id;
    }
  }

  const producto = products.find(p => p.id === maxId);

  res.status(200).json({
    producto,
    veces_vendido: maxCantidad
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
   SERVER
========================= */

app.listen(PORT, () => {
  console.log(`Servidor levantado en puerto ${PORT}`);
});