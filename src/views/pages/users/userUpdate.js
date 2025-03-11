import React, { useState, useEffect } from 'react';
import { CForm, CFormInput, CButton } from '@coreui/react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom' ;
import io from 'socket.io-client';


const ProfileUpdate = () => {
  const navigate = useNavigate();
  const server = "http://localhost:2001"; 
  
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const socket = io(server, {
    cors: {
      origin: "http://localhost:3000", 
      methods: ["GET", "POST"]
    }
  });
  const [userData, setUserData] = useState({
    email: '',
    password: '', 
  });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:2001/profile/profile', {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        });
        setUserData({
          email: response.data.email,
          password: '',
        });
      } catch (err) {
        setError('Failed to load user data');
      }
    };
    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put('http://localhost:2001/profile/update', userData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      setSuccessMessage('Profile updated successfully');
      setError(null);
    } catch (err) {
      setError('Error updating profile');
      setSuccessMessage('');
    }
  };

  const handleDelete = async () => {
    const isConfirmed = window.confirm('Are you sure you want to delete your profile? This action cannot be undone.');

    if (isConfirmed) {
      try {
        await axios.delete('http://localhost:2001/profile/delete', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        });
        setSuccessMessage('Profile deleted successfully');
        setError(null);
        localStorage.removeItem('authToken');
        navigate('/login') 
        } catch (err) {
        setError('Error deleting profile');
        setSuccessMessage('');
      }
    }
  };

  return (
    <div className="container mt-5">
      <h2>Update Profile</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      <CForm onSubmit={handleSubmit}>
        <CFormInput
          type="email"
          size="lg"
          placeholder="Email"
          aria-label="Email"
          name="email"
          value={userData.email}
          onChange={handleChange}
        />
        <CFormInput
          type="password"
          size="lg"
          placeholder="Password"
          aria-label="Password"
          name="password"
          value={userData.password}
          onChange={handleChange}
        />
        <CButton color="primary" size="lg" type="submit">
          Update Profile
        </CButton>
      </CForm>
      <CButton color="danger" size="lg" onClick={handleDelete} className="mt-3">
        Delete Profile
      </CButton>
    </div>
  );
};

export default ProfileUpdate;
