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
    res.status(200).json('Welcome to linkly, human!')
}


//auth controllers---------
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

//--------------------------------------

//GET non-users link data 
function normalizeIP(ip) {
    if (ip === '::1') {
        return '127.0.0.1';
    }
    
    if (ip.startsWith('::ffff:')) {
        return ip.substring(7);
    }
    
    return ip;
}


module.exports.fetchNonUserLinkData = async (req, res, next) => {
    try {
        if (!req.session.visitorId) {
            req.session.visitorId = require('shortid').generate();
        }
        
        const visitorId = req.session.visitorId;
        
        const ipList = req.headers['x-forwarded-for'] || 
                      req.headers['x-real-ip'] || 
                      req.connection.remoteAddress || 
                      '127.0.0.1';
        const rawIP = ipList.split(',')[0].trim();
        const clientIP = normalizeIP(rawIP);
        
        let userLinks = [];
        
        userLinks = await freelinkModel.find({ visitorId });
        
        if (userLinks.length === 0) {
            const possibleIPFormats = [
                clientIP,
                rawIP,
                `::ffff:${clientIP}`,
                `::ffff:${rawIP}`
            ];
            
            userLinks = await freelinkModel.find({
                userIP: { $in: possibleIPFormats }
            });
            
            if (userLinks.length === 0) {
                userLinks = await freelinkModel.find({
                    userIP: { $regex: clientIP.replace(/\./g, '\\.') }
                });
            }
            
            if (userLinks.length > 0) {
                const updatePromises = userLinks.map(link => 
                    freelinkModel.updateOne(
                        { _id: link._id },
                        { $set: { visitorId } }
                    )
                );
                
                await Promise.all(updatePromises);
            }
        }
        
        const MAX_FREE_LINKS = 3;
        const FAVICON_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000;
        
        const DEFAULT_FAVICON = {
            image: 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEwAACxMBAJqcGAAAAWVJREFUOI2tk7FrwkAUxr97iYkdSiFdHBwKGZzETXBwdnDwP3Bz6tQ/wsFR6NjFsVPnQHBydXMQMnUQSiFDhmtu6BBiNCbn8L7l3ffu++7dHSGE4D+PvFfsdDohx3G+HccZ2bZtCSFeNE17zOfzb8/zvtM0ZVrrR8dxfHRPpVLper1+TJJkEMfxcL1e92u12nscx8MwDAdRFI3CMPw4n887AM+3QC6Xi2+a5jTLsp7rusfD4fBeLBYbjuO82rb9ZhjG1HXdvWVZz6ZpTkej0b7RaIw1TXvUdf3JMIzper3uW5Y1KRQKEwA/Gr0m79PpdBbHMZRSUEqRZdlix3HwvWw220opQYiBEAJKKUzTnAVBgCAIIKXEZrM52rb9ViqVXpRSMMb6JEnQ7XaXa+UNvu+P4zh+OZ1Oh/P5/FGv13dKqbZSqi2EaO33e9RqtR2AZ8bYG2NsyfO8sSzLnwBwr7fQdd0v1tgfsE+WZT90OL+Z9X8BhD/7BpTLYR4wK6lhAAAAAElFTkSuQmCC',
            mimeType: 'image/png'
        };
        
        // Early return if no links found
        if (userLinks.length === 0) {
            return res.status(200).json({ 
                userLinks: [], 
                linksRemaining: MAX_FREE_LINKS 
            });
        }
        
        // Extract base URL function
        function extractBaseUrl(url) {
            try {
                if (!url.startsWith('http://') && !url.startsWith('https://')) {
                    url = 'https://' + url;
                }
                
                const urlObj = new URL(url);
                return `${urlObj.protocol}//${urlObj.hostname}`;
            } catch (error) {
                return url; 
            }
        }
        
        // Improved fetchFavicon function with content-type validation
        async function fetchFavicon(url, link) {
            try {
                // Use cached favicon if available and not expired
                if (link.favicon && link.favicon.image && link.faviconLastChecked) {
                    const lastChecked = new Date(link.faviconLastChecked);
                    if ((new Date() - lastChecked) < FAVICON_CACHE_DURATION) {
                        return link.favicon; 
                    }
                }
                
                const nodeFetch = await import('node-fetch');
                const fetch = nodeFetch.default;
                const filteredFaviconLink = extractBaseUrl(url);
                
                const faviconUrls = [
                    `${filteredFaviconLink}/favicon.ico`,
                    `${filteredFaviconLink}/favicon.png`,
                    `${filteredFaviconLink}/apple-touch-icon.png`,
                ];
                
                for (const faviconUrl of faviconUrls) {
                    try {
                        const faviconResponse = await fetch(faviconUrl, {
                            timeout: 3000,
                            headers: {
                                'User-Agent': 'Mozilla/5.0 FaviconFetcher/1.0'
                            }
                        });
                        
                        if (faviconResponse.ok) {
                            // Check content type to ensure it's really an image
                            const contentType = faviconResponse.headers.get('content-type') || '';
                            if (!contentType.includes('image')) {
                                continue; 
                            }
                            
                            // Get the binary data
                            const buffer = await faviconResponse.buffer();
                            
                            // Validate that this is actually an image file (check for HTML content)
                            const firstBytes = buffer.toString('ascii', 0, 20).toLowerCase();
                            if (firstBytes.includes('<!doctype') || 
                                firstBytes.includes('<html') || 
                                firstBytes.includes('<?xml')) {
                                continue;
                            }
                            
                            // Only store if it's (< 50KB)
                            if (buffer.length < 50 * 1024) {
                                const imageBase64 = buffer.toString('base64');
                                
                                const faviconData = { 
                                    url, 
                                    image: imageBase64,
                                    mimeType: contentType
                                };
                                
                                // Update favicon in database
                                await freelinkModel.updateOne(
                                    { _id: link._id },
                                    { 
                                        $set: { 
                                            favicon: faviconData,
                                            faviconLastChecked: new Date()
                                        } 
                                    }
                                ).catch(() => {});
                                
                                return faviconData;
                            }
                        }
                    } catch (innerError) {
                        continue;
                    }
                }
                return { ...DEFAULT_FAVICON, url };
            } catch (error) {
                return { ...DEFAULT_FAVICON, url };
            }
        }
        
        // Process links to add favicons
        const processedLinks = await Promise.all(userLinks.map(async (link) => {
            try {
                const favicon = await fetchFavicon(link.UrlFromUser, link);
                return { 
                    ...link.toObject(),
                    favicon
                };
            } catch (error) {
                // Use default favicon on error
                return {
                    ...link.toObject(),
                    favicon: { ...DEFAULT_FAVICON, url: link.UrlFromUser }
                };
            }
        }));
        
        const linksRemaining = Math.max(0, MAX_FREE_LINKS - userLinks.length);
        
        return res.status(200).json({ 
            userLinks: processedLinks, 
            linksRemaining: linksRemaining
        });
        
    } catch (error) {
        return res.status(500).json({ 
            errMsg: 'Server error processing link data',
            error: process.env.NODE_ENV === 'production' ? null : error.message
        });
    }
};


