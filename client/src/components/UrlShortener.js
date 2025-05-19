import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { FaLink, FaArrowRight } from "react-icons/fa";
import { AiOutlineQuestionCircle } from "react-icons/ai";
import loadingImage from '../images/loading.svg';
import { ToastContainer } from 'react-toastify';
import { customToastError, customToastSuccess } from '../assets/toastStyles';
import api from '../api/client';

const UrlShortener = ({ data, mutate }) => {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  // Form and button states
  const [isLoadingBtn, setIsLoadingBtn] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [linkValue, setLinkValue] = useState({ UrlFromUser: '' });
  const [isChecked, setIsChecked] = useState(false);

  // Update screen width when window is resized
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Submit link form handler
  const submitLink = async (e) => {
    e.preventDefault();
    setIsLoadingBtn(true);
    setIsButtonDisabled(true);

    // Returns autopage toggle to normal
    if (isChecked) {
      setIsChecked(true);
    }

    try {
      const submitResponse = await api.post('/api/submiturl', {...linkValue});
      const submitData = submitResponse.data;
      
      // Check if data contains any errors
      if (submitData.errMsg) {
        customToastError(submitData.errMsg);
        setLinkValue({ UrlFromUser: '' });
        mutate();
      } else {
        mutate();
        customToastSuccess(submitData.successMsg);
        setLinkValue({ UrlFromUser: '' });
      }
    } catch (error) {
      customToastError('Something went wrong. Please try again later.');
      console.log(error);
    } finally {
      setIsLoadingBtn(false);
      setIsButtonDisabled(false);
    }
  };

  // Autopaste checkbox handler
  const handleCheckboxChange = async () => {
    setIsChecked((prevIsChecked) => !prevIsChecked);

    if (!isChecked) {
      try {
        const clipboardData = await navigator.clipboard.readText();
        setLinkValue({ UrlFromUser: clipboardData });

        setTimeout(() => {
          setIsChecked((prevIsChecked) => !prevIsChecked);
        }, 2000);
      } catch (error) {
        console.error('Failed to read clipboard data:', error);
      }
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    setLinkValue({...linkValue, [e.target.name]: e.target.value});
  };

  return (
    <div className='relative w-full min-h-[5rem] flex flex-col justify-start items-center space-y-[1rem] py-[7rem]'>
      <h2 className='shortenlinks-gradient capitalize text-center text-[35px] font-extrabold leading-[60px] sm:text-[50px]'>
        Shorten your loooong links :)
      </h2>
      
      <p className='text-greyText text-[16px] leding-[23px] text-center max-w-[500px]'>
        Linkly is an efficient and easy-to-use URL shortening service that streamlines your online experience.
      </p>
      
      {screenWidth < 600 ? (
        <div className='relative max-w-full'>
          <ToastContainer className='relative w-full' />
        </div>
      ) : (
        <div className=''>
          <ToastContainer className=''/>
        </div>
      )}
      
      <form action="" className='w-full flex justify-center items-center' onSubmit={submitLink}>
        <div className='relative w-full h-[76px] flex justify-center items-center pt-[1.5rem] md:w-[759px]'>
          <FaLink className='absolute text-greyText left-0 ml-[1.10rem]'/>
          
          <input 
            onChange={handleInputChange}
            name='UrlFromUser'
            value={linkValue.UrlFromUser}
            className='h-[76px] w-full px-[3rem] text-greyText caret-[#144EE3] bg-[#181E29] border border-[#353C4A] rounded-[48px] focus:outline-none md:w-[759px]'
            placeholder='Enter your link here'
          />
          
          <button 
            type='submit' 
            disabled={isButtonDisabled} 
            className='box-shadowbtn absolute right-0 mr-[10px] flex justify-center items-center w-[45px] h-[45px] font-semibold bg-[#144EE3] border border-[#144EE3] rounded-[48px] sm:w-[178px] sm:h-[60px]'
          >
            {screenWidth > 578 ? (
              <>
                {isLoadingBtn ? <img src={loadingImage} className='w-[50px] h-[50px]' alt='loading' /> : 'Shorten Now!'}
              </>
            ) : (
              <>
                {isLoadingBtn ? <img src={loadingImage} className='w-[50px] h-[50px]' alt='loading' /> : 
                  <FaArrowRight className='text-white font-[650] text-[20px]' />
                }
              </>
            )}
          </button>
        </div>
      </form>

      <div className='relative pt-[1rem] w-full min-h-[1rem] flex justify-center items-center space-x-4'>
        <input
          className="shrink-0 mr-2 mt-[0.3rem] h-[22px] w-[40px] appearance-none rounded-[22px] bg-[#181E29] border border-[#353C4A] before:pointer-events-none before:absolute before:h-3.5 before:w-3.5 before:rounded-full before:bg-transparent before:content-[''] after:absolute after:ml-[0.225rem] after:z-[2] after:mt-[1px] after:h-[18px] after:w-[18px] after:rounded-full after:border-none after:bg-neutral-100 after:shadow-[0_0px_3px_0_rgb(0_0_0_/_7%),_0_2px_2px_0_rgb(0_0_0_/_4%)] after:transition-[background-color_0.2s,transform_0.2s] after:content-[''] checked:bg-primary checked:after:absolute checked:after:z-[2] checked:after:mt-[1px] checked:after:ml-[1.0625rem] checked:after:h-[18px] checked:after:w-[18px] checked:after:rounded-full checked:after:border-none checked:after:bg-primary checked:after:shadow-[0_3px_1px_-2px_rgba(0,0,0,0.2),_0_2px_2px_0_rgba(0,0,0,0.14),_0_1px_5px_0_rgba(0,0,0,0.12)] checked:after:transition-[background-color_0.2s,transform_0.2s] checked:after:content-[''] hover:cursor-pointer focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[3px_-1px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-[18px] focus:after:w-[18px] focus:after:rounded-full focus:after:content-[''] checked:focus:border-primary checked:focus:bg-primary checked:focus:before:ml-[1.0625rem] checked:focus:before:scale-100 checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] dark:bg-[#181E29] dark:after:bg-[#144EE3] dark:checked:bg-primary dark:checked:after:bg-primary"
          type="checkbox"
          role="switch"
          checked={isChecked}
          onChange={handleCheckboxChange}
        />
        <p className='text-greyText text-[14px]'>Auto Paste from Clipboard</p>
      </div>

      <div className='relative flex flex-col justify-center items-center space-y-2 sm:flex-row sm:space-y-0 sm:space-x-1'>
        <p className='text-greyText text-[14px] text-center'>
          You can create <span className='text-[#EB568E]'>{data?.linksRemaining}</span> more links. 
          {screenWidth > 578 ? 'Register Now to enjoy unlimited usage' : ''}
        </p>
        <p className='text-greyText text-[14px] text-center'>
          {screenWidth < 578 ? (
            <>
              <Link to='/signup' className='underline underline-offset-4 text-greyText font-[600]'>
                Register Now
              </Link>{' '}
              to enjoy unlimited usage
            </>
          ) : ''}
        </p>
        {screenWidth > 578 ? <AiOutlineQuestionCircle className='text-[15px] text-greyText shrink-0'/> : ''}
      </div>
    </div>
  );
};

export default UrlShortener;