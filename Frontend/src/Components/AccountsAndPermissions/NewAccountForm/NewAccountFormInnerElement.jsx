const NewAccountFormInnerElement = ({ label, id, error, ...props }) => (
  <div className="flex flex-col gap-1">
    <label
      htmlFor={id}
      className="text-xs font-bold uppercase tracking-widest text-gray-500"
    >
      {label}
    </label>
    <input
      id={id}
      className={`border-2 ${
        error ? "border-red-500" : "border-black"
      } px-3 py-2 text-sm font-mono bg-white focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1 transition-all placeholder:text-gray-300`}
      {...props}
    />
    {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
  </div>
);

export default NewAccountFormInnerElement;
