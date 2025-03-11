import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CForm,
  CFormLabel,
  CFormInput,
  CFormTextarea,
  CRow,
  CCol,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { freeSet } from '@coreui/icons';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom
import io from 'socket.io-client';



const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [visible, setVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [visibleU, setVisibleU] = useState(false);
  const [projectIdToUpdate, setProjectIdToUpdate] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState(null);
  const navigate = useNavigate(); 
  const server = 'http://localhost:2001'; 


  // Redirect to login if no token
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

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('http://localhost:2001/projects/projects', {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        });
        console.log('Fetched projects:', response.data);

        setProjects(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error fetching projects:', error.response?.data || error.message);
        setProjects([]);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    // Add listener for projectsFetched
    socket.on('projectsFetched', (data) => {
      console.log('Received updated projects:', data);
      setProjects(data); // Update the state with the new data received from the server
    });

    return () => {
      socket.off('projectsFetched'); // Clean up listener on component unmount
      socket.off('connect'); // Clean up connection listener
    };
  }, []);

  const handleDelete = async (projectId) => {
    try {
      await axios.delete(`http://localhost:2001/projects/delete/${projectId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
      });
      setProjects((prevProjects) => prevProjects.filter((project) => project._id !== projectId));
    } catch (error) {
      console.error('Error deleting project:', error.response?.data || error.message);
    }
  };

  const handleUpdate = (projectId) => {
    const projectToEdit = projects.find((project) => project._id === projectId);
    if (projectToEdit) {
      setName(projectToEdit.name);
      setDescription(projectToEdit.description);
      setDeadline(projectToEdit.deadline ? new Date(projectToEdit.deadline) : null);
      setProjectIdToUpdate(projectId);
      setVisibleU(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedProject = {
        name,
        description,
        deadline: deadline ? deadline.toISOString() : null,
      };

      await axios.put(
        `http://localhost:2001/projects/update/${projectIdToUpdate}`,
        updatedProject,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        }
      );

      setProjects((prevProjects) =>
        prevProjects.map((project) =>
          project._id === projectIdToUpdate ? { ...project, ...updatedProject } : project
        )
      );

      setVisibleU(false);
    } catch (error) {
      console.error('Error updating project:', error.response?.data || error.message);
    }
  };

  const handleView = (project) => {
    setSelectedProject(project);
    setVisible(true);
  };

  // Navigate to the task list page
  const handleGoToTasks = (projectId) => {
    navigate(`/projects/${projectId}/tasks`); // Navigate to the tasks page
  };

  return (
    <>
      <CTable>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>Title</CTableHeaderCell>
            <CTableHeaderCell>Deadline</CTableHeaderCell>
            <CTableHeaderCell>Actions</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {projects.length === 0 ? (
            <CTableRow>
              <CTableDataCell colSpan="3">No projects available</CTableDataCell>
            </CTableRow>
          ) : (
            projects.map((project) => (
              <CTableRow key={project._id.toString()}>
                <CTableDataCell>{project.name || 'No name'}</CTableDataCell>
                <CTableDataCell>
                  {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No Deadline'}
                </CTableDataCell>
                <CTableDataCell>
                  <CButton color="info" variant="outline" onClick={() => handleView(project)}>
                    <CIcon icon={freeSet.cilSearch} size="lg" />
                  </CButton>
                  <CButton
                    color="primary"
                    variant="outline"
                    onClick={() => handleUpdate(project._id)}
                    style={{ marginLeft: '10px' }}
                  >
                    <CIcon icon={freeSet.cilPen} size="lg" />
                  </CButton>
                  <CButton
                    color="danger"
                    variant="outline"
                    onClick={() => handleDelete(project._id)}
                    style={{ marginLeft: '10px' }}
                  >
                    <CIcon icon={freeSet.cilTrash} size="lg" />
                  </CButton>
                  <CButton
                    color="success"
                    variant="outline"
                    onClick={() => handleGoToTasks(project._id)} // Navigate to task list
                    style={{ marginLeft: '10px' }}
                  >
                    <CIcon icon={freeSet.cilList} size="lg" />
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))
          )}
        </CTableBody>
      </CTable>

      {/* View Project Modal */}
      <CModal visible={visible} onClose={() => setVisible(false)}>
        <CModalHeader onClose={() => setVisible(false)}>
          <CModalTitle>View Project</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedProject && (
            <div>
              <h5>{selectedProject.name}</h5>
              <p>{selectedProject.description}</p>
              <p>
                <strong>Deadline: </strong>
                {selectedProject.deadline ? new Date(selectedProject.deadline).toLocaleDateString() : 'No Deadline'}
              </p>
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Update Project Modal */}
      <CModal visible={visibleU} onClose={() => setVisibleU(false)}>
        <CModalHeader onClose={() => setVisibleU(false)}>
          <CModalTitle>Update Project</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm onSubmit={handleSubmit}>
            <CRow>
              <CCol xs="12">
                <CFormLabel htmlFor="name">Project Name</CFormLabel>
                <CFormInput
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </CCol>
              <CCol xs="12">
                <CFormLabel htmlFor="description">Description</CFormLabel>
                <CFormTextarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </CCol>
              <CCol xs="12">
                <CFormLabel htmlFor="deadline">Deadline</CFormLabel>
                <CFormInput
                  type="date"
                  id="deadline"
                  value={deadline ? deadline.toISOString().split('T')[0] : ''}
                  onChange={(e) => setDeadline(new Date(e.target.value))}
                />
              </CCol>
            </CRow>
            <CModalFooter>
              <CButton color="secondary" onClick={() => setVisibleU(false)}>
                Close
              </CButton>
              <CButton color="primary" type="submit">
                Save Changes
              </CButton>
            </CModalFooter>
          </CForm>
        </CModalBody>
      </CModal>
    </>
  );
};

export default Projects;
