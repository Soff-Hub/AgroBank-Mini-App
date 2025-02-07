import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast, Toaster } from 'react-hot-toast';
import { Breadcrumb, DatePicker, DatePickerProps, Input, InputNumber } from "antd";
const { TextArea } = Input;

const CameraComponent: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [user, setUser] = useState<any>();
  const [photoTaken, setPhotoTaken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadPermes, setLoadPermes] = useState<any>(null);
  const [locationAllowed, setLocationAllowed] = useState(false);
  const [videoAllowed, setVideoAllowed] = useState(false);
  const [tabNumberContinues, setTabNumberContinues] = useState(false);
  const [tabNumberContinues2, setTabNumberContinues2] = useState(false);
  const [dataPath, setDataPath] = useState([]);
  const [dataPathFilter, setDataPathFilter] = useState(null);
  const [data, setData] = useState<any>([]);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [tabNumber, setTabNumber] = useState('');
  const [statusID, setStatusID] = useState<any>('');
  const [comment, setComment] = useState<any>('');
  const [price, setPrice] = useState<any>('');
  const [dateChange, setDateChane] = useState<any>('');
  const [errors, setErrors] = useState<any>('');
  const [errorMessage, setErrorMessage] = useState<any>('');
  const hi = window.location?.search
  const token = hi?.split("?hi=")[1]
  const [toggle, setToggle] = useState<"user" | "environment">("user");
  const [successText, setSuccessText] = useState("")


  async function getBrandCrums() {
    try {
      const response = await axios.get(`https://bank.soffhub.uz/api/v1/common/blank/status/path/?parent=${dataPathFilter || ""}`)
      setDataPath(response?.data)
    } catch (error) {
      console.log(error);

    }
  }

  async function getStatusData() {
    try {
      const response = await axios.get(`https://bank.soffhub.uz/api/v1/common/blank/status/?parent=${dataPathFilter || ''}`)
      setData(response?.data)
    } catch (error) {
      console.log(error);

    }
  }

  const startCamera = async (toggleMode: "user" | "environment") => {
    try {
      setPhotoTaken(false);
      setVideoAllowed(false);
      setError(null);
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: toggleMode } });
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
      toast.error("Rasm yoki joylashuv mavjud emas.");
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

      if (blob) {
        formData.append("photo", blob, "image.png");
      }
      if (location?.latitude) {
        formData.append("latitude", location?.latitude?.toString());
      }
      if (location?.longitude) {
        formData.append("longitude", location?.longitude?.toString());
      }
      if (statusID?.id) {
        formData.append("status", statusID?.id);
      }
      if (tabNumber) {
        formData.append("blank_id", tabNumber);
      }
      if (user?.id) {
        formData.append("telegram_id", user?.id);
      }
      if (comment) {
        formData.append("comment", comment);
      }
      if (price) {
        formData.append("payment_amount", price);
      }
      if (dateChange) {
        formData.append("payment_date", dateChange);
      }

      const response = await axios.post("https://bank.soffhub.uz/api/v1/common/blank/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "hi": token,
        },
      });
      if (response.status === 201) {
        toast.success("Anketa muvaffaqiyatli to'ldirildi!");
        setSuccessText("Anketa mal'umotlari muvaffaqiyatli yuborildi!")
        setLocationAllowed(false);
        setPhotoTaken(false);
        setVideoAllowed(false);
        setTabNumberContinues(false);
        setTabNumberContinues2(false);
        setTabNumber('');
        setDataPathFilter(null);
        setComment("");
        setPrice("");
        setDateChane("");
      } else {
        throw new Error("Serverga yuborishda xatolik yuz berdi.");
      }
    } catch (err: any) {
      setErrors(err?.response?.data);
    }
    setLoading(false)
  };

  const onPermissionChange = () => {
    getLocation();
    startCamera("user");
  }

  const items = dataPath?.length > 0
    ? [
      {
        title: <span style={{ cursor: "pointer" }}>Barchasi</span>,
        onClick: () => setDataPathFilter(null),
      },
      ...dataPath.map((item: any) => ({
        title: <span style={{ cursor: item?.id === dataPathFilter ? "" : "pointer", color: item?.id === dataPathFilter ? "blue" : "" }}>{item?.name}</span>,
        onClick: () => {
          setDataPathFilter(item?.id)
        }
      })),
    ]
    : [];


  useEffect(() => {
    getStatusData();
    getBrandCrums();
  }, [dataPathFilter]);

  const onChange: DatePickerProps['onChange'] = (date) => {
    const formattedDate = date.format("YYYY-MM-DD");
    setDateChane(formattedDate)
  };

  async function getPermissions() {
    try {
      const response = await axios.get(`https://bank.soffhub.uz/api/v1/common/employee/check/`, {
        headers: {
          "Content-Type": "application/json",
          "hi": token,
        },
      })
      if (response?.status === 200) {
        setLoadPermes(200)
      }
    } catch (error: any) {
      setLoadPermes(error?.status)
      setErrorMessage(error?.response?.data?.msg)

    }
  }


  useEffect(() => {
    getPermissions()
    if (typeof window !== "undefined") {
      const tg = (window as any).Telegram?.WebApp;
      tg?.expand();
      if (tg?.initDataUnsafe?.user) {
        setUser(tg.initDataUnsafe?.user);
      }
    }

  }, []);




  return (
    <>
      {successText ?
        <>
          <div style={{
            textAlign: "center",
            gap: "10px",
            width: "100%",
            display: "grid"

          }}>
            <div style={{
              backgroundColor: "#d8edce",
              padding: "40px 0",
              margin: "0 auto",
              borderRadius: "10px",
              color: "#7F4DFF",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: "10px"
            }}>
              <span><i className="fa-solid fa-circle-check" style={{ fontSize: "40px", color: "#00A44F" }}></i></span>
              <p style={{ color: "#00A44F", margin: "0" }}>
                {successText}
              </p>

            </div>
          </div>
        </>

        :
        <>
          {
            loadPermes === 200 ?
              (<>
                <Toaster />
                {tabNumberContinues &&
                  <div style={{ width: "100%", }}>
                    <Input placeholder="Anketa ID" style={{ width: "100%", height: "39.5px", marginBottom: "10px" }} onChange={(e) => setTabNumber(e.target.value)} value={tabNumber} />
                    <button disabled={Boolean(!tabNumber)} onClick={() => { setTabNumberContinues2(true), setTabNumberContinues(false) }} style={{ padding: "12px 20px", width: "100%", borderRadius: "10px", border: "none", backgroundColor: "#E5E5FF", color: "#7F4DFF", cursor: Boolean(!tabNumber) ? "not-allowed" : "pointer" }}>
                      Davom etish <i className="fa-solid fa-arrow-right"></i>
                    </button>
                  </div>
                }
                {tabNumberContinues2 &&
                  <div style={{ width: "100%", textAlign: "center", display: "flex", flexDirection: "column", gap: "5px" }}>
                    <Breadcrumb
                      items={items}
                    />
                    <h3 style={{ margin: "10px" }}>Holatlar</h3>
                    {
                      data?.results?.map((item: any) => (
                        <div onClick={() => {
                          if (item?.children) {
                            setDataPathFilter(item?.id);
                            setStatusID('');
                          } else {
                            setStatusID(item);
                          }
                        }} style={{ backgroundColor: statusID?.id === item?.id ? "rgba(111, 120, 127, 0.1)" : "", cursor: "pointer", width: '100%', border: "1px solid rgba(0,0,0,0.1) ", padding: "10px 0", marginBottom: "5px", borderRadius: "8px", position: "relative" }}>
                          {item?.name}
                          {item?.children && <span style={{ position: "absolute", top: "12px", right: "15px" }}><i className="fa-solid fa-chevron-down"></i></span>}
                        </div>
                      ))
                    }
                    {statusID?.id &&
                      <>
                        {(statusID?.requirement && statusID?.requirement !== "not_money_and_date") && <div style={{ width: "100%" }}>
                          <DatePicker placeholder=" Sana tanlash" onChange={onChange} onFocus={() => setErrors((prev: any) => ({ ...prev, payment_date: "" }))} style={{ height: "39.5px", marginBottom: "5px", width: "100%" }} />
                          {errors?.payment_date && <p style={{ color: "red", margin: "0", textAlign: "start" }}>{errors?.payment_date}</p>}
                        </div>}

                        {(statusID?.requirement && statusID?.requirement === "ten_day_in_month") && <div style={{ marginBottom: "10px" }}>
                          <InputNumber onFocus={() => setErrors((prev: any) => ({ ...prev, payment_amount: "" }))} type="number" placeholder="To'lov summasi" value={price} onChange={(e) => setPrice(e)} style={{ height: "39.5px", marginBottom: "3px", width: "100%" }} />
                          {errors?.payment_amount && <p style={{ color: "red", margin: "0", textAlign: "start" }}>{errors?.payment_amount}</p>}

                        </div>}

                        <div style={{ marginBottom: "10px" }}>
                          <TextArea
                            onFocus={() => setErrors((prev: any) => ({ ...prev, comment: "" }))}
                            showCount

                            onChange={(e) => setComment(e?.target?.value)}
                            placeholder="Izoh 10 ta belgidan katta bo'lsin"
                            style={{ height: 120, resize: 'none', marginBottom: "3px" }}
                          />
                          {errors?.comment && <p style={{ color: "red", margin: "0", textAlign: "start" }}>{errors?.comment}</p>}
                        </div>

                        <button disabled={loading} onClick={uploadToServer} style={{ padding: "12px 20px", width: "100%", borderRadius: "10px", border: "none", backgroundColor: "#E5E5FF", color: "#7F4DFF", cursor: loading ? "not-allowed" : "pointer" }}>
                          {loading && <i className="fa-solid fa-spinner"></i>} Yuborish <i className="fa-solid fa-paper-plane"></i>
                        </button>
                      </>
                    }
                  </div>}

                {
                  <div style={{
                    textAlign: "center",
                    gap: "10px",
                    width: "100%",
                    display: (!tabNumberContinues2 && !tabNumberContinues) ? "grid" : "none"

                  }}>
                    {<video ref={videoRef} autoPlay playsInline style={{ width: "100%", display: (videoAllowed && !photoTaken) ? "block" : "none", borderRadius: "10px" }}></video>}

                    {<canvas ref={canvasRef} style={{ width: "100%", display: photoTaken ? "block" : "none", borderRadius: "10px" }}></canvas>}

                    {error && <p style={{ color: "red", }}>{error}</p>}
                    {(!locationAllowed && !videoAllowed) && <p style={{
                      backgroundColor: "#E5E5FF",
                      padding: "20px 0",
                      margin: "0 auto",
                      borderRadius: "10px",
                      color: "#7F4DFF",
                      width: "100%"
                    }}>
                      Joylashuv ma'lumotlarini berishga rozimisiz?</p>}


                    {(locationAllowed && videoAllowed) ? (
                      <div style={{ display: "flex", gap: "10px", justifyContent: "center", width: "100%" }}>
                        {photoTaken ? <>
                          <button onClick={() => startCamera("user")} style={{ padding: "12px 20px", width: "100%", borderRadius: "10px", border: "none", backgroundColor: "#E5E5FF", color: "#7F4DFF", display: "flex", gap: "5px", justifyContent: "center", alignItems: "center", cursor: "pointer" }}>
                            <i className="fa-solid fa-camera-rotate"></i> <span style={{ whiteSpace: "nowrap" }}>Kameraga qaytish</span>
                          </button>
                          <button onClick={() => { setTabNumberContinues(true), stopCamera() }} style={{ padding: "12px 20px", width: "100%", borderRadius: "10px", border: "none", backgroundColor: "#E5E5FF", color: "#7F4DFF", cursor: "pointer" }}>
                            {!!tabNumber && <i className="fa-solid fa-spinner"></i>} Davom etish <i className="fa-solid fa-arrow-right"></i>
                          </button>
                        </> :
                          <div style={{ display: "flex", justifyContent: "space-between", width: "100%", gap: "10px" }}>
                            <button onClick={captureImage} style={{ padding: "12px 20px", borderRadius: "10px", width: "100%", border: "none", backgroundColor: "#E5E5FF", color: "#7F4DFF", cursor: "pointer" }}>
                              <i className="fa-solid fa-camera-retro"></i> Rasm olish
                            </button>
                            <button onClick={() => {
                              setToggle(prev => {
                                const newToggle = prev === "user" ? "environment" : "user";
                                startCamera(newToggle);
                                return newToggle;
                              });
                            }}

                              style={{ padding: "12px 20px", borderRadius: "10px", width: "100%", border: "none", backgroundColor: "#E5E5FF", color: "#7F4DFF", cursor: "pointer", display: "flex", justifyContent: "center", gap: "5px" }}>
                              <i className="fa-solid fa-camera-retro"></i> <span style={{ whiteSpace: "nowrap" }}>Kamerani almashtirish</span>
                            </button>
                          </div>
                        }
                      </div>
                    ) :
                      <button onClick={onPermissionChange} style={{ padding: "12px 20px", borderRadius: "10px", width: "100%", border: "none", backgroundColor: "#E5E5FF", color: "#7F4DFF", cursor: "pointer", display: "flex", gap: "5px", justifyContent: "center", alignItems: "center", }}>
                        <i className="fa-solid fa-camera-rotate"></i> <span style={{ whiteSpace: "nowrap" }}>Ruxsat berish</span>
                      </button>
                    }
                  </div>
                }
              </>) :
              <>
                <div style={{
                  textAlign: "center",
                  gap: "10px",
                  width: "100%",
                  display: "grid"

                }}>
                  <p style={{
                    backgroundColor: "#E5E5FF",
                    padding: "40px 0",
                    margin: "0 auto",
                    borderRadius: "10px",
                    color: "#7F4DFF",
                    width: "100%"
                  }}> {errorMessage}</p>
                </div>
              </>
          }
        </>
      }
    </>
  );
};

export default CameraComponent;
