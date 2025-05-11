import { Container } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom';
import logo from "../images/logoText.png";

function Logo() {

  const navigation = useNavigate();

  return (
    <Container className='centralise'>
      <img style={{ cursor: "pointer" }} onClick={() => navigation('/')} alt="Sticky Notes Pro" className="logo" src={logo} width={70} />
    </Container>
  )
}

export default Logo