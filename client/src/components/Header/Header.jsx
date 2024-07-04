import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Header = ({ locationDetails }) => {
    const [activeTab, setActiveTab] = useState('normal');
    const [searchInput, setSearchInput] = useState('');
    const [advancedSearchInput, setAdvancedSearchInput] = useState('');
    const [pincodeInput, setPincodeInput] = useState('');
    const [showMenu, setShowMenu] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const ShopToken = localStorage.getItem('ShopToken')
    const PartnerToken = localStorage.getItem('B2bToken')
    const cities = [
        'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur',
        'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna',
        'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivli'
    ];

    const categories = [
        'Hotels', 'Flights', 'Food', 'Transportation', 'Entertainment', 'Shopping',
        'Healthcare', 'Education', 'Finance', 'Technology', 'Utilities', 'Events', 'Other'
    ];

    const handleSearch = () => {
        // Perform search logic based on activeTab
        if (activeTab === 'normal') {
            console.log("Normal Search query:", searchInput);
            console.log("Selected City:", document.getElementById('city').value);
            console.log("Pincode:", pincodeInput);
            setSearchResults([]);
        } else if (activeTab === 'advanced') {
            console.log("Advanced Search query:", advancedSearchInput);
            console.log("Selected City:", document.getElementById('city').value);
            console.log("Selected Category:", document.getElementById('category').value);
            console.log("Pincode:", pincodeInput);
            setSearchResults([]);
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    const toggleMenu = () => {
        setShowMenu(!showMenu);
    };

    useEffect(() => {
        if (locationDetails) {
            console.log("Location details received in Header:", locationDetails);
            if (locationDetails.pincode) {
                setPincodeInput(locationDetails.pincode);
            }
        }
    }, [locationDetails]);

    return (
        <div className='w-full shadow-md'>
            <div className='max-w-[1400px] flex items-center justify-between mx-auto px-3 py-3'>
                <div className="logo p-2">
                    <Link to={'/'} className='text-xl font-extrabold text-slate-900 md:text-2xl'>
                        Nai <span className='text-green-400'>Deal</span>
                    </Link>
                </div>
                <nav className="flex items-center gap-3">
                    <ul className='hidden md:flex items-center justify-center gap-3'>
                        <li><Link className='text-slate-900 font-bold text-lg' to={'/Advertise-With-us'}>Advertise</Link></li>
                        <li><Link className='text-slate-900 font-bold text-lg' to={'/Free-Listing'}>Free Listing</Link></li>
                        <li><a className='text-green-400 font-bold text-lg' href="tel:7217619794">98XXXXXXXX</a></li>
                        {ShopToken ? (
                            <li className='space-x-2'><a className='text-slate-900 font-bold text-lg' href="/Shop-Dashboard">Shop Dashboard</a></li>
                        ) : null}
                        {PartnerToken ? (
                            <li className='space-x-2'><a className='text-slate-900 font-bold text-lg' href="/Partner-Dashboard">Partner Dashboard</a></li>
                        ) : null}
                        {
                            ShopToken || PartnerToken ? (null) : (
                                <li><Link className='text-slate-900 space-x-3 font-bold text-lg' to="/Partner-Login">Partner Login</Link> / <Link className='text-green-400 space-x-3 font-bold text-lg' to="/Shop-login">Shop Login</Link></li>

                            )
                        }
                    </ul>
                    <div className="flex items-center md:hidden">
                        <button className="text-gray-700 focus:outline-none" onClick={toggleMenu}>
                            {showMenu ? (
                                <i className="fas fa-times fa-lg"></i>
                            ) : (
                                <i className="fas fa-bars fa-lg"></i>
                            )}
                        </button>
                    </div>
                </nav>
            </div>
            <hr className='border-[0.5px] border-black max-w-[1400px] mx-auto bg-black' />
            <div className='tabs max-w-4xl mx-auto flex items-center justify-between p-3'>
                <div>
                    <button
                        className={`bg-blue-500 text-white py-2 px-4 rounded-full shadow hover:bg-blue-600 transition-all duration-300 ${activeTab === 'normal' ? 'ring-2 ring-blue-300' : ''}`}
                        onClick={() => setActiveTab('normal')}
                    >
                        Search <i className="fas fa-search ml-3 fa-lg"></i>
                    </button>
                </div>
                <div>
                    <button
                        className={`bg-green-500 text-white py-2 px-4 rounded-full shadow hover:bg-green-600 transition-all duration-300 ${activeTab === 'advanced' ? 'ring-2 ring-green-300' : ''}`}
                        onClick={() => setActiveTab('advanced')}
                    >
                        Advanced Search <i className="fa-brands fa-lg ml-3 fa-searchengin"></i>
                    </button>
                </div>
            </div>
            {activeTab === 'normal' && (
                <div className='tab-search grid grid-cols-1 gap-3 lg:grid-cols-3 md:grid-cols-3 max-w-5xl w-full mx-auto p-3'>
                    <div className='mb-4 w-full'>
                        <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='city'>Select City</label>
                        <select id='city' className='block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded leading-tight focus:outline-none focus:shadow-outline'>
                            {locationDetails && locationDetails.city ? (
                                <option value={locationDetails.city}>{locationDetails.city}</option>
                            ) : (
                                cities.map((city, index) => (
                                    <option key={index} value={city}>{city}</option>
                                ))
                            )}
                        </select>
                    </div>
                    <div className='mb-4 w-full'>
                        <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='pincode'>Pincode</label>
                        <input
                            id='pincode'
                            type='text'
                            value={locationDetails && locationDetails.PinCode ? locationDetails.PinCode : ''}
                            onChange={(e) => setPincodeInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                        />
                    </div>
                    <div className='mb-4 w-full'>
                        <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='search'>Type What You Want</label>
                        <input
                            id='search'
                            type='text'
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                        />
                    </div>


                    <div className='w-full block md:hidden '>
                        <button
                            className='bg-blue-500 text-white py-2 px-4 rounded-full shadow hover:bg-blue-600 transition-all duration-300'
                            onClick={handleSearch}
                        >
                            Search
                        </button>
                    </div>
                </div>
            )}
            {activeTab === 'advanced' && (
                <div className='tab-search grid grid-cols-1 gap-3 md:grid-cols-4 max-w-5xl mx-auto p-3'>
                    <div className='mb-4 w-full'>
                        <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='city'>Select City</label>
                        <select id='city' className='block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded leading-tight focus:outline-none focus:shadow-outline'>
                            {locationDetails && locationDetails.city ? (
                                <option value={locationDetails.city}>{locationDetails.city}</option>
                            ) : (
                                cities.map((city, index) => (
                                    <option key={index} value={city}>{city}</option>
                                ))
                            )}
                        </select>
                    </div>

                    <div className='mb-4 w-full'>
                        <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='pincode'>Pincode</label>
                        <input
                            id='pincode'
                            type='text'
                            value={locationDetails && locationDetails.PinCode ? locationDetails.PinCode : ''}
                            onChange={(e) => setPincodeInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                        />
                    </div>
                    <div className='mb-4 w-full'>
                        <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='category'>Select Categories</label>
                        <select id='category' className='block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded leading-tight focus:outline-none focus:shadow-outline'>
                            {categories.map((category, index) => (
                                <option key={index} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>
                    <div className='mb-4 w-full'>
                        <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='advanced-search'> Type What You Want
                        </label>
                        <input
                            id='advanced-search'
                            type='text'
                            value={advancedSearchInput}
                            onChange={(e) => setAdvancedSearchInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                        />
                    </div>



                    <div className='w-full block md:hidden'>
                        <button
                            className='bg-green-500 text-white py-2 px-4 rounded-full shadow hover:bg-green-600 transition-all duration-300'
                            onClick={handleSearch}
                        >
                            Search
                        </button>
                    </div>
                </div>
            )}
            {showMenu && (
                <ul className={`md:hidden absolute menu flex flex-col items-center gap-3 ${showMenu ? 'show' : ''} `}>
                    <li><Link className='text-slate-900 font-bold text-lg' to={'/Advertise-With-us'}>Advertise</Link></li>
                    <li><Link className='text-slate-900 font-bold text-lg' to={'/Free-Listing'}>Free Listing</Link></li>
                    <li><a className='text-green-400 font-bold text-lg' href="tel:7217619794">98XXXXXXXX</a></li>
                </ul>
            )}
        </div>
    );
};

export default Header;
