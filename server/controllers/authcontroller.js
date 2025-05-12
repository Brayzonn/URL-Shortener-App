const validUrl = require('valid-url');
const shortid = require('shortid');
const config = require('config');
const { URL } = require('url');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const axios = require('axios');

//env variable
require('dotenv').config();

//models
const Url = require('../models/linkdata');
const User = require('../models/user');
const freelinkModel = require('../models/nonRegLinkData')



module.exports.landing = async (req, res, next) => {
    res.status(200).json('Welcome to my home, human!')
}


//POST sign up---------
module.exports.signup = async (req, res, next) => {

    try {
        const {username, email, password} = req.body;

        //check required fields
        if( !username || !email || !password){
           return res.status(200).json({errMsg: 'Please enter all fields'})
        }
    
        // check valid email
        let emailPattern= /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    
        if(!email.match(emailPattern)){
            return res.status(200).json({errMsg: 'Invalid email pattern'})
        }
    
        //password length and min characters
        let passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$@!%&*?])[A-Za-z\d#$@!%&*?]{6,20}$/;
    
        if(!password.match(passwordRegex)){
            return res.status(200).json({errMsg: 'Password should contain at least 6 characters. An uppercase letter, lowercase letter, number, and a special character'}) 
        }
        else{
            const userResponse = await User.findOne({email:email.toLowerCase()})
    
            if(userResponse){
                return res.status(200).json({ errMsg: 'User with this email already exists' });
            }else{
                const newUser = new User({
                    email: email,
                    username: username,
                    password,
                })

                // Hash password
                const salt = await bcrypt.genSalt(10);
                const hash = await bcrypt.hash(newUser.password, salt);
                newUser.password = hash;

                // Save user
                await newUser.save();
                res.status(200).json({ successMsg: 'User Registered Successfully, Please Wait.' });

            }
        }        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ errMsg: 'Server error' });        
    }
    
}
//---------------

//POST sign in---------
module.exports.signin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Check required fields
        if (!email || !password) {
            return res.status(200).json({ errMsg: 'Please enter both email and password' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(200).json({ errMsg: 'Account does not exist' });
        }

        const isMatch = await comparePasswordWithHash(password, user.password);

        if (!isMatch) {
            return res.status(200).json({ errMsg: 'Incorrect Password!' });
        }

        const token = generateUserToken({ role: 'user', UserId: user._id });

        return res.status(200).json({ successMsg: 'Login successful, please wait', token });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ errMsg: 'Server error' });
    }
};

const comparePasswordWithHash = async (password, hashedPassword) => {
    return bcrypt.compare(password, hashedPassword);
};

const generateUserToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });
};
//---------------


