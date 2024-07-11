import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const UnApprovedPost = () => {
    const [unApprovedPosts, setUnApprovedPosts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 4; // Display 4 posts per page
    const [modalPost, setModalPost] = useState(null); // State for modal post

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-Listing`);
                const data = res.data.data
                const filter = data.filter((item) => item.isApprovedByAdmin === false)
                setUnApprovedPosts(filter);
            } catch (error) {
                console.error('Error fetching unapproved posts:', error);
            }
        };

        fetchPosts();
    }, []);

    // Pagination logic
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = unApprovedPosts.slice(indexOfFirstPost, indexOfLastPost);

    // Change page
    const paginate = pageNumber => setCurrentPage(pageNumber);

    // Handle approval
    const handleApprove = async (postId) => {
        try {
            await axios.put(`${process.env.REACT_APP_BACKEND_URL}/admin-approve-post/${postId}`);
            toast.success('Post Approved Successful')
            setUnApprovedPosts(unApprovedPosts.filter(post => post._id !== postId));
        } catch (error) {
            console.error('Error approving post:', error);
        }
    };

    // Handle deletion
    const handleDelete = async (postId) => {
        try {
            await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/delete-listing/${postId}`);
            setUnApprovedPosts(unApprovedPosts.filter(post => post._id !== postId));
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };

    // Format date and time
    const formatDateTime = (createdAt) => {
        const date = new Date(createdAt);
        const options = { hour: 'numeric', minute: 'numeric' };
        return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], options);
    };

    // Open modal with post details
    const openModal = (post) => {
        setModalPost(post);
    };

    // Close modal
    const closeModal = () => {
        setModalPost(null);
    };

    return (
        <div className="container mx-auto px-4">
            <h1 className="text-2xl font-bold mb-4">Unapproved Posts</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {currentPosts.map(post => (
                    <div key={post._id} className="border border-gray-300 p-4">
                        <h2 className="text-lg font-bold mb-2">{post.Title}</h2>
                        <p className="text-gray-600 mb-2">{post.Details}</p>
                        <div className="flex flex-wrap mb-2">
                            {/* Display only the first picture */}
                            <img
                                src={post.Pictures.length > 0 ? post.Pictures[0].ImageUrl : ''}
                                alt="Post Image"
                                className="w-24 h-24 object-cover mr-2 mb-2 cursor-pointer"

                            />
                        </div>
                        <ul className="mb-2">
                            {post.Items.map(item => (
                                <li key={item._id}>
                                    <strong>{item.itemName}</strong> - MRP: {item.MrpPrice}, Discount: {item.Discount}%
                                </li>
                            ))}
                        </ul>
                        <p className={`text-sm font-semibold ${post.isApprovedByAdmin ? 'text-green-600' : 'text-red-600'}`}>
                            {post.isApprovedByAdmin ? 'Approved' : 'Not Approved'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            {formatDateTime(post.createdAt)}
                        </p>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                            <button className=" text-sm bg-blue-700 whitespace-nowrap hover:bg-blue-900 text-white px-4 py-1 rounded mr-2" onClick={() => openModal(post)}>
                                See Post
                            </button>
                            <button onClick={() => handleApprove(post._id)} className=" text-sm bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded mr-2">
                                Approve
                            </button>
                            <button onClick={() => handleDelete(post._id)} className=" text-sm bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded">
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-4">
                {Array.from({ length: Math.ceil(unApprovedPosts.length / postsPerPage) }, (_, i) => (
                    <button
                        key={i}
                        onClick={() => paginate(i + 1)}
                        className={`px-3 py-1 mx-1 border ${i + 1 === currentPage ? 'bg-indigo-600 text-white' : 'bg-white text-black'}`}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>

            {/* Modal */}
            {modalPost && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-4 rounded-lg w-11/12 max-w-3xl">
                        <h4 className='text-xl font-bold '>Shop Info</h4>
                        <p className="text-gray-600 mb-2">Shop Name :{modalPost.shopDetails.ShopName}</p>
                        <p className="text-gray-600 mb-2">Shop Package :{modalPost.shopDetails.ListingPlan}</p>

                        <p className="text-gray-600 mb-2">Shop id : <a href="" className='text-blue-500 underline'>{modalPost.shopDetails._id}</a></p>
                        <hr className='border-2' />
                        <h2 className="text-lg font-bold mb-2">{modalPost.Title}</h2>
                        <p className="text-gray-600 mb-2">{modalPost.Details}</p>


                        <p className="text-gray-900 font-bold mb-2">Cover Images</p>
                        <div className="flex flex-wrap mb-2">
                            {modalPost.Pictures.map(pic => (
                                <img key={pic._id} src={pic.ImageUrl} alt="Post Image" className="w-24 h-24 object-cover mr-2 mb-2" />
                            ))}
                        </div>
                        <div>
                            <p className="text-sm truncate text-gray-700 mb-2">
                                {modalPost.shopDetails ? (
                                    <>
                                        {modalPost.shopDetails.ShopAddress.NearByLandMark || "N/A"}
                                        , <address>
                                            {modalPost.shopDetails.ShopAddress.PinCode || "N/A"}
                                            ,{modalPost.shopDetails.ShopAddress.ShopAddressStreet || "N/A"}

                                        </address>
                                    </>
                                ) : (
                                    "N/A"
                                )}
                            </p>
                        </div>

                        <div className="flex flex-wrap mb-2">
                            {modalPost.Items && modalPost.Items.map(item => (
                                <div key={item._id}>
                                    <h3 className="font-semibold">{item.itemName}</h3>
                                    <p>MRP: {item.MrpPrice}, Discount: {item.Discount}%</p>
                                    <p className='text-lg from-orange-500 font-bold text-red-400'>Item Image</p>

                                    <div className="flex flex-wrap">
                                        {item.dishImages.map(pic => (
                                            <img key={pic.public_id} src={pic.ImageUrl} alt="Item Image" className="w-24 h-24 object-cover mr-2 mb-2" />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className={`text-sm font-semibold ${modalPost.isApprovedByAdmin ? 'text-green-600' : 'text-red-600'}`}>
                            {modalPost.isApprovedByAdmin ? 'Approved' : 'Not Approved'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            {formatDateTime(modalPost.createdAt)}
                        </p>
                        <div className="mt-2">
                            <button onClick={() => handleApprove(modalPost._id)} className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded mr-2">
                                Approve
                            </button>
                            <button onClick={() => handleDelete(modalPost._id)} className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded">
                                Delete
                            </button>
                            <button onClick={closeModal} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-1 rounded ml-2">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UnApprovedPost;
