import React from 'react'

const Portfolio = () => {
  return (
    <div className='bg-black h-screen flex-col'>
        <div className="bg-gradient-to-l from-red-900 to-blue-900 h-16">
            <div className="flex justify-between">
                
                <p className='text-white font-bold text-xl p-4'>Digitech Enterprises</p>

                <div className='flex hover:text-black'>
                <p className='text-white font-bold text p-4 '>Home</p>
                <p className='text-white font-bold text p-4'>About Us</p>
                <p className='text-white font-bold text p-4'>Contact Us</p>
                </div>

            </div>
        </div>

        <div className='text-white'>
            
        </div>

    </div>
  )
}

export default Portfolio