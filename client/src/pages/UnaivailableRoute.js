import React from 'react';
import { Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';


const UnaivailableRoute = () => {

    return (
        <div className='absolute min-h-[100vh] w-full flex flex-col justify-center items-center space-y-4 overflow-hidden p-2 bg-mainbackground'>
            
                {/* toast messages */}
                <div className=''>
                    <ToastContainer className=''/>
                </div>
           
                <h3 className='text-[28px] font-[550] text-white text-center'>Nothing to see here :)</h3>

                <Link to = '/' className = ' text-white flex justify-center items-center space-x-2 w-[123px] h-[50px] bg-[#181E29] border border-[#353C4A] rounded-[48px]'>Homepage</Link>
                <Link to = '/user/dashboard' className = 'box-shadowbtn text-white flex justify-center items-center space-x-2 w-[163px] h-[50px] bg-[#144EE3] border border-[#144EE3] rounded-[48px]' >Dashboard</Link>

        </div>
    );
};

export default UnaivailableRoute;
