import React from 'react';
import Welcome from './Welcome/Welcome';
import useCourseStore from './store/Adminstors';
import AdminRoute from './mainadmin/AdminRoute';
import StudentRoute from './Studentsdashboard/Studentsroute';

const App = () => {
  const { authUser, storementors } = useCourseStore();

  if (!authUser) {
    return <Welcome />;
  }

  const isMentor = storementors.includes(authUser.email);

  return (
    <div>
      {isMentor ? <AdminRoute /> : <StudentRoute />}
    </div>
  );
};

export default App;
