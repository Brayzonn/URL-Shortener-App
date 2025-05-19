// src/pages/Landing.js
import React from 'react';
import useSWR from 'swr';
import Navbar from '../components/Navbar';
import UrlShortener from '../components/UrlShortener';
import LinksTable from '../components/LinksTable';
import api from '../api/client';

const Landing = () => {
  // SWR fetcher with our configured API client
  const fetcher = (url) => api.get(url).then(res => res.data);
  const { data, error, mutate } = useSWR('/api/getfreeurl', fetcher);
  const isLoading = !data && !error;

  return (
    <div className='absolute min-h-[100vh] w-full flex flex-col justify-start items-start overflow-hidden rec-cube-bg bg-mainbackground'>
      <div className="relative h-full w-full overflow-hidden flex flex-col justify-start items-start text-white p-[1rem] md:p-[2rem]">
        {/* Navbar Component */}
        <Navbar />
        
        {/* URL Shortener Component */}
        <UrlShortener 
          data={data} 
          mutate={mutate} 
        />
        
        {/* Links Table Component */}
        <LinksTable 
          data={data} 
          error={error} 
          isLoading={isLoading} 
        />
      </div>
    </div>
  );
};

export default Landing;