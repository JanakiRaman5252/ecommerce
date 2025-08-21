import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import MainLayout from "./layout/MainLayout";
import HomePage from "./pages/HomePage";
import API from "./api";
import ProductsPage from "./pages/ProductsPage";
import CartPage from "./pages/CartPage";
import ProfilePage from "./pages/ProfilePage";
import AboutPage from "./pages/AboutPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderDetails from "./pages/OrderDetails";
import AdminPage from "./pages/AdminPage";
import ProductDetailPage from "./pages/ProductDetails";
import ProtectedRoute from "./components/ui/ProtectedRoute";
import AdminProtectedRoute from "./components/ui/AdminRoute"; // 👈 new
import Contact from "./pages/Contact";
import ShopPage from "./pages/ShopPage";

function App() {
  const [numCartItems, setNumCartItems] = useState(0);
  const cart_code = localStorage.getItem("cart_code");

  useEffect(() => {
    if (cart_code) {
      API.get(`cart-status?cart_code=${cart_code}`)
        .then((response) => {
          setNumCartItems(response.data.data.num_of_items);
        })
        .catch((error) => {
          console.error(error.message);
        });
    }
  }, [cart_code]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Main Layout Routes */}
        <Route path="/" element={<MainLayout NumCartItems={numCartItems} />}>
          <Route
            path="*"
            element={<h1 className="text-center text-2xl">404 Not Found</h1>}
          />
          {/* Admin Route (Protected for Admins only) */}
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminPage />
              </AdminProtectedRoute>
            }
          />

          {/* Public Routes */}
          <Route index element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage setNumCartItems={setNumCartItems}/>} />
          <Route path="/cart" element={<CartPage setNumCartItems={setNumCartItems}/>} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/contact" element={<Contact />} />

          {/* User Protected Routes */}
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-orders"
            element={
              <ProtectedRoute>
                <OrderDetails />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Auth Routes */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
