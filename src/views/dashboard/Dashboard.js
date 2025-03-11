import React, { useState, useEffect } from "react";
import classNames from 'classnames';
import { 
  CAvatar, CButton, CButtonGroup, CCard, CCardBody, CCardFooter, 
  CCardHeader, CCol, CProgress, CRow, CTable, CTableBody, CTableDataCell, 
  CTableHead, CTableHeaderCell, CTableRow 
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import Calendar from '../plugins/calendar'; 
import MainChart from './MainChart';
import TaskProgressChart from './MainChart';
import axios from 'axios';
import io from 'socket.io-client';
import { useNavigate } from "react-router-dom"; 

const Dashboard = () => {
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

  const [topProjects, setTopProjects] = useState([]);
  const [progressData, setProgressData] = useState([]);

  // Fetch Top Projects
  useEffect(() => {
    const fetchTopProjects = async () => {
      try {
        const response = await axios.get('http://localhost:2001/projects/top-5-progressing-projects', {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        });

        setTopProjects(response.data);
      } catch (error) {
        console.error("Error fetching top projects:", error.response?.data || error.message);
      }
    };

    fetchTopProjects();
  }, []);

  // Fetch Tasks
  const fetchTasks = async () => {
    try {
      const response = await axios.get('http://localhost:2001/tasks/all', {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
      });

      if (!Array.isArray(response.data)) {
        throw new Error("Invalid response format");
      }

      // Get the start of the current week (Monday)
      const now = new Date();
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1));
      startOfWeek.setHours(0, 0, 0, 0); // Reset time to start of the day

      const groupedTasks = {
        Monday: { completed: 0, notCompleted: 0 },
        Tuesday: { completed: 0, notCompleted: 0 },
        Wednesday: { completed: 0, notCompleted: 0 },
        Thursday: { completed: 0, notCompleted: 0 },
        Friday: { completed: 0, notCompleted: 0 },
        Saturday: { completed: 0, notCompleted: 0 },
        Sunday: { completed: 0, notCompleted: 0 },
      };

      response.data.forEach((task) => {
        const isCompleted = task.status === "completed";
        const isInProgressOrPending = task.status === "pending" || task.status === "in-progress";
        const completedDate = task.completedAt ? new Date(task.completedAt) : null;
        
        if (!completedDate) {
          const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
          groupedTasks[dayName].notCompleted += 1;
          return;
        }

        completedDate.setHours(0, 0, 0, 0);
        if (completedDate >= startOfWeek) {
          const dayName = completedDate.toLocaleDateString('en-US', { weekday: 'long' });
          if (isCompleted) {
            groupedTasks[dayName].completed += 1;
          } else if (isInProgressOrPending) {
            groupedTasks[dayName].notCompleted += 1;
          }
        }
      });

      const formattedData = Object.keys(groupedTasks).map((day) => ({
        title: day,
        completed: groupedTasks[day].completed,
        notCompleted: groupedTasks[day].notCompleted,
      }));

      setProgressData(formattedData);

    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

 useEffect(() => {
  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
  });

  socket.on('tasksFetched', (tasks) => {
    console.log('Received tasks:', tasks);
    setTasks(tasks); // Update the tasks state when the event is received
  });

  return () => {
    socket.off('tasksFetched');
    socket.off('connect'); // Clean up the connection event when the component unmounts
  };
}, []);


  return (
    <>
      <CCard className="mb-4">
        <CCardBody>
          <CRow>
            <CCol sm={5}>
              <h4 id="traffic" className="card-title mb-0">Traffic</h4>
              <div className="small text-body-secondary">January - July 2025</div>
            </CCol>
          </CRow>
          <TaskProgressChart tasksData={progressData} />
          <MainChart />
        </CCardBody>
      </CCard>
      <CRow>
        <CCol xs>
          <CCard className="mb-4">
            <CCardHeader>Tasks {' & '} Projects</CCardHeader>
            <CCardBody>
              <CRow>
                <CCol xs={12} md={6} xl={6}>
                  <CRow>
                    <CCol xs={6}>
                      <div className="border-start border-start-4 border-start-info py-1 px-3">
                        <div className="text-body-secondary text-truncate small">Completed Tasks</div>
                        <div className="fs-5 fw-semibold">
                          {progressData.reduce((sum, item) => sum + item.completed, 0)}
                        </div>
                      </div>
                    </CCol>
                    <CCol xs={6}>
                      <div className="border-start border-start-4 border-start-danger py-1 px-3 mb-3">
                        <div className="text-body-secondary text-truncate small">Pending Tasks</div>
                        <div className="fs-5 fw-semibold">
                          {progressData.reduce((sum, item) => sum + item.notCompleted, 0)}
                        </div>
                      </div>
                    </CCol>
                  </CRow>

                  <hr className="mt-0" />
                  {progressData.map((item, index) => (
                    <div className="progress-group mb-4" key={index}>
                      <div className="progress-group-prepend">
                        <span className="text-body-secondary small">{item.title}</span>
                      </div>
                      <div className="progress-group-bars">
                        <CProgress thin color="info" value={item.completed} />
                        <CProgress thin color="danger" value={item.notCompleted} />
                      </div>
                    </div>
                  ))}
                </CCol>

                <CCol xs={12} md={6} xl={6}>
                  <CCol xs={6}>
                    <div className="border-start border-start-4 border-start-info py-1 px-3">
                      <div className="text-body-secondary text-truncate small">Top progressing projects</div>
                      <div className="fs-5 fw-semibold">top 5 projects</div>
                    </div>
                  </CCol>
                  {topProjects.length > 0 ? (
                    <CRow>
                      {topProjects.map((project, index) => (
                        <CCol xs={12} key={project._id}>
                          <div className="progress-group">
                            <div className="progress-group-header">
                              <CIcon className="me-2" icon="cil-task" size="lg" />
                              <span>{project.name}</span>
                              <span className="ms-auto fw-semibold">
                                {project.progress}%{' '}
                                <span className="text-body-secondary small">({project.progress}%)</span>
                              </span>
                            </div>
                            <div className="progress-group-bars">
                              <CProgress thin color="success" value={project.progress} />
                            </div>
                          </div>
                        </CCol>
                      ))}
                    </CRow>
                  ) : (
                    <p>No top progressing projects available</p>
                  )}
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>

          <br />

          <div className="calendar-section">
            <Calendar />
          </div>
        </CCol>
      </CRow>
    </>
  );
};

export default Dashboard;
