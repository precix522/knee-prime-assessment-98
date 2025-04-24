
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
      className="text-gray-900 font-bold text-xl flex items-center space-x-1"
      onClick={handleHomeClick}
    >
      <span className="text-health-600">GATOR</span>
      <span>PRIME</span>
    </a>
  );
};
