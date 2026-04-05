import React, { memo } from 'react';
import { Container, Row, Col, Card, ProgressBar } from 'react-bootstrap';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faImage,
  faVideo,
  faNewspaper
} from '@fortawesome/free-solid-svg-icons';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const DashboardStats = memo(({ stats, analytics, period }) => {
  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Content Growth Over Time',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Content Distribution by Category',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'User Engagement Distribution',
      },
    },
  };

  const lineChartData = {
    labels: analytics?.timeline?.map(item => item.date) || [],
    datasets: [
      {
        label: 'Gallery Items',
        data: analytics?.timeline?.map(item => item.gallery) || [],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
      {
        label: 'Videos',
        data: analytics?.timeline?.map(item => item.videos) || [],
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
      },
      {
        label: 'Updates',
        data: analytics?.timeline?.map(item => item.updates) || [],
        borderColor: 'rgb(53, 162, 235)',
        tension: 0.1,
      },
    ],
  };

  const barChartData = {
    labels: Object.keys(analytics?.categories || {}),
    datasets: [
      {
        label: 'Items',
        data: Object.values(analytics?.categories || {}),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
          'rgba(255, 159, 64, 0.5)',
        ],
      },
    ],
  };

  const doughnutData = {
    labels: ['Gallery Views', 'Video Views', 'Update Views'],
    datasets: [
      {
        data: [
          stats?.gallery?.views || 0,
          stats?.videos?.views || 0,
          stats?.updates?.views || 0,
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const recentActivity = [
    {
      type: 'gallery',
      action: 'Added new image',
      title: 'Village Festival 2024',
      time: '2 hours ago',
      icon: faImage,
      variant: 'primary'
    },
    {
      type: 'video',
      action: 'Updated video',
      title: 'Cultural Program',
      time: '5 hours ago',
      icon: faVideo,
      variant: 'success'
    },
    {
      type: 'update',
      action: 'Posted update',
      title: 'New Development Project',
      time: '1 day ago',
      icon: faNewspaper,
      variant: 'info'
    }
  ];

  // Add null checks for stats and analytics
  if (!stats || !analytics) {
    return (
      <Container fluid className="py-3">
        <div className="text-center">Loading dashboard statistics...</div>
      </Container>
    );
  }

  const totalContent = (stats.totalGalleryItems || 0) + (stats.totalVideos || 0) + (stats.totalUpdates || 0);

  return (
    <Container fluid className="py-3">
      <Row className="g-4">
        <Col lg={8}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <Line options={lineChartOptions} data={lineChartData} />
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <Doughnut options={doughnutOptions} data={doughnutData} />
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12}>
          <Card className="shadow-sm">
            <Card.Body>
              <Bar options={barChartOptions} data={barChartData} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Stats */}
      <Row className="g-4 mt-4">
        {/* Content Distribution */}
        <Col md={6}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <h5 className="mb-4">Content Distribution</h5>
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="text-muted">Gallery Items</span>
                  <span className="fw-bold">{stats.totalGalleryItems || 0}</span>
                </div>
                <ProgressBar
                  variant="primary"
                  now={totalContent ? ((stats.totalGalleryItems || 0) / totalContent) * 100 : 0}
                  className="mb-3"
                />

                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="text-muted">Videos</span>
                  <span className="fw-bold">{stats.totalVideos || 0}</span>
                </div>
                <ProgressBar
                  variant="success"
                  now={totalContent ? ((stats.totalVideos || 0) / totalContent) * 100 : 0}
                  className="mb-3"
                />

                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="text-muted">Updates</span>
                  <span className="fw-bold">{stats.totalUpdates || 0}</span>
                </div>
                <ProgressBar
                  variant="info"
                  now={totalContent ? ((stats.totalUpdates || 0) / totalContent) * 100 : 0}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Recent Activity */}
        <Col md={6}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <h5 className="mb-4">Recent Activity</h5>
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className={`d-flex align-items-start mb-3 ${
                    index !== recentActivity.length - 1 ? 'border-bottom pb-3' : ''
                  }`}
                >
                  <div className={`bg-${activity.variant} bg-opacity-10 p-2 rounded me-3`}>
                    <FontAwesomeIcon
                      icon={activity.icon}
                      className={`text-${activity.variant}`}
                    />
                  </div>
                  <div>
                    <div className="fw-bold">{activity.action}</div>
                    <div>{activity.title}</div>
                    <small className="text-muted">{activity.time}</small>
                  </div>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
});

DashboardStats.displayName = 'DashboardStats';

export default DashboardStats; 