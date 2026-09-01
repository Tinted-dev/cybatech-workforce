import { useEffect, useState } from "react"

function App() {
  const [message, setMessage] = useState("Loading...")

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/health")
      .then((response) => response.json())
      .then((data) => {
        setMessage(data.status)
      })
      .catch((error) => {
        console.error("Error connecting to API:", error)
        setMessage("API connection failed")
      })
  }, [])

  return (
    <main>
      <h1>Cybatech Workforce</h1>

      <p>
        Backend status: {message}
      </p>
    </main>
  )
}

export default App