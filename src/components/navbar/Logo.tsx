
import { useNavigate } from "react-router-dom";

export const Logo = () => {
  const navigate = useNavigate();

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate("/");
  };

  return (
    <a 
      href="/" 
      className="text-gray-900 font-bold text-xl flex items-center space-x-1.5 py-1"
      onClick={handleHomeClick}
      aria-label="GATOR PRIME Home"
    >
      <span className="text-health-600 whitespace-nowrap">GATOR</span>
      <span className="whitespace-nowrap">PRIME</span>
    </a>
  );
};
