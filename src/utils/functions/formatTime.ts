export const formatDateVn = (dateString: string): string => {
  const date = new Date(dateString);

  const options: Intl.DateTimeFormatOptions = {
    weekday: "short", // Ví dụ: 'T.5' (Thứ 5)
    day: "numeric", // Ví dụ: '9'
    month: "numeric", // Ví dụ: '10'
    year: "numeric", // Ví dụ: '2025'
  };

  return date.toLocaleDateString("vi-VN", options);
};
