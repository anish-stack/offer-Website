import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const EditPost = () => {
    const query = new URLSearchParams(window.location.search);
    const id = query.get('id');
    const token = localStorage.getItem('ShopToken');
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        Title: '',
        Details: '',
        Items: []
    });
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [imagePreviews, setImagePreviews] = useState([]); // State for image previews

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await axios.get(`https://offer-website.onrender.com/api/v1/My-Shop-Post`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const post = response.data.data.find(p => p._id === id);
                if (post) {
                    setFormData({
                        Title: post.Title,
                        Details: post.Details,
                        Items: post.Items,
                    });
                    setImages(post.Pictures);
                    setLoading(false);
                } else {
                    setError('Post not found');
                    setLoading(false);
                }
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchPost();
    }, [id, token]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        const updatedItems = formData.Items.map((item, i) =>
            i === index ? { ...item, [name]: value } : item
        );
        setFormData({ ...formData, Items: updatedItems });
    };

    const handleImageChange = (index, e) => {
        const updatedImages = [...images];
        updatedImages[index] = {
            ...updatedImages[index],
            file: e.target.files[0]
        };
        setImages(updatedImages);

        // Update image preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreviews(prev => [...prev, reader.result]);
        };
        reader.readAsDataURL(e.target.files[0]);
    };

    const handleDishImageChange = (itemIndex, dishIndex, e) => {
        const updatedItems = [...formData.Items];
        updatedItems[itemIndex].dishImages[dishIndex] = {
            ...updatedItems[itemIndex].dishImages[dishIndex],
            file: e.target.files[0]
        };
        setFormData({ ...formData, Items: updatedItems });

        // Update image preview
        const reader = new FileReader();
        reader.onloadend = () => {
            const updatedPreviews = [...imagePreviews];
            updatedPreviews[itemIndex * 10 + dishIndex] = reader.result;
            setImagePreviews(updatedPreviews);
        };
        reader.readAsDataURL(e.target.files[0]);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const formDataToSubmit = new FormData();
        formDataToSubmit.append('Title', formData.Title);
        formDataToSubmit.append('Details', formData.Details);
        formData.Items.forEach((item, index) => {
            formDataToSubmit.append(`Items[${index}].itemName`, item.itemName);
            formDataToSubmit.append(`Items[${index}].Discount`, item.Discount);
            formDataToSubmit.append(`Items[${index}].MrpPrice`, item.MrpPrice);

            formDataToSubmit.append(`Items[${index}].public_id`, item.public_id);
            item.dishImages.forEach((dishImage, dishIndex) => {
                if (dishImage.file) {
                    formDataToSubmit.append(`dishImages`, dishImage.file);
                }
            });
        });

        images.forEach((image, index) => {
            if (image.file) {
                formDataToSubmit.append(`images`, image.file);
            }
        });

        try {
            const response = await axios.put(`https://offer-website.onrender.com/api/v1/My-Shop-Edit-post/${id}`, formDataToSubmit, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log(response.data);
            navigate(`/Shop-Dashboard`);
        } catch (err) {
            setError(err.message);
            console.log(err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Edit Post</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
                {/* Title input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                        type="text"
                        name="Title"
                        value={formData.Title}
                        onChange={handleInputChange}
                        className="mt-1 border px-2 py-2 border-black block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                    />
                </div>

                {/* Details textarea */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Details</label>
                    <textarea
                        name="Details"
                        value={formData.Details}
                        onChange={handleInputChange}
                        rows={4}
                        className="mt-1 border px-2 py-2 border-black block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                    />
                </div>

                {/* Items mapping */}
                {formData.Items.map((item, itemIndex) => (
                    <div key={itemIndex}>
                        <h3 className="text-lg font-bold mb-2">Item {itemIndex + 1}</h3>
                        {/* Item Name input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Item Name</label>
                            <input
                                type="text"
                                name="itemName"
                                value={item.itemName}
                                onChange={(e) => handleItemChange(itemIndex, e)}
                                className="mt-1 border px-2 py-2 border-black block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                            />
                        </div>

                        {/* Discount input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Discount</label>
                            <input
                                type="text"
                                name="Discount"
                                value={item.Discount}
                                onChange={(e) => handleItemChange(itemIndex, e)}
                                className="mt-1 border px-2 py-2 border-black block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                            />
                        </div>

                        <label className="block text-sm font-medium text-gray-700">Mrp Price</label>

                        <input
                            type="text"
                            name="MrpPrice"
                            placeholder="MrpPrice"
                            value={item.MrpPrice}
                            onChange={(e) => handleItemChange(itemIndex, e)}
                            className="mt-1 border px-2 py-2 border-black block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required
                        />
                        {/* Dish Images mapping */}
                        {item.dishImages.map((dishImage, dishIndex) => (
                            <div key={dishIndex} className="mt-4">
                                <label className="block text-sm font-medium text-gray-700">Dish Image {dishIndex + 1}</label>
                                <div className="flex items-center mt-1 space-x-4">
                                    {/* Old image */}
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Display existing images */}
                                        {dishImage.ImageUrl && (
                                            <div className="flex items-center border p-2 rounded-md">
                                                <div className="relative">
                                                    <img
                                                        src={dishImage.ImageUrl}
                                                        alt={`Dish ${dishIndex + 1}`}
                                                        className="w-32 h-32 object-contain object-center rounded"
                                                    />
                                                    <span className="absolute bottom-0 right-0 bg-gray-700 text-white text-xs px-1 py-0.5 rounded">
                                                        Old
                                                    </span>
                                                </div>
                                                {/* <p className="text-xs ml-2">{dishImage.public_id}</p> */}
                                            </div>
                                        )}

                                        {/* Display new image previews */}
                                        {imagePreviews[itemIndex * 10 + dishIndex] && (
                                            <div className="border p-2 rounded-md">
                                                <div className="relative">
                                                    <img
                                                        src={imagePreviews[itemIndex * 10 + dishIndex]}
                                                        alt={`Dish ${dishIndex + 1}`}
                                                        className="w-32 h-32  object-contain object-center rounded"
                                                    />
                                                    <span className="absolute bottom-0 right-0 bg-indigo-600 text-white text-xs px-1 py-0.5 rounded">
                                                        New
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>


                                    {/* Image upload */}
                                    <input
                                        type="file"
                                        name={`dishImage${itemIndex}_${dishIndex}`}
                                        onChange={(e) => handleDishImageChange(itemIndex, dishIndex, e)}
                                        className="ml-2 mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                ))}

                {/* Update button */}
                <div className="mt-4">
                    <button
                        type="submit"
                        className={`w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={submitting}
                    >
                        {submitting ? 'Updating...' : 'Update Post'}
                    </button>
                </div>
            </form>

            {/* Loader component */}
            {submitting && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
                    <div className="loader"></div> {/* Replace with your loader component or style */}
                </div>
            )}
        </div>
    );
};

export default EditPost;
