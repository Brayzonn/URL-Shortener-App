import React, { useContext } from 'react';
import axios from 'axios';
import { useState  } from 'react';


const AppContext = React.createContext();

const AppProvider = ({ children }) => {

    //base url
    const baseURL = 'http://localhost:3300'

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
      baseURL

    }}>{children}</AppContext.Provider>;
};

const useGlobalContext = () => {
  return useContext(AppContext);
};

export { useGlobalContext, AppProvider };