
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
        src="/lovable-uploads/508a5528-851c-4a1c-96c6-3847e0488399.png" 
        alt="PRECIX Logo" 
        className="h-12 w-auto" 
      />
    </a>
  );
};
