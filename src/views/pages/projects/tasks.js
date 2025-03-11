import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import axios from 'axios';
import {
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CFormSelect,
  CButton, // Import CButton for buttons
  CForm,
  CFormLabel,
  CFormInput,
  CFormTextarea,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CRow,
  CCol,
  CProgress,
  CProgressBar,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { freeSet } from '@coreui/icons';
import DatePicker from 'react-datepicker'; // Importing react-datepicker
import "react-datepicker/dist/react-datepicker.css"; // Importing the CSS for styling
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';


const TasksProj = () => {
  const { projectId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [visible, setVisible] = useState(false); // To control the modal visibility
  const [visible2, setVisible2] = useState(false); // To control the modal visibility
  const [selectedTask, setSelectedTask] = useState(null); // To store selected project details
  const [selectedTaskView, setSelectedTaskView] = useState(null); // To store selected project details

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState(new Date()); // Initialize with a valid date
  const [taskIdToUpdate, setTaskIdToUpdate] = useState(null); // For tracking which task to update
  const [showTaskDropdown, setShowTaskDropdown] = useState(false);
  const [selectedTaskToAdd, setSelectedTaskToAdd] = useState(false);
  const [tasksDropDown, setTasksDropDown] = useState([]);
  const [progress, setProgress] = useState([]);

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
  


  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(`http://localhost:2001/projects/projects/${projectId}/tasks`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        });
        console.log('Fetched Tasks:', response.data);
        setTasks(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error fetching tasks:', error.response?.data || error.message);
        setTasks([]);
      }
    };
    fetchTasks();
  }, []);

  const getRowColor = (task) => {
    if (!task.deadline) return '';
    const currentDate = new Date();
    const deadlineDate = new Date(task.deadline);
    const timeDifference = deadlineDate - currentDate;
    const twoDaysInMilliseconds = 2 * 24 * 60 * 60 * 1000;

    if (['in-progress', 'pending'].includes(task.status) && timeDifference <= twoDaysInMilliseconds) {
      return 'danger';
    }
    if (task.status === 'completed') return 'success';
    if (task.status === 'pending') return 'warning';
    if (task.status === 'in-progress') return 'info';
    return '';
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const response = await axios.put(
        `http://localhost:2001/tasks/update/${taskId}`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        }
      );
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task._id === taskId ? { ...task, status: newStatus } : task))
      );
      handleProgress();
      console.log('Task status updated:', response.data);
    } catch (error) {
      console.error('Error updating status:', error.response?.data || error.message);
    }
  };

  const handleDelete = async (taskId) => {
    try {
      const response = await axios.post(
        `http://localhost:2001/projects/projects/${projectId}/remove-task`,
        {
          taskId, // Sending taskId in the request body
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
      console.log('Task deleted:', response.data);
    } catch (error) {
      console.error('Error deleting task:', error.response?.data || error.message);
    }
  };
  

  const handleUpdate = async (taskId) => {
    const taskToEdit = tasks.find((task) => task._id === taskId);
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description);
      setDeadline(new Date(taskToEdit.deadline));
      setTaskIdToUpdate(taskId);
      setVisible(true); // Show modal for updating
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedTask = {
        title,
        description,
        deadline: deadline.toISOString(),
      };

      const response = await axios.put(
        `http://localhost:2001/tasks/update/${taskIdToUpdate}`,
        updatedTask,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        }
      );

      console.log('Task updated:', response.data);
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task._id === taskIdToUpdate ? { ...task, ...updatedTask } : task))
      );
      setVisible(false); // Close modal
      handleProgress();
    } catch (error) {
      console.error('Error updating task:', error.response?.data || error.message);
    }
  };
  const handleView = (task) => {
    setSelectedTaskView(task); // Set the project details in the state
    setVisible2(true); // Show the modal
  };
  const fetchTasks = async () => {
    try {
      // Step 1: Fetch all tasks
      const response = await axios.get('http://localhost:2001/tasks/all', {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
      });
      console.log('Fetched Tasks:', response.data);
  
      // Step 2: Fetch tasks assigned to the current project
      const projectResponse = await axios.get(`http://localhost:2001/projects/projects/${projectId}/tasks`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
      });
      console.log('Tasks for Current Project:', projectResponse.data);
  
      // Step 3: Get the task IDs that are already assigned to the current project
      const existingTaskIds = projectResponse.data.map(task => task._id); // Use _id here instead of id
  
      // Step 4: Filter the tasks to exclude those already assigned to this or other projects
      const filteredTasks = response.data.filter(task => !existingTaskIds.includes(task._id)); // Use _id here as well
  
      console.log('Filtered Tasks:', filteredTasks);
  
      // Step 5: Set the filtered tasks for the dropdown
      setTasksDropDown(filteredTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error.response?.data || error.message);
      setTasksDropDown([]); // Ensure tasks are an empty array on error
    }
  };
  

useEffect(() => {
  handleProgress();
  fetchTasks();
}, [projectId]); // Only re-fetch if the projectId changes

