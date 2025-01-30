// Rasm va joylashuvni serverga yuborish


import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

const CameraComponent: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [user, setUser] = useState<any>(null);
  const [cameraAllowed, setCameraAllowed] = useState(false);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [photoHiddenButton, setPhotoHiddenButton] = useState(false);

  const startCamera = async () => {
    setPhotoTaken(false)
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraAllowed(true);
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
    setCameraAllowed(false);
  };

  const captureImage = () => { 
    
    if (videoRef.current && canvasRef.current) {
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
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
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
  
      const response = await axios.post("http://192.168.1.15:8000/api/v1/common/blank/", formData, {
        headers: {
          "Content-Type": "multipart/form-data", 
        },
      });
  
      if (response.status === 200) {
        alert("Rasm va joylashuv muvaffaqiyatli yuborildi!");
      } else {
        throw new Error("Serverga yuborishda xatolik yuz berdi.");
      }
    } catch (err) {
      setError("Serverga ulanishda xatolik yuz berdi.");
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const tg = (window as any).Telegram?.WebApp;
      tg?.expand();
      if (tg?.initDataUnsafe?.user) {
        setUser(tg.initDataUnsafe.user);
      }
    }
  }, []);

    useEffect(()=>{
      if (Boolean(location?.latitude) && cameraAllowed) {
        setPhotoHiddenButton(true)
      }
    },[location , cameraAllowed])


  return (
    <div style={{
       textAlign: "center",
       padding: "30px", 
      maxWidth: "450px", width: "100%",
       margin: "0 auto",
       height:"100vh",
       display:"grid",
       placeContent:"center",
       gap:"10px"

     }}>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {<video ref={videoRef} autoPlay playsInline style={{ width: "100%", display:(cameraAllowed && !photoTaken) ? "block" : "none", borderRadius:"10px" }}></video>}

      {<canvas ref={canvasRef} style={{ width: "100%", display:photoTaken ? "block" : "none", borderRadius:"10px" }}></canvas>}
      {!location && !cameraAllowed && !error && <p style={{ backgroundColor: "#E5E5FF",
         padding:"20px 30px",
          margin:"0 auto",
          borderRadius:"10px"
         }}>
       Joylashuv ma'lumotlarini berishga rozimisiz?</p>}

      {user && <p>Salom, {user.first_name}!</p>}

      {photoHiddenButton ? (
        <div style={{display:"flex", gap:"10px", justifyContent:"center", }}>
         {photoTaken ? <>
          <button onClick={startCamera} style={{ padding: "10px",  borderRadius: "5px", border: "none", backgroundColor: "#4CAF50", color: "white", cursor: "pointer" }}>
           Kamerani ochish
        </button>
        <button onClick={uploadToServer} style={{ padding: "10px",  borderRadius: "5px", border: "none", backgroundColor: "#4CAF50", color: "white", cursor: "pointer" }}>
         Yuborish
        </button>
          </> : 
        <button onClick={captureImage} style={{ padding: "10px",  borderRadius: "5px", border: "none", backgroundColor: "#4CAF50", color: "white", cursor: "pointer" }}>
          Rasm olish
        </button> }
        </div>
      ): 
       <div>
        <button onClick={() => { startCamera(); getLocation();
       }} style={{ padding: "10px", borderRadius: "5px", marginTop:"50px", border: "none", backgroundColor: "#E5E5FF", color: "#7F4DFF", cursor: "pointer" }}>
      Ruxsat berish
    </button>
       </div>
      }
    </div>
  );
};

export default CameraComponent;
