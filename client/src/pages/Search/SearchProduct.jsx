import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SearchProduct = () => {
    // Extract query parameters from URL
    const searchParams = new URLSearchParams(window.location.search);
    const city = searchParams.get('city');
    const pincode = searchParams.get('pincode');
    const WhatYouWant = searchParams.get('WhatYouWant');
    const shopCategory = searchParams.get('ShopCategory');

    // State for search results, loading indicator, and pagination
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [resultsPerPage] = useState(8); // Number of results per page
    const [totalPages, setTotalPages] = useState(0);
    const [filter, setFilter] = useState(''); // Filter by Gold, Silver, Free

    // State for form data
    const [formData] = useState({
        City: city,
        PinCode: pincode,
        WhatYouWant: WhatYouWant,
        ShopCategory: shopCategory
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await axios.post(`http://localhost:7485/api/v1/search`, {
                    formData,
                    filter // Pass filter as part of the request
                });
                const data = response.data.data; // Assuming response is an object with a 'data' property
    
                // Sort data based on HowMuchOfferPost in descending order
                data.sort((a, b) => b.HowMuchOfferPost - a.HowMuchOfferPost);
    
                // Filter out items where HowMuchOfferPost is 0
                const filteredData = data.filter(item => item.HowMuchOfferPost !== 0);
    
                setSearchResults(filteredData);
                setTotalPages(Math.ceil(filteredData.length / resultsPerPage)); // Calculate total pages
            } catch (error) {
                console.error('Error fetching data:', error);
            }
            setLoading(false);
        };
    
        fetchData();
    }, [formData, filter]); // Trigger useEffect when formData or filter changes
    
    // Pagination - Previous page
    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    // Pagination - Next page
    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    // Handle filtering
    const handleFilter = async (selectedFilter) => {
        setFilter(selectedFilter);
        setCurrentPage(1); // Reset to first page when filter changes
    };

    // Calculate current results to display based on pagination
    const indexOfLastResult = currentPage * resultsPerPage;
    const indexOfFirstResult = indexOfLastResult - resultsPerPage;
    const currentResults = searchResults.slice(indexOfFirstResult, indexOfLastResult);

    return (

        <>
            <div className="p-4 max-w-7xl mx-auto mt-9 mb-5 grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {/* Filter buttons */}


                {/* Search results */}
                {loading ? (
                   <div className='w-full min-h-screen flex items-center justify-center loading'><svg viewBox="25 25 50 50">
                   <circle r="20" cy="50" cx="50"></circle>
               </svg></div>
                ) : currentResults.length > 0 ? (
                    <>
                        {currentResults.map((result, index) => (
                            <a
                            href={`/View-More-Offers/Shop-profile/${result._id}/${result?.ShopName.replace(/\s+/g, '-') || "N/A"}`}
                                key={index}
                                className="border rounded-lg overflow-hidden shadow-lg animate__animated animate__fadeIn"
                            >
                                <div className="relative">
                                    {console.log(result)}

                                    <img
                                        src={`https://via.placeholder.com/300x200`} // Placeholder image
                                        alt={`Image for ${result.ShopName}`}
                                        className="w-full h-48 object-cover"
                                    />
                                    <div className="absolute top-0 right-0 p-2 bg-white text-gray-700 rounded-bl-lg">
                                        {result.ListingPlan}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="text-lg font-bold mb-2">{result.ShopName}</h3>
                                    <p className="text-gray-700 mb-2">
                                        {result.ShopAddress.ShopAddressStreet}, {result.ShopAddress.NearByLandMark}
                                    </p>
                                    <p className="text-gray-700 mb-2">PinCode: {result.ShopAddress.PinCode}</p>
                                    <p className="text-gray-700 mb-2">Email: {result.Email}</p>
                                    <p className="text-gray-700 mb-2">Contact Number: {result.ContactNumber}</p>
                                    {/* <p className="text-gray-700 mb-2">
                                        How Much Offer Post: {result.HowMuchOfferPost || '0'}
                                    </p> */}
                                    <div>
                                 
                                        <div>
                                            {result.HowMuchOfferPost === 0 ? (
                                                <p>No offer</p>
                                            ) : (
                                                <p>Offer available: {result.HowMuchOfferPost || 0}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* <div className="mt-4">
                                        {result.HowMuchOfferPost !== undefined && result.HowMuchOfferPost !== 0 ? (
                                            <a
                                                href={`/View-More-Offers/Shop-profile/${result?._id}/${result?.ShopName.replace(/\s+/g, '-') || "N/A"}`}
                                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition duration-300"
                                            >
                                                View Offers
                                            </a>
                                        ) : (
                                            <button
                                                className="bg-gray-300 text-gray-600 font-bold py-2 px-4 rounded-full cursor-not-allowed"
                                                disabled
                                            >
                                                No Offers Available
                                            </button>
                                        )}
                                    </div> */}

                                </div>
                            </a>
                        ))}
                        {/* Pagination controls */}

                    </>
                ) : (
                    <p className="text-center">No data found.</p>
                )}
            </div>
            <div className="flex m-4 items-center justify-center mt-8">
                <button
                    onClick={prevPage}
                    className={`bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-l ${currentPage === 1 ? 'cursor-not-allowed' : ''
                        }`}
                    disabled={currentPage === 1}
                >
                    Previous
                </button>
                <button
                    onClick={nextPage}
                    className={`bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r ${currentPage === totalPages ? 'cursor-not-allowed' : ''
                        }`}
                    disabled={currentPage === totalPages}
                >
                    Next
                </button>
            </div>
        </>

    );
};

export default SearchProduct;
