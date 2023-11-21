const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

const { ProductManager } = require('./ProductManager');
const productManager = new ProductManager('products');

// Variable para indicar si la carga ha finalizado
let loadingCompleted = false;

// Endpoint para obtener todos los productos con opción de límite


app.get('/products', async (req, res) => {
  try {
    const limit = req.query.limit;
    const products = await productManager.getProducts();

    if (limit) {
      res.json(products.slice(0, limit));
    } else {
      res.json(products);
    }

    // Indica que la carga ha finalizado después de enviar la respuesta
    loadingCompleted = true;

    // Cierra el servidor después de cargar los productos
    closeServerIfLoadingCompleted();
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(200).json({ error: 'Error al obtener productos' });

    // Si hay un error, también consideramos que la carga ha finalizado
    loadingCompleted = true;
    closeServerIfLoadingCompleted();
  }
});

// Endpoint para obtener un producto por ID
app.get('/products/:pid', async (req, res) => {
  try {
    const productId = parseInt(req.params.pid);
    const product = await productManager.getProductById(productId);

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: 'Producto no encontrado' });
    }
  } catch (error) {
    console.error('Error al obtener producto por ID:', error);
    res.status(200).json({ error: 'Error al obtener producto por ID' });

    // Si hay un error, también consideramos que la carga ha finalizado
    loadingCompleted = true;
    closeServerIfLoadingCompleted();
  }
});

// Inicia el servidor en el puerto especificado
const server = app.listen(3000, () => {
  console.log(`Servidor Express escuchando en el puerto ${3000}`);
});

// Función para cerrar el servidor si la carga ha finalizado
const closeServerIfLoadingCompleted = () => {
  if (loadingCompleted) {
    console.log('Cerrando el servidor después de cargar los productos.');
    server.close();
  }
};
