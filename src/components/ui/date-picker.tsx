import * as React from 'react'
import { Input } from './input'
import { Calendar } from 'lucide-react'

interface DatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function DatePicker({ label, className, ...props }: DatePickerProps) {
  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="date"
          className={`pl-10 ${className || ''}`}
          {...props}
        />
      </div>
    </div>
  )
}

