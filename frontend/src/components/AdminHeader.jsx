import { useNavigate } from 'react-router-dom';

function aHeader() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('userId'); // or the actual key you're using
    navigate('/'); // redirect to login page
  };

  return (
    <header className="bg-[#E3D0B4] flex justify-between items-center px-4 py-3 shadow-md">
      <div className="flex items-center gap-4">
        {/* Add any logo or left content here */}
      </div>

      {/* Right Content */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold">Mosico Team</p>
            <p className="text-xs text-gray-600">Admin</p>
          </div>  
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default aHeader;
