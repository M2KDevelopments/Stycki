import { Link } from 'react-router-dom';
import { Button } from '@mui/material';
import logo from "../images/logo.png";

function Navigation() {
  return (
    <div className='navigation'>
      <div style={{ display: "flex", marginRight: 10, zIndex: 1, position: "fixed", left: 10, top: 0 }}>
        <Button title="Home" size="small" color="inherit" variant='contained' as={Link} to="/" style={{ fontSize: "0.6rem", borderRadius: 24, textDecoration:"none" }}>
          <img style={{ cursor: "pointer" }} alt="Sticky Notes Pro" className="logo" src={logo} width={20} />
          <span>Sticky Notes Pro</span>
        </Button>
      </div>
    </div>
  )
}

export default Navigation