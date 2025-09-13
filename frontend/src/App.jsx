import { useState } from 'react'
//import 'bootstrap/dist/css/bootstrap.min.css'
import Signup from './Signup'
import Login from './Login'
import Home from './Home'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Planner from './Planner'
import BudgetPlans from './BudgetPlans'
import Dashboard from './Dashboard'
import PlanDetails from './PlanDetails';
import EditPlan from './EditPlan';
import Hotels from './Hotels';
import UserProfile from './UserProfile';
import Map from './Map'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/register' element={<Signup />}></Route>
        <Route path='/login' element={<Login />}></Route>
        <Route path='/home' element={<Home />}></Route>
        <Route path='/' element={<Home />}></Route>
        <Route path='/planner' element={<Planner />}></Route>
        <Route path='/plans' element={<BudgetPlans />}></Route>
        <Route path='/dashboard' element={<Dashboard />}></Route>
        <Route path="/plans/:id" element={<PlanDetails />} />
        <Route path="/plans/:id/edit" element={<EditPlan />} />
        <Route path="/hotels" element={<Hotels />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/map" element={<Map />} />
        <Route path="*" element={<h2 style={{padding: '2rem', alignContent: 'center'}}>404 Not Found</h2>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
