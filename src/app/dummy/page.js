"use client";
import {
  TrashIcon,
  PencilSquareIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import { IoSaveOutline } from "react-icons/io5";

export default function Home() {
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    qty: "",
    description: "",
    comments: "",
  });
  const [fetched, setFetched] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const [deleteMarkedItems, setDeleteMarkedItems] = useState({});
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/itemmaster");
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const result = await response.json();
        setFetched(result.data || []);

        const initialSelection = {};
        result.data.forEach(item => {
          initialSelection[item.id] = true;
        });
        setSelectedItems(initialSelection);
      } catch (error) {
        console.error("Fetch failed:", error);
      }
    };

    fetchData();
  }, []);

  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      qty: item.quantity,
      description: item.description,
      comments: item.comments || "",
    });
    setEditingItem(item.id);
  };

  const handleSave = async (e, id) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/itemmaster/${id}`, {
        method: "PUT",
        body: JSON.stringify({ ...formData, id }),
        headers: { "Content-Type": "application/json" },
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Something went wrong");

      // Update the fetched items
      setFetched((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...formData } : item))
      );

      setEditingItem(null);
      setFormData({ name: "", qty: "", description: "", comments: "" });
    } catch (error) {
      console.error("Error while saving:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-5">
      <h1 className="text-center text-3xl mt-5 font-bold">Item Master</h1>

      <div className="mt-8">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-4 py-2">NO</th>
              <th className="border border-gray-300 px-4 py-2">Name</th>
              <th className="border border-gray-300 px-4 py-2">Min <br /> Qty</th>
              <th className="border border-gray-300 px-4 py-2">Description</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {fetched.map((item, i) => (
              <tr key={item.id}>
                <td className="border border-gray-300 px-4 py-2">
                  {`IT${String(i + 1).padStart(3, '0')}`}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {editingItem === item.id ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="border-2 border-gray-300 p-1 rounded-md"
                    />
                  ) : (
                    item.name
                  )}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {editingItem === item.id ? (
                    <input
                      type="number"
                      name="qty"
                      value={formData.qty}
                      onChange={handleChange}
                      className="border-2 border-gray-300 p-1 rounded-md"
                    />
                  ) : (
                    item.quantity
                  )}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {editingItem === item.id ? (
                    <input
                      type="text"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="border-2 border-gray-300 p-1 rounded-md"
                    />
                  ) : (
                    item.description
                  )}
                </td>
                <td className="border border-gray-300 px-4 py-2 flex space-x-3 justify-center">
                  {editingItem === item.id ? (
                    <button
                      onClick={(e) => handleSave(e, item.id)}
                      className="bg-green-500 text-white p-1 rounded-md"
                    >
                      <IoSaveOutline className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEdit(item)}
                      className="bg-blue-500 text-white p-1 rounded-md"
                    >
                      <PencilSquareIcon className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="my-5 flex justify-end">
        <button className="flex items-center border-2 p-2 rounded-md text-white bg-gray-700">
          <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
          <span>Download</span>
        </button>
      </div>
    </div>
  );
}
