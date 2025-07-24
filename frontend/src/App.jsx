import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import React from "react";
import {  Routes, Route } from "react-router-dom";
import AdminLayout from "./mainadmin/AdminLayout";
import Addcourses from "./mainadmin/Addcourses";
import Createcourse from "./mainadmin/Createcourse";

import GoogleOAuthLogin from './GoogleOAuthLogin'
import SimpleStudentLogin from './SimpleStudentLogin'

function App() {
  const [count, setCount] = useState(0)
  const [message, setMessage] = useState('')
  const [echoInput, setEchoInput] = useState('')
  const [echoResponse, setEchoResponse] = useState('')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [loginError, setLoginError] = useState('')

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

  // Handle Google OAuth login success
  const handleLoginSuccess = (loginData) => {
    setUser(loginData.student)
    setLoginError('')
    console.log('Login successful:', loginData)
  }

  // Handle Google OAuth login error
  const handleLoginError = (error) => {
    setLoginError(error)
    setUser(null)
    console.error('Login error:', error)
  }

  // Handle logout
  const handleLogout = () => {
    setUser(null)
    setLoginError('')
  }

  return (
    
      <Routes>
        {/* Admin routes */}
        <Route path="/" element={<AdminLayout/>}>
        
          <Route path="addcourse" element={<Addcourses />} />
          <Route path="create-course" element={<Createcourse />} />
         
        </Route>

        {/* You can add public routes here */}
        {/* <Route path="/" element={<HomePage />} /> */}
      </Routes>
    
  );
};

export default App;
