import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import axios from 'axios';
import {
  CForm,
  CFormLabel,
  CFormInput,
  CFormTextarea,
  CButton,
  CRow,
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
} from '@coreui/react';
import DatePicker from 'react-datepicker'; // Importing react-datepicker
import "react-datepicker/dist/react-datepicker.css"; // Importing the CSS for styling
import io from 'socket.io-client';

const CreateProject = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Stored Token:", localStorage.getItem("authToken"));
    
    try {
      const response = await axios.post(
        'http://localhost:2001/projects/new',
        {
          name,
          description,
          deadline,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );
      setSuccess('Project created successfully');
      setName('');
      setDescription('');
      setDeadline('');
    } catch (error) {
      console.error("Error creating project:", error.response?.data || error.message);
      setError('Error creating project');
    }
  };

  return (
    <div>
      <CForm onSubmit={handleSubmit}>
        <div className="mb-3">
          <CFormLabel htmlFor="title">Title</CFormLabel>
          <CFormInput
            type="text"
            id="title"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter project name"
            required
          />
        </div>
        <div className="mb-3">
          <CFormLabel htmlFor="description">project Description</CFormLabel>
          <CFormTextarea
            id="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <CFormLabel htmlFor="deadline">Deadline</CFormLabel>
          <CRow>
            <CCol lg={4}>
              <DatePicker
                id="deadline"
                selected={deadline} // Make sure the date is in a Date object format
                onChange={(date) => setDeadline(date)} // Set the selected date
                dateFormat="MMMM d, yyyy" // Optional: You can customize the date format
                placeholderText="Select a deadline"
                locale="en-US" // Optional: locale for date formatting
              />
            </CCol>
          </CRow>
        </div>
        <CButton type="submit">Create project</CButton>
      </CForm>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </div>
  );
};

export default CreateProject;
