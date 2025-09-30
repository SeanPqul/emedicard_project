import React from 'react';

interface ApplicantsChartProps {
  data: Record<string, number>;
  year: number;
}

const ApplicantsChart: React.FC<ApplicantsChartProps> = ({ data, year }) => {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  // Define a color palette that matches the dashboard's aesthetic
  const barColors = [
    "bg-emerald-500", // Primary green from navbar/buttons
    "bg-blue-500",    // Blue from the original image
    "bg-purple-500",  // Complementary color
    "bg-yellow-500",  // Complementary color
    "bg-cyan-500",    // Complementary color
    "bg-indigo-500",  // Complementary color
  ];

  const maxApplicants = Math.max(0, ...Object.values(data));

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm mb-4 max-w-md w-full min-h-[200px]">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Applicants Submitted ({year})</h3>
      <div className="flex justify-between items-end h-[calc(100%-40px)] w-full gap-2">
        {/* Adjusted height for title, added gap */}
        {months.map((month, index) => {
          const count = data[index.toString()] || 0;
          const barHeight = maxApplicants > 0 ? (count / maxApplicants) * 100 : 0;
          const barColorClass = barColors[index % barColors.length]; // Cycle through colors

          return (
            <div key={month} className="flex flex-col items-center h-full justify-end flex-grow">
              {/* flex-grow for auto layout */}
              {/* Adjusted width to w-6 */}
              <div
                className={`${barColorClass} rounded-t-md w-6 transition-all duration-300 ease-out`}
                style={{ height: `${barHeight}%` }}
                title={`${month}: ${count} applicants`}
              ></div>
              <span className="text-xs text-gray-600 mt-1">{month}</span>
              {/* Removed the count below the month to make it less "much" as per user request, count is still in tooltip */}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ApplicantsChart;
