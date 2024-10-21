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

  const fetchData = async () => {
    try {
      const response = await fetch("/api/itemmaster");
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const result = await response.json();
      setFetched(result.data || []);
    } catch (error) {
      console.error("Fetch failed:", error);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      qty: item.quantity,
      description: item.description,
      comments: item.comments || "",
    });
    setEditingItem(item.id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingItem ? "PUT" : "POST";
      const endpoint = editingItem ? `/api/itemmaster/${editingItem}` : "/api/itemmaster";

      const response = await fetch(endpoint, {
        method,
        body: JSON.stringify({ ...formData, id: editingItem }),
        headers: { "Content-Type": "application/json" },
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Something went wrong");

      setFormData({ name: "", qty: "", description: "", comments: "" });
      setEditingItem(null);
      await fetchData();
    } catch (error) {
      console.error("Error while submitting:", error);
    }
  };

  const handleCheckboxChange = (id) => {
    setSelectedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    const newSelection = {};
    fetched.forEach(item => {
      newSelection[item.id] = isChecked;
    });
    setSelectedItems(newSelection);
  };

  const openDeleteDialog = (id) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/itemmaster`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: itemToDelete }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete the item");
      }

      await fetchData();
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error("Error while deleting:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-5">
      <form onSubmit={handleSubmit}>
        <h1 className="text-center text-3xl mt-5 font-bold">Item Master</h1>

        <div className="mt-6 space-y-4">
          <div className="flex space-x-4">
            <div className="w-3/4">
              <label htmlFor="name" className="block font-medium">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="border-2 border-gray-300 block rounded-md w-full p-2"
                name="name"
                id="name"
              />
            </div>
            <div className="w-1/4">
              <label htmlFor="minquantity" className="block font-medium">Minimum Quantity</label>
              <input
                type="number"
                onChange={handleChange}
                value={formData.qty}
                className="border-2 block border-gray-300 rounded-md w-full p-2"
                name="qty"
                id="minquantity"
              />
            </div>
          </div>
          <div>
            <label htmlFor="description" className="block font-medium">Description</label>
            <textarea
              className="border-2 border-gray-300 rounded-md resize-none w-full p-2"
              name="description"
              onChange={handleChange}
              value={formData.description}
              id="description"
              cols="30"
              rows="3"
            />
          </div>
          <div>
            <label htmlFor="comments" className="block font-medium">Comments</label>
            <textarea
              name="comments"
              value={formData.comments}
              onChange={handleChange}
              placeholder="Enter your comments here"
              className="border-2 border-gray-300 rounded-md resize-none w-full p-2"
              rows="3"
            />
          </div>
          <div className="flex justify-center">
            <button
              className="border-2 p-2 rounded-md flex items-center text-white bg-green-600"
              type="submit"
            >
              <IoSaveOutline className="w-5 h-5 mr-1" />
              <span>Save</span>
            </button>
          </div>
        </div>
      </form>

      <div className="mt-8">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-4 py-2">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={fetched.every(item => selectedItems[item.id])}
                />
              </th>
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
                  <input
                    type="checkbox"
                    checked={!!selectedItems[item.id]}
                    onChange={() => handleCheckboxChange(item.id)}
                  />
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {`IT${String(i + 1).padStart(3, '0')}`}
                </td>
                <td className="border border-gray-300 px-4 py-2">{item.name}</td>
                <td className="border border-gray-300 px-4 py-2 text-right">{item.quantity}</td>
                <td className="border border-gray-300 px-4 py-2">
                  {item.description.length > 30
                    ? item.description.slice(0, 30) + "..."
                    : item.description}
                </td>
                <td className="border border-gray-300 px-4 py-2 flex space-x-3 justify-center">
                  <button
                    aria-label="Edit item"
                    onClick={() => handleEdit(item)}
                    className="bg-blue-500 text-white flex items-center justify-center w-8 h-8 rounded-md hover:bg-blue-600 transition duration-200 shadow-md"
                  >
                    <PencilSquareIcon className="w-4 h-4" />
                  </button>
                  <button
                    aria-label="Delete item"
                    onClick={() => openDeleteDialog(item.id)}
                    className="bg-red-500 text-white flex items-center justify-center w-8 h-8 rounded-md hover:bg-red-600 transition duration-200 shadow-md"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
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

      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-75 transition-opacity overflow-y-auto">
          <div className="bg-white p-3 rounded-md shadow-xl transition-all">
            <h2 className="text-lg font-bold">Confirm Deletion</h2>
            <p>Are you sure you want to delete this item?</p>
            <div className="mt-4 flex justify-end space-x-2">
              <button onClick={() => setDeleteDialogOpen(false)} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
