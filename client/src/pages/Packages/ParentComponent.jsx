import React, { useEffect, useState } from 'react';
import axios from 'axios';
import UpgradePackage from './UpgradePackage';

const ParentComponent = () => {
    const [shopDetails, setShopDetails] = useState(null);
    const token = localStorage.getItem('ShopToken')

    const fetchMyShopDetails = async () => {
        try {
            const response = await axios.get('https://offer-website.onrender.com/api/v1/My-Shop-Details', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = response.data.user;
            console.log(data);
            setShopDetails(data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchMyShopDetails();
    }, []);

    return (
        <div>
            {shopDetails ? (
                <UpgradePackage selectedPlan={shopDetails.ListingPlan} />
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default ParentComponent;
