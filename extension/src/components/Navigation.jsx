/*global chrome*/
import React, { useContext, useEffect, useState } from 'react';
import { FaPowerOff, FaUserCircle } from 'react-icons/fa';
import { MdNotificationsActive } from 'react-icons/md';
import { Link } from 'react-router-dom';
import ToolTip from './ToolTip';
import { Badge } from 'react-bootstrap';
import { ContextUser } from '../App';
import { Button } from '@mui/material';
import { AiFillDollarCircle } from 'react-icons/ai';



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
      {
        notifications ? <Badge style={{ position: "absolute", top: 10, left: -12 }} pill bg='warning'>{notifications}</Badge> : null
      }
      <ToolTip text="Notifications">
        <Link to="/notifications">
          <MdNotificationsActive color="#5f92ff" size={20} class="svg" />
        </Link>
      </ToolTip>
      <ToolTip text={user ? "Logout" : "Login"}>
        {
          user ?
            <Link to="/account" title={user.name}>
              <FaUserCircle color="#5f92ff" size={16} class="svg" />
            </Link> :
            <Link to="/login">
              <FaPowerOff color="#5f92ff" size={16} class="svg" />
            </Link>
        }
      </ToolTip>
      <Button size='small' color='info' variant='contained' style={{ fontSize: "0.6rem", borderRadius: 24, marginRight: 10, zIndex: 1, position: "fixed", left: 10 }} onClick={() => chrome.tabs.create({ url: 'https://stickynotespro.com/priceplans' })}><AiFillDollarCircle size={20}/>{" "}Buy More Notes</Button>
    </div>
  )
}



export default Navigation