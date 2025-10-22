interface FormInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: "text" | "textarea";
}

export default function FormInput({
  label,
  value,
  onChange,
  placeholder = "",
  required = false,
  type = "text",
}: FormInputProps) {
  const baseClassName =
    "w-full rounded-lg border border-gray-200 bg-[#FAFAFA] px-3 py-2 text-[#5C4033] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B6F47]/30 focus:border-[#5C4033]";

  return (
    <div>
      <label className="block text-sm font-semibold text-[#5C4033] mb-1">
        {label}
      </label>
      {type === "textarea" ? (
        <textarea
          placeholder={placeholder}
          className={`${baseClassName} min-h-28`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
        />
      ) : (
        <input
          type="text"
          placeholder={placeholder}
          className={baseClassName}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
        />
      )}
    </div>
  );
}
