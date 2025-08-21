import { useState, useEffect } from "react";
import API from "../api"; 

// Hook for multiple products + CRUD
export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await API.get("products/");
      setProducts(res.data);
    } catch (err) {
      setError(err);
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  };

  // Create product
  const createProduct = async (data) => {
    try {
      await API.post("products/", data);
      fetchProducts();
    } catch (err) {
      setError(err);
      console.error("Failed to create product:", err);
    }
  };

  // Update product
  const updateProduct = async (id, data) => {
    try {
      await API.put(`products/${id}/`, data);
      fetchProducts();
    } catch (err) {
      setError(err);
      console.error(`Failed to update product ${id}:`, err);
    }
  };

  // Delete product
  const deleteProduct = async (id) => {
    try {
      await API.delete(`products/${id}/`);
      fetchProducts();
    } catch (err) {
      setError(err);
      console.error(`Failed to delete product ${id}:`, err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}

// Hook for a single product
export function useProduct(id) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProduct = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const res = await API.get(`products/${id}/`);
      setProduct(res.data);
    } catch (err) {
      setError(err);
      console.error(`Failed to fetch product ${id}:`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProduct(id);
  }, [id]);

  return { product, loading, error, fetchProduct };
}
