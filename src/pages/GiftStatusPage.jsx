import React, { useEffect, useState } from "react";
import axios from "axios";

const GiftStatusPage = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  // Fetch all event-forms
  const fetchUsers = async () => {
    try {
      const res = await axios.get("https://api.regeve.in/api/event-forms?populate=Photo");
      setUsers(res.data.data);
    } catch (err) {
      console.error("Error fetching users", err);
    }
  };

  // Update IsGiftReceived using condition
  const updateGiftStatus = async (user, status) => {
    // ❗ Condition Check
    if (!user.IsVerified_Member || !user.IsPresent) {
      alert("This member is not verified or not present.");
      return;
    }

    try {
      await axios.put(`https://api.regeve.in/api/event-forms/${user.Member_ID}`, {
        data: {
          IsGiftReceived: status,
        },
      });

      fetchUsers();
    } catch (err) {
      console.error("Error updating gift status", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Search filter
  const filteredUsers = users.filter((u) => {
    const s = search.toLowerCase();
    return (
      u.Member_ID?.toLowerCase().includes(s) ||
      u.Name?.toLowerCase().includes(s) ||
      u.Company_ID?.toLowerCase?.().includes(s) ||
      String(u.Phone_Number)?.includes(s)
    );
  });

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 text-center">
        🎁 Gift Received Status
      </h1>

      {/* Search Bar */}
      <div className="mb-6 flex justify-center">
        <input
          type="text"
          placeholder="Search by Member ID, Name, Company ID, Phone Number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-3xl px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white p-4 shadow-xl rounded-xl">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-blue-100 text-center font-semibold">
              <th className="p-3 border">Photo</th>
              <th className="p-3 border">Member_ID</th>
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Company_ID</th>
              <th className="p-3 border">Phone</th>
              <th className="p-3 border">Gift Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((user) => {
              const imageUrl = user.Photo?.url
                ? `https://api.regeve.in${user.Photo.url}`
                : "https://via.placeholder.com/60";

              return (
                <tr
                  key={user.Member_ID}
                  className={`text-center transition-all ${
                    user.IsGiftReceived ? "bg-green-50" : "hover:bg-gray-50"
                  }`}
                >
                  <td className="p-2 border">
                    <img
                      src={imageUrl}
                      className="w-14 h-14 rounded-full object-cover border shadow"
                      alt=""
                    />
                  </td>

                  <td className="p-2 border font-semibold">{user.Member_ID}</td>
                  <td className="p-2 border">{user.Name}</td>
                  <td className="p-2 border">{user.Company_ID}</td>
                  <td className="p-2 border">{user.Phone_Number}</td>

                  <td className="p-2 border">
                    <div className="flex justify-center gap-3">

                      {/* YES BUTTON */}
                      <button
                        onClick={() => updateGiftStatus(user, true)}
                        className={`px-5 py-2 rounded-lg font-semibold shadow transition ${
                          user.IsGiftReceived
                            ? "bg-green-600 text-white"
                            : "bg-green-200 hover:bg-green-300"
                        }`}
                      >
                        Yes
                      </button>

                      {/* NO BUTTON */}
                      <button
                        onClick={() => updateGiftStatus(user, false)}
                        className={`px-5 py-2 rounded-lg font-semibold shadow transition ${
                          !user.IsGiftReceived
                            ? "bg-red-600 text-white"
                            : "bg-red-200 hover:bg-red-300"
                        }`}
                      >
                        No
                      </button>

                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>

        </table>
      </div>
    </div>
  );
};

export default GiftStatusPage;
