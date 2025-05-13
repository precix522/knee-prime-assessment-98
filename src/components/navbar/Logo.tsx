
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
      className="text-gray-900 font-bold text-xl flex items-center py-1"
      onClick={handleHomeClick}
      aria-label="GATOR PRIME Home"
    >
      <img 
        src="/lovable-uploads/cbb9c383-12da-4b7c-9a0e-22d0bc691c2f.png" 
        alt="GATOR PRIME Logo" 
        className="h-8" 
      />
    </a>
  );
};