//GET non-users link data 
module.exports.getSubmitUrl = async (req, res, next) => {
    try {
        // Get client IP with better fallback handling
        const ipList = req.headers['x-forwarded-for'] || 
                      req.headers['x-real-ip'] || 
                      req.connection.remoteAddress || 
                      '127.0.0.1';
        const ips = ipList.split(',');
        const clientIP = ips[0].trim(); 
        
        // Find links created by this IP
        const freeLinkModel = await freelinkModel.find({ userIP: clientIP });
        
        // constants
        const MAX_BATCH_SIZE = 3; 
        const MAX_FREE_LINKS = 3;
        const FAVICON_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; 
        
        /**
         * Check link status 
         * @param {string} url - URL to check
         * @returns {string} - Status of the link
         */
        async function checkLinkStatus(url) {
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'https://' + url;
            }
            
            try {
                const response = await axios.head(url, { 
                    timeout: 5000,
                    maxRedirects: 5,
                    validateStatus: status => status < 400,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 LinkChecker/1.0'
                    }
                });
                
                return 'Active';
            } catch (headError) {
                // If HEAD request fails, try GET as fallback
                if (headError.response?.status === 405 || 
                    headError.code === 'ECONNABORTED' ||  
                    headError.code === 'ERR_BAD_REQUEST') {
                    
                    try {
                        const response = await axios.get(url, { 
                            timeout: 5000,
                            maxRedirects: 5,
                            validateStatus: status => status < 400,
                            headers: {
                                'User-Agent': 'Mozilla/5.0 LinkChecker/1.0'
                            }
                        });
                        
                        return 'Active';
                    } catch (getError) {
                        // Handle rate limiting
                        if (getError.response?.status === 429) {
                            await new Promise(resolve => setTimeout(resolve, 5000));
                            try {
                                await axios.get(url, { 
                                    timeout: 10000,
                                    maxRedirects: 5,
                                    headers: {
                                        'User-Agent': 'Mozilla/5.0 LinkChecker/1.0'
                                    }
                                });
                                return 'Active';
                            } catch (retryError) {
                                return 'Rate Limited';
                            }
                        }
                        
                        if (getError.response) {
                            const status = getError.response.status;
                            if (status === 404) return 'Not Found';
                            if (status >= 500) return 'Server Error';
                            if (status === 403 || status === 401) return 'Restricted';
                        }
                        
                        if (getError.code === 'ENOTFOUND') return 'Domain Not Found';
                        if (getError.code === 'ECONNREFUSED') return 'Connection Refused';
                        if (getError.code === 'ETIMEDOUT') return 'Timeout';
                        
                        return 'Inactive';
                    }
                }
                
                // Handle rate limiting for HEAD requests
                if (headError.response?.status === 429) {
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    return checkLinkStatus(url); 
                }
                
                // Classify other HEAD errors
                if (headError.response) {
                    const status = headError.response.status;
                    if (status === 404) return 'Not Found';
                    if (status >= 500) return 'Server Error';
                    if (status === 403 || status === 401) return 'Restricted';
                }
                
                if (headError.code === 'ENOTFOUND') return 'Domain Not Found';
                if (headError.code === 'ECONNREFUSED') return 'Connection Refused';
                if (headError.code === 'ETIMEDOUT') return 'Timeout';
                
                return 'Inactive';
            }
        }
        
        /**
         * Extract base URL for favicon fetching
         * @param {string} url - URL to extract base from
         * @returns {string} - Base URL
         */
        function extractBaseUrl(url) {
            try {
                if (!url.startsWith('http://') && !url.startsWith('https://')) {
                    url = 'https://' + url;
                }
                
                const urlObj = new URL(url);
                return `${urlObj.protocol}//${urlObj.hostname}`;
            } catch (error) {
                console.error('Error extracting base URL:', error.message);
                return url; 
            }
        }
        
        /**
         * Fetch favicon with improved error handling
         * @param {string} url - URL to fetch favicon for
         * @returns {Object} - Favicon data
         */
        async function fetchFavicon(url, link) {
            try {
                // Check if we have a cached favicon and it's not too old
                if (link.favicon && link.faviconLastChecked) {
                    const lastChecked = new Date(link.faviconLastChecked);
                    if ((new Date() - lastChecked) < FAVICON_CACHE_DURATION) {
                        return link.favicon; // Use cached favicon
                    }
                }
                
                const { default: fetch } = await import('node-fetch');
                const filteredFaviconLink = extractBaseUrl(url);
                
                // Try multiple favicon locations
                const faviconUrls = [
                    `${filteredFaviconLink}/favicon.ico`,
                    `${filteredFaviconLink}/favicon.png`,
                    `${filteredFaviconLink}/apple-touch-icon.png`,
                ];
                
                // Try each potential favicon URL
                for (const faviconUrl of faviconUrls) {
                    try {
                        const faviconResponse = await fetch(faviconUrl, {
                            timeout: 3000,
                            headers: {
                                'User-Agent': 'Mozilla/5.0 FaviconFetcher/1.0'
                            }
                        });
                        
                        if (faviconResponse.ok) {
                            const blob = await faviconResponse.blob();
                            const buffer = await blob.arrayBuffer();
                            const imageBuffer = Buffer.from(buffer);
                            
                            // Only store if it's a reasonable size (< 50KB)
                            if (imageBuffer.length < 50 * 1024) {
                                const imageBase64 = imageBuffer.toString('base64');
                                
                                // Update favicon in database
                                await freelinkModel.updateOne(
                                    { _id: link._id },
                                    { 
                                        $set: { 
                                            favicon: { url, image: imageBase64 },
                                            faviconLastChecked: new Date()
                                        } 
                                    }
                                ).catch(err => console.error('Error updating favicon:', err.message));
                                
                                return { url, image: imageBase64 };
                            }
                        }
                    } catch (innerError) {
                        // Continue to next favicon URL on error
                        continue;
                    }
                }
                
                // If we get here, no favicon was found
                return { url, image: null };
            } catch (error) {
                console.error('Error fetching favicon:', error.message);
                return { url, image: null };
            }
        }
        
        // Process links in batches to avoid overwhelming resources
        const processedLinks = [];
        
        for (let i = 0; i < freeLinkModel.length; i += MAX_BATCH_SIZE) {
            const batch = freeLinkModel.slice(i, i + MAX_BATCH_SIZE);
            
            const batchPromises = batch.map(async (link) => {
                // Check if link status needs updating (older than 24 hours)
                let status = link.status;
                if (!link.lastStatusCheck || (new Date() - new Date(link.lastStatusCheck) > 24 * 60 * 60 * 1000)) {
                    status = await checkLinkStatus(link.UrlFromUser);
                    
                    // Update status in database (don't await to speed up response)
                    freelinkModel.updateOne(
                        { _id: link._id },
                        { $set: { status, lastStatusCheck: new Date() } }
                    ).catch(err => console.error('Error updating link status in MongoDB:', err.message));
                }
                
                // Fetch favicon
                const favicon = await fetchFavicon(link.UrlFromUser, link);
                
                // Return link with status and favicon
                return { 
                    ...link.toObject(),
                    status,
                    favicon
                };
            });
            
            // Wait for current batch to complete
            const batchResults = await Promise.all(batchPromises);
            processedLinks.push(...batchResults);
        }
        
        // Calculate remaining links
        const linksRemaining = Math.max(0, MAX_FREE_LINKS - freeLinkModel.length);
        
        // Return response
        return res.status(200).json({ 
            userLinks: processedLinks, 
            linksRemaining: linksRemaining
        });
        
    } catch (error) {
        console.error('Error in getSubmitUrl:', error);
        return res.status(500).json({ 
            errMsg: 'Server error processing link data',
            error: process.env.NODE_ENV === 'production' ? null : error.message
        });
    }
};

