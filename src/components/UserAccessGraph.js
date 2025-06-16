import {
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
} from 'chart.js';
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import '../styles/UserAccessGraph.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function UserAccessGraph() {
  const [accessData, setAccessData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Using the exact data provided
    const mockData = [
      { user: 'John Doe', lastAccess: '2024-03-15T10:00:00', app: 'Dover Portal' },
      { user: 'Jane Smith', lastAccess: '2024-03-15T11:30:00', app: 'GitHub' },
      { user: 'Bob Johnson', lastAccess: '2024-03-15T09:15:00', app: 'HR Portal' },
      { user: 'Alice Brown', lastAccess: '2024-03-15T14:20:00', app: 'DevOps Portal' },
      { user: 'Charlie Wilson', lastAccess: '2024-03-15T15:45:00', app: 'Finance Portal' },
      { user: 'Emma Davis', lastAccess: '2024-03-15T16:30:00', app: 'Dover Portal' },
      { user: 'Frank Miller', lastAccess: '2024-03-15T13:10:00', app: 'GitHub' },
      { user: 'Grace Lee', lastAccess: '2024-03-15T12:00:00', app: 'HR Portal' },
      { user: 'Henry Taylor', lastAccess: '2024-03-15T17:15:00', app: 'DevOps Portal' },
      { user: 'Ivy Martinez', lastAccess: '2024-03-15T18:00:00', app: 'Finance Portal' }
    ];
    setAccessData(mockData);
    setLoading(false);
  }, []);

  const chartData = {
    labels: accessData.map(item => item.user),
    datasets: [
      {
        label: 'Last Access Time',
        data: accessData.map(item => new Date(item.lastAccess).getTime()),
        borderColor: 'rgb(25, 108, 147)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'var(--text-color)',
          font: {
            size: 14,
          },
        },
      },
      title: {
        display: true,
        text: 'User Last Access Times',
        color: 'var(--text-color)',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const date = new Date(context.raw);
            const user = accessData[context.dataIndex];
            return [
              `User: ${user.user}`,
              `Last Access: ${date.toLocaleString('en-US', { timeZone: 'UTC' })}`,
              `Application: ${user.app}`
            ];
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: 'var(--text-color)',
          font: {
            size: 12,
          },
          maxRotation: 45,
          minRotation: 45
        },
        grid: {
          color: 'rgba(28, 33, 22, 0.12)',
        },
      },
      y: {
        ticks: {
          color: 'var(--text-color)',
          font: {
            size: 12,
          },
          callback: function(value) {
            return new Date(value).toLocaleTimeString();
          },
        },
        grid: {
          color: 'rgba(49, 176, 79, 0.2)',
        },
      },
    },
  };

  if (loading) {
    return <div className="loading">Loading access data...</div>;
  }

  return (
    <div className="user-access-graph-container">
      <div className="graph-wrapper">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}

export default UserAccessGraph; 