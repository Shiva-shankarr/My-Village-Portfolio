import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { useInView } from 'react-intersection-observer';
import { updatesAPI } from '../../services/api';
import Updates from '../Updates';

jest.mock('../../services/api', () => ({
  updatesAPI: {
    getAll: jest.fn()
  }
}));

jest.mock('react-intersection-observer', () => ({
  useInView: jest.fn()
}));

// Mock framer-motion with proper animation handling
jest.mock('framer-motion', () => {
  const React = require('react');
  const actual = jest.requireActual('framer-motion');
  return {
    ...actual,
    motion: new Proxy({}, {
      get: (target, prop) => {
        const Component = prop === 'custom' ? 'div' : prop;
        return React.forwardRef(({ children, animate, initial, exit, ...props }, ref) => (
          React.createElement(Component, { ...props, ref, 'data-testid': `motion-${prop}` }, children)
        ));
      }
    }),
    AnimatePresence: ({ children }) => <>{children}</>,
  };
});

// Suppress React error boundary warnings
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (/Warning.*not wrapped in act/.test(args[0])) {
      return;
    }
    if (/Warning.*React does not recognize/.test(args[0])) {
      return;
    }
    if (typeof args[0] === 'string' && args[0].includes('ReactDOMTestUtils.act')) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

describe('Updates Component', () => {
  const mockUpdates = [
    {
      _id: '1',
      title: 'Test Update 1',
      content: 'Test content 1',
      category: 'development',
      createdAt: new Date().toISOString(),
      images: ['image1.jpg'],
    },
    {
      _id: '2',
      title: 'Test Update 2',
      content: 'Test content 2',
      category: 'education',
      createdAt: new Date().toISOString(),
      images: [],
    },
  ];

  const mockResponse = {
    data: {
      data: mockUpdates,
      pagination: {
        current: 1,
        total: 1,
        hasMore: true,
      },
      metadata: {
        total: 2,
        categories: ['development', 'education'],
      },
    },
  };

  beforeEach(() => {
    updatesAPI.getAll.mockClear();
    useInView.mockReturnValue({ ref: jest.fn(), inView: false });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders updates page with title', async () => {
    render(<Updates />);
    expect(screen.getByText('Village Updates')).toBeInTheDocument();
  });

  test('displays loading skeleton initially', () => {
    render(<Updates />);
    expect(screen.getAllByTestId('loading-skeleton')).toHaveLength(6);
  });

  test('renders updates after loading', async () => {
    updatesAPI.getAll.mockResolvedValueOnce(mockResponse);
    render(<Updates />);
    await waitFor(() => {
      expect(screen.getByText('Test Update 1')).toBeInTheDocument();
      expect(screen.getByText('Test Update 2')).toBeInTheDocument();
    });
  });

  test('filters updates by search term', async () => {
    jest.useFakeTimers();
    updatesAPI.getAll.mockResolvedValue(mockResponse);
    render(<Updates />);
    const searchInput = screen.getByLabelText('Search updates');
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'test search' } });
    });
    act(() => {
      jest.runAllTimers();
    });
    await waitFor(() => {
      expect(updatesAPI.getAll).toHaveBeenLastCalledWith(
        expect.objectContaining({ search: 'test search' })
      );
    });
    jest.useRealTimers();
  });

  test('filters updates by category', async () => {
    updatesAPI.getAll.mockResolvedValueOnce(mockResponse);
    render(<Updates />);
    await waitFor(() => {
      expect(screen.getByText('Development')).toBeInTheDocument();
    });

    const filterButton = screen.getByText('Filters');
    await act(async () => {
      fireEvent.click(filterButton);
    });

    await waitFor(() => {
      const categorySelect = screen.getByLabelText('Category');
      fireEvent.change(categorySelect, { target: { value: 'development' } });
      expect(updatesAPI.getAll).toHaveBeenLastCalledWith(
        expect.objectContaining({ category: 'development' })
      );
    });
  });

  test('shows error message when API call fails', async () => {
    const errorMessage = 'Failed to load updates. Please try again later.';
    updatesAPI.getAll.mockRejectedValueOnce(new Error('API Error'));

    render(<Updates />);
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('loads more updates when scrolling to bottom', async () => {
    const moreUpdatesResponse = {
      data: {
        data: [
          {
            _id: '3',
            title: 'Test Update 3',
            content: 'Test content 3',
            category: 'health',
            createdAt: new Date().toISOString(),
            images: [],
          },
        ],
        pagination: {
          current: 2,
          total: 2,
          hasMore: false,
        },
        metadata: {
          total: 3,
          categories: ['development', 'education', 'health'],
        },
      },
    };

    // Mock axios.get to return different responses for each call
    useInView.mockReturnValue({ ref: jest.fn(), inView: true });
    updatesAPI.getAll
      .mockImplementationOnce(() => Promise.resolve(mockResponse))
      .mockImplementationOnce(() => Promise.resolve(moreUpdatesResponse));

    render(<Updates />);

    // Wait for initial updates to load
    await waitFor(() => {
      expect(screen.getByText('Test Update 1')).toBeInTheDocument();
    });

    // Wait for the second API call to complete
    await waitFor(() => {
      expect(updatesAPI.getAll).toHaveBeenCalledTimes(2);
    });

    // Wait for the new update to appear
    await waitFor(() => {
      expect(screen.getByText('Test Update 3')).toBeInTheDocument();
    });
  });

  test('resets filters when reset button is clicked', async () => {
    updatesAPI.getAll.mockResolvedValueOnce(mockResponse);
    render(<Updates />);
    const filterButton = screen.getByText('Filters');
    await act(async () => {
      fireEvent.click(filterButton);
    });

    await waitFor(() => {
      const categorySelect = screen.getByLabelText('Category');
      const sortBySelect = screen.getByLabelText('Sort By');
      
      fireEvent.change(categorySelect, { target: { value: 'development' } });
      fireEvent.change(sortBySelect, { target: { value: 'title' } });

      const resetButton = screen.getByText('Reset Filters');
      fireEvent.click(resetButton);

      expect(categorySelect.value).toBe('');
      expect(sortBySelect.value).toBe('newest');
    });
  });
}); 
