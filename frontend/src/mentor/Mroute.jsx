import React from 'react'
import Mlayout from './Mlayout'
import { Toaster } from 'react-hot-toast'
import { Routes, Route } from "react-router-dom";
const Mroute = () => {
  return (
    <div>
      <Toaster/>
    <Routes>
    {/* Admin routes */}
    <Route path="/" element={<Mlayout/>}>
    
      {/* <Route path="dashboard" element={<AdminDashboard/>} /> */}
    
     
    </Route>

    {/* You can add public routes here */}
    {/* <Route path="/" element={<HomePage />} /> */}
  </Routes>
  </div>
  )
}

export default Mroute