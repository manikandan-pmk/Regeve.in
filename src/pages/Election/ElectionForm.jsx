import React, { useState } from "react";
import axios from "axios";

const API_URL = "https://api.regeve.in/api/voter-registrations";

export default function ElectionForm({ token = null }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone_number: "",
    whatsapp_number: "",
    age: "",
    gender: "",
    experience: "",
  });

  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleFiles(e) {
    setPhotos(Array.from(e.target.files));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      let uploadedMedia = [];

      // Upload images to Strapi
      if (photos.length > 0) {
        const fd = new FormData();
        photos.forEach((file) => fd.append("files", file));

        const uploadResp = await axios.post(
          "https://api.regeve.in/api/upload",
          fd,
          { headers: { "Content-Type": "multipart/form-data", ...authHeaders } }
        );

        uploadedMedia = uploadResp.data.map((file) => file.id);
      }

      // FINAL PAYLOAD - MUST MATCH STRAPI EXACTLY
      const payload = {
        data: {
          name: form.name,
          email: form.email,
          Phone_Number: form.phone_number,
          WhatsApp_Number: form.whatsapp_number,
          age: Number(form.age),
          gender: form.gender,
          experience: form.experience,
          photo: uploadedMedia, // <- multiple media IDs
        },
      };

      await axios.post(API_URL, payload, {
        headers: { "Content-Type": "application/json", ...authHeaders },
      });

      setMessage({
        type: "success",
        text: "Candidate submitted successfully.",
      });

      // Reset fields
      setForm({
        name: "",
        email: "",
        phone_number: "",
        whatsapp_number: "",
        age: "",
        gender: "",
        experience: "",
      });
      setPhotos([]);
    } catch (err) {
      console.error(err.response ? err.response.data : err);

      setMessage({
        type: "error",
        text: "Failed to submit. Check console.",
      });
    }

    setLoading(false);
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-xl rounded-lg my-10">
      <h2 className="text-3xl font-bold text-center mb-2">Apply as a Candidate</h2>

      {message && (
        <div
          className={`p-4 mb-4 rounded-md ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4"
      >
        <div>
          <label>Name</label>
          <input
            className="w-full px-3 py-2 border rounded-md"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Email</label>
          <input
            className="w-full px-3 py-2 border rounded-md"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Phone Number</label>
          <input
            className="w-full px-3 py-2 border rounded-md"
            name="phone_number"
            value={form.phone_number}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>WhatsApp Number</label>
          <input
            className="w-full px-3 py-2 border rounded-md"
            name="whatsapp_number"
            value={form.whatsapp_number}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Age</label>
          <input
            className="w-full px-3 py-2 border rounded-md"
            type="number"
            name="age"
            value={form.age}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Gender</label>
          <select
            className="w-full px-3 py-2 border rounded-md"
            name="gender"
            value={form.gender}
            onChange={handleChange}
          >
            <option value="">Select</option>
            <option>Male</option>
            <option>Female</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label>Experience</label>
          <textarea
            className="w-full px-3 py-2 border rounded-md"
            name="experience"
            value={form.experience}
            onChange={handleChange}
          />
        </div>

        <div className="md:col-span-2">
          <label>Photo(s)</label>
          <input type="file" multiple accept="image/*" onChange={handleFiles} />
        </div>

        <div className="md:col-span-2">
          <button
            className={`w-full py-3 px-4 rounded-md text-white bg-blue-600 ${
              loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
            }`}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Application"}
          </button>
        </div>
      </form>
    </div>
  );
}