const handleAddTaskToProject = async () => {
  if (!selectedTaskToAdd) {
    alert("Please select a task first.");
    return;
  }

  try {
    const response = await axios.post(
      `http://localhost:2001/projects/projects/${projectId}/add-task`,
      { taskId: selectedTaskToAdd },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
      }
    );
    console.log("Task added successfully:", response.data);
    alert("Task added successfully!");
    handleProgress();
  } catch (error) {
    console.error("Error adding task to project:", error.response?.data || error.message);
    alert("Error adding task to project");
  }
};
const handleProgress = async () => {
  try {
    const response = await axios.get(
      `http://localhost:2001/projects/${projectId}/completion-percentage`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
      }

     
    );
    const updatedPregress = await axios.put(
      `http://localhost:2001/projects/update/${projectId}`,
      { progress: response.data.percentage }, // Send updated progress
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
      }
    );
    console.log("Progress updated successfully:", updatedPregress.data);

    console.log("progress counted successfully:", response.data);
    setProgress(response.data);
  } catch (error) {
    console.error("Error counting progress for project:", error.response?.data || error.message);

  }
};

  return (
    <>
         <CRow className="mb-3">
        <CCol xs={12} className="d-flex justify-content-end">
          <CButton
            color="primary"
            variant="outline"
            shape="rounded-pill"
            onClick={() => setShowTaskDropdown(!showTaskDropdown)}
          >
            <CIcon icon={freeSet.cilPlus} size="lg" />
          </CButton>
        </CCol>
      </CRow>

      {showTaskDropdown && (
        <CRow className="mb-3">
          <CCol xs={12}>
            <CFormSelect
              aria-label="Select tasks to add"
              value={selectedTaskToAdd}
              onChange={(e) => setSelectedTaskToAdd(e.target.value)} // Properly manage selected task
            >
              <option value="">Select a task</option>
              {tasksDropDown.map((task) => (
                <option key={task._id} value={task._id}>
                  {task.title}
                </option>
              ))}
            </CFormSelect>
            <CButton
              color="success"
              className="mt-2"
              onClick={handleAddTaskToProject}
            >
              Add Task
            </CButton>
          </CCol>
        </CRow>
      )}
            <CProgress className="mb-3">
                <CProgressBar color="info" variant="striped" animated value={progress.percentage} />
              </CProgress>

      <CTable>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell scope="col">Title</CTableHeaderCell>
            <CTableHeaderCell scope="col">Status</CTableHeaderCell>
            <CTableHeaderCell scope="col">Deadline</CTableHeaderCell>
            <CTableHeaderCell scope="col">Actions</CTableHeaderCell> {/* New column */}
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {tasks.length === 0 ? (
            <CTableRow>
              <CTableDataCell colSpan="5">No tasks available</CTableDataCell>
            </CTableRow>
          ) : (
            tasks.map((task) => (
              <CTableRow key={task._id.toString()} color={getRowColor(task)}>
                <CTableDataCell>{task.title || 'No Title'}</CTableDataCell>
                <CTableDataCell>
                  <CFormSelect
                    value={task.status}
                    onChange={(e) => handleStatusChange(task._id, e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </CFormSelect>
                </CTableDataCell>
                <CTableDataCell>
                  {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No Deadline'}
                </CTableDataCell>
                <CTableDataCell>
                  <CButton
                                      className="btn-view"
                                      color="info"
                                      variant="outline"
                                      shape="rounded-pill"
                                      onClick={() => handleView(task)} // Trigger modal
                                      style={{ marginLeft: '10px', marginRight: '10px', marginTop: '10px' }}
                                    >
                  <CIcon icon={freeSet.cilSearch} size="lg" /> </CButton>
                  <CButton
                    className="btn-consulter"
                    color="primary"
                    variant="outline"
                    shape="rounded-pill"
                    style={{ marginLeft: '10px', marginRight: '10px', marginTop: '10px' }}
                    onClick={() => handleUpdate(task._id)} // Open the update modal
                  >
                    <CIcon icon={freeSet.cilPen} size="lg" />
                  </CButton>
                  <CButton
                    className="btn-consulter"
                    color="danger"
                    variant="outline"
                    shape="rounded-pill"
                    onClick={() => handleDelete(task._id)}
                    style={{ marginTop: '10px' }}
                  >
                    <CIcon icon={freeSet.cilTrash} size="lg" />
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))
          )}
        </CTableBody>
      </CTable>

      {/* Update Task Modal */}
      <CModal alignment="center" visible={visible} onClose={() => setVisible(false)}>
        <CModalHeader>
          <CModalTitle>Update Task</CModalTitle>
        </CModalHeader>
        <CModalBody>
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
                    selected={deadline} // Make sure the date is in a Date object format
                    onChange={(date) => setDeadline(date)} // Set the selected date
                    dateFormat="MMMM d, yyyy" // Optional: You can customize the date format
                    placeholderText="Select a deadline"
                    locale="en-US" // Optional: locale for date formatting
                  />
                </CCol>
              </CRow>
            </div>
            <CButton type="submit">Update Task</CButton>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>

      
{/* View Task Modal */}
<CModal alignment="center" visible={visible2} onClose={() => setVisible2(false)}>
  <CModalHeader>
    <CModalTitle>Task Details</CModalTitle>
  </CModalHeader>
  <CModalBody>
    {selectedTaskView ? (
      <>
        <p><strong>Title:</strong> {selectedTaskView.title}</p>
        <p><strong>Description:</strong> {selectedTaskView.description}</p>
        <p><strong>Deadline:</strong> {selectedTaskView.deadline ? new Date(selectedTaskView.deadline).toLocaleDateString() : 'No Deadline'}</p>
        <p><strong>Status:</strong> {selectedTaskView.status}</p>
      </>
    ) : (
      <p>No task selected.</p>
    )}
  </CModalBody>
  <CModalFooter>
    <CButton color="secondary" onClick={() => setVisible2(false)}>Close</CButton>
  </CModalFooter>
</CModal>

    </>
  );
};

export default TasksProj;
