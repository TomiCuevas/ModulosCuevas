import express from "express";

const app = express();
const PORT = 3001;

// middleware para leer JSON
app.use(express.json());

// ruta de prueba
app.get("/", (req, res) => {
  res.send("Servidor funcionando 🚀");
});

// levantar servidor
app.listen(PORT, () => {
  console.log(`Servidor levantado en puerto ${PORT}`);
});