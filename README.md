MODULOS CUEVAS:

Desarrollado con Express.js para la gestión de usuarios, productos y ventas.  
Permite realizar consultas, creación, actualización y eliminación de datos manteniendo la coherencia entre estructuras.

---

## Endpoints

---

### GET 1 - Detalle de venta

GET http://localhost:3001/sales/detail/1

Obtiene el detalle de una venta específica, incluyendo:
- Cliente
- Productos
- Total

---

### GET 2 - Producto más vendido

GET http://localhost:3001/products/most-sold

Devuelve el/los productos más vendidos según las ventas registradas.

---

### POST 1 - Login

POST http://localhost:3001/login

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
  "nombre": "Liliana",
  "apellido": "Dominguez",
  "email": "liliana@gmail.com",
  "password": "1234",
  "direccion": "Av. Velez Sarsfield 52"
}

Permite crear un nuevo usuario.  
Los datos se guardan en el archivo JSON utilizando writeFile, simulando persistencia.

Devuelve código 201 si la creación es exitosa.

---

### POST 3 - Ventas por usuario

POST http://localhost:3001/sales/user

Body:

{
  "id_usuario": 1
}

Permite obtener las ventas de un usuario enviando el ID por el body, evitando exponer datos en la URL.  
Devuelve información filtrada y estructurada.

---

### PUT - Actualizar precio de producto

PUT http://localhost:3001/products/price/update/d3

Body:

{
  "price": 150000
}

Actualiza el precio de un producto específico y de todos sus equivalentes (como los destacados).  
Además, recalcula automáticamente el total de las ventas donde intervienen, garantizando la coherencia de los datos.

---

### DELETE - Eliminar usuario

DELETE http://localhost:3001/users/delete/7

Elimina un usuario junto con sus ventas asociadas.  
Se implementa eliminación en cascada para mantener la integridad de los datos y evitar relaciones inválidas.

---

## Instalación

Clonar repositorio:

git clone https://github.com/TomiCuevas/ModulosCuevas.git

Instalar dependencias:

npm install

Ejecutar servidor:

node index.js

---

## Notas

- El proyecto utiliza archivos JSON como base de datos.
- Se implementa lógica para mantener la coherencia entre usuarios, productos y ventas.
- El archivo .gitignore evita subir dependencias como node_modules.

---
## Autor
Tomás Cuevas
