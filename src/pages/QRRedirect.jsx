import React, { useEffect } from "react";
import { useParams } from "react-router-dom";

const QRRedirect = () => {
  const { memberId } = useParams();

  useEffect(() => {
    if (!memberId) return;

    // Correct file name format
    const target = `https://api.regeve.in/uploads/${memberId}/${memberId}_QR.png`;

    window.location.replace(target);
  }, [memberId]);

  return (
    <div style={{ textAlign: "center", padding: 40 }}>
      <p style={{ color: "#444" }}>Preparing your QR code — redirecting…</p>
    </div>
  );
};

export default QRRedirect;
