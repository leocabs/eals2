import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';

const COLORS = ['#00C49F', '#FF0000'];

export default function StudentStatusDonut() {
  const [data, setData] = useState([
    { name: 'Ready', value: 0 },
    { name: 'Not Ready', value: 0 },
  ]);

  useEffect(() => {
    const teacherId = localStorage.getItem("user_id");
  
    if (!teacherId) return;
  
    axios
      .get(`http://localhost:3000/students/dashboard-data?teacher_id=${teacherId}`)
      .then((res) => {
        const { atRiskCount, readyCount } = res.data;
  
        setData([
          { name: 'Ready', value: readyCount },
          { name: 'Not Ready', value: atRiskCount },
        ]);
      })
      .catch((err) => console.error('Failed to fetch dashboard data:', err));
  }, []);

  return (
    <div className="bg-white shadow rounded-xl p-4 flex flex-col items-center justify-center">
      <h2 className="text-md font-semibold mb-2">Student Status</h2>
      <PieChart width={160} height={160}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={70}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
      <div className="flex space-x-4 text-sm mt-2">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-[#00C49F] rounded-full"></div>
          <span>Ready: {data[0].value}</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span>Not Ready: {data[1].value}</span>
        </div>
      </div>
    </div>
  );
}
