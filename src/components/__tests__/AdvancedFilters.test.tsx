
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/utils'
import AdvancedFiltersComponent from '../AdvancedFilters'
import type { Flight } from '@/types'

const mockFlights: Flight[] = [
  {
    id: '1',
    airline: 'American Airlines',
    flightNumber: 'AA123',
    departure: {
      airport: { code: 'JFK', name: 'John F. Kennedy International', city: 'New York', country: 'USA' },
      time: '08:00',
      date: '2024-12-25',
    },
    arrival: {
      airport: { code: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'USA' },
      time: '11:30',
      date: '2024-12-25',
    },
    duration: '5h 30m',
    price: 299,
    currency: 'USD',
    stops: 0,
    aircraft: 'Boeing 737',
    class: 'economy',
  },
  {
    id: '2',
    airline: 'Delta Airlines',
    flightNumber: 'DL456',
    departure: {
      airport: { code: 'LGA', name: 'LaGuardia Airport', city: 'New York', country: 'USA' },
      time: '14:00',
      date: '2024-12-25',
    },
    arrival: {
      airport: { code: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'USA' },
      time: '17:30',
      date: '2024-12-25',
    },
    duration: '5h 30m',
    price: 349,
    currency: 'USD',
    stops: 0,
    aircraft: 'Airbus A320',
    class: 'economy',
  },
]

// Mock the store
const mockUpdateFilters = vi.fn()
const mockResetFilters = vi.fn()
const mockApplyFilters = vi.fn()
const mockOnClose = vi.fn()

const defaultFilters = {
  sortBy: 'price' as const,
  sortOrder: 'asc' as const,
  selectedAirlines: [],
  selectedAirports: [],
  airlines: [],
  priceRange: [0, 2000] as [number, number],
  durationRange: [0, 1440] as [number, number],
  maxLayovers: 3,
  timePreferences: {
    departureTime: 'all' as const,
    arrivalTime: 'all' as const,
  },
  departureTime: 'all' as const,
  preferredClass: 'all' as const,
  maxStops: 3,
}

vi.mock('@/store/flightStore', () => ({
  useFlightStore: () => ({
    filters: defaultFilters,
    flights: mockFlights,
    updateFilters: mockUpdateFilters,
    resetFilters: mockResetFilters,
    applyFilters: mockApplyFilters,
  }),
}))

