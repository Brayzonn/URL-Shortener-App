import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useSWR from 'swr';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useNavigate } from "react-router-dom";
import { FiLogIn } from "react-icons/fi"; 
import { FaLink, FaCopy} from "react-icons/fa"; 
import { FaArrowRight } from "react-icons/fa"; 
import { BsChevronDown } from "react-icons/bs"; 
import { BsChevronUp } from "react-icons/bs";
import { BsFillBarChartFill } from "react-icons/bs";
import { IoMdNotifications } from "react-icons/io"; 
import { BiHistory } from "react-icons/bi";  
import { GiClick } from "react-icons/gi"; 
import { FiSettings } from "react-icons/fi"; 
import { AiOutlinePlus } from "react-icons/ai"; 
import { FcCheckmark } from "react-icons/fc";
import { ToastContainer } from 'react-toastify';
import { customToastError, customToastSuccess } from '../assets/toastStyles'; 
import loadingImage from '../images/loading.svg';

const UserLanding = () => {
    const baseURL = process.env.REACT_APP_API_URL;
    const userToken = sessionStorage.getItem('userInfo');
    const navigate = useNavigate();

    // SWR fetcher with proper error handling
    const fetcher = async (url) => {
        try {
            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${userToken}`, 
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            if (error.response?.status === 401) {
                sessionStorage.clear();
                navigate('/signin');
            }
            throw error;
        }
    };

    // SWR hook with proper configuration
    const { data, error, mutate, isLoading } = useSWR(
        userToken ? `${baseURL}/api/user/dashboard` : null,
        fetcher,
        {
            revalidateOnFocus: false,
            refreshInterval: 0,
            dedupingInterval: 5000,
            errorRetryCount: 1,
            onError: (error) => {
                if (error.response?.status === 401) {
                    sessionStorage.clear();
                    navigate('/signin');
                }
            }
        }
    );

    // Screen width state
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);
    
    // UI states
    const [activeMenu, setActiveMenu] = useState(1);
    const [activeSignout, setActiveSignout] = useState(false);
    const [isLoadingBtn, setIsLoadingBtn] = useState(false);
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const [displayMenu, setDisplayMenu] = useState({});
    const [linkCopied, setLinkCopied] = useState({});
    const [linkValue, setLinkValue] = useState({
        UrlFromUser: ''
    });

    // Handle screen width changes
    useEffect(() => {
        const handleResize = () => {
            setScreenWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Check for token on mount and redirect if not found
    useEffect(() => {
        if (!userToken) {
            navigate('/signin');
        }
    }, [userToken, navigate]);

    const signOut = () => {
        sessionStorage.clear();
        navigate('/signin');
    };

    // Link submission with proper error handling and loading states
    const submitLink = async (e) => {
        e.preventDefault();
        
        if (!linkValue.UrlFromUser.trim()) {
            customToastError('Please enter a URL');
            return;
        }

        setIsLoadingBtn(true);
        setIsButtonDisabled(true);

        try {
            const response = await axios.post(
                `${baseURL}/api/user/submiturl`, 
                linkValue,
                {
                    headers: {
                        'Authorization': `Bearer ${userToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.errMsg) {
                customToastError(response.data.errMsg);
            } else {
                customToastSuccess(response.data.successMsg);
                setLinkValue({ UrlFromUser: '' });
            
                mutate();
            }
        } catch (error) {
            console.error('Link submission error:', error);
            if (error.response?.status === 401) {
                customToastError('Session expired. Please login again.');
                sessionStorage.clear();
                navigate('/signin');
            } else {
                customToastError('Something went wrong. Please try again later.');
            }
        } finally {
            setIsLoadingBtn(false);
            setIsButtonDisabled(false);
        }
    };

    // Auto paste from clipboard
    const handleCheckboxChange = async () => {
        setIsChecked(!isChecked);

        if (!isChecked) {
            try {
                const clipboardData = await navigator.clipboard.readText();
                setLinkValue({ UrlFromUser: clipboardData });

                setTimeout(() => {
                    setIsChecked(false);
                }, 2000);
            } catch (error) {
                console.error('Failed to read clipboard data:', error);
            }
        }
    };

    // Toggle column menu for smaller screens
    const toggleColMenu = (index) => {
        setDisplayMenu(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    // Copy link to clipboard
    const alertCopied = (index) => {
        setLinkCopied(prev => ({
            ...prev,
            [index]: true
        }));

        setTimeout(() => {
            setLinkCopied(prev => {
                const newState = { ...prev };
                delete newState[index];
                return newState;
            });
        }, 2000);
    };

    // Date formatting
    const formatDate = (dateString) => {
        const options = { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' };
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, options);
    };

    // Handle loading and error states
    if (!userToken) {
        return null; 
    }

    if (error) {
        return (
            <div className="absolute min-h-[100vh] w-full flex items-center justify-center bg-mainbackground">
                <div className="text-white text-center">
                    <p className="text-xl mb-4">Error loading dashboard</p>
                    <button 
                        onClick={() => mutate()}
                        className="px-4 py-2 bg-[#144EE3] text-white rounded"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const userLinks = data?.userLinks || [];

    return (
        <div className='absolute min-h-[100vh] w-full flex flex-col justify-start items-start overflow-hidden rec-swirl-cube-bg bg-mainbackground'>
            <div className="relative h-full w-full overflow-hidden flex flex-col justify-start items-start text-white">
                
                {/* Navigation */}
                <nav className='relative w-full min-h-[60px] flex justify-between items-start space-x-2 p-[1rem] md:p-[2rem]'>
                    <h4 className='logo-text-gradient text-[33.91px] font-extrabold'>Linkly</h4>

                    <div className='flex justify-end items-center space-x-6'>
                        <div className='relative w-[153px] h-[50px]'>
                            <button 
                                onClick={() => setActiveSignout(!activeSignout)} 
                                className='relative flex justify-between items-center space-x-1 px-[1rem] w-[153px] h-[50px] bg-[#181E29] border border-[#353C4A] rounded-[48px]'
                            >
                                <div className='flex flex-col justify-center items-start'>
                                    <p className='text-[12px] text-greyText font-[400] leading-[18px]'>Welcome, </p>
                                    <p className='text-[14.30px] font-semibold leading-[18px] truncate max-w-full'>
                                        {data?.userInfo?.username || 'User'}
                                    </p>
                                </div>

                                {!activeSignout ? 
                                    <BsChevronDown className='text-greyText text-[14px]'/> :
                                    <BsChevronUp className='text-greyText text-[14px]'/>
                                }
                            </button>

                            <button 
                                onClick={signOut} 
                                className={`absolute transition-all duration-100 ease-linear flex w-full h-[45px] px-[1rem] justify-start items-center space-x-3 left-[-4px] top-[54px] bg-[#181E29] opacity-[85%] border-[#181E29] rounded-[35px] ${
                                    activeSignout ? 'z-[50] opacity-[100] translate-y-0' : 'z-[-1] opacity-0 translate-y-[-50%]'
                                }`}
                            >
                                <FiLogIn className='text-white text-[16px]'/>
                                <p className='text-[14px] text-white font-semibold leading-[18px]'>Sign out</p>                 
                            </button>
                        </div>

                        {screenWidth > 891 && 
                            <button className='box-shadowbtn w-[35px] h-[35px] flex justify-center items-center bg-[#144EE3] border border-[#144EE3] rounded-full'>
                                <IoMdNotifications className='text-[19px]'/>
                            </button>
                        }
                    </div>
                </nav>

                {/* Main content */}
                <div className='relative w-full min-h-[5rem] flex flex-col justify-start items-center space-y-[1rem] py-[7rem] px-[1rem] md:p-[2rem]'>
                    <ToastContainer className={screenWidth < 600 ? 'relative w-full' : ''} />
                    
                    {/* Link submission form */}
                    <form className='w-full flex justify-center items-center' onSubmit={submitLink}>
                        <div className='relative w-full h-[76px] flex justify-center items-center pt-[1.5rem] md:w-[759px]'>
                            <FaLink className='absolute text-greyText left-0 ml-[1.10rem]'/>
                            
                            <input 
                                onChange={(e) => setLinkValue({ ...linkValue, [e.target.name]: e.target.value })}
                                name='UrlFromUser'
                                value={linkValue.UrlFromUser}
                                className='h-[76px] w-full px-[3rem] text-greyText caret-[#144EE3] bg-[#181E29] border border-[#353C4A] rounded-[48px] focus:outline-none md:w-[759px]'
                                placeholder='Enter your link here'
                            />
                            <button 
                                type='submit' 
                                disabled={isButtonDisabled} 
                                className='box-shadowbtn absolute right-0 mr-[10px] flex justify-center items-center w-[45px] h-[45px] font-semibold bg-[#144EE3] border border-[#144EE3] rounded-[48px] sm:w-[178px] sm:h-[60px] disabled:opacity-50'
                            >
                                {screenWidth > 578 ? 
                                    <>
                                        {isLoadingBtn ? <img src={loadingImage} className='w-[50px] h-[50px]' alt='loading' /> :
                                            'Shorten Now!'
                                        }
                                    </>
                                : 
                                    <>
                                        {isLoadingBtn ? <img src={loadingImage} className='w-[50px] h-[50px]' alt='loading' /> :
                                            <FaArrowRight className='text-white font-[650] text-[20px]' />
                                        }
                                    </>
                                }
                            </button>
                        </div>
                    </form>

                    {/* Auto paste checkbox */}
                    <div className='relative pt-[1rem] w-full min-h-[1rem] flex justify-center items-center space-x-4'>
                        <input
                            className="shrink-0 mr-2 mt-[0.3rem] h-[22px] w-[40px] appearance-none rounded-[22px] bg-[#181E29] border border-[#353C4A] before:pointer-events-none before:absolute before:h-3.5 before:w-3.5 before:rounded-full before:bg-transparent before:content-[''] 
                            after:absolute after:ml-[0.225rem] after:z-[2] after:mt-[1px] after:h-[18px] after:w-[18px] after:rounded-full after:border-none after:bg-neutral-100 after:shadow-[0_0px_3px_0_rgb(0_0_0_/_7%),_0_2px_2px_0_rgb(0_0_0_/_4%)] 
                            after:transition-[background-color_0.2s,transform_0.2s] after:content-[''] checked:bg-primary checked:after:absolute checked:after:z-[2] checked:after:mt-[1px] checked:after:ml-[1.0625rem] checked:after:h-[18px] 
                            checked:after:w-[18px] checked:after:rounded-full checked:after:border-none checked:after:bg-primary checked:after:shadow-[0_3px_1px_-2px_rgba(0,0,0,0.2),_0_2px_2px_0_rgba(0,0,0,0.14),_0_1px_5px_0_rgba(0,0,0,0.12)] 
                            checked:after:transition-[background-color_0.2s,transform_0.2s] checked:after:content-[''] hover:cursor-pointer focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] 
                            focus:before:shadow-[3px_-1px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-[18px] focus:after:w-[18px] 
                            focus:after:rounded-full focus:after:content-[''] checked:focus:border-primary checked:focus:bg-primary checked:focus:before:ml-[1.0625rem] checked:focus:before:scale-100  
                            checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] dark:bg-[#181E29] dark:after:bg-[#144EE3] dark:checked:bg-primary dark:checked:after:bg-primary"
                            type="checkbox"
                            role="switch"
                            checked={isChecked}
                            onChange={handleCheckboxChange}
                        />
                        <p className='text-greyText text-[14.30px]'>Auto Paste from Clipboard</p>
                    </div>  
                </div>

                {/* Links table */}
                <div className='relative w-full min-h-[500px] bg-[#151A24] opacity-[0.70]'>
                    
                    {/* Tabs */}
                    <div className='box-shadow-userlanding relative w-full h-[70px] bg-[#181E29] flex justify-center items-center p-[1rem] md:p-[2rem] md:space-x-[5rem]'>
                        <button onClick={() => setActiveMenu(1)} className='relative flex items-center space-x-1'>
                            <BiHistory className='text-[#D9D9D9]' />
                            <p className='text-[#D9D9D9] text-[15px]'>History</p>
                            {activeMenu === 1 && (
                                <>
                                    <div className='absolute w-full h-[5px] top-[-10px] left-0 bg-red-500'></div>
                                    <div className='absolute bottom-[-25px] w-full h-[3px] bg-[#144EE3]'></div>
                                </>
                            )}
                        </button>

                        {screenWidth > 891 && (
                            <>
                                <button onClick={() => setActiveMenu(2)} className='relative flex items-center space-x-1'>
                                    <BsFillBarChartFill className='text-[#D9D9D9]' />
                                    <p className='text-[#D9D9D9] text-[15px]'>Statistics</p>
                                    {activeMenu === 2 && (
                                        <>
                                            <div className='absolute w-full h-[5px] top-[-10px] left-0 bg-red-500'></div>
                                            <div className='absolute bottom-[-25px] w-full h-[3px] bg-[#144EE3]'></div>
                                        </>
                                    )}
                                </button>

                                <button onClick={() => setActiveMenu(3)} className='relative flex items-center space-x-1'>
                                    <GiClick className='text-[#D9D9D9]' />
                                    <p className='text-[#D9D9D9] text-[15px]'>Click Stream</p>
                                    {activeMenu === 3 && (
                                        <>
                                            <div className='absolute w-full h-[5px] top-[-10px] left-0 bg-red-500'></div>
                                            <div className='absolute bottom-[-25px] w-full h-[3px] bg-[#144EE3]'></div>
                                        </>
                                    )}
                                </button>

                                <button onClick={() => setActiveMenu(4)} className='relative flex items-center space-x-1'>
                                    <FiSettings className='text-[#D9D9D9]' />
                                    <p className='text-[#D9D9D9] text-[15px]'>Settings</p>
                                    {activeMenu === 4 && (
                                        <>
                                            <div className='absolute w-full h-[5px] top-[-10px] left-0 bg-red-500'></div>
                                            <div className='absolute bottom-[-25px] w-full h-[3px] bg-[#144EE3]'></div>
                                        </>
                                    )}
                                </button>
                            </>
                        )}
                    </div>

                    {/* History section */}
                    {activeMenu === 1 && (
                        <h3 className='relative w-full text-white text-[15px] font-bold mx-auto px-[1rem] pt-[2rem] md:text-[17px] md:px-[2rem] sm:w-[95%]'>
                            History({userLinks.length})
                        </h3>
                    )}

                    {/* Data display */}
                    {isLoading ? (
                        <div className="relative overflow-hidden flex flex-col justify-center items-center bg-inherit w-full min-h-[300px]">
                            <img src={loadingImage} className='w-[100px] h-[100px]' alt='loading' />
                        </div>
                    ) : activeMenu === 1 && userLinks.length > 0 ? (
                        <div className='table-grid-container relative w-full min-h-[300px] mx-auto p-[1rem] md:p-[2rem] sm:w-[95%]'>
                            {/* Table header */}
                            {screenWidth > 891 ? (
                                <div className='bg-[#0D1117] px-3 w-full border border-[#0D1117] rounded-tl-lg rounded-tr-lg table-grid-head'>         
                                    <p className='text-[15px] font-[550] text-greyText flex-1'>Short Link</p>
                                    <p className='text-[15px] font-[550] text-greyText flex-1'>Original Link</p>
                                    <p className='text-[15px] font-[550] text-greyText flex-1'>Clicks</p>
                                    <p className='text-[15px] font-[550] text-greyText flex-1'>Status</p>
                                    <p className='text-[15px] font-[550] text-greyText flex-1'>Date</p>
                                </div>
                            ) : (
                                <div className='bg-[#0D1117] px-3 w-full border border-[#0D1117] rounded-tl-lg rounded-tr-lg flex items-center'>
                                    <p className='text-[15px] font-[550] text-greyText flex-1'>Link History</p>
                                </div>
                            )}

                            {/* Table rows */}
                            {userLinks.map((eachLink, index) => (
                                <div key={eachLink._id || index} className={`relative p-3 flex flex-col transition-all duration-1000 ease-in-out ${displayMenu[index] ? 'space-y-4' : 'space-y-0'} md:flex-none md:space-y-0 md:grid md:grid-cols-5 md:gap-[2rem]`}>
                                    <div className='absolute top-0 left-0 w-full h-full bg-[#0D1117] opacity-[0.70]'></div>
                                    
                                    {/* Short link */}
                                    <div className={`relative z-50 w-full h-full flex justify-between items-center ${(displayMenu[index] && screenWidth < 891) && 'p-2 border border-[#0c1e3f] rounded-md'} md:justify-start`}>
                                        <div className='flex items-center space-x-2 w-[70%] md:w-full'>
                                            <p className='text-ellipsis text-[14px] text-greyText sm:text-[15px]'>{eachLink.shortUrl}</p>
                                            
                                            <CopyToClipboard onCopy={() => alertCopied(index)} text={eachLink.shortUrl}>
                                                <button className='shrink-0 w-[29px] h-[29px] flex justify-center items-center bg-[#1f3256] border border-[#1f3256] rounded-[30px]'>
                                                    {!linkCopied[index] ?
                                                        <FaCopy className='relative text-[13px]' /> :
                                                        <FcCheckmark className='relative text-[13px]' />                                    
                                                    }
                                                </button>
                                            </CopyToClipboard>  
                                        </div>

                                        {screenWidth < 891 && (
                                            <div className='relative z-50 w-[50%] flex items-center justify-end'>
                                                <button onClick={() => toggleColMenu(index)} className='z-50 shrink-0 w-[29px] h-[29px] flex justify-center items-center bg-[#1f3256] border border-[#1f3256] rounded-[30px]'>
                                                    {!displayMenu[index] ? 
                                                        <BsChevronDown className='text-[13px] text-white'/> :
                                                        <BsChevronUp className='text-[13px] text-white'/> 
                                                    }
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Original link */}
                                    {(displayMenu[index] || screenWidth > 891) && (
                                        <div className='relative z-50 max-w-full h-full flex justify-start items-center space-x-2'>
                                            <div className='shrink-0 w-[29px] h-[29px] flex justify-center items-center'>
                                                <img 
                                                    src={eachLink.favicon?.image ? `data:image/x-icon;base64,${eachLink.favicon.image}` : '/default-favicon.ico'}
                                                    alt='logo' 
                                                    className='w-[20px] h-[20px]'
                                                />
                                            </div>
                                            <p className='break-all overflow-hidden w-[100%] text-[13px] text-greyText sm:text-[14px] md:max-w-full'>
                                                {eachLink.UrlFromUser}
                                            </p>
                                        </div>
                                    )}

                                    {/* Clicks */}
                                    {(displayMenu[index] || screenWidth > 891) && (
                                        <div className='relative z-50 flex items-center'>
                                            {screenWidth < 891 ?
                                                <p className='text-[14px] text-greyText sm:text-[15px]'>{eachLink.clicks} clicks</p> :
                                                <p className='text-[14px] text-greyText sm:text-[15px]'>{eachLink.clicks}</p>
                                            }
                                        </div>
                                    )}

                                    {/* Status */}
                                    {(displayMenu[index] || screenWidth > 891) && (
                                        <div className='relative z-50 w-full h-full flex items-center space-x-2'>
                                            <p className={`text-[14px] ${eachLink.status === 'Active' ? 'text-[#1EB036]' : 'text-[#B0901E]'} sm:text-[15px]`}>
                                                {eachLink.status}
                                            </p> 

                                            <div className={`relative shrink-0 w-[29px] h-[29px] flex justify-center items-center ${eachLink.status === 'Active' ? 'bg-[#0e4818] border border-[#0e4818]' : 'bg-[#B0901E] border-[#B0901E]'} rounded-[30px]`}>
                                                <FaLink className='relative text-[13px] text-white'/>
                                            </div>
                                        </div>
                                    )}

                                    {/* Date */}
                                    {(displayMenu[index] || screenWidth > 891) && (
                                        <div className='relative z-50 flex items-center'>
                                            <p className='text-[14px] text-greyText sm:text-[15px]'>{formatDate(eachLink.date)}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : activeMenu === 1 && !isLoading && userLinks.length === 0 ? (
                        <div className='flex h-[300px] w-full justify-center items-center'>
                            <p className='text-greyText text-[16px]'>No links created yet. Start creating your short links!</p>
                        </div>
                    ) : (
                        <div className='flex h-[300px] w-full justify-center items-center space-x-1'>
                            <p className='text-greyText text-[16px]'>Available for Pro members</p>
                            <AiOutlinePlus className='text-[#f1d34b] text-[19px] font-bold mb-[0.70rem]'/>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserLanding;