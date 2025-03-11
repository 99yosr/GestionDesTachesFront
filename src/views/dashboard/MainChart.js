import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { CChartLine } from '@coreui/react-chartjs'
import { getStyle } from '@coreui/utils'

const MainChart = () => {
  const chartRef = useRef(null)
  const [tasksData, setTasksData] = useState([])

  // Fetch data from the API when the component mounts
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get('http://localhost:2001/tasks/all', {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        });
        console.log('Fetched Tasks:', response.data);
        setTasksData(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error fetching tasks:', error.response?.data || error.message);
        setTasksData([]);
      }
    };
    fetchTasks();
  }, []);
  

  useEffect(() => {
    document.documentElement.addEventListener('ColorSchemeChange', () => {
      if (chartRef.current) {
        setTimeout(() => {
          chartRef.current.options.scales.x.grid.borderColor = getStyle('--cui-border-color-translucent')
          chartRef.current.options.scales.x.grid.color = getStyle('--cui-border-color-translucent')
          chartRef.current.options.scales.x.ticks.color = getStyle('--cui-body-color')
          chartRef.current.options.scales.y.grid.borderColor = getStyle('--cui-border-color-translucent')
          chartRef.current.options.scales.y.grid.color = getStyle('--cui-border-color-translucent')
          chartRef.current.options.scales.y.ticks.color = getStyle('--cui-body-color')
          chartRef.current.update()
        })
      }
    })
  }, [chartRef])

  const tasksByMonth = (status) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
    const taskCounts = months.map((month, index) => {
      // Count tasks created or completed in each month
      return tasksData.filter((task) => {
        const date = new Date(task[status]);
        return date.getMonth() === index;
      }).length;
    });
    return taskCounts;
  };

  if (!tasksData.length) {
    return <div>Loading...</div>; // Display loading until data is fetched
  }

  // Data for created and completed tasks
  const createdTasksData = tasksByMonth('createdAt');
  const completedTasksData = tasksByMonth('completedAt');

  return (
    <>
      <CChartLine
        ref={chartRef}
        style={{ height: '300px', marginTop: '40px' }}
        data={{
          labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
          datasets: [
            {
              label: 'Created Tasks',
              backgroundColor: `rgba(${getStyle('--cui-info-rgb')}, .1)`,
              borderColor: getStyle('--cui-info'),
              pointHoverBackgroundColor: getStyle('--cui-info'),
              borderWidth: 2,
              data: createdTasksData,
              fill: true,
            },
            {
              label: 'Completed Tasks',
              backgroundColor: 'transparent',
              borderColor: getStyle('--cui-success'),
              pointHoverBackgroundColor: getStyle('--cui-success'),
              borderWidth: 2,
              data: completedTasksData,
            },
          ],
        }}
        options={{
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
            },
          },
          scales: {
            x: {
              grid: {
                color: getStyle('--cui-border-color-translucent'),
                drawOnChartArea: false,
              },
              ticks: {
                color: getStyle('--cui-body-color'),
              },
            },
            y: {
              beginAtZero: true,
              border: {
                color: getStyle('--cui-border-color-translucent'),
              },
              grid: {
                color: getStyle('--cui-border-color-translucent'),
              },
              max: Math.max(Math.max(...createdTasksData), Math.max(...completedTasksData)),
              ticks: {
                color: getStyle('--cui-body-color'),
                maxTicksLimit: 5,
                stepSize: 1,
              },
            },
          },
          elements: {
            line: {
              tension: 0.4,
            },
            point: {
              radius: 0,
              hitRadius: 10,
              hoverRadius: 4,
              hoverBorderWidth: 3,
            },
          },
        }}
      />
    </>
  );
}

export default MainChart;
