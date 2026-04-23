export const formatDate = (date: Date, format: string = 'MM/DD/YYYY'): string => {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();

  return format
    .replace('MM', month)
    .replace('DD', day)
    .replace('YYYY', String(year));
};

export const formatTime = (date: Date, format: string = 'HH:mm:ss'): string => {
  const d = new Date(date);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};
