// time stamp for last update
export const updatedAt = (lastUpdate: Date) => {
    return new Date(lastUpdate).toLocaleTimeString([], {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
} 

export const minusDays = (date: Date, minusDays: number): Date => {
    let d: Date = new Date(date.getTime());
    d.setDate(date.getDate() - minusDays)
    return d;
}

export const plusDays = (date: Date, plusDays: number): Date => {
    let d: Date = new Date(date.getTime());
    d.setDate(date.getDate() + plusDays)
    return d;
}

export const diffDays = (a: Date, b: Date): number => {
    return Math.ceil(Math.abs(a.valueOf() - b.valueOf()) / (1000 * 3600 * 24));
}

export const sameDay = (date_a: Date, date_b: Date): boolean => {
    return date_a.getFullYear() == date_b.getFullYear() && date_a.getMonth() == date_b.getMonth() && date_a.getDay() == date_b.getDay();
}

export const compareDate = (date1: Date, date2: Date): number => {
  let d1 = new Date(date1); let d2 = new Date(date2);

  // Check if the dates are equal
  let same = d1.getTime() === d2.getTime();
  if (same) return 0;

  // Check if the first is greater than second
  if (d1 > d2) return 1;
 
  // Check if the first is less than second
  if (d1 < d2) return -1;
  return 0;
}