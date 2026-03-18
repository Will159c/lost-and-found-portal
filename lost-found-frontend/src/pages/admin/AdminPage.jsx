import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext.jsx";
import "./AdminPage.css";

export default function AdminPage() {
  const { token, user, loading } = useContext(AuthContext);

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [items, setItems] = useState([]);

  const [formData, setFormData] = useState({
    itemName: "",
    description: "",
    category: "",
    status: "lost",
    location: "",
    contactInfo: "",
    imageURL: "",
    date: new Date().toISOString().split("T")[0],
  });

  // Fetch items when the component loads
  useEffect(() => {
    if (token && user?.isAdmin) {
      fetchMyItems();
    }
  }, [token, user]);

  async function fetchMyItems() {
    try {
      const response = await fetch(
        `http://localhost:5050/api/items?organization=${user.organization}`,
      );
      if (!response.ok) throw new Error("Failed to fetch items");
      const data = await response.json();
      setItems(data);
    } catch (err) {
      console.error("Error fetching items:", err);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("http://localhost:5050/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      let data = {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to save item");
      }

      setMessage({ type: "success", text: "Item saved successfully!" });

      setFormData({
        itemName: "",
        description: "",
        category: "",
        status: "lost",
        location: "",
        contactInfo: "",
        imageURL: "",
        date: new Date().toISOString().split("T")[0],
      });

      // Refresh the items list to show the newly created item
      fetchMyItems();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange(id, newStatus) {
    try {
      const response = await fetch(`http://localhost:5050/api/items/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      // Update the state to reflect the new status locally
      setItems((prevItems) =>
        prevItems.map((item) =>
          item._id === id ? { ...item, status: newStatus } : item,
        ),
      );
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      const response = await fetch(`http://localhost:5050/api/items/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete item");

      // Remove the item from the state
      setItems((prevItems) => prevItems.filter((item) => item._id !== id));
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) return <div className="admin-container">Loading...</div>;

  if (!token || !user?.isAdmin) {
    return (
      <div className="admin-container">
        <div className="admin-card">
          <h2>Access Denied</h2>
          <p>You do not have admin privileges.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="admin-container"
      style={{
        flexDirection: "column",
        alignItems: "center",
        gap: "20px",
        marginBottom: "40px",
      }}
    >
      {/* Create Item Form */}
      <div className="admin-card">
        <h2>Post New Item</h2>

        {message && (
          <div className={`admin-alert ${message.type}`}>{message.text}</div>
        )}

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label>Item Name *</label>
            <input
              name="itemName"
              value={formData.itemName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <input
              name="category"
              value={formData.category}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="lost">Lost</option>
              <option value="found">Found</option>
              <option value="claimed">Claimed</option>
            </select>
          </div>
          <div className="form-group">
            <label>Location</label>
            <input
              name="location"
              value={formData.location}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Contact Information</label>
            <input
              name="contactInfo"
              value={formData.contactInfo}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Image URL</label>
            <input
              name="imageURL"
              value={formData.imageURL}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
            />
          </div>
          <button type="submit" disabled={submitting}>
            {submitting ? "Processing..." : "Submit"}
          </button>
        </form>
      </div>

      {/* Manage Items List */}
      <div className="admin-card" style={{ width: "800px", maxWidth: "90vw" }}>
        <h2>Manage Posted Items</h2>
        {items.length === 0 ? (
          <p>No items posted yet.</p>
        ) : (
          <table
            style={{
              width: "100%",
              textAlign: "left",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "2px solid #eee" }}>
                <th style={{ padding: "10px" }}>Item Name</th>
                <th style={{ padding: "10px" }}>Date</th>
                <th style={{ padding: "10px" }}>Status</th>
                <th style={{ padding: "10px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "10px" }}>{item.itemName}</td>
                  <td style={{ padding: "10px" }}>
                    {new Date(item.date).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "10px" }}>
                    <select
                      value={item.status}
                      onChange={(e) =>
                        handleStatusChange(item._id, e.target.value)
                      }
                      style={{ padding: "4px 8px", borderRadius: "4px" }}
                    >
                      <option value="lost">Lost</option>
                      <option value="found">Found</option>
                      <option value="claimed">Claimed</option>
                    </select>
                  </td>
                  <td style={{ padding: "10px" }}>
                    <button
                      onClick={() => handleDelete(item._id)}
                      style={{
                        background: "#e74c3c",
                        marginTop: 0,
                        padding: "6px 12px",
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
