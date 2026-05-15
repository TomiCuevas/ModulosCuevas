MODULOS CUEVAS:

Desarrollado con Express.js para la gestión de usuarios, productos y ventas.  
Permite realizar consultas, creación, actualización y eliminación de datos manteniendo la coherencia entre estructuras.

---

## Endpoints

---

### GET 1 - Listado de productos

GET http://localhost:3001/products

Devuelve todos los productos disponibles para la venta.

---

### GET 2 - Productos por categoría

GET http://localhost:3001/products/category/camisas

Permite filtrar productos según su categoría.

Categorías disponibles:
- camisas
- trajes
- zapatos
- destacados

---

### GET 3 - Detalle de venta

GET http://localhost:3001/sales/detail/1

Obtiene el detalle de una venta específica, incluyendo:
- Cliente
- Productos
- Total

---

### GET 4 - Producto más vendido

GET http://localhost:3001/products/most-sold

Devuelve el/los productos más vendidos según las ventas registradas.

---

### POST 1 - Login

POST http://localhost:3001/users/login

Body:

{
  "email": "tomas@gmail.com",
  "password": "1234"
}

Simula un login.  
Recibe email y password, busca el usuario en el JSON y devuelve sus datos si coinciden.

---

### POST 2 - Crear usuario

POST http://localhost:3001/users/create

Body:

{
  "nombre": "Gonzalo",
  "apellido": "Bustos",
  "email": "bustos@gmail.com",
  "password": "1234",
  "direccion": "Av. Velez Sarsfield 78"
}

Permite crear un nuevo usuario.  
Los datos se guardan en el archivo JSON utilizando writeFile, simulando persistencia.

Devuelve código 201 si la creación es exitosa.

---

### POST 3 - Crear venta / Orden de compra

POST http://localhost:3001/sales/create

Body:

{
  "id_usuario": 2,
  "direccion": "Av. Colón 1450",
  "productos": [
    {
      "id": "z2",
      "qty": 2
    },
    {
      "id": "z1",
      "qty": 1
    }
  ]
}

Genera una orden de compra registrando:
- Usuario
- Productos
- Cantidades
- Dirección
- Total calculado automáticamente

La venta queda almacenada en ventas.json.

---

### POST 4 - Ventas por usuario

POST http://localhost:3001/sales/user

Body:

{
  "id_usuario": 1
}

Permite obtener las ventas de un usuario enviando el ID por el body, evitando exponer datos en la URL.  
Devuelve información filtrada y estructurada.

---

### PUT 1 - Actualizar precio de producto

PUT http://localhost:3001/products/price/update/d3

Body:

{
  "price": 150000
}

Actualiza el precio de un producto específico y de todos sus equivalentes (como los destacados).  
Además, recalcula automáticamente el total de las ventas donde intervienen, garantizando la coherencia de los datos.

---

### PUT 2 - Actualizar usuario

PUT http://localhost:3001/users/update/1

Body:

{
  "direccion": "Nueva dirección 123"
}

Permite actualizar información de un usuario existente.

---

### DELETE - Eliminar usuario

DELETE http://localhost:3001/users/delete/7

Elimina un usuario junto con sus ventas asociadas.  
Se implementa eliminación en cascada para mantener la integridad de los datos y evitar relaciones inválidas.

---

## Instalación

Clonar repositorio:

git clone https://github.com/TomiCuevas/ModulosCuevas.git

Ingresar a la carpeta:

cd ModulosCuevas

Instalar dependencias:

npm install

Ejecutar servidor:

node index.js

Servidor disponible en:

http://localhost:3001

---

## RELACIÓN CON EL FRONTEND

Este backend se conecta con el frontend del proyecto ZAMMOT utilizando fetch y arquitectura multirepo.

Repositorio frontend:

https://github.com/TomiCuevas/zammot-ecommerce

---

## Notas

- El proyecto utiliza archivos JSON como base de datos.
- Se implementa lógica para mantener la coherencia entre usuarios, productos y ventas.
- Se utiliza Express.js junto con CORS para la comunicación cliente-servidor.
- El archivo .gitignore evita subir dependencias como node_modules.
- Se utilizan métodos GET, POST, PUT y DELETE.
- El frontend consume el backend mediante fetch.
- El proyecto utiliza arquitectura multirepo separando frontend y backend.

---
## Autor
Tomás Cuevas