module.exports.shortenLinkForNonUser = async (req, res, next) => {
    try {
        if (!req.session.visitorId) {
            req.session.visitorId = require('shortid').generate();
        }
        
        const visitorId = req.session.visitorId;
        
        const ipList = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const rawIP = ipList.split(',')[0].trim();
        const clientIP = normalizeIP(rawIP); 

        const { UrlFromUser } = req.body;
        const baseUrl = process.env.SERVER_BASEURL;

        if(!UrlFromUser){
            return res.status(200).json({errMsg: 'Input URL'});
        } 
        if (!validUrl.isUri(baseUrl)) {
            return res.status(200).json({errMsg: 'Invalid base URL'});
        }
        if (!validUrl.isUri(UrlFromUser)) {
            return res.status(200).json({errMsg: 'Invalid URL'});
        }

        const existingLinks = await freelinkModel.find({ visitorId });

        if(existingLinks.length <= 2){
            const urlCode = shortid.generate();
            const shortUrl = baseUrl + '/b/' + urlCode;

            const newurl = new freelinkModel({
                UrlFromUser,
                userIP: clientIP, 
                visitorId, 
                shortUrl,
                urlCode,
                clicks: 0,
                status: 'Active',
                date: new Date()
            });

            await newurl.save();

            res.status(200).json({
                successMsg: 'Link shortened successfully',
                shortUrl, 
                linksRemaining: Number(3) - Number(existingLinks.length) - 1 
            });
        } else {    
            return res.status(200).json({
                errMsg: 'You can create 0 more links', 
                linksRemaining: 0
            });
        }
    } catch (error) {
        console.error('Error shortening URL:', error);
        res.status(500).json({errMsg: 'Server error, please try again'});
    }
};


module.exports.redirectNonUserShortenedUrl = async (req, res, next) => {
    const linkCode = req.params.nonuserurlcode;

    try {
        const linkData = await freelinkModel.findOne({ urlCode: linkCode });
        
        if (linkData) {
            if (req.session && req.session.visitorId) {
                console.log(req.session)
            }
            
            linkData.clicks += 1;
            await linkData.save();
            res.redirect(`${linkData.UrlFromUser}`);
        } else {
            return res.status(200).json({errMsg: 'Link not found'});
        }
    } catch (err) {
        console.error('Error in redirect:', err);
        return res.status(500).json({errMsg: 'Internal Server Error'});
    }
};
//-----------------------













//GET user dashboard data---------
function extractBaseUrl(fullUrl) {
    const parsedUrl = new URL(fullUrl);
    return `${parsedUrl.protocol}//${parsedUrl.host}`;
}

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


