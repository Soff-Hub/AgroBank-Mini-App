import TelegramWebApp from './components/TelegramWebApp'

function App() {

  return (
    <div style={{
      textAlign: "center",
      padding: "20px",
      maxWidth: "450px",
      width: "90%",
      margin: "0 auto",
      minHeight: "75vh",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      justifyContent: "center",

    }}>
      <TelegramWebApp />
    </div>
  )
}

export default App
