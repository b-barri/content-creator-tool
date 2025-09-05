import { cn } from '@/lib/utils'

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2')
  })

  it('should handle conditional classes', () => {
    expect(cn('class1', true && 'class2', false && 'class3')).toBe('class1 class2')
  })

  it('should handle undefined and null values', () => {
    expect(cn('class1', undefined, null, 'class2')).toBe('class1 class2')
  })

  it('should handle empty strings', () => {
    expect(cn('class1', '', 'class2')).toBe('class1 class2')
  })

  it('should handle arrays of classes', () => {
    expect(cn(['class1', 'class2'], 'class3')).toBe('class1 class2 class3')
  })

  it('should handle objects with boolean values', () => {
    expect(cn({
      'class1': true,
      'class2': false,
      'class3': true
    })).toBe('class1 class3')
  })

  it('should merge conflicting Tailwind classes', () => {
    expect(cn('p-4 p-2')).toBe('p-2')
    expect(cn('bg-red-500 bg-blue-500')).toBe('bg-blue-500')
  })

  it('should handle complex combinations', () => {
    expect(cn(
      'base-class',
      true && 'conditional-class',
      false && 'hidden-class',
      ['array-class1', 'array-class2'],
      {
        'object-class': true,
        'hidden-object-class': false
      },
      'final-class'
    )).toBe('base-class conditional-class array-class1 array-class2 object-class final-class')
  })

  it('should handle no arguments', () => {
    expect(cn()).toBe('')
  })

  it('should handle single argument', () => {
    expect(cn('single-class')).toBe('single-class')
  })
})
