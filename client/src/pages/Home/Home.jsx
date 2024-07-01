import React from 'react'
import Categorey from '../../components/Category/Categorey'
import MCategorey from '../../components/Category/Mobile'
import AllListings from '../../components/Listings/AllListings'

const Home = () => {
  return (
    <div>
     <div className='hidden lg:block'>
     <Categorey/>
     </div>
      <div className=' block lg:hidden'>
        <MCategorey/>
      </div>
      <AllListings/>
    </div>
  )
}

export default Home
