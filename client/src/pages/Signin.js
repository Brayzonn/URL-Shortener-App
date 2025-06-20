import React from 'react'
import axios from 'axios'
import {Link, useNavigate} from "react-router-dom"
import { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import { customToastError, customToastSuccess } from '../assets/toastStyles'; 
import loadingImage from '../images/loading.svg'
import { BsEye } from "react-icons/bs";



const Signin = () => {

    const baseURL = process.env.REACT_APP_API_URL || "http://localhost:3300";

    const navigate = useNavigate();

    //screen width----------------------------------------
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
    //---------------------------------------------------

    //toggle password view
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword((prevShowPassword) => !prevShowPassword);
    };

    const [isLoadingBtn, updateisLoadingBtn] = useState(null)
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);

    //signin form submit-------------------------------
    const [signinValues, setsigninValues] = useState({
        email: "",
        password: "",
    });

    const signinSubmit = async (e) =>{
        e.preventDefault();
        updateisLoadingBtn(true)
        setIsButtonDisabled(true)
    
        try {
            //send form data to backend
            const signInResp =  await axios.post(`${baseURL}/api/signin`, {...signinValues})
            const signIndata = signInResp.data;
    
            //checks if data contains any errors
            if(signIndata.errMsg){
                customToastError(signIndata.errMsg);
                window.scroll(0, 0)
                updateisLoadingBtn(false)
                setIsButtonDisabled(false)
            }else{
                customToastSuccess(signIndata.successMsg)

                setTimeout(()=>{
                    updateisLoadingBtn(false)
                    setIsButtonDisabled(false)
                    sessionStorage.setItem('userInfo', JSON.stringify(signIndata.token))
                    navigate('/user/dashboard'); 
                }, 3000)       
            }
    
        }catch (error) {
            console.log(error)
            updateisLoadingBtn(false)
            setIsButtonDisabled(false)
        }      
    }


  return (
    <div className='relative min-h-[100vh] w-full flex flex-col justify-start items-start overflow-x-hidden rec-swirl bg-mainbackground'>
       <div className="relative h-full w-full overflow-hidden flex flex-col justify-start items-start text-white p-[1rem] md:p-[2rem]">
            
            <div className='relative pt-[10rem] pb-[2rem]'>
              <h1 className=' text-greyText text-[22px] font-[550]'>Welcome To <Link to = '/' className='logo-text-gradient'>Linkly</Link></h1>
              <p className='text-greyText pb-5'>Sign into your account or <Link to = '/signup' className='text-[#446dd5]'>Sign Up</Link> to create an account. </p>
              {screenWidth < 600 ? <div className='relative max-w-full flex flex-col space-y-1'>
                <ToastContainer className='relative w-full'/>
              </div> :

              <div className=''>
                <ToastContainer className=''/>
              </div>
              }           
            </div>

            <form action="" className='w-full' onSubmit={(e) => signinSubmit(e)}>
                <div className='relative w-full flex flex-col space-y-4'>
                    <div className='relative w-full flex flex-col justify-start items-start space-y-2 '>
                        <label htmlFor="email" className='text-[15px] text-left text-greyText font-[450]'>Email</label>
                        <input type="email" name='email' className='bg-[#181E29] px-2 border-[#181E29] border-[1px] rounded-[2px] w-full h-[45px] text-white text-[16px] sm:w-[450px] focus:outline-none focus:border-[#272c36] ' onChange={(e)=> setsigninValues({...signinValues, [e.target.name]:e.target.value})} />
                    </div>

                    <div className='relative w-full flex flex-col justify-start items-start space-y-2 pb-[1rem]'>
                        <div className='w-full flex justify-between sm:w-[450px]'>
                        <label htmlFor="password" className='text-[15px] text-left text-greyText font-[450]'>Password</label>
                        <button type= "button" onClick={togglePasswordVisibility} className ='flex items-center justify-end text-[14px]'><BsEye className='text-primaryGreen mr-[5px] text-[16px]'/> {showPassword ? 'Hide' : 'Show'} </button> 
                        </div>
                        
                        <input 
                        type={showPassword ? 'text' : 'password'} 
                        name='password'
                        className='bg-[#181E29] px-2 border-[#181E29] border-[1px] rounded-[2px] w-full h-[45px] text-white text-[16px] sm:w-[450px] focus:outline-none focus:border-[#272c36]'
                        onChange={(e)=> setsigninValues({...signinValues, [e.target.name]:e.target.value})}
                        />
                    </div>

                    <button type='submit' disabled = {isButtonDisabled} className='bg-[#144EE3] text-greyText border-primaryGreen rounded-md flex justify-center items-center text-center w-full h-[50px] sm:w-[450px]'>
                        {isLoadingBtn ? <img src={loadingImage} className='w-[50px] h-[50px]' alt='loading'  /> : <p>Sign In</p>} 
                    </button>
                </div>
            </form>

       </div>
    </div>
  )
}

export default Signin