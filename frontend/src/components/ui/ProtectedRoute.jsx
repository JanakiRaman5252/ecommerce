import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import {API }from '../../api';
import { Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import Loader from './Loader';

const ProtectedRoute = ({ children }) => {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        const refreshToken = async () => {
            const refresh = localStorage.getItem('refresh');
            try {
                const res = await API.post('/token/refresh/', { refresh });
                if (res.status === 200) {
                    localStorage.setItem('access', res.data.access);
                    setIsAuthorized(true);
                } else {
                    setIsAuthorized(false);
                }
            } catch (error) {
                console.error("Error refreshing token:", error);
                setIsAuthorized(false);
            }
        };

        const auth = async () => {
            const token = localStorage.getItem('access');
            if (!token) {
                setIsAuthorized(false);
                setLoading(false);
                return;
            }
            const decoded = jwtDecode(token);
            const expiry_date = decoded.exp;
            const current_date = Math.floor(Date.now() / 1000);
            if (expiry_date < current_date) {
                await refreshToken();
            } else {
                setIsAuthorized(true);
            }
            setLoading(false);
        };

        auth();
    }, []);

    if (loading) return <Loader/>

    return isAuthorized ? children : <Navigate to="/login" state={{ from: location }} replace />;
};
ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
