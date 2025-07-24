import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [message, setMessage] = useState('')
  const [echoInput, setEchoInput] = useState('')
  const [echoResponse, setEchoResponse] = useState('')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

  const API_BASE_URL = 'http://127.0.0.1:8000/api'

  // Fetch hello message from Django backend
  const fetchHelloMessage = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/hello/`)
      const data = await response.json()
      setMessage(data.message)
    } catch (error) {
      console.error('Error fetching hello message:', error)
      setMessage('Error connecting to backend')
    } finally {
      setLoading(false)
    }
  }

  // Send echo message to Django backend
  const sendEchoMessage = async () => {
    if (!echoInput.trim()) return

    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/echo/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: echoInput })
      })
      const data = await response.json()
      setEchoResponse(data.echo)
    } catch (error) {
      console.error('Error sending echo message:', error)
      setEchoResponse('Error sending message to backend')
    } finally {
      setLoading(false)
    }
  }

  // Fetch data from Django backend
  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/data/`)
      const result = await response.json()
      setData(result.data)
    } catch (error) {
      console.error('Error fetching data:', error)
      setData([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>React + Django Connection</h1>
      
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>

      {/* Django Backend Connection Demo */}
      <div className="card">
        <h2>Django Backend Connection</h2>
        
        {/* Hello Message */}
        <div style={{ marginBottom: '20px' }}>
          <button onClick={fetchHelloMessage} disabled={loading}>
            {loading ? 'Loading...' : 'Get Hello Message'}
          </button>
          {message && <p style={{ color: 'green' }}>{message}</p>}
        </div>

        {/* Echo Message */}
        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            value={echoInput}
            onChange={(e) => setEchoInput(e.target.value)}
            placeholder="Type a message to echo"
            style={{ marginRight: '10px', padding: '5px' }}
          />
          <button onClick={sendEchoMessage} disabled={loading || !echoInput.trim()}>
            {loading ? 'Sending...' : 'Send Echo'}
          </button>
          {echoResponse && <p style={{ color: 'blue' }}>{echoResponse}</p>}
        </div>

        {/* Fetch Data */}
        <div>
          <button onClick={fetchData} disabled={loading}>
            {loading ? 'Loading...' : 'Fetch Data'}
          </button>
          {data.length > 0 && (
            <div style={{ marginTop: '10px' }}>
              <h3>Data from Backend:</h3>
              <ul style={{ textAlign: 'left' }}>
                {data.map((item) => (
                  <li key={item.id}>
                    <strong>{item.name}</strong>: {item.description}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
