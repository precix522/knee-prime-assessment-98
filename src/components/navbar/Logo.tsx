
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
      aria-label="PRECIX Home"
    >
      <img 
        src="/lovable-uploads/d9a24f6e-d258-4ec3-9a5e-3af02541919b.png" 
        alt="PRECIX Logo" 
        className="h-8" 
      />
    </a>
  );
};
