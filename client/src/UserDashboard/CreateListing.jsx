import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';

const CreateListing = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        Title: '',
        Details: '',
        Items: [{ itemName: '', Discount: '' }],
        Pictures: []
    });
    const [imagePreviews, setImagePreviews] = useState([]);
    const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

    useEffect(() => {
        const isFormIncomplete = !formData.Title || !formData.Details || formData.Items.some(item => !item.itemName || !item.Discount);
        const isImageLimitExceeded = formData.Pictures.length > 5;
        setIsSubmitDisabled(isFormIncomplete || isImageLimitExceeded);
    }, [formData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        const items = [...formData.Items];
        items[index][name] = value;
        setFormData({ ...formData, Items: items });
    };

    const handleAddItem = () => {
        setFormData({ ...formData, Items: [...formData.Items, { itemName: '', Discount: '' }] });
    };

    const handleRemoveItem = (index) => {
        const items = [...formData.Items];
        items.splice(index, 1);
        setFormData({ ...formData, Items: items });
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (formData.Pictures.length + files.length > 5) {
            toast.error('You can only upload a maximum of 5 images.');
            return;
        }
        setFormData({ ...formData, Pictures: [...formData.Pictures, ...files] });

        const previews = files.map(file => URL.createObjectURL(file));
        setImagePreviews([...imagePreviews, ...previews]);
    };

    const handleImageRemove = (index) => {
        const updatedPictures = [...formData.Pictures];
        updatedPictures.splice(index, 1);

        const updatedPreviews = [...imagePreviews];
        updatedPreviews.splice(index, 1);

        setFormData({ ...formData, Pictures: updatedPictures });
        setImagePreviews(updatedPreviews);
    };
    const token = localStorage.getItem('ShopToken')

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'Items') {
                    formData.Items.forEach((item, index) => {
                        data.append(`Items[${index}].itemName`, item.itemName);
                        data.append(`Items[${index}].Discount`, item.Discount);
                    });
                } else if (key === 'Pictures') {
                    formData.Pictures.forEach(file => {
                        data.append('images', file);
                    });
                } else {
                    data.append(key, formData[key]);
                }
            });

            const response = await axios.post('http://localhost:7485/api/v1/Create-Post', data,{
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            toast.success(response.data.message);
            onClose();
        } catch (error) {
            console.log(error);
            toast.error('Error creating listing');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
        <Toaster />
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl overflow-y-auto max-h-screen">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-semibold">Create Listing</h1>
            <button onClick={onClose} className="text-red-500 hover:text-red-700">Close</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 mb-1">
              {['Title', 'Details'].map((field, idx) => (
                <div key={idx} className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">{field} <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name={field}
                    value={formData[field]}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              ))}
            </div>
            <div className="mb-1">
              <label className="block text-gray-700 font-medium mb-2">Items <span className="text-red-500">*</span></label>
              {formData.Items.map((item, index) => (
                <div key={index} className="flex items-center mb-4 space-x-4">
                  <input
                    type="text"
                    name="itemName"
                    placeholder="Item Name"
                    value={item.itemName}
                    onChange={(e) => handleItemChange(index, e)}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="number"
                    name="Discount"
                    placeholder="Discount"
                    value={item.Discount}
                    onChange={(e) => handleItemChange(index, e)}
                    className="w-1/3 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <button type="button" onClick={() => handleRemoveItem(index)} className="text-red-500 hover:text-red-700">
                  <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              ))}
              <button type="button" onClick={handleAddItem} className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">Add Item</button>
            </div>
            <div className="mb-1">
              <label className="block text-gray-700 font-medium mb-2">Upload Images <span className="text-red-500">*</span></label>
              <input
                type="file"
                multiple
                onChange={handleImageChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <div className="grid grid-cols-4 gap-2 mt-4">
                {imagePreviews.map((src, index) => (
                  <div key={index} className="relative">
                    <img
                      src={src}
                      alt={`Preview ${index}`}
                      className="w-full h-24 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      className="absolute top-0 right-0 w-[1.4rem] h-[1.4rem] flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-red-700"
                      onClick={() => handleImageRemove(index)}
                    >
                     <i className="fa-solid text-sm fa-minus"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>
            {formData.Pictures.length > 5 && (
              <div className="text-red-500 text-sm mb-4">You can only upload a maximum of 5 images.</div>
            )}
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className={`w-full py-2 text-white rounded-md transition-all duration-300 ease-in-out ${
                isSubmitDisabled
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              }`}
            >
              Post It
            </button>
          </form>
        </div>
      </div>
      
    );
};

export default CreateListing;
