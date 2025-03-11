import React, { useEffect, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { CCard, CCardBody, CCardHeader } from '@coreui/react'
import ProBadge from './badge/ProBadge'
import './Calendar.css'
import axios from 'axios';


export default function Calendar() {
  const [events, setEvents] = useState([])

  // Fetch tasks from API when component mounts
  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await axios.get('http://localhost:2001/tasks/all', {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
      });
  
      console.log('Fetched Tasks:', response.data);
  
      if (!Array.isArray(response.data)) {
        throw new Error("Invalid response format");
      }
  
      const formattedEvents = response.data.map((task) => ({
        id: task.id,
        title: task.title,
        start: task.createdAt,
        end: task.deadline,
        extendedProps: { status: task.status },
      }));
  
      setEvents(formattedEvents);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };
  
  
  
  const getEventClass = (eventInfo) => {
    const status = eventInfo.event.extendedProps.status
    switch (status) {
      case 'pending':
        return 'event-pending'
      case 'inProgress':
        return 'event-inProgress'
      case 'completed':
        return 'event-completed'
      default:
        return ''
    }
  }

  return (
    <CCard className="mb-4">
      <CCardHeader>
        Task Calendar <ProBadge />
      </CCardHeader>
      <CCardBody>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          initialView="dayGridMonth"
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          events={events} // Use fetched tasks
          eventContent={renderEventContent}
          eventClassNames={getEventClass}
        />
      </CCardBody>
    </CCard>
  )
}

// Custom rendering for events
const renderEventContent = (eventInfo) => {
  return (
    <div className="custom-event">
      <b>{eventInfo.timeText}</b> - <i>{eventInfo.event.title}</i>
    </div>
  )
}
