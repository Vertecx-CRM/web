import { useState, useEffect } from 'react';
import moment from 'moment';
import 'moment/locale/es';

interface CalendarMonthProps {
  onDateSelect: (date: Date) => void;
  selectedDate?: Date;
}

const CalendarMonth = ({ onDateSelect, selectedDate }: CalendarMonthProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<string[]>([]);

  // Calcular la semana completa de la fecha seleccionada
  useEffect(() => {
    if (!selectedDate) {
      setSelectedWeek([]);
      return;
    }

    const selectedMoment = moment(selectedDate);
    const weekStart = selectedMoment.clone().startOf('isoWeek'); 
    const weekDays = [];

    for (let i = 0; i < 7; i++) {
      weekDays.push(weekStart.clone().add(i, 'days').format('YYYY-MM-DD'));
    }

    setSelectedWeek(weekDays);
  }, [selectedDate]);

  // Función para navegar al mes anterior
  const navigateToPreviousMonth = () => {
    setCurrentDate(prevDate => moment(prevDate).subtract(1, 'month').toDate());
  };

  // Función para navegar al mes siguiente
  const navigateToNextMonth = () => {
    setCurrentDate(prevDate => moment(prevDate).add(1, 'month').toDate());
  };

  // Función para manejar clic en una fecha
  const handleDateClick = (date: moment.Moment) => {
    onDateSelect(date.toDate());
  };

  // Obtener información del mes actual 
  const monthStart = moment(currentDate).startOf('month');
  const monthEnd = moment(currentDate).endOf('month');
  const startDate = moment(monthStart).startOf('isoWeek');
  const endDate = moment(monthEnd).endOf('isoWeek');      

  // Función para determinar el estilo de cada día
  const getDayStyle = (day: moment.Moment) => {
    const dayStr = day.format('YYYY-MM-DD');
    const isCurrentMonth = moment(day).isSame(currentDate, 'month');
    const isToday = moment(day).isSame(new Date(), 'day');
    const isInSelectedWeek = selectedWeek.includes(dayStr);
    const isSelectedDate = selectedDate && moment(selectedDate).isSame(day, 'day');
    const isHovered = hoveredDate === dayStr;

    let bgClass = '';
    let textClass = '';
    let shadowClass = '';
    let borderClass = '';

    if (!isInSelectedWeek) {
      bgClass = !isCurrentMonth
        ? 'text-blue-950/20'
        : isToday
          ? 'bg-red-700'
          : 'bg-white';
      textClass = !isCurrentMonth
        ? 'text-blue-950/20'
        : isToday
          ? 'text-white'
          : 'text-stone-900';
      shadowClass = !isCurrentMonth
        ? ''
        : isToday
          ? 'shadow-[0px_3.2px_2.1px_0px_rgba(0,71,255,0.20)] shadow-[0px_1.6px_1.1px_0px_rgba(0,31,112,0.25)]'
          : 'shadow-[0px_1px_1px_0px_rgba(0,14,51,0.05)]';
    } else {
      // Estilos para días de la semana seleccionada
      if (isSelectedDate) {
        bgClass = 'bg-[#B20000]';
      } else {
        bgClass = 'bg-[#FFD6D6]';
      }
      textClass = 'text-white';
      shadowClass = 'shadow-[0px_1px_1px_0px_rgba(0,14,51,0.05)]';
    }

    // Aplicar borde al hover
    if (isHovered) {
      borderClass = 'border-2 border-[#CC0000]';
    }

    return {
      bg: bgClass,
      text: textClass,
      shadow: shadowClass,
      border: borderClass
    };
  };

  // Generar los días del mes
  const days = [];
  let day = startDate.clone();

  while (day <= endDate) {
    const cloneDay = moment(day);
    const dayStr = cloneDay.format('YYYY-MM-DD');
    const dayStyle = getDayStyle(cloneDay);

    days.push(
      <div
        key={day.toString()}
        className="flex justify-center items-center p-0.5"
        onClick={() => handleDateClick(cloneDay)}
        onMouseEnter={() => setHoveredDate(dayStr)}
        onMouseLeave={() => setHoveredDate(null)}
      >
        <div
          className={`w-6 h-6 flex items-center justify-center rounded-md cursor-pointer ${dayStyle.bg} ${dayStyle.text} ${dayStyle.shadow} ${dayStyle.border} transition-all duration-200`}
        >
          <span className="text-xs font-bold">
            {cloneDay.date()}
          </span>
        </div>
      </div>
    );
    day.add(1, 'day');
  }

  return (
    <div className="w-[400px] flex justify-center items-center p-2">
      <div className="w-full p-3 bg-[#F4F4F4] rounded-2xl shadow-md outline outline-1 outline-offset-[-1.08px] outline-white flex flex-col justify-start items-start gap-1 overflow-hidden">

        {/* Toolbar personalizada */}
        <div className="w-full h-8 relative mb-1">
          {/* Botón de mes anterior */}
          <button
            onClick={navigateToPreviousMonth}
            className="w-6 h-6 left-0 top-0 absolute bg-white rounded-full shadow-sm flex items-center justify-center"
          >
            <img
              src="/icons/Medium-left.svg"
              className="w-4 h-4 text-gray-700"
              alt="Mes anterior"
            />
          </button>

          {/* Botón de mes siguiente */}
          <button
            onClick={navigateToNextMonth}
            className="w-6 h-6 right-0 top-0 absolute bg-white rounded-full flex items-center justify-center"
          >
            <img
              src="/icons/Medium-right.svg"
              className="w-4 h-4 text-gray-700"
              alt="Mes siguiente"
            />
          </button>

          {/* Mes y año actual */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex justify-start items-start gap-1">
            <div className="px-2 py-1 bg-white rounded-md flex items-center gap-1">
              <div className="text-neutral-900 text-sm font-bold">
                {moment(currentDate).format('MMMM')}
              </div>
              <div className="w-3 h-3">
                <img
                  src="/icons/Down.svg"
                  className="w-3 h-3 text-gray-700"
                  alt="Seleccionar mes"
                />
              </div>
            </div>
            <div className="px-2 py-1 bg-white rounded-md flex items-center gap-1">
              <div className="text-neutral-900 text-sm font-bold">
                {moment(currentDate).format('YYYY')}
              </div>
              <div className="w-3 h-3">
                <img
                  src="/icons/Down.svg"
                  className="w-3 h-3 text-gray-700"
                  alt="Seleccionar año"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Grid para días de la semana y números */}
        <div className="w-full grid grid-cols-7 gap-1">
          {/* Encabezados de días de la semana (lunes → domingo) */}
          {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'].map((day, index) => (
            <div key={index} className="flex justify-center items-center">
              <div className="w-6 h-6 flex items-center justify-center">
                <div className="text-center text-stone-900 text-xs font-medium">
                  {day}
                </div>
              </div>
            </div>
          ))}

          {/* Días del mes */}
          {days}
        </div>
      </div>
    </div>
  );
};

export default CalendarMonth;