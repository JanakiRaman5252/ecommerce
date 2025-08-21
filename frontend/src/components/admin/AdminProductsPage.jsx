import { useState } from "react";
import { useProducts } from "../../hooks/useProducts";
import { useAuth } from "../../context/AuthContext"; 
import { API_URL } from "../../api";

export default function AdminProductsPage() {
  const { user } = useAuth(); 
  const { products, createProduct, updateProduct, deleteProduct } = useProducts();
  const [form, setForm] = useState({ name: "", description: "", price: "", discount: "", inventory: "" });
  const [image, setImage] = useState(null); 
  const [editingId, setEditingId] = useState(null);

  if (!user || user.role !== "admin") {
    return <p className="text-center text-red-500">Not authorized</p>;
  }

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    setImage(e.target.files[0]); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    for (const key in form) {
      formData.append(key, form[key]);
    }
    if (image) {
      formData.append("image", image);
    }

    if (editingId) {
      await updateProduct(editingId, formData, true);
    } else {
      await createProduct(formData, true); 
    }

    setForm({ name: "", description: "", price: "", discount: "", inventory: "" });
    setImage(null);
    setEditingId(null);
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      discount: product.discount,
      inventory: product.inventory,
    });
    setEditingId(product.id);
    setImage(null); 
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">
        {editingId ? "Update Product" : "Add Product"}
      </h1>

     
      <form onSubmit={handleSubmit} className="grid gap-4 mb-6">
        <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Name" className="border p-2 rounded" required />
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="border p-2 rounded" />
        <input type="number" name="price" value={form.price} onChange={handleChange} placeholder="Price" className="border p-2 rounded" required />
        <input type="number" name="discount" value={form.discount} onChange={handleChange} placeholder="Discount (%)" className="border p-2 rounded" />
        <input type="number" name="inventory" value={form.inventory} onChange={handleChange} placeholder="Inventory" className="border p-2 rounded" />
        
       
        <input type="file" accept="image/*" onChange={handleFileChange} className="border p-2 rounded" />

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          {editingId ? "Update" : "Create"}
        </button>
      </form>

     
      <h2 className="text-lg font-semibold mb-2">All Products</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">ID</th>
            <th className="border p-2">Image</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Price</th>
            <th className="border p-2">Inventory</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((prod) => (
            <tr key={prod.id}>
              <td className="border p-2">{prod.id}</td>
              <td className="border p-2">
                {prod.image ? (
                  <img src={`${API_URL}${prod.image}`} alt={prod.name} className="h-12 w-12 object-cover" />
                ) : (
                  "No image"
                )}
              </td>
              <td className="border p-2">{prod.name}</td>
              <td className="border p-2">₹{prod.price}</td>
              <td className="border p-2">{prod.inventory}</td>
              <td className="border p-2 flex gap-2">
                <button onClick={() => handleEdit(prod)} className="bg-yellow-500 text-white px-2 py-1 rounded">Edit</button>
                <button onClick={() => deleteProduct(prod.id)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
