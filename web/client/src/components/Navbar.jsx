import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { CartContext } from '../contexts/CartContext';
import { CartSidebar } from './CartSidebar';

export function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { cartCount } = useContext(CartContext);
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const [showAddedAnimation, setShowAddedAnimation] = React.useState(false);
  const prevCartCountRef = React.useRef(cartCount);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (cartCount > prevCartCountRef.current) {
      setShowAddedAnimation(true);
      const timer = setTimeout(() => setShowAddedAnimation(false), 1500);
      return () => clearTimeout(timer);
    }
    prevCartCountRef.current = cartCount;
  }, [cartCount]);

  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 30px',
      backgroundColor: 'var(--bg-card)',
      borderBottom: '1px solid var(--border-color)',
      transition: 'background-color 0.3s ease, border-color 0.3s ease',
      fontFamily: 'sans-serif'
    }}>
      {/* Right Side: Wolt Logo visible to everyone */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <h1 style={{ color: '#009de0', margin: 0, fontSize: '24px', fontWeight: 'bold' }}>Wolt</h1>
        </Link>
      </div>

      {/* Left Side: Theme and Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button 
          type="button"
          onClick={toggleTheme}
          style={{
            padding: '8px 14px',
            backgroundColor: 'var(--bg-app)',
            color: 'var(--text-main)',
            border: '1px solid var(--border-color)',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 'bold',
            transition: 'background-color 0.3s ease, color 0.3s ease'
          }}
        >
          Theme: {theme}
        </button>



        {/* Private links */}
        {user && (
          <>
            <button 
              type="button"
              onClick={() => navigate('/orders')}
              style={{
                padding: '8px 14px',
                backgroundColor: 'var(--bg-app)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-color)',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 'bold'
              }}
            >
              Orders
            </button>

            <button 
              type="button"
              onClick={logout}
              style={{
                padding: '8px 14px',
                backgroundColor: '#ff4d4d',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 'bold'
              }}
            >
              Logout
            </button>

            <button 
              type="button"
              onClick={() => setIsCartOpen(true)}
              style={{
                padding: '8px 14px',
                backgroundColor: '#009de0',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 'bold',
                position: 'relative'
              }}
            >
              Cart 🛒
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  backgroundColor: '#ff4d4d',
                  color: 'white',
                  borderRadius: '50%',
                  padding: '2px 6px',
                  fontSize: '11px'
                }}>
                  {cartCount}
                </span>
              )}

              {/* Fading +1 Animation */}
              {showAddedAnimation && (
                <span style={{
                  position: 'absolute',
                  bottom: '-20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  color: '#009de0',
                  fontWeight: '900',
                  fontSize: '16px',
                  textShadow: '0px 2px 4px rgba(0,0,0,0.2)',
                  animation: 'fadeOutDown 1.5s cubic-bezier(0.25, 1, 0.5, 1) forwards'
                }}>
                  +1
                </span>
              )}
            </button>

            <style>
              {`
                @keyframes fadeOutDown {
                  0% { opacity: 0; transform: translate(-50%, -10px) scale(0.8); }
                  20% { opacity: 1; transform: translate(-50%, 0) scale(1.2); }
                  100% { opacity: 0; transform: translate(-50%, 20px) scale(1); }
                }
              `}
            </style>

            {user.profileImage && (
              <img 
                src={user.profileImage} 
                alt="User Profile" 
                title={`Logged in as ${user.name}`}
                style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  objectFit: 'cover', 
                  border: '2px solid #009de0',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }} 
              />
            )}
          </>
        )}
      </div>
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
}