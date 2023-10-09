/*global chrome*/
import React, { useContext, useEffect, useState } from 'react'
import { FaPowerOff, FaUserCircle } from 'react-icons/fa'
import { MdNotificationsActive } from 'react-icons/md';
import { Link } from 'react-router-dom';
import ToolTip from './ToolTip';
import { Badge } from 'react-bootstrap';
import {  ContextUser } from '../App';

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
          <MdNotificationsActive color="#2b9ef0" size={20} class="svg" />
        </Link>
      </ToolTip>
      <ToolTip text={user ? "Logout" : "Login"}>
        {
          user ?
            <Link to="/account" title={user.email}>
              <FaUserCircle color="#2b9ef0" size={16} class="svg" />
            </Link> :
            <Link to="/login">
              <FaPowerOff color="#2b9ef0" size={16} class="svg" />
            </Link>
        }
      </ToolTip>
    </div>
  )
}



export default Navigation