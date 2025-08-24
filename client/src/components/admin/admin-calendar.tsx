import { useState, useMemo } from 'react';
import { Calendar, momentLocalizer, View, Views } from 'react-big-calendar';
import moment from 'moment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '@/styles/calendar.css';

// Setup the localizer for react-big-calendar
const localizer = momentLocalizer(moment);

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'booking' | 'task';
  status: string;
  resource?: any;
}

interface AdminCalendarProps {
  className?: string;
}

export default function AdminCalendar({ className = '' }: AdminCalendarProps) {
  const [currentView, setCurrentView] = useState<View>(Views.MONTH);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTypes, setSelectedTypes] = useState('all');

  // Fetch all bookings for calendar
  const { data: allBookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ['/api/bookings', 'all'],
    queryFn: async () => {
      const response = await fetch('/api/bookings?limit=1000', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch bookings');
      return response.json();
    },
    retry: false,
  });

  // Fetch all tasks for calendar
  const { data: allTasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['/api/tasks', 'all'],
    queryFn: async () => {
      const response = await fetch('/api/tasks?limit=1000', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch tasks');
      return response.json();
    },
    retry: false,
  });

  // Transform data into calendar events
  const events = useMemo(() => {
    const calendarEvents: CalendarEvent[] = [];

    // Add booking events
    if (allBookingsData?.bookings) {
      allBookingsData.bookings.forEach((booking: any) => {
        calendarEvents.push({
          id: `booking-${booking.id}`,
          title: `📅 ${booking.title}`,
          start: new Date(booking.startDate),
          end: new Date(booking.endDate),
          type: 'booking',
          status: booking.status,
          resource: { ...booking, type: 'booking' }
        });
      });
    }

    // Add task deadline events  
    if (allTasksData?.tasks) {
      allTasksData.tasks
        .filter((task: any) => task.dueAt)
        .forEach((task: any) => {
          const dueDate = new Date(task.dueAt);
          calendarEvents.push({
            id: `task-${task.id}`,
            title: `⚡ ${task.title}`,
            start: dueDate,
            end: dueDate,
            type: 'task',
            status: task.status,
            resource: { ...task, type: 'task' }
          });
        });
    }

    // Filter by selected types
    if (selectedTypes === 'bookings') {
      return calendarEvents.filter(event => event.type === 'booking');
    } else if (selectedTypes === 'tasks') {
      return calendarEvents.filter(event => event.type === 'task');
    }
    
    return calendarEvents;
  }, [allBookingsData, allTasksData, selectedTypes]);

  // Custom event style getter
  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#3174ad';
    let borderColor = '#3174ad';
    
    if (event.type === 'booking') {
      switch (event.status) {
        case 'confirmed':
          backgroundColor = '#10b981';
          borderColor = '#059669';
          break;
        case 'pending':
          backgroundColor = '#f59e0b';
          borderColor = '#d97706';
          break;
        case 'cancelled':
          backgroundColor = '#ef4444';
          borderColor = '#dc2626';
          break;
        case 'completed':
          backgroundColor = '#8b5cf6';
          borderColor = '#7c3aed';
          break;
        default:
          backgroundColor = '#3b82f6';
          borderColor = '#2563eb';
      }
    } else if (event.type === 'task') {
      switch (event.status) {
        case 'completed':
          backgroundColor = '#10b981';
          borderColor = '#059669';
          break;
        case 'in_progress':
          backgroundColor = '#f59e0b';
          borderColor = '#d97706';
          break;
        case 'todo':
          backgroundColor = '#ef4444';
          borderColor = '#dc2626';
          break;
        default:
          backgroundColor = '#6b7280';
          borderColor = '#4b5563';
      }
    }
    
    return {
      style: {
        backgroundColor,
        borderColor,
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '12px',
      }
    };
  };

  // Custom event component
  const EventComponent = ({ event }: { event: CalendarEvent }) => (
    <div className="px-1 py-0.5 text-xs truncate">
      {event.title}
    </div>
  );

  const handleSelectEvent = (event: CalendarEvent) => {
    // Could open a modal with event details here
    console.log('Selected event:', event);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
        return 'default';
      case 'pending':
      case 'todo':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (bookingsLoading || tasksLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Calendar View</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="border-b border-slate-200">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            📅 Calendar Overview
            <Badge variant="outline" className="text-xs">
              {events.length} events
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-3">
            <Select value={selectedTypes} onValueChange={setSelectedTypes}>
              <SelectTrigger className="w-40" data-testid="calendar-filter-select">
                <SelectValue placeholder="Filter events" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="bookings">Bookings Only</SelectItem>
                <SelectItem value="tasks">Tasks Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-6 p-4 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Legend:</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-xs">Confirmed/Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span className="text-xs">Pending/In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-xs">Todo/Cancelled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-xs">Other</span>
          </div>
        </div>

        {/* Calendar */}
        <div style={{ height: '600px' }} data-testid="admin-calendar">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            view={currentView}
            onView={setCurrentView}
            date={currentDate}
            onNavigate={setCurrentDate}
            eventPropGetter={eventStyleGetter}
            components={{
              event: EventComponent,
            }}
            onSelectEvent={handleSelectEvent}
            popup
            showMultiDayTimes
            step={60}
            timeslots={1}
            views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
            toolbar
            formats={{
              timeGutterFormat: 'HH:mm',
              eventTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) => 
                `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`,
              agendaTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) =>
                `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`,
            }}
          />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {events.filter(e => e.type === 'booking').length}
            </p>
            <p className="text-sm text-slate-600">Total Bookings</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {events.filter(e => e.type === 'task').length}
            </p>
            <p className="text-sm text-slate-600">Task Deadlines</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {events.filter(e => ['confirmed', 'completed'].includes(e.status)).length}
            </p>
            <p className="text-sm text-slate-600">Confirmed/Done</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">
              {events.filter(e => ['pending', 'todo', 'in_progress'].includes(e.status)).length}
            </p>
            <p className="text-sm text-slate-600">Need Attention</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}