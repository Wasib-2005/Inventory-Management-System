const TimeZoneWarning = () => {
  const timeZone = import.meta.env.VITE_TIMEZONE;
  return (
    <div>
      <p className="text-sm text-yellow-600">
        Note: Server timezone is set to
        <span className="font-semibold"> {timeZone}. </span>
        For any time-related operations, please ensure to convert times to
        <span className="font-semibold"> {timeZone} </span>
        to avoid discrepancies.
      </p>
    </div>
  );
};

export default TimeZoneWarning;
