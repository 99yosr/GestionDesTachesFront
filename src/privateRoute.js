import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
    const authToken = localStorage.getItem('authToken'); // Check if token exists

    return authToken ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
