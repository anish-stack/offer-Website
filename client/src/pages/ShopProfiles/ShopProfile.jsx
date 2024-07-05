import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './Shop.css'
const ShopProfile = () => {
    const { id } = useParams();
    const [shopDetails, setShopDetails] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`http://localhost:7485/api/v1/get-Listing`);
                const data = response.data.data;
                console.log(data)
                // Filter data based on ShopId  
                const filteredShop = data.filter(item => item.ShopId === id);
                console.log(`Shop with ID ${id} found. `, filteredShop);
                if (filteredShop) {
                    setShopDetails(filteredShop);
                } else {
                    console.log(`Shop with ID ${id} not found.`);
                }
            } catch (error) {
                console.log(error);
            }
        };

        fetchData();
    }, [id]);

    if (!shopDetails) {
        return <div>Loading...</div>; // Add a loading state if data is being fetched
    }

    return (
        <div className='w-full'>
            <div className='shop-profile'>
                <div className='backgrounds'>
                    <div className='shop-details flex items-center justify-center flex-col h-full text-white relative z-30'>
                        <h2 className='text-lg lg:text-5xl font-extrabold md:text-2xl '>{shopDetails.length > 0 ? shopDetails[0].shopDetails.ShopName : 'N/A'}</h2>
                        <h3 className='text-lg lg:text-3xl font-extrabold md:text-xl '>{shopDetails.length > 0 ? shopDetails[0].shopDetails.ShopCategory : 'N/A'}</h3>
                        <h3 className='text-lg lg:text-2xl font-extrabold md:text-xl '>{shopDetails.length > 0 ? shopDetails[0].shopDetails.Email : 'N/A'}</h3>
                    </div>

                </div>
            </div>

            <div className='max-w-7xl mx-auto '>
                {/* <h2 className="text-3xl text-center font-semibold mb-4 text-gray-800">All Offers</h2> */}
                <div className="grid grid-cols-1  mt-6 sm:grid-cols-2 lg:grid-cols-4 gap-6 rounded-lg  p-6 mb-8">
                    {shopDetails && shopDetails.map((item, index) => (

                        <a href={`/Single-Listing/${item._id}/${item.Title.replace(/\s+/g, '-')}`} key={index} className="bg-white border cursor-pointer rounded overflow-hidden ">
                            <img
                                className="w-full h-48 object-cover object-center"
                                src={item.Pictures[0].ImageUrl}
                                alt={item.Title}
                            />
                            <div className="px-6 py-4">
                                <div className="font-bold text-xl mb-2">{item.Title}</div>
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
                                    <div className='flex  items-center'>
                                        <span className='bg-green-500 text-white py-1  px-1 whitespace-nowrap md:px-2 rounded-full text-sm font-semibold mr-2'>
                                            {item.Items[0].Discount}% Off
                                        </span>
                                        <span className='text-gray-700'>{item.Items[0].itemName}</span>
                                    </div>
                                )}
                                {/* <p className="text-gray-700 text-base">Discount: {product.Discount}%</p> */}
                            </div>
                        </a>

                    ))}
                </div>
            </div>
        </div>
    );
};

export default ShopProfile;
