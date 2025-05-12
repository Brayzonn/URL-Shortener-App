import axios from 'axios';
import useSWR from 'swr';
import React, { useState, useEffect } from 'react';
import {Link} from "react-router-dom";
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { FiLogIn } from "react-icons/fi"; 
import { FaLink, FaCopy} from "react-icons/fa"; 
import { FaArrowRight } from "react-icons/fa"; 
import { BsChevronDown } from "react-icons/bs"; 
import { BsChevronUp } from "react-icons/bs";
import { AiOutlineQuestionCircle } from "react-icons/ai";
import loadingImage from '../images/loading.svg';
import { ToastContainer } from 'react-toastify';
import { customToastError, customToastSuccess } from '../assets/toastStyles';   
import { FcCheckmark } from "react-icons/fc";

const Landing = () => {
  const baseURL = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL : "http://localhost:3300";

  //SWR LOGIC
  const fetcher = (url) => axios.get(url).then(res => res.data)
  const { data, error, mutate } = useSWR(`${baseURL}/api/getfreeurl`, fetcher)
  const isLoading = !data && !error;
  
  //date formatter function -----
  const formatDate = (dateString) => {
      const options = { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' };
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, options);
  };

  //screen width-----------------------------------------------------
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  // Update screen width when the window is resized
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    // Add event listener for window resize
    window.addEventListener('resize', handleResize);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // link submission---
  const [isLoadingBtn, updateisLoadingBtn] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const [linkValue, updateLinkValue] = useState({
      UrlFromUser: ''
  });

  const submitLink = async(e) =>{
      e.preventDefault();
      updateisLoadingBtn(true)
      setIsButtonDisabled(true)

      //returns autopage toggle to normal
      if(isChecked){
        setIsChecked(true); 
      }
  
      try {
          //send form data to backend
          const submitResponse =  await axios.post(`${baseURL}/api/submiturl`, {...linkValue})
          const submitData = submitResponse.data;
          
          // checks if data contains any errors
          if(submitData.errMsg){
              customToastError(submitData.errMsg);
              updateLinkValue({ UrlFromUser: '' })  
              mutate()         
          }else{
              mutate()
              customToastSuccess(submitData.successMsg)
              updateLinkValue({ UrlFromUser: '' })
          }  
      }catch (error) {
          customToastError('Something went wrong. Please try again later.');
          console.log(error)
      } finally {
          // Reset button state regardless of success or error
          updateisLoadingBtn(false)
          setIsButtonDisabled(false)
      }     
  } 

  // toggle menu for smaller screens---
  const [displayMenu, updateDisplayMenu] = useState({});

  const toggleColMenu = (index) => {
      const updatedDisplayMenu = { ...displayMenu };
      updatedDisplayMenu[index] = !updatedDisplayMenu[index];
      updateDisplayMenu(updatedDisplayMenu);
  };

  // autopaste checkbox---
  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = async () => {
      setIsChecked((prevIsChecked) => !prevIsChecked);        

      if (!isChecked) {
          try {
            const clipboardData = await navigator.clipboard.readText();
            updateLinkValue({ UrlFromUser: clipboardData });

            setTimeout(()=>{
              setIsChecked((prevIsChecked) => !prevIsChecked); 
            },2000)
          } catch (error) {
            console.error('Failed to read clipboard data:', error);
          }
      }
  }

  //short link copy to clipboard funtion----
  const [linkCopied, updateLinkCopied] = useState({})

  const alertCopied = (index) =>{
      const updatedCopiedIcon = {...linkCopied}
      updatedCopiedIcon[index] = true
      updateLinkCopied(updatedCopiedIcon);

      setTimeout(()=>{
          updateLinkCopied({});
      }, 2000)
  }

  return (
    <div className='absolute min-h-[100vh] w-full flex flex-col justify-start items-start overflow-hidden rec-cube-bg bg-mainbackground'>
       <div className="relative h-full w-full overflow-hidden flex flex-col justify-start items-start text-white p-[1rem] md:p-[2rem]">
        
          <nav className='relative w-full min-h-[60px] flex justify-between items-start'>
            <Link to = "/" className='logo-text-gradient text-[33.91px] font-extrabold'>Linkly</Link>

            <div className='flex justify-end items-center space-x-4'>
                <Link to = "/signin" className='flex justify-center items-center space-x-2 w-[123px] h-[50px] bg-[#181E29] border border-[#353C4A] rounded-[48px]'>
                  <p className='text-[16px] font-semibold leading-[18px]'>Login</p>
                  <FiLogIn className='text-[#C9CED6] text-[18px]'/>
                </Link>

                <Link to = "/signup" className='box-shadowbtn hidden justify-center items-center space-x-2 w-[163px] h-[50px] bg-[#144EE3] border border-[#144EE3] rounded-[48px] sm:flex'>
                  <p className='text-[16px] font-semibold leading-[18px]'>Register Now</p>
                </Link>
            </div>
          </nav>

          {/* showcase(shorten your long links and shorten input field) */}
          <div className='relative w-full min-h-[5rem] flex flex-col justify-start items-center space-y-[1rem] py-[7rem]'>
              <h2 className='shortenlinks-gradient capitalize text-center text-[35px] font-extrabold leading-[60px] sm:text-[50px]'>Shorten your loooong links :)</h2>
              <p className='text-greyText text-[16px] leding-[23px] text-center max-w-[500px]'>Linkly is an efficient and easy-to-use URL shortening service that streamlines your online experience.</p>
              {screenWidth < 600 ? <div className='relative max-w-full'>
                    <ToastContainer className='relative w-full ' />
                  </div> :
    
                  <div className=''>
                    <ToastContainer className=''/>
                  </div>
              } 
              <form action="" className='w-full flex justify-center items-center' onSubmit={(e) => submitLink(e)}>
                <div className='relative w-full h-[76px] flex justify-center items-center pt-[1.5rem] md:w-[759px]'>
                    <FaLink className='absolute text-greyText left-0 ml-[1.10rem]'/>
                    
                        <input 
                            onChange={(e)=> updateLinkValue({...linkValue, [e.target.name]:e.target.value})}
                            name='UrlFromUser'
                            value={linkValue.UrlFromUser}
                            className='h-[76px] w-full px-[3rem] text-greyText caret-[#144EE3] bg-[#181E29] border border-[#353C4A] rounded-[48px] focus:outline-none md:w-[759px]'
                            placeholder='Enter your link here'
                        />
                        <button type='submit' 
                            disabled = {isButtonDisabled} 
                            className='box-shadowbtn absolute right-0 mr-[10px] flex justify-center items-center w-[45px] h-[45px] font-semibold bg-[#144EE3] border border-[#144EE3] rounded-[48px] sm:w-[178px] sm:h-[60px]'>
                            {screenWidth > 578 ? 
                            <>
                            {isLoadingBtn ? <img src={loadingImage} className='w-[50px] h-[50px]' alt='loading'  />  :
                            `Shorten Now!`
                            }
                            </>
                            : 
                            <>
                            {isLoadingBtn ? <img src={loadingImage} className='w-[50px] h-[50px]' alt='loading'  /> :
                            <FaArrowRight className='text-white font-[650] text-[20px]' />
                            }
                            </>}
                        </button>
                    
                </div>
              </form>

              <div className='relative pt-[1rem] w-full min-h-[1rem] flex justify-center items-center space-x-4'>
                <input
                      className="shrink-0 mr-2 mt-[0.3rem] h-[22px] w-[40px] appearance-none rounded-[22px] bg-[#181E29] border border-[#353C4A] before:pointer-events-none before:absolute before:h-3.5 before:w-3.5 before:rounded-full before:bg-transparent before:content-[''] 
                      after:absolute after:ml-[0.225rem] after:z-[2] after:mt-[1px] after:h-[18px] after:w-[18px] after:rounded-full after:border-none after:bg-neutral-100 after:shadow-[0_0px_3px_0_rgb(0_0_0_/_7%),_0_2px_2px_0_rgb(0_0_0_/_4%)] 
                      after:transition-[background-color_0.2s,transform_0.2s] after:content-[''] checked:bg-primary checked:after:absolute checked:after:z-[2] checked:after:mt-[1px] checked:after:ml-[1.0625rem] checked:after:h-[18px] 
                      checked:after:w-[18px] checked:after:rounded-full checked:after:border-none checked:after:bg-primary checked:after:shadow-[0_3px_1px_-2px_rgba(0,0,0,0.2),_0_2px_2px_0_rgba(0,0,0,0.14),_0_1px_5px_0_rgba(0,0,0,0.12)] 
                      checked:after:transition-[background-color_0.2s,transform_0.2s] checked:after:content-[''] hover:cursor-pointer focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] 
                      focus:before:shadow-[3px_-1px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-[18px] focus:after:w-[18px] 
                      focus:after:rounded-full focus:after:content-[''] checked:focus:border-primary checked:focus:bg-primary checked:focus:before:ml-[1.0625rem] checked:focus:before:scale-100  
                      checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] dark:bg-[#181E29] dark:after:bg-[#144EE3] dark:checked:bg-primary dark:checked:after:bg-primary  "
                      type="checkbox"
                      role="switch"
                      checked={isChecked}
                      onChange={handleCheckboxChange}
                />

                <p className='text-greyText text-[14px]'>Auto Paste from Clipboard</p>
              </div>  

              <div className='relative flex flex-col justify-center items-center space-y-2 sm:flex-row sm:space-y-0 sm:space-x-1'>
                  <p className='text-greyText text-[14px] text-center'>You can create <span className='text-[#EB568E]'>{data?.linksRemaining}</span> more links. {screenWidth > 578 ? `Register Now to enjoy unlimited usage` : '' } </p>
                  <p className='text-greyText text-[14px] text-center'>
                      {screenWidth < 578 ? (
                        <>
                          <Link to='/signup' className='underline underline-offset-4 text-greyText font-[600]'>
                            Register Now
                          </Link>{' '}
                          to enjoy unlimited usage
                        </>
                      ) : (
                        ''
                      )}
                  </p>
                
                  {screenWidth > 578 ? <AiOutlineQuestionCircle className='text-[15px] text-greyText shrink-0'/> : ''}
              </div>            
          </div> 

          {/* links table */}
          {!isLoading && data && data.userLinks ? <div className='table-grid-container relative w-full min-h-[300px] mx-auto  sm:w-[95%]'>
              {screenWidth > 891 ? <div className='bg-[#181E29] px-3  w-full border border-[#181E29] rounded-tl-lg rounded-tr-lg table-grid-head '>         
                  <p className=' text-[15px] font-[550] text-greyText flex-1'>Short Link</p>
                  <p className=' text-[15px] font-[550] text-greyText flex-1 '>Original Link</p>
                  <p className=' text-[15px] font-[550] text-greyText flex-1 '>Clicks</p>
                  <p className=' text-[15px] font-[550] text-greyText flex-1 '>Status</p>
                  <p className=' text-[15px] font-[550] text-greyText flex-1 '>Date</p>
              </div> : 

              <div className='bg-[#181E29] px-3 w-full border border-[#181E29] rounded-tl-lg rounded-tr-lg flex items-center'>
                  <p className=' text-[15px] font-[550] text-greyText flex-1 '>Link History</p>
              </div>}

              {data.userLinks.map((eachLink, index) => <div key={index} className={`relative p-3 flex flex-col transition-all duration-1000 ease-in-out ${displayMenu ? 'space-y-4' : 'space-y-0'} md:flex-none md:space-y-0 md:grid md:grid-cols-5 md:gap-[2rem] `}>
                  <div className='absolute top-0 left-0 w-full h-full bg-[#181E29] opacity-[42%]'></div>
                  
                  {/* short link */}
                  <div className={`relative z-50 w-full h-full flex justify-between items-center ${(displayMenu[index] && screenWidth < 891) && 'p-2 border border-[#0c1e3f] rounded-md' } md:justify-start`}>
                      <div className='flex items-center space-x-2 w-[70%] md:w-full'>
                          <p className='text-ellipsis text-[13px] text-greyText sm:text-[14px]'>{eachLink.shortUrl}</p>

                          <CopyToClipboard onCopy={()=> alertCopied(index)} text={eachLink.shortUrl}>
                              <button className='shrink-0 w-[29px] h-[29px] flex justify-center items-center bg-[#1f3256] border border-[#1f3256] rounded-[30px]'>
                                  {!linkCopied[index] ?
                                      <FaCopy className='relative text-[13px] '/>
                                  :
                                      <FcCheckmark className='relative text-[13px] '/>                                    
                                  }
                              </button>
                          </CopyToClipboard>  
                      </div>

                      {screenWidth < 891 && 
                        <div className='w-[50%] flex items-center justify-end'>
                            <button onClick={() => toggleColMenu(index)} className='z-50 shrink-0 w-[29px] h-[29px] flex justify-center items-center bg-[#1f3256] border border-[#1f3256] rounded-[30px]'>
                                {!displayMenu[index]  ? < BsChevronDown className='text-[13px] text-white'/> 
                                  :
                                < BsChevronUp className='text-[13px] text-white'/> }
                            </button>
                        </div>
                      }
                  </div>

                  {/* original link */}
                  {(displayMenu[index] || screenWidth > 891) && <div className='relative z-50 max-w-full h-full flex justify-start items-center space-x-2 '>
                      <div className='shrink-0 w-[29px] h-[29px] flex justify-center items-center bg-[#1f3256] border border-[#1f3256] rounded-[30px]'>
                         <img src={eachLink.favicon && eachLink.favicon.image ? `data:image/x-icon;base64,${eachLink.favicon.image}` : '/default-favicon.ico'} 
                         className='w-[20px] h-[20px]'
                         alt='logo' 
                         />
                      </div>

                      <p className='break-all  overflow-hidden w-[100%] text-[13px] text-greyText sm:text-[14px] md:max-w-full'>{eachLink.UrlFromUser}</p>
                  </div>}

                  {/* clicks */}
                  {(displayMenu[index] || screenWidth > 891) && <div className='relative z-50 flex items-center'>
                    {screenWidth < 891 ?
                        <p className=' text-[13px] text-greyText sm:text-[14px]'>{eachLink.clicks} clicks</p>
                    :   <p className=' text-[13px] text-greyText sm:text-[14px]'>{eachLink.clicks}</p>}
                  </div>}

                  {/* status */}
                  {(displayMenu[index] || screenWidth > 891) && <div className='relative z-50 w-full h-full flex items-center space-x-2 '>
                      <p className=' text-[13px] text-[#1EB036] sm:text-[14px]'>{eachLink.status}</p>

                      <div className='relative shrink-0 w-[29px] h-[29px] flex justify-center items-center bg-[#0e4818] border border-[#0e4818] rounded-[30px]'>
                          <FaLink className='relative text-[13px] text-white'/>
                      </div>
                  </div>}

                  {/* date */}
                  {(displayMenu[index] || screenWidth > 891) && <div className='relative z-50 flex items-center '>
                      <p className=' text-[13px] text-greyText sm:text-[14px]'>{formatDate(eachLink.date)}</p>
                  </div>}
              </div> )}
          </div> 
          
          : error ? 
          <div className="relative overflow-hidden flex flex-col justify-center items-center bg-inherit w-full ">
              <p className="text-red-500">Error loading data. Please try again.</p>
          </div>
          :
          <div className="relative overflow-hidden flex flex-col justify-center items-center bg-inherit w-full ">
              <img src={loadingImage} className='w-[100px] h-[100px]' alt='loading'  />
          </div>
          }

        </div>  
    </div>
  )
}

export default Landing