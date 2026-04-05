import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faImage,
  faVideo,
  faNewspaper,
  faEye,
  faUsers,
  faChartLine
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import DashboardStats from '../../components/admin/DashboardStats';
import { dashboardAPI } from '../../services/api';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('week');

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      // Make API calls one at a time to better handle errors
      const statsRes = await dashboardAPI.getStats();
      setStats(statsRes.data);

      const activityRes = await dashboardAPI.getRecentActivity();
      setActivity(activityRes.data);

      const analyticsRes = await dashboardAPI.getAnalytics(period);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      // Don't show error toast if it's an auth error (will be handled by interceptor)
      if (!error.response || error.response.status !== 401) {
        toast.error('Failed to fetch dashboard data. Please try again later.');
      }
      // Set default values to prevent undefined errors
      setStats({
        totalGalleryItems: 0,
        totalVideos: 0,
        totalUpdates: 0,
        gallery: { total: 0, views: 0, growth: 0 },
        videos: { total: 0, views: 0, growth: 0 },
        updates: { total: 0, views: 0, growth: 0 },
        views: { total: 0, growth: 0 },
        users: { active: 0, growth: 0 },
        engagement: { rate: 0, growth: 0 }
      });
      setActivity([]);
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const StatCard = ({ title, value, icon, color, percentage }) => (
    <Card className="h-100 shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h6 className="text-muted mb-2">{title}</h6>
            <h3 className="mb-0">{value}</h3>
            {percentage && (
              <small className={`text-${percentage >= 0 ? 'success' : 'danger'}`}>
                {percentage > 0 ? '+' : ''}{percentage}% from last month
              </small>
            )}
          </div>
          <div className={`bg-${color} bg-opacity-10 p-3 rounded`}>
            <FontAwesomeIcon icon={icon} className={`text-${color} fs-4`} />
          </div>
        </div>
      </Card.Body>
    </Card>
  );

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Dashboard</h1>
          <p className="text-muted">Welcome back! Here's what's happening with your village portfolio.</p>
        </div>
        <div className="d-flex gap-2">
          <Button
            variant={period === 'week' ? 'primary' : 'light'}
            onClick={() => setPeriod('week')}
          >
            Week
          </Button>
          <Button
            variant={period === 'month' ? 'primary' : 'light'}
            onClick={() => setPeriod('month')}
          >
            Month
          </Button>
          <Button
            variant={period === 'year' ? 'primary' : 'light'}
            onClick={() => setPeriod('year')}
          >
            Year
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <Row className="g-3 mb-4">
        <Col md={6} lg={4}>
          <StatCard
            title="Total Gallery Items"
            value={stats?.gallery?.total || 0}
            icon={faImage}
            color="primary"
            percentage={stats?.gallery?.growth}
          />
        </Col>
        <Col md={6} lg={4}>
          <StatCard
            title="Total Videos"
            value={stats?.videos?.total || 0}
            icon={faVideo}
            color="success"
            percentage={stats?.videos?.growth}
          />
        </Col>
        <Col md={6} lg={4}>
          <StatCard
            title="Total Updates"
            value={stats?.updates?.total || 0}
            icon={faNewspaper}
            color="info"
            percentage={stats?.updates?.growth}
          />
        </Col>
        <Col md={6} lg={4}>
          <StatCard
            title="Page Views"
            value={stats?.views?.total || 0}
            icon={faEye}
            color="warning"
            percentage={stats?.views?.growth}
          />
        </Col>
        <Col md={6} lg={4}>
          <StatCard
            title="Active Users"
            value={stats?.users?.active || 0}
            icon={faUsers}
            color="danger"
            percentage={stats?.users?.growth}
          />
        </Col>
        <Col md={6} lg={4}>
          <StatCard
            title="Engagement Rate"
            value={`${stats?.engagement?.rate || 0}%`}
            icon={faChartLine}
            color="purple"
            percentage={stats?.engagement?.growth}
          />
        </Col>
      </Row>

      {/* Charts and Analytics */}
      <Row className="g-3">
        <Col lg={8}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <h5 className="mb-4">Analytics Overview</h5>
              <DashboardStats
                stats={stats}
                analytics={analytics}
                period={period}
              />
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <div className="d-flex flex-column gap-3">
            <Card className="shadow-sm">
              <Card.Body>
                <h5 className="mb-4">Recent Activity</h5>
                <div className="activity-feed">
                  {activity.map((item, index) => (
                    <div
                      key={index}
                      className={`d-flex align-items-start mb-3 ${
                        index !== activity.length - 1 ? 'border-bottom pb-3' : ''
                      }`}
                    >
                      <div className={`bg-${item.type === 'gallery' ? 'primary' : item.type === 'video' ? 'success' : 'info'} bg-opacity-10 p-2 rounded me-3`}>
                        <FontAwesomeIcon
                          icon={item.type === 'gallery' ? faImage : item.type === 'video' ? faVideo : faNewspaper}
                          className={`text-${item.type === 'gallery' ? 'primary' : item.type === 'video' ? 'success' : 'info'}`}
                        />
                      </div>
                      <div>
                        <div className="fw-bold">{item.action}</div>
                        <div>{item.title}</div>
                        <small className="text-muted">{item.time}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
            <Card className="shadow-sm">
              <Card.Body>
                <h5 className="mb-3">Quick Actions</h5>
                <div className="d-grid gap-2">
                  <Button as={Link} to="/admin/gallery" variant="outline-primary">
                    Add Gallery Item
                  </Button>
                  <Button as={Link} to="/admin/videos" variant="outline-success">
                    Add Video
                  </Button>
                  <Button as={Link} to="/admin/updates" variant="outline-info">
                    Post Update
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard; 
