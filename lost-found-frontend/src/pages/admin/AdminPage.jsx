import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext.jsx";
import "./AdminPage.css";

export default function AdminPage() {
    const { token, user, loading } = useContext(AuthContext);

    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState(null);

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

    if (loading) return <div className="admin-container">Loading...</div>;

    if (!token) {
        return (
            <div className="admin-container">
                <div className="admin-card">
                    <h2>Access Denied</h2>
                    <p>You must be logged in.</p>
                </div>
            </div>
        );
    }

    if (!user?.isAdmin) {
        return (
            <div className="admin-container">
                <div className="admin-card">
                    <h2>Access Denied</h2>
                    <p>You do not have admin privileges.</p>
                </div>
            </div>
        );
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
                throw new Error(
                    data.message || "Failed to save item"
                );
            }

            setMessage({
                type: "success",
                text: "Item saved successfully!",
            });

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

        } catch (err) {
            setMessage({
                type: "error",
                text: err.message,
            });
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="admin-container">
            <div className="admin-card">
                <h2>Post New Item</h2>

                {message && (
                    <div className={`admin-alert ${message.type}`}>
                        {message.text}
                    </div>
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
        </div>
    );
}