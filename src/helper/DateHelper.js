/**
 * Date formatting helper for Admin application.
 * Formats all dates into D/M/Y (DD/MM/YYYY) format.
 */

export const formatDateDMY = (dateInput) => {
  if (!dateInput) return '—';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (e) {
    return String(dateInput || '—');
  }
};

export const formatDateTimeDMY = (dateInput) => {
  if (!dateInput) return '—';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${day}/${month}/${year}, ${time}`;
  } catch (e) {
    return String(dateInput || '—');
  }
};

export default {
  formatDateDMY,
  formatDateTimeDMY
};
