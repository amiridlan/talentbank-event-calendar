import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Home from './page'

describe('Home Page', () => {
  it('renders the home page', () => {
    render(<Home />)
    expect(screen.getByRole('heading', { name: /get started/i })).toBeInTheDocument()
  })

  it('contains links to templates and learning resources', () => {
    render(<Home />)
    expect(screen.getByRole('link', { name: /templates/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /learning/i })).toBeInTheDocument()
  })

  it('displays deploy and documentation buttons', () => {
    render(<Home />)
    expect(screen.getByRole('link', { name: /deploy now/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /documentation/i })).toBeInTheDocument()
  })
})
