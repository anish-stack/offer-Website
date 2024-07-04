import React from 'react'
import UserRegister from '../../UserDashboard/UserRegister'
import ShopLogin from '../Auth/ShopLogin';

const FreeListing = () => {
  const B2bToken = localStorage.getItem("B2bToken");
  return (
    <>
      {B2bToken ? (
        <UserRegister/>
      ) : (
        <>
          <div className="w-full flex justify-center mt-4 px-2">
            <div className="w-full sm:w-3/4 md:w-3/5 lg:w-2/5 p-4 bg-red-100 border border-red-400 text-red-700 rounded text-center">
              You are not logged in. Please log in first.
            </div>
          </div>

          <ShopLogin/>
        </>
      )}
    </>
  )
}

export default FreeListing
