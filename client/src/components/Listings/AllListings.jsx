import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {Link} from 'react-router-dom'
const AllListings = () => {
    const [listings, setListings] = useState([]);
    const [showAll, setShowAll] = useState(false);

    const fetchData = async () => {
        try {
            const response = await axios.get(`http://localhost:7485/api/v1/get-Listing`);
            const data = response.data.data;
            const filter  = data.filter((item)=> item.isApprovedByAdmin === true)
            // console.log(data)
            setListings(filter.reverse());
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    const handleShowMore = () => {
        setShowAll(true);
    }

    const handleShowLess = () => {
        setShowAll(false);
    }

    return (
        <div className='max-w-screen-xl mx-auto px-4 py-5'>
            <h1 className="text-3xl font-bold mb-8 text-center">Explore Listings</h1>
            <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5'>
                {listings.slice(0, showAll ? listings.length : 8).map((item, index) => (
                    <Link to={`/Single-Listing/${item._id}/${item.Title.replace(/\s+/g, '-')}`} className='bg-white cursor-pointer rounded-lg shadow-md p-4' key={index}>
                        <img src={item.Pictures[0].ImageUrl} alt={item.Title} loading='lazy' className='w-full h-20 md:h-48 object-cover mb-4 rounded-lg' />
                        <p className='text-lg font-semibold mb-2'>{item.Title}</p>
                        <p className="text-sm truncate text-gray-700 mb-2">
                            {item.shopDetails ? (
                                <>
                                    {item.shopDetails.ShopAddress.NearByLandMark || "N/A"}
                                    , <address>
                                        {item.shopDetails.ShopAddress.PinCode || "N/A"}
                                        ,{item.shopDetails.ShopAddress.ShopAddressStreet || "N/A"}

                                    </address>
                                </>
                            ) : (
                                "N/A"
                            )}
                        </p>              
                                  {item.Items.length > 0 && (
                            <div className='flex  truncate  items-center'>
                                <span className='bg-green-500 text-white py-1  px-1 whitespace-nowrap md:px-2 rounded-full text-sm font-semibold mr-2'>
                                    {item.Items[0].Discount}% Off
                                </span>
                                <span className='text-gray-700'>{item.Items[0].itemName}</span>
                            </div>
                        )}
                    </Link>
                ))}
            </div>
            {!showAll && listings.length > 8 && (
                <div className='flex justify-center mt-8'>
                    <button
                        onClick={handleShowMore}
                        className='bg-gradient-to-r from-green-600 to-green-600 hover:from-green-700 hover:to-green-700 text-white py-2 px-6 rounded-full shadow-md transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400'
                        style={{ maxWidth: '200px' }}
                    >
                        View More
                    </button>

                </div>
            )}
            {showAll && (
                <div className='flex justify-center mt-8'>
                    <button onClick={handleShowLess}

                        className='bg-gradient-to-r from-red-600 to-red-600 hover:from-red-700 hover:to-red-700 text-white py-2 px-6 rounded-full shadow-md transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400'

                    >
                        Show Less
                    </button>
                </div>
            )}
        </div>
    )
}

export default AllListings;
