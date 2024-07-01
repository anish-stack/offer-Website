import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
    const [activeTab, setActiveTab] = useState('normal');
    const [searchInput, setSearchInput] = useState('');
    const [advancedSearchInput, setAdvancedSearchInput] = useState('');
    const [showMenu, setShowMenu] = useState(false); // State for toggling menu visibility
    const [searchResults, setSearchResults] = useState([]); // State to store search results

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
            // Example: Perform normal search based on searchInput
            console.log("Normal Search query:", searchInput);
            console.log("Selected City:", document.getElementById('city').value);
            setSearchResults([]); // Reset previous results
            // Example: fetch data and update searchResults
        } else if (activeTab === 'advanced') {
            // Example: Perform advanced search based on advancedSearchInput and other criteria
            console.log("Advanced Search query:", advancedSearchInput);
            console.log("Selected City:", document.getElementById('city').value);
            console.log("Selected Category:", document.getElementById('category').value);
            setSearchResults([]); // Reset previous results
            // Example: fetch data and update searchResults
        }
    };


    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    const toggleMenu = () => {
        setShowMenu(!showMenu); // Toggle menu visibility
    };

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
                        <li className='space-x-2'><Link className='text-slate-900 space-x-3 font-bold text-lg' to="/Partner-Login">Login</Link> / <Link className='text-green-400 space-x-3 font-bold text-lg' to="/Register-Partner">Register</Link></li>

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
                <div className='tab-search  grid grid-cols-1 gap-3 lg:grid-cols-2 md:grid-cols-3 max-w-4xl w-full mx-auto p-3'>
                    <div className='mb-4 w-full'>
                        <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='city'>Select City</label>
                        <select id='city' className='block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded leading-tight focus:outline-none focus:shadow-outline'>
                            {cities.map((city, index) => (
                                <option key={index} value={city}>{city}</option>
                            ))}
                        </select>
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
                <div className='tab-search grid grid-cols-1 gap-3 md:grid-cols-3 max-w-4xl mx-auto p-3'>
                    <div className='mb-4 w-full'>
                        <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='city'>Select City</label>
                        <select id='city' className='block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded leading-tight focus:outline-none focus:shadow-outline'>
                            {cities.map((city, index) => (
                                <option key={index} value={city}>{city}</option>
                            ))}
                        </select>
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
                        <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='advanced-search'>Advanced Search Field</label>
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
            {/* Conditionally render menu items based on showMenu state */}
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
