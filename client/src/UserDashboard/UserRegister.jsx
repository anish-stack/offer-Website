import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

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
        ListingPlan: 'Free', // Default to Free plan
        price: 0,
        ShopCategory: "",
        CustomCategory: "",  // New field for custom category
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

        if (name === 'ListingPlan') {
            updatePrice(value);
        }
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

    const updatePrice = (plan) => {
        switch (plan) {
            case 'Free':
                price = 0;
                break;
            case 'Silver':
                price = 499;
                break;
            case 'Gold':
                price = 799;
                break;
            default:
                price = 0;
                break;
        }
        setFormData(prevState => ({
            ...prevState,
            ListingPlan: plan,
            price: price
        }));
    };

    const token = localStorage.getItem('B2bToken');
    

    const handleSubmit = async () => {
        try {
            const response = await axios.post('http://localhost:7485/api/v1/register-list-user', formData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
    
            console.log(response.data);
    
            // Check if the ListingPlan requires payment
            if (formData.ListingPlan === 'Free') {
                // Handle free plan registration
                toast.success('Shop listed successfully.');
                localStorage.removeItem('formData');  // Clear form data after successful submission
            } else {
                // Handle payment process for Silver or Gold plan
                const order = response.data.order;
    
                const options = {
                    key: "rzp_test_gwvXwuaK4gKsY3",
                    amount: order?.amount || null,
                    currency: "INR",
                    name: "Nai Deal",
                    description: `Payment For Plans Name ${formData.ListingPlan}`,
                    image: "https://i.pinimg.com/originals/9e/ff/85/9eff85f9a3f9540bff61bbeffa0f6305.jpg",
                    order_id: order?.id,
                    callback_url: "http://localhost:7485/api/v1/paymentverification",
                    prefill: {
                        name: formData.UserName,
                        email: formData.Email,
                        contact: formData.ContactNumber
                    },
                    notes: {
                        "address": "Razorpay Corporate Office"
                    },
                    theme: {
                        "color": "#121212"
                    }
                };
    
                const razorpay = new window.Razorpay(options);
                razorpay.on('payment.failed', function (response) {
                    toast.error('Payment failed. Please try again.');
                });
                razorpay.open();
            }
    
            toast.success('Shop listed successfully. Make your first post!');
            localStorage.removeItem('formData');  // Clear form data after successful submission
        } catch (error) {
            toast.error('There was an error registering: ' + error.response?.data?.message || 'Unknown error');
            console.error('There was an error registering:', error);
        }
    };
    


    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white shadow-lg rounded-lg p-8 max-w-2xl m-4 w-full">
                <div className="mb-4 text-center">
                    <h1 className="text-2xl font-bold">List Your Shop in a Simple Two-Step Process</h1>
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
                            <label className="block text-gray-700">Username</label>
                            <input
                                type="text"
                                name="UserName"
                                value={formData.UserName}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Shop Name</label>
                            <input
                                type="text"
                                name="ShopName"
                                value={formData.ShopName}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Contact Number</label>
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
                            <label className="block text-gray-700">Shop Category</label>
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
                                value={formData.CustomCategory}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">How Much Offers Post Per Year</label>
                            <input
                                type="text"
                                name="HowMuchOfferPost"
                                value={formData.HowMuchOfferPost}
                                onChange={handleInputChange}
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
                                className="bg-blue-500 text-white px-4 py-2 rounded"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
                {step === 2 && (
                    <div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Shop Address</label>
                            <input
                                type="text"
                                name="ShopNo"
                                value={formData.ShopAddress.ShopNo}
                                onChange={handleAddressChange}
                                className="w-full p-2 border border-gray-300 rounded mb-2"
                                placeholder="Shop Number"
                            />
                            <input
                                type="text"
                                name="ShopAddressStreet"
                                value={formData.ShopAddress.ShopAddressStreet}
                                onChange={handleAddressChange}
                                className="w-full p-2 border border-gray-300 rounded mb-2"
                                placeholder="Shop Address Street"
                            />
                            <input
                                type="text"
                                name="NearByLandMark"
                                value={formData.ShopAddress.NearByLandMark}
                                onChange={handleAddressChange}
                                className="w-full p-2 border border-gray-300 rounded mb-2"
                                placeholder="Near By LandMark"
                            />
                            <input
                                type="text"
                                name="PinCode"
                                value={formData.ShopAddress.PinCode}
                                onChange={handleAddressChange}
                                className="w-full p-2 border border-gray-300 rounded"
                                placeholder="Pin Code"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Choose Your Plan</label>
                            <select
                                name="ListingPlan"
                                value={formData.ListingPlan}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded"
                            >

                                <option value="Free">Free</option>
                                <option value="Silver">Silver - ₹499/year</option>
                                <option value="Gold">Gold - ₹799/year</option>
                            </select>
                            <div className="mt-2 text-red-700">
                                Selected Plan: {formData.ListingPlan} - {formData.price > 0 ? `₹${formData.price}/year` : 'Free'}
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Price</label>
                            <input
                                type="text"
                                name="price"
                                value={formData.price}
                                className="w-full p-2 border border-gray-300 rounded"

                            />
                        </div>
                        <div className="flex justify-between">
                            <button
                                onClick={prevStep}
                                className="bg-gray-400 text-white px-4 py-2 rounded"
                            >
                                Previous
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="bg-blue-500 text-white px-4 py-2 rounded"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserRegister;
