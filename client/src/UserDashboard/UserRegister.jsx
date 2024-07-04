import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {toast} from 'react-hot-toast'
// Updated list of categories
const SHOP_CATEGORIES = [
    "Art Gallery", "Automotive Showroom", "Bakery", "Barbershop", "Beauty Salon",
    "Big-box Store", "Book Store", "Brand Flagship", "Brand Shop", "Brand Showroom",
    "Bread Shop", "Cafe", "Cake Shop", "Candy Store", "Clothing Store",
    "Co-operative", "Collectables", "Concept Shop", "Concession Stand", "Confectionery",
    "Convenience Store", "Craft Shop", "Cupcake Shop", "Delicatessen", "Department Store",
    "Discount Shop", "Diy Shop", "Dollar Store", "Donut Shop", "Dress Shop",
    "Dry Cleaner", "Duty-free Shop", "Electronics Store", "Fabric / Sewing Supplies", "Farmers Market",
    "Fashion Boutique", "Fast Food Restaurant", "Franchise / Chain Store", "Fruit Market", "Furniture Store",
    "Garden Center", "Gas Station", "General Store", "Gift Shop", "Hobby Shop",
    "Home Decor", "Home Improvement", "Hypermarket", "Imported Goods", "Jeweler",
    "Junk Shop", "Kiosk", "Kitchen Store", "Liquidator", "Luxury Brand Shop",
    "Mattress Store", "Mechanic / Garage", "Megastore", "Music Shop", "Newspaper Stand",
    "Niche Shop", "Outdoor Shop / Outfitter", "Patisserie", "Pharmacy / Drug Store", "Pop-up Shop",
    "Popular Culture (e.g. Anime Shop)", "Reuse Cafe", "Second-hand / Thrift Shop", "Service Center", "Software / Video Games",
    "Souvenir Shop", "Specialty Shop", "Sports Store", "Stationery Shop", "Street Vendors",
    "Supermarket", "Surplus Shop", "Tailor", "Takeout Restaurant", "Tattoo Shop",
    "Ticket Vendors", "Trading Shop", "Travel Agent", "Truck Stop", "Variety Store",
    "Vegetable Market", "Wholesaler", "Drink",
    "Fashion and apparel", "Furniture", "Household essentials", "Media", "Toy", "DIY and Hardware", "Tobacco products", "Automotive", "Fashion accessories",
    "Footwear", "Pet care", "Jewellery", "Beauty and personal Care", "Electronics", "Food", "Personalize the shopping experience", "Baby products"
];

