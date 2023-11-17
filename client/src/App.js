import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';

import Landing from './pages/Landing'
import Signup from './pages/Signup';
import Signin from './pages/Signin';
import UserLanding from './pages/UserLanding';
import UnaivailableRoute from './pages/UnaivailableRoute';

//user routes 
import UserRoutes from './pages/privateroutes/UserRoutes'

function App() {
  return (
    <Router>
      <Routes>
          <Route path="*" element={<UnaivailableRoute />}/>
          <Route path='/' element={<Landing />}/>
          <Route path='/signup' element={<Signup />}/>
          <Route path='/signin' element={<Signin />}/>

          <Route element={<UserRoutes />}>
            <Route path='/user/dashboard' element = {<UserLanding />} />
          </Route>
      </Routes>
    </Router>
  );
}

export default App;
