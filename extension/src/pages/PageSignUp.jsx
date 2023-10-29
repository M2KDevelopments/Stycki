import React, { useState } from 'react'
import AppBar from '../components/AppBar'
import { Link } from 'react-router-dom'
import { Button, Col, Form, Row } from 'react-bootstrap'
import * as API from "../utils/api";
import swal from 'sweetalert'
import Logo from '../components/Logo';


function PageSignUp() {

  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const name = e.target['name'].value;
      const email = e.target['email'].value;
      const response = await API.PostAPI('/api/email/signup', { email, name });
      if (response.result) {
        swal('Sign Up', response.message, 'success');
      } else {
        swal('Sign Up', response.message, 'warning');
      }
    } catch (err) {
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  }


  return (
    <AppBar>
      <br /><br />
      <Logo />
      <Form onSubmit={onSubmit}>
        <Row xs={1}>
          <Col>
            <Form.Group className="mb-3 input" controlId="mwo.name">
              <Form.Control className='input' disabled={loading} type="name" name="name" placeholder="Name" />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group className="mb-3 input" controlId="mwo.email">
              <Form.Control className='input' disabled={loading} type="email" name="email" placeholder="Email" />
            </Form.Group>
          </Col>
        </Row>


        <Button style={{ width: "100%", marginBottom: 10 }} disabled={loading} variant="warning" className="drop" type="submit">
          {loading ? "Loading..." : "Create Account"}
        </Button>


        <h6 style={{ fontSize: '0.8rem' }}>
          <Link to="/login">I Have an Account?</Link>
        </h6>
      </Form>
    </AppBar>
  )
}

export default PageSignUp