import React, { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";

const QRCodeForm = () => {
  const url = "https://regeve.in/#/event-form";
  const qrRef = useRef(null);

  const downloadQR = () => {
    const canvas = qrRef.current.querySelector("canvas");
    const pngUrl = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = pngUrl;
    link.download = "regeve-qrcode.png";
    link.click();
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h3>Scan to Register</h3>

      <div ref={qrRef}>
        <QRCodeCanvas value={url} size={200} includeMargin={true} />
      </div>

      <p>{url}</p>

      <button
        onClick={downloadQR}
        style={{
          padding: "10px 20px",
          background: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          marginTop: "10px",
        }}
      >
        Download QR Code
      </button>
    </div>
  );
};

export default QRCodeForm;