describe('AdvancedFilters Component', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders when open is true', () => {
      render(<AdvancedFiltersComponent open={true} onClose={mockOnClose} />)
      
      expect(screen.getByText('Advanced Filters')).toBeInTheDocument()
      expect(screen.getByText('Sort & Order')).toBeInTheDocument()
      expect(screen.getByText('Price Range')).toBeInTheDocument()
      expect(screen.getByText('Flight Duration')).toBeInTheDocument()
      expect(screen.getByText('Airlines (0 selected)')).toBeInTheDocument()
      expect(screen.getByText('Time Preferences')).toBeInTheDocument()
      expect(screen.getByText('Other Options')).toBeInTheDocument()
    })

    it('does not render when open is false', () => {
      render(<AdvancedFiltersComponent open={false} onClose={mockOnClose} />)
      
      expect(screen.queryByText('Advanced Filters')).not.toBeInTheDocument()
    })

    it('renders close button', () => {
      render(<AdvancedFiltersComponent open={true} onClose={mockOnClose} />)
      
      const closeButton = screen.getByRole('button', { name: /close/i })
      expect(closeButton).toBeInTheDocument()
    })

    it('renders reset and apply buttons', () => {
      render(<AdvancedFiltersComponent open={true} onClose={mockOnClose} />)
      
      expect(screen.getByRole('button', { name: /reset all/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /apply filters/i })).toBeInTheDocument()
    })

    it('displays available airlines from flights', () => {
      render(<AdvancedFiltersComponent open={true} onClose={mockOnClose} />)
      
      // Expand Airlines accordion
      fireEvent.click(screen.getByText('Airlines (0 selected)'))
      
      expect(screen.getByText('American Airlines')).toBeInTheDocument()
      expect(screen.getByText('Delta Airlines')).toBeInTheDocument()
    })
  })

  describe('Sort Options', () => {
    it('displays current sort options', () => {
      render(<AdvancedFiltersComponent open={true} onClose={mockOnClose} />)
      
      // Check default sort options are displayed
      expect(screen.getByDisplayValue('price')).toBeInTheDocument()
      expect(screen.getByText('Ascending')).toBeInTheDocument()
    })

    it('updates sort by when changed', async () => {
      render(<AdvancedFiltersComponent open={true} onClose={mockOnClose} />)
      
      // Find and click sort by dropdown
      const sortBySelect = screen.getByLabelText('Sort by')
      fireEvent.mouseDown(sortBySelect)
      
      await user.click(screen.getByRole('option', { name: 'Duration' }))
      
      expect(mockUpdateFilters).toHaveBeenCalledWith({ sortBy: 'duration' })
    })

    it('updates sort order when toggled', async () => {
      render(<AdvancedFiltersComponent open={true} onClose={mockOnClose} />)
      
      const descendingButton = screen.getByRole('button', { name: /descending/i })
      await user.click(descendingButton)
      
      expect(mockUpdateFilters).toHaveBeenCalledWith({ sortOrder: 'desc' })
    })
  })

  describe('Price Range', () => {
    it('displays current price range', () => {
      render(<AdvancedFiltersComponent open={true} onClose={mockOnClose} />)
      
      // Expand Price Range accordion
      fireEvent.click(screen.getByText('Price Range'))
      
      expect(screen.getByText('$0 - $2000')).toBeInTheDocument()
    })

    it('updates price range when slider changes', () => {
      render(<AdvancedFiltersComponent open={true} onClose={mockOnClose} />)
      
      // Expand Price Range accordion
      fireEvent.click(screen.getByText('Price Range'))
      
      // Find price range slider
      const priceSlider = screen.getByRole('slider')
      fireEvent.change(priceSlider, { target: { value: '500,1500' } })
      
      expect(mockUpdateFilters).toHaveBeenCalled()
    })
  })

  describe('Duration Range', () => {
    it('displays formatted duration range', () => {
      render(<AdvancedFiltersComponent open={true} onClose={mockOnClose} />)
      
      // Expand Flight Duration accordion
      fireEvent.click(screen.getByText('Flight Duration'))
      
      expect(screen.getByText('0h 0m - 24h 0m')).toBeInTheDocument()
    })
  })

  describe('Airline Selection', () => {
    it('shows airline count in accordion title', () => {
      render(<AdvancedFiltersComponent open={true} onClose={mockOnClose} />)
      
      expect(screen.getByText('Airlines (0 selected)')).toBeInTheDocument()
    })

    it('toggles airline selection when clicked', async () => {
      render(<AdvancedFiltersComponent open={true} onClose={mockOnClose} />)
      
      // Expand Airlines accordion
      fireEvent.click(screen.getByText('Airlines (0 selected)'))
      
      const americanAirlinesChip = screen.getByText('American Airlines')
      await user.click(americanAirlinesChip)
      
      expect(mockUpdateFilters).toHaveBeenCalledWith({
        selectedAirlines: ['American Airlines']
      })
    })

    it('shows message when no airlines available', () => {
      // Mock empty flights array
      vi.mocked(require('@/store/flightStore').useFlightStore).mockReturnValue({
        filters: defaultFilters,
        flights: [],
        updateFilters: mockUpdateFilters,
        resetFilters: mockResetFilters,
        applyFilters: mockApplyFilters,
      })
      
      render(<AdvancedFiltersComponent open={true} onClose={mockOnClose} />)
      
      // Expand Airlines accordion
      fireEvent.click(screen.getByText('Airlines (0 selected)'))
      
      expect(screen.getByText('No airlines available in current results')).toBeInTheDocument()
    })
  })

  describe('Time Preferences', () => {
    it('updates departure time preference', async () => {
      render(<AdvancedFiltersComponent open={true} onClose={mockOnClose} />)
      
      // Expand Time Preferences accordion
      fireEvent.click(screen.getByText('Time Preferences'))
      
      const departureSelect = screen.getByLabelText('Departure Time')
      fireEvent.mouseDown(departureSelect)
      
      await user.click(screen.getByRole('option', { name: 'Morning (6am-12pm)' }))
      
      expect(mockUpdateFilters).toHaveBeenCalledWith({
        timePreferences: {
          departureTime: 'morning',
          arrivalTime: 'all',
        }
      })
    })

    it('updates arrival time preference', async () => {
      render(<AdvancedFiltersComponent open={true} onClose={mockOnClose} />)
      
      // Expand Time Preferences accordion
      fireEvent.click(screen.getByText('Time Preferences'))
      
      const arrivalSelect = screen.getByLabelText('Arrival Time')
      fireEvent.mouseDown(arrivalSelect)
      
      await user.click(screen.getByRole('option', { name: 'Evening (6pm-10pm)' }))
      
      expect(mockUpdateFilters).toHaveBeenCalledWith({
        timePreferences: {
          departureTime: 'all',
          arrivalTime: 'evening',
        }
      })
    })
  })

  describe('Other Options', () => {
    it('updates max layovers', async () => {
      render(<AdvancedFiltersComponent open={true} onClose={mockOnClose} />)
      
      // Expand Other Options accordion
      fireEvent.click(screen.getByText('Other Options'))
      
      const layoversInput = screen.getByLabelText('Max Layovers')
      await user.clear(layoversInput)
      await user.type(layoversInput, '2')
      
      expect(mockUpdateFilters).toHaveBeenCalledWith({ maxLayovers: 2 })
    })

    it('updates preferred class', async () => {
      render(<AdvancedFiltersComponent open={true} onClose={mockOnClose} />)
      
      // Expand Other Options accordion
      fireEvent.click(screen.getByText('Other Options'))
      
      const classSelect = screen.getByLabelText('Preferred Class')
      fireEvent.mouseDown(classSelect)
      
      await user.click(screen.getByRole('option', { name: 'Business' }))
      
      expect(mockUpdateFilters).toHaveBeenCalledWith({ preferredClass: 'business' })
    })

    it('handles invalid layovers input', async () => {
      render(<AdvancedFiltersComponent open={true} onClose={mockOnClose} />)
      
      // Expand Other Options accordion
      fireEvent.click(screen.getByText('Other Options'))
      
      const layoversInput = screen.getByLabelText('Max Layovers')
      await user.clear(layoversInput)
      await user.type(layoversInput, 'invalid')
      
      expect(mockUpdateFilters).toHaveBeenCalledWith({ maxLayovers: 0 })
    })
  })

  describe('Actions', () => {
    it('calls onClose when close button is clicked', async () => {
      render(<AdvancedFiltersComponent open={true} onClose={mockOnClose} />)
      
      const closeButton = screen.getByRole('button', { name: /close/i })
      await user.click(closeButton)
      
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('calls resetFilters when reset button is clicked', async () => {
      render(<AdvancedFiltersComponent open={true} onClose={mockOnClose} />)
      
      const resetButton = screen.getByRole('button', { name: /reset all/i })
      await user.click(resetButton)
      
      expect(mockResetFilters).toHaveBeenCalled()
    })

    it('calls applyFilters and onClose when apply button is clicked', async () => {
      render(<AdvancedFiltersComponent open={true} onClose={mockOnClose} />)
      
      const applyButton = screen.getByRole('button', { name: /apply filters/i })
      await user.click(applyButton)
      
      expect(mockApplyFilters).toHaveBeenCalled()
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      render(<AdvancedFiltersComponent open={true} onClose={mockOnClose} />)
      
      expect(screen.getByRole('presentation')).toBeInTheDocument() // Drawer
      expect(screen.getByLabelText('Sort by')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /reset all/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /apply filters/i })).toBeInTheDocument()
    })

    it('supports keyboard navigation', async () => {
      render(<AdvancedFiltersComponent open={true} onClose={mockOnClose} />)
      
      const resetButton = screen.getByRole('button', { name: /reset all/i })
      resetButton.focus()
      
      await user.tab()
      expect(screen.getByRole('button', { name: /apply filters/i })).toHaveFocus()
    })

    it('has proper accordion structure', () => {
      render(<AdvancedFiltersComponent open={true} onClose={mockOnClose} />)
      
      // Check that accordions are properly structured
      const accordions = screen.getAllByRole('button', { expanded: false })
      expect(accordions.length).toBeGreaterThan(0)
      
      // First accordion should be expanded by default (Sort & Order)
      const sortAccordion = screen.getByRole('button', { name: /sort & order/i })
      expect(sortAccordion).toHaveAttribute('aria-expanded', 'true')
    })
  })

  describe('Responsive Design', () => {
    it('renders drawer with responsive width', () => {
      render(<AdvancedFiltersComponent open={true} onClose={mockOnClose} />)
      
      const drawer = screen.getByRole('presentation')
      expect(drawer).toBeInTheDocument()
      // Material-UI drawer should handle responsive behavior
    })
  })

  describe('Data Flow', () => {
    it('formats price values correctly', () => {
      render(<AdvancedFiltersComponent open={true} onClose={mockOnClose} />)
      
      // Expand Price Range accordion
      fireEvent.click(screen.getByText('Price Range'))
      
      // Check price formatting
      expect(screen.getByText('$0 - $2000')).toBeInTheDocument()
    })

    it('formats duration values correctly', () => {
      render(<AdvancedFiltersComponent open={true} onClose={mockOnClose} />)
      
      // Expand Flight Duration accordion
      fireEvent.click(screen.getByText('Flight Duration'))
      
      // Check duration formatting (0 minutes = 0h 0m, 1440 minutes = 24h 0m)
      expect(screen.getByText('0h 0m - 24h 0m')).toBeInTheDocument()
    })

    it('handles airline deselection correctly', async () => {
      // Mock store with selected airline
      vi.mocked(require('@/store/flightStore').useFlightStore).mockReturnValue({
        filters: { 
          ...defaultFilters, 
          selectedAirlines: ['American Airlines']
        },
        flights: mockFlights,
        updateFilters: mockUpdateFilters,
        resetFilters: mockResetFilters,
        applyFilters: mockApplyFilters,
      })
      
      render(<AdvancedFiltersComponent open={true} onClose={mockOnClose} />)
      
      // Expand Airlines accordion
      fireEvent.click(screen.getByText('Airlines (1 selected)'))
      
      // Click to deselect American Airlines
      const americanAirlinesChip = screen.getByText('American Airlines')
      await user.click(americanAirlinesChip)
      
      expect(mockUpdateFilters).toHaveBeenCalledWith({
        selectedAirlines: []
      })
    })
  })
})