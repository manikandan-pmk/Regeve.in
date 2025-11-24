// Dashboard.jsx
import React, { useEffect } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

export default function MemberDashBoard() {
  const navigate = useNavigate();

  useEffect(() => {
    // Connect to backend Socket.IO
    const socket = io("https://api.regeve.in", {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("✅ Connected to Socket.IO:", socket.id);
    });
  
    // Listen for scan events
    socket.on("member-scanned", ({ Member_ID }) => {
      console.log("📥 member-scanned received:", Member_ID);

      // Option 1: navigate to member details page
      navigate(`/member-details/${Member_ID}`);

      // Option 2: open in new tab
      // window.open(`/member-details/${memberId}`, "_blank");
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from Socket.IO");
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [navigate]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Admin Dashboard</h1>
      <p>Keep this page open. When someone scans a QR, this screen will change.</p>
    </div>
  );
}

