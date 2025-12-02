import { useState } from 'react';
import type { Dream } from '../types';
import type { Language } from '../i18n/translations';

function getDreamDays(dreams: Dream[]): Map<string, number> {
  const dreamDays = new Map<string, number>();
  dreams.forEach(dream => {
    const date = new Date(dream.date);
    const dateKey = date.toISOString().split('T')[0];
    dreamDays.set(dateKey, (dreamDays.get(dateKey) || 0) + 1);
  });
  return dreamDays;
}

function generateCalendarData(dreams: Dream[]) {
  const dreamDays = getDreamDays(dreams);
  const today = new Date();
  const calendar: Array<{
    date: Date;
    dreams: number;
  }> = [];

  // Generate data for the last 365 days
  for (let i = 364; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    calendar.push({
      date,
      dreams: dreamDays.get(dateKey) || 0
    });
  }

  return calendar;
}

export function useCalendar(dreams: Dream[], language: Language) {
  const calendarData = generateCalendarData(dreams);
  const weekDays = [
    { key: 'mon', label: 'L' },
    { key: 'tue', label: 'Ma' },
    { key: 'wed', label: 'Me' },
    { key: 'thu', label: 'J' },
    { key: 'fri', label: 'V' },
    { key: 'sat', label: 'S' },
    { key: 'sun', label: 'D' }
  ];

  const getIntensityClass = (count: number) => {
    if (count === 0) return 'bg-white/5';
    if (count === 1) return 'bg-purple-500/40';
    if (count === 2) return 'bg-purple-500/70';
    return 'bg-purple-500';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
      day: 'numeric',
      month: 'short'
    });
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  // Group calendar data by months
  const months = Array.from({ length: 12 }, (_, i) => {
    const monthStart = new Date();
    monthStart.setMonth(monthStart.getMonth() - (11 - i));
    monthStart.setDate(1);
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    monthEnd.setDate(0);

    // Filter days for this month
    const days = calendarData.filter(day => 
      day.date >= monthStart && day.date <= monthEnd
    );

    // Calculate empty days at the start of the month
    const firstDay = days.length > 0 ? days[0].date : monthStart;
    const emptyDays = (firstDay.getDay() + 6) % 7; // Adjust for Monday start
    const emptyPrefix = Array(emptyDays).fill(null);

    return {
      month: monthStart,
      days: [...emptyPrefix, ...days]
    };
  });

  return {
    months,
    weekDays,
    formatMonth,
    formatDate,
    getIntensityClass
  };
}