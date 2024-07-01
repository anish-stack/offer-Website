import React from 'react'
import construction from './construction-worker.png'
import conversation from './conversation.png'
import sweets from './sweets.png'
import restaurant from './resturant.png'
import courier from './delivery-man.png'
import dentist from './dental-checkup.png'
import event from './event.png'
import gym from './fitness.png'
import hiring from './hiring.png'
import hotel from './hotel.png'
import house from './house.png'
import spa from './massage.png'
import hospital from './medical-team.png'
import pet from './pet-shop.png'
import porter from './porter.png'
import education from './scholarship.png'
import school from './school.png'
import View from './view.png'

const Categorey = () => {
    const categories = [
        { title: 'Construction', image: construction, href: '/construction' },
        { title: 'Conversation', image: conversation, href: '/conversation' },
        { title: 'Sweets', image: sweets, href: '/sweets' },
        { title: 'Restaurant', image: restaurant, href: '/restaurant' },
        { title: 'Courier', image: courier, href: '/courier' },
        { title: 'Dentist', image: dentist, href: '/dentist' },
        { title: 'Event', image: event, href: '/event' },
        { title: 'Gym', image: gym, href: '/gym' },
        { title: 'Hiring', image: hiring, href: '/hiring' },
        { title: 'Hotel', image: hotel, href: '/hotel' },
        { title: 'House', image: house, href: '/house' },
        { title: 'Spa', image: spa, href: '/spa' },
        { title: 'Medical', image: hospital, href: '/medical' },
        { title: 'Pet', image: pet, href: '/pet' },
        { title: 'Porter', image: porter, href: '/porter' },
        { title: 'Education', image: education, href: '/education' },
        { title: 'School', image: school, href: '/school' },
        { title: 'View All', image: View, href: '/View-All' }

    ];

    return (
        <div className="max-w-screen-xl mx-auto px-4 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-4">
                {categories.map((category, index) => (
                    <div key={index} className="flex border-2 w-32 h-32 shadow-sm rounded-[50%] flex-col items-center justify-center space-y-2">
                        <a href={category.href} className="text-center">
                            <img src={category.image} alt={category.title} className="h-14 transition-all ease-in-out hover:scale-[1.05] w-14 object-contain mx-auto" />
                            <p className="text-sm cursor-pointer font-bold mt-2">{category.title}</p>
                        </a>
                    </div>
                ))}
            </div>

        </div>
    )
}

export default Categorey