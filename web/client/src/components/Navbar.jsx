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
      {/* Left Side: Wolt Logo and Theme Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <h1 style={{ color: '#009de0', margin: 0, fontSize: '24px', fontWeight: 'bold' }}>Wolt</h1>
        </Link>
        <button 
          type="button"
          onClick={toggleTheme}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-app)',
            color: 'var(--text-main)',
            border: '1px solid var(--border-color)',
            cursor: 'pointer',
            fontSize: '16px',
            transition: 'background-color 0.3s ease, color 0.3s ease, transform 0.2s ease'
          }}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>

      {/* Right Side: Navigation Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>



        {/* Public links for guests */}
        {!user && (
          <>
            <button 
              type="button"
              onClick={() => navigate('/login')}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                color: '#009de0',
                border: '1px solid #009de0',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 'bold',
                transition: 'all 0.2s ease'
              }}
            >
              Login
            </button>
            <button 
              type="button"
              onClick={() => navigate('/register')}
              style={{
                padding: '8px 16px',
                backgroundColor: '#009de0',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 'bold',
                transition: 'background-color 0.2s ease'
              }}
            >
              Sign Up
            </button>
          </>
        )}

        {/* Private links for authenticated users */}
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

          </>
        )}
      </div>
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
}