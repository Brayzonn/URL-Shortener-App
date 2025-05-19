import React from 'react';
import { Link } from "react-router-dom";
import { FiLogIn } from "react-icons/fi";

const Navbar = () => {
  return (
    <nav className='relative w-full min-h-[60px] flex justify-between items-start'>
      <Link to="/" className='logo-text-gradient text-[33.91px] font-extrabold'>Linkly</Link>

      <div className='flex justify-end items-center space-x-4'>
        <Link to="/signin" className='flex justify-center items-center space-x-2 w-[123px] h-[50px] bg-[#181E29] border border-[#353C4A] rounded-[48px]'>
          <p className='text-[16px] font-semibold leading-[18px]'>Login</p>
          <FiLogIn className='text-[#C9CED6] text-[18px]'/>
        </Link>

        <Link to="/signup" className='box-shadowbtn hidden justify-center items-center space-x-2 w-[163px] h-[50px] bg-[#144EE3] border border-[#144EE3] rounded-[48px] sm:flex'>
          <p className='text-[16px] font-semibold leading-[18px]'>Register Now</p>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;