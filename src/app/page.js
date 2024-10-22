"use client";
import {
  TrashIcon,
  PencilSquareIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import { IoSaveOutline } from "react-icons/io5";
import { Switch } from "@headlessui/react";

export default function Home() {
  const [editingItem, setEditingItem] = useState(null);
  const [enabledItems, setEnabledItems] = useState({});

  const [selected, setSelected] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    qty: "",
    description: "",
    comments: "",
  });
  const [fetched, setFetched] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const [deleteMarkedItems, setDeleteMarkedItems] = useState({});

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

        // Initialize enabledItems with true for each item
        const initialEnabledState = {};
        result.data.forEach((item) => {
          initialEnabledState[item.id] = true; // Default to true
        });
        setEnabledItems(initialEnabledState);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingItem ? "PUT" : "POST";
      const endpoint = editingItem
        ? `/api/itemmaster/${editingItem}`
        : "/api/itemmaster";

      const response = await fetch("/api/itemmaster", {
        method,
        body: JSON.stringify({
          ...formData,
          id: editingItem,
          enabled: enabledItems || true,
          
        }),
        headers: { "Content-Type": "application/json" },
      });
      console.log(enabledItems,"enable")

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Something went wrong");

      if (editingItem) {
        setFetched((prev) =>
          prev.map((item) =>
            item.id === editingItem ? { ...item, ...formData } : item
          )
        );
      } else {
        setFetched((prev) => [...prev, { ...formData, id: result.id }]);
      }

      setFormData({ name: "", qty: "", description: "", comments: "" });
      setEditingItem(null);
      setEnabledItems((prev) => ({ ...prev, [result.id]: true }));
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

  const handleToggleChange = (id) => {
    setEnabledItems((prev) => ({
      ...prev,
      [id]: !prev[id], // Toggle the current value
    }));
  };

  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    const newSelection = {};
    fetched.forEach((item) => {
      newSelection[item.id] = isChecked;
    });
    setSelectedItems(newSelection);
  };

  const handleDeleteCheckboxChange = (id) => {
    setDeleteMarkedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleDelete = async (id) => {
    // Delete logic here
  };

  return (
    <div className="max-w-4xl mx-auto p-5">
      <form onSubmit={handleSubmit}>
        <h1 className="text-center text-3xl mt-5 font-bold">Item Master</h1>

        <div className="mt-6 space-y-4">
          <div className="flex space-x-4">
            <div className="w-3/4">
              <label htmlFor="name" className="block font-medium">
                Name
              </label>
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
              <label htmlFor="minquantity" className="block font-medium">
                Minimum Quantity
              </label>
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
            <label htmlFor="description" className="block font-medium">
              Description
            </label>
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
            <label htmlFor="comments" className="block font-medium">
              Comments
            </label>
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
              <th className="border border-gray-300 px-4 py-2 text-left">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={fetched.every((item) => selectedItems[item.id])}
                />
              </th>
              <th className="border border-gray-300 px-2 py-2">NO</th>
              <th className="border border-gray-300 px-2 py-2">Name</th>
              <th className="border border-gray-300 px-2 py-2">Description</th>
              <th className="border border-gray-300 px-2 py-2">
                Min <br /> Qty
              </th>
              <th className="border border-gray-300 px-2 py-2">Actions</th>
              <th className="border border-gray-300 px-2 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {fetched.map((item, i) => (
              <tr
                key={item.id}
                className={
                  editingItem === item.id
                    ? "text-green-700"
                    : deleteMarkedItems[item.id]
                    ? "text-red-700"
                    : ""
                }
              >
                <td className="border border-gray-300 px-4 py-2">
                  <input
                    type="checkbox"
                    checked={!!selectedItems[item.id]}
                    onChange={() => handleCheckboxChange(item.id)}
                  />
                </td>
                <td className="border border-gray-300 px-2 py-2">
                  {`IT${String(i + 1).padStart(3, "0")}`}
                </td>
                <td className="border border-gray-300 px-2 py-2">
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

                <td className="border border-gray-300 px-2 py-2">
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
                <td className="border border-gray-300 px-2 py-2 text-right">
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

                <td className="border border-gray-300 px-2 text-center py-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="bg-blue-500 text-white p-1 rounded-md"
                  >
                    <PencilSquareIcon className="w-4 h-4" />
                  </button>
                </td>

                <td className="border border-gray-300 px-2 text-center py-2">
                  <Switch
                    checked={!!enabledItems[item.id]}
                    onChange={() => handleToggleChange(item.id)}
                    className={`group relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                ${enabledItems[item.id] ? "bg-green-600" : "bg-red-600"} 
                transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2`}
                  >
                    <span className="sr-only">Use setting</span>
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
                  transition duration-200 ease-in-out ${
                    enabledItems[item.id] ? "translate-x-5" : ""
                  }`}
                    />
                  </Switch>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-center mt-4">
          <button
            className="border-2 p-2 rounded-md flex items-center text-white bg-green-600"
            type="button" // Changed to type="button" to prevent form submission
            onClick={(e) => handleSubmit(e)} // Ensure handleSubmit works for saving
          >
            <IoSaveOutline className="w-5 h-5 mr-1" />
            <span>Save</span>
          </button>
        </div>
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
