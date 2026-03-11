import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/utils'
import SearchBox from '../SearchBox'
import * as router from 'react-router-dom'

// Mock the store
const mockSearchFlights = vi.fn()
const mockSearchAirports = vi.fn()
const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('@/store/flightStore', () => ({
  useFlightStore: () => ({
    allAirports: [
      { code: 'JFK', name: 'John F. Kennedy International', entityId: '1', skyId: 'JFK' },
      { code: 'LAX', name: 'Los Angeles International', entityId: '2', skyId: 'LAX' },
      { code: 'LHR', name: 'London Heathrow', entityId: '3', skyId: 'LHR' },
    ],
    searchAirports: mockSearchAirports,
    searchFlights: mockSearchFlights,
  }),
}))

describe('SearchBox Component', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
    mockSearchFlights.mockResolvedValue([])
  })

  describe('Rendering', () => {
    it('renders all form elements', () => {
      render(<SearchBox />)
      
      // Check that selects render with default values
      expect(screen.getByText('Round trip')).toBeInTheDocument()
      expect(screen.getByText('Economy')).toBeInTheDocument()
      
      // Check text inputs
      expect(screen.getByLabelText(/passengers/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/from/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/to/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/departure date/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/return date/i)).toBeInTheDocument()
      
      // Check submit button
      expect(screen.getByRole('button', { name: /explore/i })).toBeInTheDocument()
    })

    it('renders return date field for round trip by default', () => {
      render(<SearchBox />)
      expect(screen.getByLabelText(/return date/i)).toBeInTheDocument()
    })

    it('hides return date field for one-way flights', async () => {
      render(<SearchBox />)
      
      // Change to one-way by clicking on the select and choosing option
      const flightTypeSelect = screen.getByText('Round trip')
      fireEvent.mouseDown(flightTypeSelect)
      await user.click(screen.getByRole('option', { name: 'One way' }))
      
      await waitFor(() => {
        expect(screen.queryByLabelText(/return date/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('Form Interactions', () => {
    it('updates passenger count', async () => {
      render(<SearchBox />)
      
      const passengersInput = screen.getByLabelText(/passengers/i) as HTMLInputElement
      await user.clear(passengersInput)
      await user.type(passengersInput, '3')
      
      expect(passengersInput.value).toBe('3')
    })

    it('changes flight type', async () => {
      render(<SearchBox />)
      
      const flightTypeSelect = screen.getByText('Round trip')
      fireEvent.mouseDown(flightTypeSelect)
      await user.click(screen.getByRole('option', { name: 'One way' }))
      
      await waitFor(() => {
        expect(screen.getByText('One way')).toBeInTheDocument()
      })
    })

    it('changes cabin class', async () => {
      render(<SearchBox />)
      
      // Find cabin class select by its current value
      const cabinClassSelect = screen.getByText('Economy').closest('[role="combobox"]')
      expect(cabinClassSelect).toBeInTheDocument()
      
      fireEvent.mouseDown(cabinClassSelect!)
      
      // Click on Business option
      await user.click(screen.getByRole('option', { name: 'Business' }))
      
      await waitFor(() => {
        expect(screen.getByText('Business')).toBeInTheDocument()
      })
    })

    it('updates departure date', async () => {
      render(<SearchBox />)
      
      const departureInput = screen.getByLabelText(/departure date/i) as HTMLInputElement
      await user.type(departureInput, '2024-12-25')
      
      expect(departureInput.value).toBe('2024-12-25')
    })

    it('updates return date', async () => {
      render(<SearchBox />)
      
      const returnInput = screen.getByLabelText(/return date/i) as HTMLInputElement
      await user.type(returnInput, '2024-12-30')
      
      expect(returnInput.value).toBe('2024-12-30')
    })
  })

  describe('Airport Search', () => {
    it('calls searchAirports when typing in origin field', async () => {
      render(<SearchBox />)
      
      const fromInput = screen.getByLabelText(/from/i)
      await user.type(fromInput, 'JFK')
      
      await waitFor(() => {
        expect(mockSearchAirports).toHaveBeenCalledWith('JFK')
      })
    })

    it('calls searchAirports when typing in destination field', async () => {
      render(<SearchBox />)
      
      const toInput = screen.getByLabelText(/to/i)
      await user.type(toInput, 'LAX')
      
      await waitFor(() => {
        expect(mockSearchAirports).toHaveBeenCalledWith('LAX')
      })
    })
  })

  describe('Date Validation Logic', () => {
    it('clears return date when departure is set to after return date', async () => {
      render(<SearchBox />)
      
      // Set return date first
      const returnInput = screen.getByLabelText(/return date/i) as HTMLInputElement
      await user.type(returnInput, '2024-12-25')
      
      // Set departure date after return date
      const departureInput = screen.getByLabelText(/departure date/i) as HTMLInputElement
      await user.type(departureInput, '2024-12-30')
      
      await waitFor(() => {
        expect(returnInput.value).toBe('')
      })
    })

    it('sets min date for return date based on departure date', async () => {
      render(<SearchBox />)
      
      const departureInput = screen.getByLabelText(/departure date/i) as HTMLInputElement
      await user.type(departureInput, '2024-12-25')
      
      const returnInput = screen.getByLabelText(/return date/i) as HTMLInputElement
      expect(returnInput.min).toBe('2024-12-25')
    })
  })

  describe('Form Submission', () => {
    it('prevents default form submission', async () => {
      render(<SearchBox />)
      
      const form = screen.getByRole('button', { name: /explore/i }).closest('form')!
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true })
      const preventDefaultSpy = vi.spyOn(submitEvent, 'preventDefault')
      
      form.dispatchEvent(submitEvent)
      
      expect(preventDefaultSpy).toHaveBeenCalled()
    })

    it('calls searchFlights with correct parameters on submission', async () => {
      render(<SearchBox />)
      
      // Fill form with basic required fields
      const passengersInput = screen.getByLabelText(/passengers/i) as HTMLInputElement
      await user.clear(passengersInput)
      await user.type(passengersInput, '2')
      
      const departureInput = screen.getByLabelText(/departure date/i)
      await user.type(departureInput, '2024-12-25')
      
      const returnInput = screen.getByLabelText(/return date/i)
      await user.type(returnInput, '2024-12-30')
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /explore/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockSearchFlights).toHaveBeenCalledWith(
          expect.objectContaining({
            flightType: 'round-trip',
            passengers: '2', // Note: input returns string, not number
            cabinClass: 'economy',
            departureDate: '2024-12-25',
            returnDate: '2024-12-30',
            origin: expect.objectContaining({
              entityId: '',
              skyId: '',
            }),
            destination: expect.objectContaining({
              entityId: '',
              skyId: '',
            }),
          })
        )
      })
    })

    it('navigates to results page after successful search', async () => {
      render(<SearchBox />)
      
      const submitButton = screen.getByRole('button', { name: /explore/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/results')
      })
    })

    it('excludes return date for one-way flights', async () => {
      render(<SearchBox />)
      
      // Change to one-way
      const flightTypeSelect = screen.getByText('Round trip')
      fireEvent.mouseDown(flightTypeSelect)
      await user.click(screen.getByRole('option', { name: 'One way' }))
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /explore/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockSearchFlights).toHaveBeenCalledWith(
          expect.objectContaining({
            flightType: 'one-way',
            returnDate: '',
          })
        )
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper form labels and roles', () => {
      render(<SearchBox />)
      
      expect(screen.getByRole('combobox', { name: /from/i })).toBeInTheDocument()
      expect(screen.getByRole('combobox', { name: /to/i })).toBeInTheDocument()
      expect(screen.getByRole('spinbutton', { name: /passengers/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /explore/i })).toBeInTheDocument()
    })

    it('supports keyboard navigation', async () => {
      render(<SearchBox />)
      
      const passengersInput = screen.getByLabelText(/passengers/i)
      passengersInput.focus()
      expect(passengersInput).toHaveFocus()
      
      // Tab to next focusable element (Note: Material-UI components may have different tab order)
      await user.tab()
      // The exact focus target depends on Material-UI's internal structure
      // Just verify that focus moved away from passengers input
      expect(passengersInput).not.toHaveFocus()
    })
  })
})