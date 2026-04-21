import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();

  return (
    <nav className="glass-panel" style={{ margin: '1rem', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', color: 'white', fontSize: '0.8rem' }}>
          VAG
        </div>
        <h2 style={{ margin: 0, fontSize: '1.5rem', background: 'linear-gradient(135deg, #fff, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Garanties VAG
        </h2>
      </Link>
      <div style={{ display: 'flex', gap: '1.5rem' }}>
        <Link 
          to="/" 
          style={{ 
            color: location.pathname === '/' ? 'white' : 'var(--text-muted)',
            fontWeight: location.pathname === '/' ? '600' : '400',
            transition: 'color 0.2s'
          }}
        >
          Tableau de bord
        </Link>
        <Link 
          to="/dossiers" 
          style={{ 
            color: location.pathname === '/dossiers' ? 'white' : 'var(--text-muted)',
            fontWeight: location.pathname === '/dossiers' ? '600' : '400',
            transition: 'color 0.2s'
          }}
        >
          Dossiers
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
