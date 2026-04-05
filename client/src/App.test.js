import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div>{children}</div>,
  Routes: ({ children }) => <div>{children}</div>,
  Route: ({ element, children }) => element || children || null,
  Navigate: () => null
}));

jest.mock('./pages/Home', () => () => <div>Home Page</div>);
jest.mock('./pages/Gallery', () => () => <div>Gallery Page</div>);
jest.mock('./pages/Videos', () => () => <div>Videos Page</div>);
jest.mock('./pages/Updates', () => () => <div>Updates Page</div>);
jest.mock('./pages/Login', () => () => <div>Login Page</div>);
jest.mock('./pages/NotFound', () => () => <div>Not Found</div>);
jest.mock('./pages/admin/Dashboard', () => () => <div>Admin Dashboard</div>);
jest.mock('./pages/admin/Gallery', () => () => <div>Admin Gallery</div>);
jest.mock('./pages/admin/Videos', () => () => <div>Admin Videos</div>);
jest.mock('./pages/admin/Updates', () => () => <div>Admin Updates</div>);
jest.mock('./components/ProtectedRoute', () => ({ children }) => <div>{children}</div>);
jest.mock('./components/admin/AdminLayout', () => () => <div>Admin Layout</div>);

test('renders home page placeholder', () => {
  render(<App />);
  expect(screen.getByText('Home Page')).toBeInTheDocument();
});
