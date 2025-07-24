import React from 'react'
import Googlemain from './GoogleAuth/Googlemain'
import AdminRoute from './mainadmin/AdminRoute'
import StudentRoute from './Studentsdashboard/Studentsroute'
import Welcome from './Welcome/Welcome'
import Mroute from './mentor/Mroute'


const App = () => {
  return (
    <div>

     
      {/* <AdminRoute/> */}
      {/* <Welcome/> */}
      <Mroute/>
      {/* <StudentRoute/> */}
     
    </div>
  )
}

export default App