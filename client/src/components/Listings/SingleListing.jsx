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
            setListing(data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="grid grid-cols-1 gap-2">
                    <img src={listing.Pictures[0].ImageUrl} alt={listing.Title} className='w-full h-80 object-contain rounded-lg shadow-lg' />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {listing.Pictures.slice(1).map((pic, index) => (
                        <img key={index} src={pic.ImageUrl} alt={listing.Title} className='w-full h-40 object-contain rounded-lg shadow-lg' />
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
                <h2 className="text-3xl font-semibold mb-4">Items</h2>
                <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <thead className="bg-gray-100 text-start">
                        <tr className='text-start'>
                            <th className="py-2 text-start px-4 border-b">Item</th>
                            <th className="py-2 text-start px-4 border-b">Discount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {listing.Items.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition duration-150">
                                <td className="py-2 px-4 border-b">{item.itemName}</td>
                                <td className="py-2 px-4 border-b">{item.Discount}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-center">
                <button className='bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white py-2 px-6 rounded-full shadow-md transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400'>
                    Contact
                </button>
            </div>
            <AllListings/>
        </div>
    );
};

export default SingleListing;
