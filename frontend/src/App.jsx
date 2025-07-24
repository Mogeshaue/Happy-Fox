import React from 'react'
import Googlemain from './GoogleAuth/Googlemain'
import AdminRoute from './mainadmin/AdminRoute'
import StudentRoute from './Studentsdashboard/Studentsroute'
import Welcome from './Welcome/Welcome'
import Mroute from './mentor/Mroute'

import useCourseStore from './store/Adminstors'


const App = () => {
  const {authUser} =useCourseStore()
  console.log(authUser)
  return (
    <div>

     
      {/* <AdminRoute/> */}
      <Welcome/>
      {/* <Mroute/> */}
      {/* <StudentRoute/> */}
     
    </div>
  )
}

export default App