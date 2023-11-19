import React, { useContext } from 'react';
import axios from 'axios';
import { useState  } from 'react';


const AppContext = React.createContext();

const AppProvider = ({ children }) => {

    //base url
    const [baseURL, updateBaseUrl] = useState('https://linklyy.onrender.com')

    //non users data
    const [nonuserData, updatenonuserData]  = useState([])

    const fetchNonuserData = async () =>{
      try {
        // Fetch all mongodb data for non user
        const nonUserResponse = await axios.get(`${baseURL}/api/getfreeurl`);
        const nonUserData = nonUserResponse.data;
        updatenonuserData(nonUserData)
      } catch (error) {
          console.log(error)
      }
    }

    //users
    const [allUserMongoData, updateallUserMongoData] = useState([]);

    const fetchUserData = async () => {
      try {
          const userToken = sessionStorage.getItem('userInfo');

          const userConfig = {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          };

          // Fetch all mongodb data for user
          const userResponse = await axios.get(`${baseURL}/api/user/dashboard`, userConfig);
          const userData = userResponse.data;

          updateallUserMongoData(userData);         

      } catch (error) {
        console.log(error)
      }
    }

    return <AppContext.Provider value={{
      fetchUserData,
      allUserMongoData,
      updateallUserMongoData,
      nonuserData,
      fetchNonuserData,
      baseURL

    }}>{children}</AppContext.Provider>;
};

const useGlobalContext = () => {
  return useContext(AppContext);
};

export { useGlobalContext, AppProvider };