//---------------

//POST link shorterner for non users---------
module.exports.freeSubmitUrl = async (req, res, next) => {
    try {
        const ipList = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const ips = ipList.split(',');
        const clientIP = ips[0].trim(); 

        const { UrlFromUser } = req.body;

        const baseUrl = process.env.SERVER_BASEURL

        //check for empty url
        if(!UrlFromUser){
            return res.status(200).json({errMsg: 'Input URL'});
        } 
        // Check base url
        if (!validUrl.isUri(baseUrl)) {
            return res.status(200).json({errMsg: 'Invalid base URL'});
        }
        //check user url
        if (!validUrl.isUri(UrlFromUser)) {
            return res.status(200).json({errMsg: 'Invalid URL'});
        }

        const freeLinkModel = await freelinkModel.find({userIP: clientIP})

        //checks if user has used up all free links
        if(freeLinkModel.length <= 2){
            // generate short url 
            const urlCode = shortid.generate();
            const shortUrl = baseUrl + '/b/' + urlCode;

            //cfreate and save new data
            const newurl = new freelinkModel({
                UrlFromUser,
                userIP: clientIP,
                shortUrl,
                urlCode,
                clicks: 0,
                status: 'Active',
                date: new Date()
            });

            await newurl.save();

            res.status(200).json({successMsg: 'Link shortened successfully', linksRemaining: Number(3) - Number(freeLinkModel.length)});
        }else{    
            return res.status(200).json({errMsg: 'You can create 0 more links', linksRemaining: 0});
        }
    } catch (error) {
        console.log(error)
    }

}

function extractBaseUrl(fullUrl) {
    const parsedUrl = new URL(fullUrl);
    return `${parsedUrl.protocol}//${parsedUrl.host}`;
}
//---------------

//GET url handling and redirection for non-users
module.exports.getuRLnonUser = async (req, res, next) => {

    const linkCode = req.params.nonuserurlcode;
    
    try {
        const linkData = await freelinkModel.findOne({ urlCode: linkCode });
        
        //update link counter and send data
        if (linkData) {
            //increament clicks
            linkData.clicks += 1

            await linkData.save();

            res.redirect(`${linkData.UrlFromUser}`)

        } else {
            return res.status(200).json({errMsg: 'Link not found'});
        }
    } catch (err) {
        return res.status(500).json({errMsg: 'Internal Server Error'});
    }
}
//---------------

