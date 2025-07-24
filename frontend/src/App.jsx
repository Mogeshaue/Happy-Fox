import React from "react";
import {  Routes, Route } from "react-router-dom";
import AdminLayout from "./mainadmin/AdminLayout";
import Addcourses from "./mainadmin/Addcourses";
import Createcourse from "./mainadmin/Createcourse";


const App = () => {
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
