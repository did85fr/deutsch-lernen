import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { Button } from './ui/Button';
import styles from '../styles/bubble.module.css';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const NavItem = ({ path, text, icon }: { path: string; text: string; icon: string }) => {
    const isActive = location.pathname === path;
    return (
      <button
        onClick={() => navigate(path)}
        className={cn(
          "flex items-center gap-3 px-6 h-full transition-all",
          "hover:bg-gray-100",
          "text-base", // Taille de police plus grande
          isActive && "bg-gray-100 font-medium",
          "relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full",
          isActive && "after:bg-indigo-600"
        )}
        title={text}
      >
        <img 
          src={`/src/images/${icon}`} 
          alt="" 
          className="w-6 h-6 min-w-[24px]" // Icônes plus grandes et taille minimum fixée
        />
        <span className="hidden md:inline">{text}</span>
      </button>
    );
  };

  const ColoredText = ({ text, color }: { text: string; color: string }) => (
    <span 
      className={styles.hoverText} 
      style={{ '--color-value': color } as React.CSSProperties}
    >
      {text}
    </span>
  );

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <h1 className="text-2xl font-bold shrink-0">
          <ColoredText text="Deut" color="0,0,0" />
          <ColoredText text="sch Le" color="255,0,0" />
          <ColoredText text="rnen" color="254,204,0" />
        </h1>

        {/* Navigation centrée */}
        <nav className="flex h-16 justify-center flex-1 mx-8">
          <div className="flex h-full">
            <NavItem path="/" text="Dashboard" icon="dashboard.png" />
            <NavItem path="/add" text="Add Word" icon="crayon.png" />
            <NavItem path="/list" text="Word List" icon="word list.png" />
            <NavItem path="/practice" text="Practice" icon="molecule.png" />
          </div>
        </nav>

        {/* Logout Button */}
        <Button 
          onClick={handleLogout}
          variant="default"
          className="flex items-center gap-2 shrink-0"
        >
          <img 
            src="/src/images/deconnexion.png" 
            alt="" 
            className="w-5 h-5 min-w-[20px]" 
          />
          <span className="hidden md:inline">Déconnexion</span>
        </Button>
      </div>
    </header>
  );
}

