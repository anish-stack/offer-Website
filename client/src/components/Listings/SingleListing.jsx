import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import AllListings from './AllListings';

const SingleListing = () => {
    const { id } = useParams();
    const [listing, setListing] = useState(null);

    const fetchSingleData = async () => {
        try {
            const response = await axios.get(`http://localhost:7485/api/v1/get-listing/${id}`);
            const data = response.data.data;
            // console.log(data)
            setListing(data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        // window.scrollTo({
        //     top: 0,
        //     behavior: "smooth"
        // })
        fetchSingleData();
    }, [id]);

    if (!listing) {
        return <div>Loading...</div>;
    }

    return (
        <div className='max-w-screen-xl mx-auto px-4 py-5'>
            {/* Breadcrumbs */}
            <nav className="mb-8 text-gray-700" aria-label="Breadcrumb">
                <ol className="list-reset flex">
                    <li>
                        <Link to="/" className="text-blue-600 hover:underline">Home</Link>
                    </li>
                    <li><span className="mx-2">/</span></li>
                    <li>
                        <Link to="/listings" className="text-blue-600 hover:underline">Listings</Link>
                    </li>
                    <li><span className="mx-2">/</span></li>
                    <li className="text-gray-500">{listing.Title}</li>
                </ol>
            </nav>

            <h1 className="text-4xl font-bold mb-8 text-center">{listing.Title}</h1>


            <div className="max-w-screen-xl mx-auto p-4">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
                    <div className="lg:col-span-4">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="grid grid-cols-1 gap-2">
                                <img
                                    src={listing.Pictures[0].ImageUrl}
                                    alt={listing.Title}
                                    className="w-full  object-contain rounded-lg shadow-lg"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {listing.Pictures.slice(1).map((pic, index) => (
                                    <img
                                        key={index}
                                        src={pic.ImageUrl}
                                        alt={listing.Title}
                                        className="w-full object-cover rounded-lg shadow-lg"
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                            <h2 className="text-3xl font-semibold mb-4">Details</h2>
                            <p className="text-gray-700 mb-4">{listing.Details}</p>
                            <h3 className="text-2xl font-semibold mt-6">Address</h3>
                            <p className="text-gray-700">{listing.Address}</p>
                            <p className="text-gray-700">{listing.City}, {listing.State}, {listing.PinCode}</p>
                        </div>
                        

                        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                            <h2 className="text-3xl font-semibold mb-4 text-gray-800">Items</h2>
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                                    <thead className="bg-gray-100">
                                        <tr className="text-left">
                                            <th className="py-3 px-6 border-b border-gray-200 font-semibold text-gray-700">Item</th>
                                            <th className="py-3 px-6 border-b border-gray-200 font-semibold text-gray-700">Discount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {listing.Items.map((item, index) => (
                                            <tr key={index} className="hover:bg-gray-50 transition duration-150">
                                                <td className="py-4 px-6 border-b border-gray-200">{item.itemName}</td>
                                                <td className="py-4 px-6 border-b border-gray-200">{item.Discount}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>


                    </div>

                    {/* Advertisment Grid  */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-4">
                            <div className="w-full max-h-[60vh] lg:h-auto bg-gray-100 p-4 rounded-lg shadow-lg overflow-y-auto">
                                <h3 className="text-xl font-semibold text-gray-800 mb-4">Advertisement</h3>
                                <p className="text-gray-600 mb-4">Place your ad content here. This section occupies a maximum of 60% of the screen height.</p>
                                <button className="bg-blue-500 w-full text-white px-4 py-2 rounded-md hover:bg-blue-600">Contact Us</button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Contact Button */}
            <div className="flex justify-center">
                <button className='text-lg bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white py-3 px-10 rounded-full shadow-md transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400'>
                    Contact Now
                </button>
            </div>
            <AllListings />
        </div>
    );
};

export default SingleListing;
