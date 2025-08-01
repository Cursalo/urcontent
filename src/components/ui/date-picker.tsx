import React from 'react';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'; interface DatePickerProps { date?: Date; onDateChange: (date: Date | undefined) => void; placeholder?: string; disabled?: boolean; className?: string;
} export const DatePicker: React.FC<DatePickerProps> = ({ date, onDateChange, placeholder = 'Seleccionar fecha', disabled = false, className
}) => { return ( <Popover> <PopoverTrigger asChild> <Button variant="outline"className={cn( 'w-full justify-start text-left font-normal', !date && 'text-muted-foreground', className )} disabled={disabled} > <CalendarIcon className="mr-2 h-4 w-4"/> {date ? format(date, 'PPP', { locale: es }) : placeholder} </Button> </PopoverTrigger> <PopoverContent className="w-auto p-0"> <Calendar mode="single"selected={date} onSelect={onDateChange} initialFocus locale={es} /> </PopoverContent> </Popover> );
}; export default DatePicker;