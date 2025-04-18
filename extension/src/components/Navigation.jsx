/*global chrome*/
import React, { useContext, useEffect, useState } from 'react';
import { FaPowerOff, FaUserCircle } from 'react-icons/fa';
import { MdNotificationsActive } from 'react-icons/md';
import { Link } from 'react-router-dom';
import ToolTip from './ToolTip';
import { Badge } from 'react-bootstrap';
import { ContextUser } from '../App';
import { Button } from '@mui/material';
import logo from "../images/logo.png";
import { AiFillDollarCircle, AiTwotoneSetting } from 'react-icons/ai';



function Navigation() {

  const user = useContext(ContextUser)
  const [notifications, setNotifications] = useState(0);


  useEffect(() => {
    async function countNotifications() {

      let { notifications } = await chrome.storage.local.get('notifications')
      if (!notifications) notifications = [];
      const unread = notifications.filter(n => !n.read).length;
      //update badges
      setNotifications(unread)
    }
    countNotifications()
  }, []);



  return (
    <div className='navigation'>
      {/* Top Right Section */}
      {
        notifications ? <Badge style={{ position: "absolute", top: -30, left: 10 }} pill bg='warning'>{notifications}</Badge> : null
      }
      <ToolTip text="Settings">
        <Link to="/api">
          <AiTwotoneSetting color="purple" size={20} class="svg" />
        </Link>
      </ToolTip>
      <ToolTip text="Notifications">
        <Link to="/notifications">
          <MdNotificationsActive color="purple" size={20} class="svg" />
        </Link>
      </ToolTip>
      <ToolTip text={user ? "Logout" : "Login"}>
        {
          user ?
            <Link to="/account" title={user.name}>
              <FaUserCircle color="purple" size={16} class="svg" />
            </Link> :
            <Link to="/login">
              <FaPowerOff color="purple" size={16} class="svg" />
            </Link>
        }
      </ToolTip>

      {/* Top Left Section */}
      <div style={{ display: "flex", marginRight: 10, zIndex: 1, position: "fixed", left: 10, top: 0 }}>
        <Button title="Home" size="small" color="inherit" variant='contained' as={Link} to="/" style={{ fontSize: "0.6rem", borderRadius: 24 }}>
          <img style={{ cursor: "pointer" }} alt="Sticky Notes Pro" className="logo" src={logo} width={20} />
        </Button>
        <Button size='small' color='secondary' variant='contained' style={{ fontSize: "0.6rem", borderRadius: 24 }} onClick={() => chrome.tabs.create({ url: 'https://stickynotespro.vercel.app#priceplans' })}>
          <AiFillDollarCircle size={20} />{" "}Buy More Notes
        </Button>
      </div>

    </div>
  )
}



export default Navigation