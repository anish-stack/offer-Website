import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Card from '../components/Card/Card';
import Sidebar from '../components/header/Header'; // Ensure correct import path
import Login from '../components/Auth/Login';
import AllShop from '../pages/Shop/AllShop';
import UnApprovedPost from '../pages/Post/UnApprovedPost';
import AllPartners from '../pages/Partners/AllPartners';
import ShopsOfPartner from '../pages/Partners/ShopsOfPartner';
import Payments from '../pages/dashboard/Payments';
import AllPackages from '../pages/Packages/AllPackages';
import CreatePackage from '../pages/Packages/CraetePackages';
import DashboardScreen from '../pages/dashboard/DashboardScree';


const Home = () => {
  const token = localStorage.getItem('newDealToken');

  return (
    token ? (
      <div className="w-full flex">
        <div className="w-1/6 border-2">
          <Sidebar />
        </div>
        <div className="w-[83%] p-4">
          <Routes>
          <Route path="/" element={<DashboardScreen />} />

            <Route path="/card" element={<Card />} />
            <Route path="/All-shops" element={<AllShop />} />
            <Route path="/approve-post" element={<UnApprovedPost />} />
            <Route path="/Partners" element={<AllPartners />} />
            <Route path="/partner-details" element={<ShopsOfPartner />} />
            <Route path="/All-Payments-Details" element={<Payments />} />
            <Route path="/All-Packages" element={<AllPackages />} />
            <Route path="/All-Packages" element={<AllPackages />} />
            <Route path="/create-package" element={<CreatePackage />} />








          </Routes>
        </div>
      </div>
    ) : (
      <Login />
    )
  );
};

export default Home;
