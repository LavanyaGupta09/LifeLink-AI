import React, { useEffect } from 'react';
import { useReminderStore } from '../store/reminderStore';

const AlarmManager: React.FC = () => {
  const { reminders, triggerAlarm, activeAlarm } = useReminderStore();

  useEffect(() => {
    const interval = setInterval(() => {
      if (activeAlarm) return; // don't trigger if one is already active

      const now = new Date();
      const currentHours = now.getHours().toString().padStart(2, '0');
      const currentMinutes = now.getMinutes().toString().padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      
      const currentDateStr = now.toISOString().split('T')[0];

      reminders.forEach(reminder => {
        if (!reminder.active) return;
        
        // Check date bounds
        if (reminder.startDate && reminder.startDate > currentDateStr) return;
        if (reminder.endDate && reminder.endDate < currentDateStr) return;

        reminder.timeSlots.forEach(slot => {
          if (slot.time === currentTimeStr) {
            triggerAlarm(reminder, currentTimeStr);
          }
        });
      });
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [reminders, triggerAlarm, activeAlarm]);

  return null;
};

export default AlarmManager;
