// Rasm va joylashuvni serverga yuborish


import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast, Toaster } from 'react-hot-toast';


const CameraComponent: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [user, setUser] = useState<any>(null);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locationAllowed, setLocationAllowed] = useState(false);
  const [videoAllowed, setVideoAllowed] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      setPhotoTaken(false);
      setVideoAllowed(false);
      setError(null);
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setVideoAllowed(true);
      }
    } catch (err) {
      setError("Kamerani yoqishda xatolik. Iltimos, ruxsat bering.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      setPhotoTaken(false);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        setPhotoTaken(true);
        stopCamera();
      }
    }
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError("Brauzerda geolokatsiya qo'llab-quvvatlanmaydi.");
      return;
    }
    setLocationAllowed(false);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationAllowed(true);
      },
      () => {
        setError("Joylashuvni olishda xatolik. Ruxsat bering.");
      }
    );
  };

  const uploadToServer = async () => {
    if (!canvasRef.current || !location) {
      setError("Rasm yoki joylashuv mavjud emas.");
      return;
    }
    setLoading(true)
    const canvas = canvasRef.current;
    const imageData = canvas.toDataURL("image/png");

    try {
      const formData = new FormData();

      const byteString = atob(imageData.split(',')[1]);
      const arrayBuffer = new ArrayBuffer(byteString.length);
      const uintArray = new Uint8Array(arrayBuffer);
      for (let i = 0; i < byteString.length; i++) {
        uintArray[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([uintArray], { type: 'image/png' });

      formData.append("photo", blob, "image.png");
      formData.append("latitude", location?.latitude?.toString() || "");
      formData.append("longitude", location?.longitude?.toString() || "");
      formData.append("telegram_id", user?.id);

      const response = await axios.post("https://bank.soffhub.uz/api/v1/common/blank/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201) {
        toast.success("Rasm va joylashuv muvaffaqiyatli yuborildi!");
        setLocationAllowed(false);
        setPhotoTaken(false);
        setVideoAllowed(false);
      } else {
        throw new Error("Serverga yuborishda xatolik yuz berdi.");
      }
    } catch (err) {
      toast.error("Serverga ulanishda xatolik yuz berdi.");
    }
    setLoading(false)
  };

  const onPermissionChange = () => {
    getLocation();
    startCamera();
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      const tg = (window as any).Telegram?.WebApp;
      tg?.expand();
      if (tg?.initDataUnsafe?.user) {
        setUser(tg.initDataUnsafe?.user);
      }
    }

  }, []);


  return (
    <div style={{
      textAlign: "center",
      padding: "20px",
      maxWidth: "450px",
      margin: "0 auto",
      height: "75vh",
      display: "grid",
      placeContent: "center",
      gap: "10px",

    }}>
      <Toaster />
      {<video ref={videoRef} autoPlay playsInline style={{ width: "100%", display: (videoAllowed ) ? "block" : "none", borderRadius: "10px" }}></video>}

      {<canvas ref={canvasRef} style={{ width: "100%", display: photoTaken ? "block" : "none", borderRadius: "10px" }}></canvas>}

      {error && <p style={{ color: "red" }}>{error}</p>}
      {(!locationAllowed && !videoAllowed) && <p style={{
        backgroundColor: "#E5E5FF",
        padding: "20px 30px",
        margin: "0 auto",
        borderRadius: "10px",
        color: "#7F4DFF"
      }}>
        Joylashuv ma'lumotlarini berishga rozimisiz?</p>}


      {(locationAllowed && videoAllowed) ? (
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", width: "100%" }}>
          {photoTaken ? <>
            <button onClick={() => startCamera()} style={{ padding: "12px 20px", width: "100%", borderRadius: "10px", border: "none", backgroundColor: "#E5E5FF", color: "#7F4DFF", display: "flex", gap: "5px", justifyContent: "center", alignItems: "center", cursor: "pointer" }}>
              <i className="fa-solid fa-camera-rotate"></i> <span style={{ whiteSpace: "nowrap" }}>Kameraga qaytish</span>
            </button>
            <button disabled={loading} onClick={uploadToServer} style={{ padding: "12px 20px", width: "100%", borderRadius: "10px", border: "none", backgroundColor: "#E5E5FF", color: "#7F4DFF", cursor: loading ? "not-allowed" : "pointer" }}>
              {loading && <i className="fa-solid fa-spinner"></i>} Yuborish <i className="fa-solid fa-paper-plane"></i>
            </button>
          </> :
            <button onClick={captureImage} style={{ padding: "12px 20px", borderRadius: "10px", width: "100%", border: "none", backgroundColor: "#E5E5FF", color: "#7F4DFF", cursor: "pointer" }}>
              <i className="fa-solid fa-camera-retro"></i> Rasm olish
            </button>
          }
        </div>
      ) :
        <button onClick={onPermissionChange} style={{ padding: "12px 20px", borderRadius: "10px", width: "100%", border: "none", backgroundColor: "#E5E5FF", color: "#7F4DFF", cursor: "pointer", display: "flex", gap: "5px", justifyContent: "center", alignItems: "center", }}>
          <i className="fa-solid fa-camera-rotate"></i> <span style={{ whiteSpace: "nowrap" }}>Ruxsat berish</span>
        </button>
      }
    </div>
  );
};

export default CameraComponent;
