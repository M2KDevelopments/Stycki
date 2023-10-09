/*global chrome*/
import React from 'react'
import AppBar from '../components/AppBar'
import swal from 'sweetalert';
import { ContextSetUser, ContextUser } from '../App';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container } from 'react-bootstrap';
import { FaUserCircle } from 'react-icons/fa';
import { AiOutlinePoweroff } from 'react-icons/ai';

function PageAccount() {

  const user = useContext(ContextUser)
  const setUser = useContext(ContextSetUser);
  const navigation = useNavigate();


  const onLogout = async () => {
    const result = await swal({
      title: "Logout",
      text: `Are you sure you want to log out?`,
      buttons: ['CANCEL', 'LOGOUT']
    });

    if (result) {
      chrome.storage.local.set({ user: null }, () => setUser(null));
      swal('Logged out')
      navigation('/')
    }
  }


  return (
    <AppBar>
      <Container className="centralise">
        
        <FaUserCircle color="grey" size={50} class="svg" />
        
        <h5>{user.name}</h5>
        <h6>{user.email}</h6>
        <h6><i>{user?.priceplan_name || ""}</i></h6>
        
        <br /><br /><br />

        <Button variant="dark" className="round hover dropShadow" onClick={onLogout}>
          <AiOutlinePoweroff /> Logout
        </Button>

      </Container>
    </AppBar>
  )
}

export default PageAccount