import { useEffect, useState } from 'react'

type Props = {}

function TelegramWebApp({ }: Props) {
  const [locationAllowed, setLocationAllowed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState("Yuklanmoqda");
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError("Brauzerda geolokatsiya qo'llab-quvvatlanmaydi.");
      return;
    }
    setLocationAllowed(false);
    setLoading("Yuklanmoqda");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationAllowed(true);
        setLoading("Success")
      },
      () => {
        setError("Joylashuvni olishda xatolik. Ruxsat bering.");
      }
    );
  };


  useEffect(() => {
    getLocation();
  }, [])
  return (
    <div>
      {JSON.stringify(location)}
      {loading}
      {error && <div>{error}</div>}
      {locationAllowed && <div>Joylashuv uchun ruxsat qilingan!</div>}
    </div>
  )
}

export default TelegramWebApp