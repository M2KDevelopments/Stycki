import React from 'react'
import { Container } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom';
import logo from "../images/logoText.png";
import Ripples from 'react-ripples'

function Logo() {

  const navigation = useNavigate();

  return (
    <Container className='centralise'>
      <Ripples>
        <img style={{ cursor: "pointer" }} onClick={() => navigation('/')} alt="SwearGuard" className="logo" src={logo} width={70} />
      </Ripples>
      <h5 style={{ color: "grey" }}>Get Game</h5>
    </Container>
  )
}

export default Logo