//GET user dashboard data---------
module.exports.userdash = async (req, res, next) => {
    try {
      const userInfo = await User.findOne({ _id: req.id });
      const userLinks = await Url.find({ userEmail: userInfo.email });
  
  
      // Function to check the status of a link
      async function checkLinkStatus(url) {
          try {
            const response = await axios.head(url, { timeout: 5000 });
            return response.status === 200 ? 'Active' : 'Inactive';
          } catch (error) {
            console.error('Error checking link status:', error.message);
            return 'Error checking link status';
          }
      }
  
      // Function to update link status
      const updateLinkStatus = await Promise.all(
          userLinks.map(async (link) => {
              try {
                  const status = await checkLinkStatus(link.UrlFromUser);
  
                  // Update the link status in MongoDB
                  await Url.updateOne({ _id: link._id }, { $set: { status } });
              } catch (error) {
                   console.error('Error updating link status in MongoDB:', error.message);
              }
  
          })
      );
  
      //function to fetch favicon for URL
      async function fetchFavicon(url) {
        const { default: fetch } = await import('node-fetch'); 
        const filteredFaviconLink = extractBaseUrl(url);
        const faviconUrl = `${filteredFaviconLink}/favicon.ico`;
        const faviconResponse = await fetch(faviconUrl);
  
        if (faviconResponse.ok) {
          const blob = await faviconResponse.blob();
          const buffer = await blob.arrayBuffer();
          const imageBuffer = Buffer.from(buffer);
          const imageBase64 = imageBuffer.toString('base64');
  
          return { url, image: imageBase64 };
        } else {
          return { url, image: null }; // Favicon not found
        }
      }
  
      // Fetch favicon for each link in userLinks
      const userLinksWithFavicons = await Promise.all(
        userLinks.map(async (link) => {
          const favicon = await fetchFavicon(link.UrlFromUser);
          return { ...link.toObject(), favicon };
        })
      );
  
      return res.status(200).json({ userInfo, userLinks: userLinksWithFavicons });
    } catch (error) {
        console.error(error);
        res.status(500).json({ errMsg: 'Server error' });
    }
  };


//POST link shorterner for users---------
module.exports.submitUrl = async (req, res, next) => {

    try {
        const { UrlFromUser } = req.body;
        
        const baseUrl = process.env.SERVER_BASEURL

        //check for empty url
        if(!UrlFromUser){
            return res.status(200).json({errMsg: 'Input URL'});
        } 
        // Check base url
        if (!validUrl.isUri(baseUrl)) {
            return res.status(200).json({errMsg: 'Invalid base URL'});
        }
        //check user url
        if (!validUrl.isUri(UrlFromUser)) {
            return res.status(200).json({errMsg: 'Invalid URL'});
        }
       
        //get user id and email
        const userInfo = await User.findOne({_id: req.id})

        const url = await Url.find({ UrlFromUser });

        //if links exists in db
        if (url.length !== 0) {

            const allUserLinks = await Url.find({userEmail: userInfo.email })   
            
            const responseData = {
                url: allUserLinks,
            };

            res.send(responseData);    
                
        } else {
            // generate short url 
            const urlCode = shortid.generate();
            const shortUrl = baseUrl + '/a/' + urlCode;

            //get user id and email
            const userInfo = await User.findOne({_id: req.id})

            const newurl = new Url({
                UrlFromUser,
                userEmail: userInfo.email,
                shortUrl,
                urlCode,
                clicks: 0,
                status: 'Active',
                date: new Date()
            });

            await newurl.save();

            const allurl = await Url.find({ userEmail: userInfo.email });
    
            const responseData = {
                url: allurl,
                successMsg: 'Link shortened successfully'
            };
            res.send(responseData);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({errMsg: 'Server error'});
    }

};
//---------------


//GET url handling and redirection for users
module.exports.getuRL = async (req, res, next) => {

    const linkCode = req.params.urlcode;

    try {
        const linkData = await Url.findOne({ urlCode: linkCode });
        
        //update link counter and send data
        if (linkData) {
            //increament clicks
            linkData.clicks += 1

            await linkData.save();

            res.redirect(`${linkData.UrlFromUser}`)

        } else {
            return res.status(200).json({errMsg: 'Link not found'});
        }
    } catch (err) {
        return res.status(500).json({errMsg: 'Internal Server Error'});
    }
}
//---------------


