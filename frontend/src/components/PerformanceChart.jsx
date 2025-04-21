import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useEffect, useState } from 'react';

export default function PerformanceChart() {
  const [chartData, setChartData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [availableMonths, setAvailableMonths] = useState([]);
  const teacherId = localStorage.getItem("user_id");

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        const res = await fetch(`http://localhost:3000/students/performance-history?teacher_id=${teacherId}`);
        const rawData = await res.json();

        console.log("Raw Data:", rawData); // Log raw data for inspection

        // Grouping the data by date
        const grouped = {};

        rawData.forEach(({ flt_score, date_taken }) => {
          const date = new Date(date_taken);
          const formattedDate = date.toLocaleDateString('en-US'); // Format as 'MM/DD/YYYY'
          
          // Add the date entry if not exists
          if (!grouped[formattedDate]) {
            grouped[formattedDate] = { total: 0, count: 0 };
          }

          grouped[formattedDate].total += flt_score;
          grouped[formattedDate].count += 1;
        });

        // Calculating the average score for each date
        const formattedData = Object.keys(grouped).map(date => {
          const { total, count } = grouped[date];
          return {
            date: date,
            average: total / count, // Average score
          };
        });

        // Get months from the formattedData to populate dropdown
        const monthsSet = new Set(formattedData.map(entry => {
          const date = new Date(entry.date);
          return date.toLocaleDateString('en-US', { month: 'long' }); // Month name (e.g., 'January')
        }));

        setAvailableMonths(['All', ...Array.from(monthsSet)]);
        setChartData(formattedData);
      } catch (err) {
        console.error('Error fetching performance history:', err);
      }
    };

    fetchPerformanceData();
  }, [teacherId]);

  // Filter the data based on selected month
  const filteredData = chartData.filter((entry) => {
    if (selectedMonth === 'All') return true;
    const month = new Date(entry.date).toLocaleDateString('en-US', { month: 'long' });
    return month === selectedMonth;
  });

  return (
    <div className="bg-white p-4 rounded-xl shadow w-full h-64 relative">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-md font-semibold">Average Performance</h2>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border px-5 py-1 rounded text-sm"
        >
          {availableMonths.map((month, index) => (
            <option key={index} value={month}>{month}</option>
          ))}
        </select>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={filteredData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="average"
            stroke="#8884d8"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
