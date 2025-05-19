// src/components/LinksTable.js
import React, { useState, useEffect } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { FaLink, FaCopy } from "react-icons/fa";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";
import { FcCheckmark } from "react-icons/fc";
import loadingImage from '../images/loading.svg';

const LinksTable = ({ data, error, isLoading }) => {
  // Screen width state
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [displayMenu, setDisplayMenu] = useState({});
  const [linkCopied, setLinkCopied] = useState({});

  // Update screen width when window is resized
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Date formatter function
  const formatDate = (dateString) => {
    const options = { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, options);
  };

  // Toggle menu for smaller screens
  const toggleColMenu = (index) => {
    const updatedDisplayMenu = { ...displayMenu };
    updatedDisplayMenu[index] = !updatedDisplayMenu[index];
    setDisplayMenu(updatedDisplayMenu);
  };

  // Alert when link is copied to clipboard
  const alertCopied = (index) => {
    const updatedCopiedIcon = { ...linkCopied };
    updatedCopiedIcon[index] = true;
    setLinkCopied(updatedCopiedIcon);

    setTimeout(() => {
      setLinkCopied({});
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="relative overflow-hidden flex flex-col justify-center items-center bg-inherit w-full ">
        <img src={loadingImage} className='w-[100px] h-[100px]' alt='loading' />
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative overflow-hidden flex flex-col justify-center items-center bg-inherit w-full ">
        <p className="text-red-500">Error loading data. Please try again.</p>
      </div>
    );
  }

  if (!data || !data.userLinks) {
    return null;
  }

  return (
    <div className='table-grid-container relative w-full min-h-[300px] mx-auto sm:w-[95%]'>
      {screenWidth > 891 ? (
        <div className='bg-[#181E29] px-3 w-full border border-[#181E29] rounded-tl-lg rounded-tr-lg table-grid-head'>
          <p className='text-[15px] font-[550] text-greyText flex-1'>Short Link</p>
          <p className='text-[15px] font-[550] text-greyText flex-1'>Original Link</p>
          <p className='text-[15px] font-[550] text-greyText flex-1'>Clicks</p>
          <p className='text-[15px] font-[550] text-greyText flex-1'>Status</p>
          <p className='text-[15px] font-[550] text-greyText flex-1'>Date</p>
        </div>
      ) : (
        <div className='bg-[#181E29] px-3 w-full border border-[#181E29] rounded-tl-lg rounded-tr-lg flex items-center'>
          <p className='text-[15px] font-[550] text-greyText flex-1'>Link History</p>
        </div>
      )}

      {data.userLinks.map((eachLink, index) => (
        <div key={index} className={`relative p-3 flex flex-col transition-all duration-1000 ease-in-out ${displayMenu ? 'space-y-4' : 'space-y-0'} md:flex-none md:space-y-0 md:grid md:grid-cols-5 md:gap-[2rem]`}>
          <div className='absolute top-0 left-0 w-full h-full bg-[#181E29] opacity-[42%]'></div>
          
          {/* Short link */}
          <div className={`relative z-50 w-full h-full flex justify-between items-center ${(displayMenu[index] && screenWidth < 891) && 'p-2 border border-[#0c1e3f] rounded-md'} md:justify-start`}>
            <div className='flex items-center space-x-2 w-[70%] md:w-full'>
              <p className='text-ellipsis text-[13px] text-greyText sm:text-[14px]'>{eachLink.shortUrl}</p>

              <CopyToClipboard onCopy={() => alertCopied(index)} text={eachLink.shortUrl}>
                <button className='shrink-0 w-[29px] h-[29px] flex justify-center items-center bg-[#1f3256] border border-[#1f3256] rounded-[30px]'>
                  {!linkCopied[index] ? (
                    <FaCopy className='relative text-[13px]' />
                  ) : (
                    <FcCheckmark className='relative text-[13px]' />
                  )}
                </button>
              </CopyToClipboard>
            </div>

            {screenWidth < 891 && (
              <div className='w-[50%] flex items-center justify-end'>
                <button onClick={() => toggleColMenu(index)} className='z-50 shrink-0 w-[29px] h-[29px] flex justify-center items-center bg-[#1f3256] border border-[#1f3256] rounded-[30px]'>
                  {!displayMenu[index] ? (
                    <BsChevronDown className='text-[13px] text-white' />
                  ) : (
                    <BsChevronUp className='text-[13px] text-white' />
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Original link */}
          {(displayMenu[index] || screenWidth > 891) && (
            <div className='relative z-50 max-w-full h-full flex justify-start items-center space-x-2'>
              <div className='shrink-0 w-[29px] h-[29px] flex justify-center items-center bg-[#1f3256] border border-[#1f3256] rounded-[30px]'>
                <img
                  src={eachLink.favicon && eachLink.favicon.image
                    ? `data:${eachLink.favicon.mimeType || 'image/x-icon'};base64,${eachLink.favicon.image}`
                    : `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEwAACxMBAJqcGAAAAWVJREFUOI2tk7FrwkAUxr97iYkdSiFdHBwKGZzETXBwdnDwP3Bz6tQ/wsFR6NjFsVPnQHBydXMQMnUQSiFDhmtu6BBiNCbn8L7l3ffu++7dHSGE4D+PvFfsdDohx3G+HccZ2bZtCSFeNE17zOfzb8/zvtM0ZVrrR8dxfHRPpVLper1+TJJkEMfxcL1e92u12nscx8MwDAdRFI3CMPw4n887AM+3QC6Xi2+a5jTLsp7rusfD4fBeLBYbjuO82rb9ZhjG1HXdvWVZz6ZpTkej0b7RaIw1TXvUdf3JMIzper3uW5Y1KRQKEwA/Gr0m79PpdBbHMZRSUEqRZdlix3HwvWw220opQYiBEAJKKUzTnAVBgCAIIKXEZrM52rb9ViqVXpRSMMb6JEnQ7XaXa+UNvu+P4zh+OZ1Oh/P5/FGv13dKqbZSqi2EaO33e9RqtR2AZ8bYG2NsyfO8sSzLnwBwr7fQdd0v1tgfsE+WZT90OL+Z9X8BhD/7BpTLYR4wK6lhAAAAAElFTkSuQmCC`}
                  className='w-[20px] h-[20px]'
                  alt='logo'
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEwAACxMBAJqcGAAAAWVJREFUOI2tk7FrwkAUxr97iYkdSiFdHBwKGZzETXBwdnDwP3Bz6tQ/wsFR6NjFsVPnQHBydXMQMnUQSiFDhmtu6BBiNCbn8L7l3ffu++7dHSGE4D+PvFfsdDohx3G+HccZ2bZtCSFeNE17zOfzb8/zvtM0ZVrrR8dxfHRPpVLper1+TJJkEMfxcL1e92u12nscx8MwDAdRFI3CMPw4n887AM+3QC6Xi2+a5jTLsp7rusfD4fBeLBYbjuO82rb9ZhjG1HXdvWVZz6ZpTkej0b7RaIw1TXvUdf3JMIzper3uW5Y1KRQKEwA/Gr0m79PpdBbHMZRSUEqRZdlix3HwvWw220opQYiBEAJKKUzTnAVBgCAIIKXEZrM52rb9ViqVXpRSMMb6JEnQ7XaXa+UNvu+P4zh+OZ1Oh/P5/FGv13dKqbZSqi2EaO33e9RqtR2AZ8bYG2NsyfO8sSzLnwBwr7fQdd0v1tgfsE+WZT90OL+Z9X8BhD/7BpTLYR4wK6lhAAAAAElFTkSuQmCC`;
                  }}
                />
              </div>
              <p className='break-all overflow-hidden w-[100%] text-[13px] text-greyText sm:text-[14px] md:max-w-full'>{eachLink.UrlFromUser}</p>
            </div>
          )}

          {/* Clicks */}
          {(displayMenu[index] || screenWidth > 891) && (
            <div className='relative z-50 flex items-center'>
              {screenWidth < 891 ? (
                <p className='text-[13px] text-greyText sm:text-[14px]'>{eachLink.clicks} clicks</p>
              ) : (
                <p className='text-[13px] text-greyText sm:text-[14px]'>{eachLink.clicks}</p>
              )}
            </div>
          )}

          {/* Status */}
          {(displayMenu[index] || screenWidth > 891) && (
            <div className='relative z-50 w-full h-full flex items-center space-x-2'>
              <p className='text-[13px] text-[#1EB036] sm:text-[14px]'>{eachLink.status}</p>
              <div className='relative shrink-0 w-[29px] h-[29px] flex justify-center items-center bg-[#0e4818] border border-[#0e4818] rounded-[30px]'>
                <FaLink className='relative text-[13px] text-white' />
              </div>
            </div>
          )}

          {/* Date */}
          {(displayMenu[index] || screenWidth > 891) && (
            <div className='relative z-50 flex items-center'>
              <p className='text-[13px] text-greyText sm:text-[14px]'>{formatDate(eachLink.date)}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default LinksTable;