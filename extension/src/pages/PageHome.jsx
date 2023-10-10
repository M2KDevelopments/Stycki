/*global chrome*/

import React, { useContext } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import AppBar from '../components/AppBar';
import { Alert } from 'react-bootstrap';
import { ContextUser } from '../App';
import swal from 'sweetalert';

function PageHome() {

  const user = useContext(ContextUser);

  // Get chrome voices
  useEffect(() => {

  }, [])

  const onCopy = (note) => window.navigator.clipboard.writeText(note).then(() => swal('Copied notes'));

  return (
    <AppBar>
      <Alert variant="light">
        <Alert.Heading>

        </Alert.Heading>
      </Alert>


    </AppBar >
  )
}

export default PageHome