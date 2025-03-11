import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import axios from 'axios';
import io from 'socket.io-client';
import {
  CForm,
  CFormLabel,
  CFormInput,
  CFormTextarea,
  CButton,
  CRow,
  CCol,
} from '@coreui/react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";


const CreateTask = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState(null); 
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
      origin: 'http://localhost:3000', 
      methods: ['GET', 'POST'],
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Stored Token:", localStorage.getItem("authToken"));

    try {
      const response = await axios.post(
        'http://localhost:2001/tasks/new',
        {
          title,
          description,
          deadline,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );

      setSuccess('Task created successfully');
      setTitle('');
      setDescription('');
      setDeadline(null);

      // Emit event to notify other components
      socket.emit('taskCreated', response.data);  

    } catch (error) {
      console.error("Error creating task:", error.response?.data || error.message);
      setError('Error creating task');
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
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task title"
            required
          />
        </div>
        <div className="mb-3">
          <CFormLabel htmlFor="description">Task Description</CFormLabel>
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
                selected={deadline}
                onChange={(date) => setDeadline(date)}
                dateFormat="MMMM d, yyyy"
                placeholderText="Select a deadline"
                locale="en-US"
              />
            </CCol>
          </CRow>
        </div>
        <CButton type="submit">Create Task</CButton>
      </CForm>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </div>
  );
};

export default CreateTask;
