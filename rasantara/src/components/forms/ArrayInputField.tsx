interface ArrayInputFieldProps {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

export default function ArrayInputField({
  label,
  values,
  onChange,
  placeholder = "",
}: ArrayInputFieldProps) {
  const handleValueChange = (index: number, value: string) => {
    const copy = [...values];
    copy[index] = value;
    onChange(copy);
  };

  const handleRemove = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const handleAdd = () => {
    onChange([...values, ""]);
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-[#5C4033] mb-1">
        {label}
      </label>
      <div className="space-y-2">
        {values.map((val, idx) => (
          <div key={idx} className="flex gap-2">
            <input
              type="text"
              className="flex-1 rounded-lg border border-gray-200 bg-[#FAFAFA] px-3 py-2 text-[#5C4033] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B6F47]/30 focus:border-[#5C4033]"
              placeholder={placeholder}
              value={val}
              onChange={(e) => handleValueChange(idx, e.target.value)}
            />
            <button
              type="button"
              className="px-3 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 text-sm"
              onClick={() => handleRemove(idx)}
              disabled={values.length === 1}
            >
              −
            </button>
            <button
              type="button"
              className="px-3 py-2 rounded-lg border border-[#5C4033] text-[#5C4033] hover:bg-[#F9F5EB] text-sm"
              onClick={handleAdd}
            >
              +
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
