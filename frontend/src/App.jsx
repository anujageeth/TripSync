import Signup from './Signup'
import Login from './Login'
import Home from './Home'
import {BrowserRouter, Routes, Route, Navigate, Outlet} from 'react-router-dom'
import Planner from './Planner'
import BudgetPlans from './BudgetPlans'
import Dashboard from './Dashboard'
import PlanDetails from './PlanDetails';
import EditPlan from './EditPlan';
import Hotels from './Hotels';
import UserProfile from './UserProfile';
import Map from './Map'
import AddHotel from './AddHotel'
import CreateCollection from './components/CreateCollection';
import PlanCollections from './PlanCollections';
import CollectionDetails from './CollectionDetails'
import PageNotFound from './PageNotFound'

function RequireAuth() {
  const authed = Boolean(localStorage.getItem('userId'));
  return authed ? <Outlet /> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path='/' element={<Home />}></Route>
        <Route path='/home' element={<Home />}></Route>
        <Route path='/login' element={<Login />}></Route>
        <Route path='/register' element={<Signup />}></Route>

        {/* Protected */}
        <Route element={<RequireAuth />}>
          <Route path='/dashboard' element={<Dashboard />}></Route>
          <Route path='/planner' element={<Planner />}></Route>
          <Route path='/plans' element={<BudgetPlans />}></Route>
          <Route path="/plans/:id" element={<PlanDetails />} />
          <Route path="/plans/:id/edit" element={<EditPlan />} />
          <Route path="/hotels" element={<Hotels />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/map" element={<Map />} />
          <Route path="/add-hotel" element={<AddHotel />} />
          <Route path="/create-collection" element={<CreateCollection />} />
          <Route path="/collections" element={<PlanCollections />} />
          <Route path="/collections/:id" element={<CollectionDetails />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
