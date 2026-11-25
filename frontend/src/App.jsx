import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AuctioneerDashboard from "./pages/AuctioneerDashboard";
import BidderDashboard from "./pages/BidderDashboard";
import NotFound from "./pages/NotFound";
import AuctionRoom from "./pages/AuctionRoom";
import RequireAuth from "./components/RequireAuth";

function App() {

  return (

    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auctioneer-dashboard"
          element={
            <ProtectedRoute allowedRole="AUCTIONEER">
              <AuctioneerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/bidder-dashboard"
          element={
            <ProtectedRoute allowedRole="BIDDER">
              <BidderDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
        <Route element={<RequireAuth />}>
        <Route
        path="/auction/:auctionId"
        element={<AuctionRoom />}/>
        
        </Route>

      </Routes>
    </>

  );
}

export default App;