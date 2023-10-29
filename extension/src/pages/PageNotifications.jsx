/*global chrome*/
import React, { useEffect, useState } from 'react';
import AppBar from '../components/AppBar';
import { Button, Container } from 'react-bootstrap';
import { Slide } from 'react-awesome-reveal';
import Ripples from 'react-ripples';
import swal from 'sweetalert';
import { AnimationNotifications } from '../components/Lottie';


function PageNotifications() {

  const [notifications, setNotifications] = useState([]);


  useEffect(() => {
    async function countNotifications() {

      let { notifications } = await chrome.storage.local.get('notifications');
      if (!notifications) notifications = [];

      //update badges
      setNotifications(notifications);

      //Read all the notifications
      for (const notification of notifications) notification.read = true;
      await chrome.storage.local.set({ notifications }, () => chrome.action.setBadgeText({ text: '' }));
    }
    countNotifications();
  }, []);


  const onDel = async (index) => {
    const result = await swal({
      title: "Remove Notification",
      text: `Are you sure you want to remove this notification?`,
      icon: "info",
      buttons: ['CANCEL', 'REMOVE']
    })
    if (!result) return;
    const list = notifications.filter((n, i) => i !== index);
    chrome.storage.local.set({ notifications: list }, () => setNotifications(list));
  }


  if (!notifications.length) {
    return (
      <AppBar>
        <br /><br />
        <Container fluid className='centralise'>
          <AnimationNotifications width={300} title="No Notifications" />
        </Container>
      </AppBar>
    )
  }

  
  return (
    <AppBar>
      <br /><br />
      <Container fluid style={{ overflowY: "scroll", maxHeight: 260 }}>
        {notifications.map((note, index) =>
          <Slide key={index} cascade delay={(index + 1) * 100}>
            <div style={{ textAlign: "left" }}>
              <Ripples>
                <div className='glass' style={{ padding: 10, display: "flex", borderRadius: 10 }}>
                  <div style={{ width: "20%" }}>
                    <img src={note.iconUrl} alt={note.title} style={{ width: "100%", cursor: "pointer" }} onClick={() => chrome.tabs.create({ url: note.url })} />
                  </div>
                  <div style={{ width: "80%" }}>
                    <h6 style={{ fontSize: "0.85rem" }}><strong>{note.title}</strong></h6>
                    <h6 style={{ fontSize: "0.8rem" }}>{note.message}</h6>
                    <h6 style={{ fontSize: "0.7rem" }}><i>{note.contextMessage} - {new Date(note.date).toLocaleString()}</i></h6>
                    <div style={{ display: "flex" }}>
                      {note.buttons && note.buttons.length ?
                        <>
                          {
                            note.buttons.map((btn, i) =>
                              <Button key={'btn' + i} size='sm' variant="light" style={{ fontSize: "0.7rem" }} onClick={() => chrome.tabs.create({ url: btn.url })}>{btn.title}</Button>
                            )
                          }
                        </>
                        : null
                      }
                      <Button size='sm' variant="danger" style={{ fontSize: "0.7rem" }} onClick={() => onDel(index)}>Del</Button>
                    </div>
                  </div>
                </div>
              </Ripples>
            </div>
          </Slide>
        )}
      </Container>
    </AppBar>
  )
}

export default PageNotifications