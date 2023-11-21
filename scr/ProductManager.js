const fs = require('fs').promises;
const readlineSync = require('readline-sync');

class ProductManager {
  constructor(baseFileName) {
    this.baseFileName = baseFileName;
    this.currentFilePath = `${baseFileName}_stockActual.json`;
    this.deletedFilePath = `${baseFileName}_productosBorrados.json`;
    this.idCounter = 1;
    this.initializeFile();
    this.loadLastId(); // Agregamos la carga del último id
  }


  async initializeFile() {
    try {
      await fs.access(this.currentFilePath, fs.constants.F_OK);
      await fs.access(this.deletedFilePath, fs.constants.F_OK);
    } catch (err) {
      await fs.writeFile(this.currentFilePath, '[]');
      await fs.writeFile(this.deletedFilePath, '[]');
    }
  }


 // Nueva función para cargar el último id desde el archivo
 async loadLastId() {
  try {
    const data = await fs.readFile(`${this.baseFileName}_lastId.json`, 'utf8');
    const lastId = JSON.parse(data);
    if (lastId && typeof lastId === 'number') {
      this.idCounter = lastId + 1;
    }
  } catch (error) {
    // El archivo no existe o hay algún error al leerlo
  }
}
  // Nueva función para guardar el último id en el archivo
  async saveLastId() {
    await fs.writeFile(`${this.baseFileName}_lastId.json`, JSON.stringify(this.idCounter - 1));
  }


  async addProduct(product) {
    try {
      const products = await this.getProducts();
      const newProduct = {
        id: this.idCounter++, 
        ...product,
      };
      products.push(newProduct);
      await fs.writeFile(this.currentFilePath, JSON.stringify(products, null, 2));
      await this.saveLastId(); // Guardamos el último id después de agregar un producto
      return newProduct;
    } catch (error) {
      console.error('Error al agregar el producto:', error);
      return null;
    }
  }

  async addMultipleProducts(newProducts) {
    try {
      const currentProducts = await this.getProducts();
      const productsToAdd = newProducts.map((product) => ({
        id: this.idCounter++, // Utilizamos el contador aquí y cuando se trata de un solo producto 
        ...product,
      }));
      const updatedProducts = [...currentProducts, ...productsToAdd];
      await fs.writeFile(this.currentFilePath, JSON.stringify(updatedProducts, null, 2));
      
      // Guardar el último id después de agregar cada producto
      await this.saveLastId();
  
      return productsToAdd;
    } catch (error) {
      console.error('Error al agregar productos:', error);
      return [];
    }
  }
  

  async getProducts() {
    try {
      const data = await fs.readFile(this.currentFilePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error al obtener los productos:', error);
      return [];
    }
  }

  async getProductById(id) {
    try {
      const products = await this.getProducts();
      return products.find((product) => product.id === id);
    } catch (error) {
      console.error('Error al obtener el producto por ID:', error);
      return null;
    }
  }

  async updateProduct(id, updatedFields) {
    try {
      const products = await this.getProducts();
      const updatedProducts = products.map((product) => {
        if (product.id === id) {
          return { ...product, ...updatedFields, id };
        }
        return product;
      });
      await fs.writeFile(this.currentFilePath, JSON.stringify(updatedProducts, null, 2));
      return true;
    } catch (error) {
      console.error('Error al actualizar el producto:', error);
      return false;
    }
  }

  async deleteProduct(id) {
    try {
      let products = await this.getProducts();
      const productToDelete = products.find((product) => product.id === id);

      if (!productToDelete) {
        console.log('Producto no encontrado.');
        return false;
      }
      // he creado dos archivos JSON uno para los productos elimandos y otro para el listado de prodcutos existentes 



      
      // Guardar el producto eliminado
      const deletedProducts = await fs.readFile(this.deletedFilePath, 'utf8');
      const deletedProductsArray = JSON.parse(deletedProducts);
      deletedProductsArray.push(productToDelete);
      await fs.writeFile(this.deletedFilePath, JSON.stringify(deletedProductsArray, null, 2));

      // Actualizar el archivo actual sin el producto eliminado
      products = products.filter((product) => product.id !== id);
      await fs.writeFile(this.currentFilePath, JSON.stringify(products, null, 2));

      return true;
    } catch (error) {
      console.error('Error al eliminar el producto:', error);
      return false;
    }
  }

  async getDeletedProducts() {
    try {
      const data = await fs.readFile(this.deletedFilePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error al obtener los productos eliminados:', error);
      return [];
    }
  }
}

const run = async () => {
  const baseFileName = 'products'; // Nombre base del archivo  sugerido por CODER
  const productManager = new ProductManager(baseFileName);


  // agregar múltiples productos al JSON 
  const newProducts = [
    {
      title: 'Product 2',
      description: 'Description of product 2',
      price: 30,
      thumbnail: 'url_to_thumbnail_2',
      code: 'XYZ789',
      stock: 5,
    },
    {
      title: 'Product 3',
      description: 'Description of product 3',
      price: 40,
      thumbnail: 'url_to_thumbnail_3',
      code: 'DEF459',
      stock: 8,
    },
    {
      title: 'Product 4',
      description: 'Description of product 34',
      price: 40,
      thumbnail: 'url_to_thumbnail_4',
      code: 'DEG456',
      stock: 18,
    },
    {
      title: 'Product 5',
      description: 'Description of product 5',
      price: 40,
      thumbnail: 'url_to_thumbnail_5',
      code: 'DEG4321',
      stock: 18,
    },
  ];
  /* const addedProducts = await productManager.addMultipleProducts(newProducts);
  console.log('Productos agregados:', addedProducts); */

  async function intendando(){
    const addedProducts = await productManager.addMultipleProducts(newProducts);
}
intendando()



  // Obtener todos los productos
  const allProducts = await productManager.getProducts();
  console.log('Todos los productos:', allProducts);

  // Obtener producto por ID
  const productById = await productManager.getProductById(1);
  console.log('Producto por ID:', productById);

  // Actualizar producto
  const updated = await productManager.updateProduct(1, { stock: 20 });
  console.log('Producto actualizado:', updated);

  // Eliminar producto por ID
  const deleted = await productManager.deleteProduct(3); // elimina un producto por ID
  console.log('Producto eliminado:', deleted); 

  // Obtener productos eliminados
  const deletedProducts = await productManager.getDeletedProducts();
  console.log('Productos eliminados:', deletedProducts);
};

module.exports = { ProductManager };
run();
