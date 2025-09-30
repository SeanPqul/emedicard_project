import React, { useState } from 'react';

interface DateRangeFilterDropdownProps {
  onSelect: (startDate: number | undefined, endDate: number | undefined) => void;
}

const DateRangeFilterDropdown: React.FC<DateRangeFilterDropdownProps> = ({ onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('All Applicants');

  const handleSelect = (filter: string) => {
    setSelectedFilter(filter);
    setIsOpen(false);

    const now = new Date();
    let startDate: number | undefined = undefined;
    let endDate: number | undefined = undefined;

    switch (filter) {
      case 'Past 24 Hours':
        startDate = now.getTime() - (24 * 60 * 60 * 1000);
        endDate = now.getTime();
        break;
      case 'Past 2 Days':
        startDate = now.getTime() - (2 * 24 * 60 * 60 * 1000);
        endDate = now.getTime();
        break;
      case 'Past Week':
        startDate = now.getTime() - (7 * 24 * 60 * 60 * 1000);
        endDate = now.getTime();
        break;
      case 'Past Month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).getTime();
        endDate = now.getTime();
        break;
      case 'Past 6 Months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()).getTime();
        endDate = now.getTime();
        break;
      case 'Past Year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()).getTime();
        endDate = now.getTime();
        break;
      case 'All Applicants':
      default:
        startDate = undefined;
        endDate = undefined;
        break;
    }
    onSelect(startDate, endDate);
  };

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          id="menu-button"
          aria-expanded="true"
          aria-haspopup="true"
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedFilter}
          <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div
          className="origin-top-left absolute left-0 mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10" // Changed right-0 to left-0 and w-56 to w-full
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
        >
          <div className="py-1" role="none">
            {[
              'All Applicants',
              'Past 24 Hours',
              'Past 2 Days',
              'Past Week',
              'Past Month',
              'Past 6 Months',
              'Past Year',
            ].map((filter) => (
              <button
                key={filter}
                onClick={() => handleSelect(filter)}
                className="text-gray-700 block px-4 py-2 text-sm w-full text-left hover:bg-gray-100"
                role="menuitem"
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangeFilterDropdown;
