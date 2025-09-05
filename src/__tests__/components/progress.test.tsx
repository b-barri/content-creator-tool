import { render, screen } from '@testing-library/react'
import { Progress } from '@/components/progress'

// Mock Radix UI Progress
jest.mock('@radix-ui/react-progress', () => ({
  Root: ({ children, className, value, ...props }: any) => (
    <div 
      className={className} 
      data-testid="progress-root"
      {...props}
    >
      {children}
    </div>
  ),
  Indicator: ({ className, style, ...props }: any) => (
    <div 
      className={className}
      style={style}
      data-testid="progress-indicator"
      {...props}
    />
  ),
}))

describe('Progress Component', () => {
  it('should render with default props', () => {
    render(<Progress />)
    
    const progressRoot = screen.getByTestId('progress-root')
    expect(progressRoot).toBeInTheDocument()
    expect(progressRoot).toHaveClass('relative', 'h-4', 'w-full', 'overflow-hidden', 'rounded-full', 'bg-secondary')
  })

  it('should render with custom value', () => {
    render(<Progress value={50} />)
    
    const progressRoot = screen.getByTestId('progress-root')
    expect(progressRoot).toBeInTheDocument()
    
    const progressIndicator = screen.getByTestId('progress-indicator')
    expect(progressIndicator).toHaveStyle('transform: translateX(-50%)')
  })

  it('should render with custom className', () => {
    render(<Progress value={75} className="custom-class" />)
    
    const progressRoot = screen.getByTestId('progress-root')
    expect(progressRoot).toHaveClass('custom-class')
  })

  it('should render progress indicator', () => {
    render(<Progress value={25} />)
    
    const progressIndicator = screen.getByTestId('progress-indicator')
    expect(progressIndicator).toBeInTheDocument()
    expect(progressIndicator).toHaveClass('h-full', 'w-full', 'flex-1', 'bg-primary', 'transition-all')
  })

  it('should handle zero value', () => {
    render(<Progress value={0} />)
    
    const progressIndicator = screen.getByTestId('progress-indicator')
    expect(progressIndicator).toHaveStyle('transform: translateX(-100%)')
  })

  it('should handle 100% value', () => {
    render(<Progress value={100} />)
    
    const progressIndicator = screen.getByTestId('progress-indicator')
    expect(progressIndicator).toHaveStyle('transform: translateX(-0%)')
  })

  it('should handle negative values', () => {
    render(<Progress value={-10} />)
    
    const progressIndicator = screen.getByTestId('progress-indicator')
    expect(progressIndicator).toHaveStyle('transform: translateX(-110%)')
  })

  it('should handle values over 100', () => {
    render(<Progress value={150} />)
    
    const progressIndicator = screen.getByTestId('progress-indicator')
    expect(progressIndicator).toHaveStyle('transform: translateX(--50%)')
  })

  it('should pass through additional props', () => {
    render(<Progress value={50} data-testid="custom-progress" />)
    
    const progressRoot = screen.getByTestId('custom-progress')
    expect(progressRoot).toBeInTheDocument()
  })
})
