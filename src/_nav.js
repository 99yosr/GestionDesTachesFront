import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilBell,
  cilCalculator,
  cilChartPie,
  cilCursor,
  cilDescription,
  cilDrop,
  cilExternalLink,
  cilNotes,
  cilPencil,
  cilPuzzle,
  cilSpeedometer,
  cilStar,
  cilUser
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'
import { cilAccountLogout } from '@coreui/icons'
import { useNavigate } from 'react-router-dom' // Import useNavigate

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    badge: {
      color: 'info',
    },
  },
  {
    component: CNavTitle,
    name: 'Components',
  },
  {
    component: CNavGroup,
    name: 'Tasks',
    to: '/Tasks',
    icon: <CIcon icon={cilPuzzle} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'All Tasks',
        to: '/tasks',
      },
      {
        component: CNavItem,
        name: 'New Task',
        to: '/newTask',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Projects',
    icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'All Projects',
        to: '/projects',
      },
      {
        component: CNavItem,
        name: 'New Project',
        to: '/newProject',
      },
    ],
  },
  {
    component: CNavItem,
    name: 'Edit Profile',
    to: '/profile/update', // This is a fallback if needed
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,  // Use cilUser for the profile icon
    badge: {
      color: 'info',
    },
  },
  {
    component: CNavItem,
    name: 'Logout',
    to: '/login', // This is a fallback if needed
    icon: <CIcon icon={cilAccountLogout} customClassName="nav-icon" />,
    badge: {
      color: 'info',
    },
    onClick: () => logout(), 
  },
]

const logout = () => {
  const navigate = useNavigate()

  localStorage.clear();
  navigate('/login');
  window.location.reload();
}

export default _nav
