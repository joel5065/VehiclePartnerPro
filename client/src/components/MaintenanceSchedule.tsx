import { formatPrice } from "../lib/utils";
import { Check } from "lucide-react";

interface MaintenanceScheduleProps {
  schedule: {
    [interval: string]: string[];
  };
  className?: string;
}

const MaintenanceSchedule = ({ schedule, className = "" }: MaintenanceScheduleProps) => {
  const intervals = ["5,000", "10,000", "15,000", "30,000", "60,000"];
  
  // Get all unique maintenance items across all intervals
  const allItems = new Set<string>();
  Object.values(schedule).forEach(items => {
    items.forEach(item => allItems.add(item));
  });
  
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Service</th>
            {intervals.map(interval => (
              <th key={interval} className="py-3 px-4 text-left font-semibold text-gray-700 border-b">
                {interval} miles
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from(allItems).map(item => (
            <tr key={item} className="border-b hover:bg-gray-50">
              <td className="py-3 px-4">{item}</td>
              {intervals.map(interval => (
                <td key={`${item}-${interval}`} className="py-3 px-4">
                  {schedule[interval.replace(",", "")] && schedule[interval.replace(",", "")].includes(item) ? (
                    <Check className="text-green-500 h-5 w-5" />
                  ) : (
                    "-"
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="mt-8 max-w-3xl mx-auto bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-3">Your Personalized Plan Includes:</h3>
        <ul className="space-y-2">
          <li className="flex items-start">
            <Check className="text-green-500 mt-1 mr-2 h-5 w-5" />
            <span>Detailed maintenance schedule based on your vehicle and driving habits</span>
          </li>
          <li className="flex items-start">
            <Check className="text-green-500 mt-1 mr-2 h-5 w-5" />
            <span>Email or text reminders when service is due</span>
          </li>
          <li className="flex items-start">
            <Check className="text-green-500 mt-1 mr-2 h-5 w-5" />
            <span>Service history tracking and record keeping</span>
          </li>
          <li className="flex items-start">
            <Check className="text-green-500 mt-1 mr-2 h-5 w-5" />
            <span>Recommended parts for your specific vehicle</span>
          </li>
          <li className="flex items-start">
            <Check className="text-green-500 mt-1 mr-2 h-5 w-5" />
            <span>DIY guides and video tutorials for common maintenance tasks</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default MaintenanceSchedule;
