import { useEffect, useState } from "react";

type Props = {};

function TelegramWebApp({}: Props) {
  const [locationAllowed, setLocationAllowed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState("Yuklanmoqda...");
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError("Brauzerda geolokatsiya qo'llab-quvvatlanmaydi.");
      setIsModalOpen(true);
      return;
    }

    setLocationAllowed(false);
    setLoading("Yuklanmoqda...");
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationAllowed(true);
        setLoading("Joylashuv olindi!");
      },
      () => {
        setError("Joylashuvni olishda xatolik. Ruxsat bering.");
        setIsModalOpen(true);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    getLocation();
  }, []);

  return (
    <div>
      <div>
        <strong>Joylashuv:</strong> {location ? JSON.stringify(location) : "Mavjud emas"}
      </div>
      <div>{loading}</div>
      {error && <div style={{ color: "red" }}>{error}</div>}
      {locationAllowed && <div>✅ Joylashuv uchun ruxsat qilingan!</div>}

      {/* Modal */}
      {isModalOpen && (
        <div style={modalStyle}>
          <div style={modalContentStyle}>
            <h3>📍 Joylashuvga ruxsat bering</h3>
            <p>Ilova sizning joylashuvingizni aniqlash uchun ruxsat so‘ramoqda.</p>
            <button onClick={() => { setIsModalOpen(false); getLocation(); }} style={buttonStyle}>
              Qayta so‘rash
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Modal uchun oddiy inline style
const modalStyle = {
  position: "fixed" as const,
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const modalContentStyle = {
  backgroundColor: "#fff",
  padding: "20px",
  borderRadius: "8px",
  textAlign: "center" as const,
};

const buttonStyle = {
  padding: "10px 20px",
  backgroundColor: "#007bff",
  color: "#fff",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  marginTop: "10px",
};

export default TelegramWebApp;
