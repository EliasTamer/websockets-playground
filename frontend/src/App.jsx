import React, { useEffect, useState } from "react";
import "./App.css";
import io from "socket.io-client";
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const socket = io("http://localhost:3001");

const ItemTypes = {
  PRODUCT: 'product',
};

// draggable product component
const DraggableProduct = ({ id, name, index, moveProduct }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.PRODUCT,
    item: { id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemTypes.PRODUCT,
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveProduct(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  return (
    <div
      ref={(node) => drag(drop(node))}
      className="item"
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
        border: '1px solid #ddd',
        padding: '10px',
        marginBottom: '8px',
        backgroundColor: 'white',
        borderRadius: '4px',
        boxShadow: isDragging ? '0 5px 10px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.12)'
      }}
    >
      Product name: <strong>{name}</strong>
    </div>
  );
};

const ProductList = ({ products, moveProduct }) => {
  return (
    <div className="products">
      {products.map((product, index) => (
        <DraggableProduct
          key={product.id}
          id={product.id}
          name={product.name}
          index={index}
          moveProduct={moveProduct}
        />
      ))}
    </div>
  );
};

function App() {  
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:3001/product/getProducts"
        );
        const results = await response.json();
        // Sort products by item_order if available
        const sortedProducts = results.data.sort((a, b) => 
          (a.item_order || 0) - (b.item_order || 0)
        );
        setProducts(sortedProducts);
        console.log("Fetched products:", results);
      } catch (error) {
        console.log("Error fetching products:", error);
      }
    };

    fetchData();
  }, []);

  // to move a product in the array
  const moveProduct = (fromIndex, toIndex) => {
    const updatedProducts = [...products];
    const [movedProduct] = updatedProducts.splice(fromIndex, 1);
    console.log(movedProduct);
    updatedProducts.splice(toIndex, 0, movedProduct);
    
    // Update item_order for each product
    const reorderedProducts = updatedProducts.map((product, index) => ({
      ...product,
      item_order: index
    }));
    
    setProducts(reorderedProducts);
    
    // Optional: Send updated order to server
    updateProductOrder(reorderedProducts);
  };

  // function to send updated order to the server
  const updateProductOrder = async (reorderedProducts) => {
    try {
      await fetch('http://localhost:3001/product/updateOrder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          products: reorderedProducts.map(p => ({ id: p.id, item_order: p.item_order }))
        }),
      });
      
      // notify via socket
      socket.emit('products-reordered', reorderedProducts);
    } catch (error) {
      console.error('Error updating product order:', error);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="app-container">
        <h1>Product List</h1>
        <p>Drag products to reorder them</p>
        
        {products.length > 0 ? (
          <ProductList
            products={products}
            moveProduct={moveProduct}
          />
        ) : (
          <div className="no-data">No products found</div>
        )}
      </div>
    </DndProvider>
  );
}

export default App;