const UserRegister = () => {
    const [formData, setFormData] = useState({
        UserName: "",
        ShopName: "",
        ContactNumber: "",
        Email: "",
        ShopAddress: {
            PinCode: "",
            ShopNo: "",
            ShopAddressStreet: "",
            NearByLandMark: "",
            ShopLongitude: "",
            ShopLatitude: ""
        },
        ShopCategory: "",
        CustomCategory: "",  // New field for custom category
        ListingPlan: "",
        HowMuchOfferPost: "",
        Password: "",
    });

    const [step, setStep] = useState(1);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const currentStep = query.get('step');
        if (currentStep) {
            setStep(parseInt(currentStep));
        }

        const savedData = localStorage.getItem('formData');
        if (savedData) {
            setFormData(JSON.parse(savedData));
        }
    }, [location]);

    useEffect(() => {
        localStorage.setItem('formData', JSON.stringify(formData));
    }, [formData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            ShopAddress: {
                ...prevState.ShopAddress,
                [name]: value
            }
        }));
    };

    const nextStep = () => {
        setStep(prevStep => {
            const newStep = prevStep + 1;
            navigate(`?step=${newStep}`);
            return newStep;
        });
    };

    const prevStep = () => {
        setStep(prevStep => {
            const newStep = prevStep - 1;
            navigate(`?step=${newStep}`);
            return newStep;
        });
    };
    const token = localStorage.getItem('B2bToken')
    const handleSubmit = async (el) => {
        try {
            el.preventDefault()
            const response = await axios.post('http://localhost:7485/api/v1/register-list-user',formData,{
                headers:{
                    Authorization:`Bearer ${token} `
                }
            })
            console.log(response.data)
            toast.success('Shop listed Successful Make Your First Post 🥰🥰')
            localStorage.removeItem('formData');  // Clear form data after successful submission

        } catch (error) {
            toast.error(error.response.data.message)
            console.log('There was an error registering!', error.response);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white shadow-lg rounded-lg p-8 max-w-2xl m-4 w-full">
                <div className="mb-4 text-center">
                    <h1 className="text-2xl font-bold">List Your Shop in a Simple Two Step Process</h1>
                </div>
                <div className="flex justify-center mb-8">
                    <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step === 1 ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>1</div>
                        <div className="w-32 h-1 bg-gray-300"></div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step === 2 ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>2</div>
                    </div>
                </div>
                {step === 1 && (
                    <div>
                        <div className="mb-4">
                            <label className="block text-gray-700">UserName</label>
                            <input
                                type="text"
                                name="UserName"
                                value={formData.UserName}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">ShopName</label>
                            <input
                                type="text"
                                name="ShopName"
                                value={formData.ShopName}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">ContactNumber</label>
                            <input
                                type="text"
                                name="ContactNumber"
                                value={formData.ContactNumber}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Email</label>
                            <input
                                type="email"
                                name="Email"
                                value={formData.Email}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">ShopCategory</label>
                            <select
                                name="ShopCategory"
                                value={formData.ShopCategory}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded"
                            >
                                <option value="">Select a category</option>
                                {SHOP_CATEGORIES.map((category, index) => (
                                    <option key={index} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Or Enter Custom Category</label>
                            <input
                                type="text"
                                name="CustomCategory"
                                value={formData.CustomCategory || ""}
                                onChange={(e) => {
                                    const { value } = e.target;
                                    setFormData(prevState => ({
                                        ...prevState,
                                        ShopCategory: value,
                                        CustomCategory: value
                                    }));
                                }}
                                className="w-full p-2 border border-gray-300 rounded"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Password</label>
                            <input
                                type="password"
                                name="Password"
                                value={formData.Password}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded"
                            />
                        </div>
                        <div className="flex justify-between">
                            <button
                                onClick={nextStep}
                                className="px-4 py-2 bg-blue-500 text-white rounded"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
                {step === 2 && (
                    <div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Pincode</label>
                            <input
                                type="text"
                                name="PinCode"
                                value={formData.ShopAddress.PinCode}
                                onChange={handleAddressChange}
                                className="w-full p-2 border border-gray-300 rounded"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">ShopNo</label>
                            <input
                                type="text"
                                name="ShopNo"
                                value={formData.ShopAddress.ShopNo}
                                onChange={handleAddressChange}
                                className="w-full p-2 border border-gray-300 rounded"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">ShopAddressStreet</label>
                            <input
                                type="text"
                                name="ShopAddressStreet"
                                value={formData.ShopAddress.ShopAddressStreet}
                                onChange={handleAddressChange}
                                className="w-full p-2 border border-gray-300 rounded"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">NearByLandMark</label>
                            <input
                                type="text"
                                name="NearByLandMark"
                                value={formData.ShopAddress.NearByLandMark}
                                onChange={handleAddressChange}
                                className="w-full p-2 border border-gray-300 rounded"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">ShopLongitude</label>
                            <input
                                type="text"
                                name="ShopLongitude"
                                value={formData.ShopAddress.ShopLongitude}
                                onChange={handleAddressChange}
                                className="w-full p-2 border border-gray-300 rounded"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">ShopLatitude</label>
                            <input
                                type="text"
                                name="ShopLatitude"
                                value={formData.ShopAddress.ShopLatitude}
                                onChange={handleAddressChange}
                                className="w-full p-2 border border-gray-300 rounded"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">ListingPlan</label>
                            <input
                                type="text"
                                name="ListingPlan"
                                value={formData.ListingPlan}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded"
                            />
                        </div>
                        <div className="flex justify-between">
                            <button
                                onClick={prevStep}
                                className="px-4 py-2 rounded-3xl bg-blue-500 text-white "
                            >
                                Previous
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="px-4 py-2 rounded-3xl bg-green-500 text-white "
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default UserRegister
