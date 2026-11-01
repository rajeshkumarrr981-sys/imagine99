import React, { useState, useEffect, useRef } from "react";

type Option = { label: string; value: string };

const CustomSelect = ({
  options,
  value,
  onChange,
}: {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((o) => o.value === value) ?? options[0];
  const selectRef = useRef<HTMLDivElement>(null);

  // Function to close the dropdown when a click occurs outside the component
  const handleClickOutside = (event: MouseEvent) => {
    if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    // Add a click event listener to the document
    document.addEventListener("click", handleClickOutside);

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option: Option) => {
    onChange(option.value);
    toggleDropdown();
  };

  return (
    <div
      className="custom-select custom-select-2 flex-shrink-0 relative"
      ref={selectRef}
    >
      <div
        className={`select-selected whitespace-nowrap ${
          isOpen ? "select-arrow-active" : ""
        }`}
        onClick={toggleDropdown}
      >
        {selectedOption.label}
      </div>
      <div className={`select-items ${isOpen ? "" : "select-hide"}`}>
        {options.map((option, index) => (
          <div
            key={index}
            onClick={() => handleOptionClick(option)}
            className={`select-item ${
              selectedOption === option ? "same-as-selected" : ""
            }`}
          >
            {option.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomSelect;
