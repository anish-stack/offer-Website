import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import About from './pages/About/About';
import SingleListing from './components/Listings/SingleListing';
import AllListings from './components/Listings/AllListings';
import FreeListing from './pages/FreeListing/FreeListing';
import Advertise from './pages/Advertise/Advertise';
import Login from './pages/Auth/Login';
import PartnerRegister from './pages/Auth/PartnerRegister';
import { Toaster } from 'react-hot-toast';
import OtpPage from './pages/Auth/OtpPage';
function App() {
  return (
    <BrowserRouter>
    <Header/>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/About' element={<About />} />
        <Route path='/Single-Listing/:id/:name' element={<SingleListing />} />
        <Route path='/listings' element={<AllListings />} />
        <Route path='/Free-Listing' element={<FreeListing />} />
        <Route path='/Advertise-With-us' element={<Advertise />} />
        <Route path='/Partner-Login' element={<Login />} />
        <Route path='/Register-Partner' element={<PartnerRegister />} />
        <Route path='/Otp' element={<OtpPage />} />

        
      </Routes>
      <Footer/>
      <Toaster/>
    </BrowserRouter>
  );
}

export default App;
