import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, Navigate } from 'react-router-dom';

const UserRoutes = () => {
    const navigate = useNavigate();
    const [isChecking, setIsChecking] = useState(true);
    
    const token = sessionStorage.getItem('userInfo');
    
    useEffect(() => {
        if (!token) {
            setIsChecking(false);
            return;
        }
        
        const checkTimeout = setTimeout(() => {
            setIsChecking(false);
        }, 100);
        
        const sessionTimeout = setTimeout(() => {
            sessionStorage.clear();
            navigate('/signin', { replace: true });
        }, 1800000); 
        
        return () => {
            clearTimeout(checkTimeout);
            clearTimeout(sessionTimeout);
        };
    }, [token, navigate]);
    
    if (isChecking) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-mainbackground">
                <div className="text-white">Loading...</div>
            </div>
        );
    }
    
    if (!token) {
        return <Navigate to="/signin" replace />;
    }
    
    return <Outlet />;
};

export default UserRoutes;