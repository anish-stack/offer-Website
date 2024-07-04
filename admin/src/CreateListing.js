import React, { useState } from 'react';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';

const CreateListing = () => {
    const [formData, setFormData] = useState({
    
        Title: '',
        Details: '',
        Items: [{ itemName: '', Discount: '' }],
        Pictures: []
    });
    const [imagePreviews, setImagePreviews] = useState([]);

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
                    if (formData.Pictures) {
                        formData.Pictures.forEach(file => {
                            data.append('images', file);
                        });
                    }
                } else {
                    data.append(key, formData[key]);
                }
            });

            const response = await axios.post('http://localhost:7485/api/v1/Create-listing', data);
            toast.success(response.data.message);
            console.log(response.data)
        } catch (error) {
          console.log(error)
        }
    };

    return (
        <div className="container my-5">
            <Toaster />
            <div className="card mx-auto p-4 shadow-lg">
                <h1 className="card-title text-center mb-4">Create Listing</h1>
                <form onSubmit={handleSubmit}>
                    <div className="row">
                        {['Title', 'Details'].map((field, idx) => (
                            <div key={idx} className="col-md-6 mb-3">
                                <label className="form-label">{field} <span className="text-danger">*</span></label>
                                <input
                                    type="text"
                                    name={field}
                                    value={formData[field]}
                                    onChange={handleInputChange}
                                    className="form-control border-dark"
                                    required
                                />
                            </div>
                        ))}
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Items <span className="text-danger">*</span></label>
                        {formData.Items.map((item, index) => (
                            <div key={index} className="row mb-2">
                                <div className="col-md-6">
                                    <input
                                        type="text"
                                        name="itemName"
                                        placeholder="Item Name"
                                        value={item.itemName}
                                        onChange={(e) => handleItemChange(index, e)}
                                        className="form-control border-dark"
                                        required
                                    />
                                </div>
                                <div className="col-md-4">
                                    <input
                                        type="number"
                                        name="Discount"
                                        placeholder="Discount"
                                        value={item.Discount}
                                        onChange={(e) => handleItemChange(index, e)}
                                        className="form-control border-dark"
                                        required
                                    />
                                </div>
                                <div className="col-md-2">
                                    <button type="button" onClick={() => handleRemoveItem(index)} className="btn btn-danger w-100">
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={handleAddItem} className="btn btn-success mt-2">Add Item</button>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Upload Images <span className="text-danger">*</span></label>
                        <input type="file" multiple onChange={handleImageChange} className="form-control border-dark" name='images' required />
                        <div className="row mt-3">
                            {imagePreviews.map((src, index) => (
                                <div key={index} className="col-md-2 mb-2">
                                    <img
                                        src={src}
                                        alt={`Preview ${index}`}
                                        className="img-thumbnail"
                                        style={{ cursor: 'pointer', width: '100%', height: '100px', objectFit: 'cover' }}
                                        onClick={() => handleImageRemove(index)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary w-100">Create Listing</button>
                </form>
            </div>
        </div>
    );
}

export default CreateListing;
