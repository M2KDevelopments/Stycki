/*global chrome*/
import React, { useContext, useState } from 'react'
import { Button, Col, Form, Row } from 'react-bootstrap'
import AppBar from '../components/AppBar'
// import ButtonFacebook from '../components/ButtonFacebook';
import ButtonGoogle from '../components/ButtonGoogle';
import ButtonLinkedin from '../components/ButtonLinkedin';
import * as API from "../utils/api";
import * as Google from "../utils/google";
// import * as Facebook from "../utils/facebook";
import * as Linkedin from "../utils/linkedin";
import swal from 'sweetalert';
import { Link, useNavigate } from 'react-router-dom';
import { ContextSetUser } from '../App';

function PageLogin() {

  const [loading, setLoading] = useState(false);
  const navigation = useNavigate();
  const setUser = useContext(ContextSetUser);

  const onSubmit = async (e) => {

    e.preventDefault();

    try {
      setLoading(true);
      const email = e.target['email'].value;
      const password = e.target['password'].value;
      const response = await API.PostAPI('/api/email/oauth', { email, password });
      if (response.result) {
        swal('Login', response.message, 'success');
        chrome.storage.local.set({ user: response.access_token });

        const user = await API.GetAPI(`/api/user`);
        setUser(user);

        navigation('/');
      } else {
        swal('Login', response.message, 'warning');
      }
    } catch (err) {
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  }

  const onForgetPassword = async (e) => {
    const email = await swal({
      title: "Forgot Password",
      text: `Please enter your email`,
      info: `info`,
      content: 'input',
      buttons: ['NO', 'RESET PASSWORD']
    });

    if (email) {
      try {
        setLoading(true);
        const res = await API.PostAPI('/api/email/password/forgot', { email });
        swal('Reset Password', res.message, res.result ? 'success' : 'warning');
      } catch (e) {
        console.log(e.message);
        swal('Forgot Password', 'Something went wrong', 'error')
      } finally {
        setLoading(false);
      }

    }
  }

  const onGoogle = async () => {
    const response = await Google.login();
    if (response.result) swal('Login Successful')
    const user = await API.GetAPI(`/api/user`);
    setUser(user);
    navigation('/');
  }

  // const onFacebook = async () => {
  //   const response = await Facebook.login();
  //   if (response.result) swal('Login Successful')
  //   const user = await API.GetAPI(`/api/user`);
  //   setUser(user);
  //   navigation('/');
  // }

  const onLinkedin = async () => {
    const response = await Linkedin.login();
    if (response.result) swal('Login Successful');
    const user = await API.GetAPI(`/api/user`);
    setUser(user);
    navigation('/');
  }

  return (
    <AppBar>
      <Form onSubmit={onSubmit}>

        <Row xs={1}>
          <Col>
            <Form.Group className="mb-3 input" controlId="mwo.email">
              <Form.Control className='input' disabled={loading} type="email" name="email" placeholder="Email" />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group className="mb-3 input" controlId="mwo.password">
              <Form.Control className='input' disabled={loading} type="password" name="password" placeholder="Password" />
            </Form.Group>
          </Col>
        </Row>

        <Button style={{ width: "100%", marginBottom: 10 }} disabled={loading} variant="warning" type="submit">
          Login With Email
        </Button>


        <Row xs={2}>
          <Col>
            <h6 style={{ fontSize: '0.8rem' }}>
              <Link to="/signup">Sign Up?</Link>
            </h6>
          </Col>
          <Col>
            <h6 style={{ fontSize: '0.8rem' }}>
              <Link to="/login#" onClick={onForgetPassword}>Forgot Password?</Link>
            </h6>
          </Col>
        </Row>
        <div style={{ display: "flex", margin: 10, color: "grey", fontWeight: 900, fontSize: '0.9rem' }}>
          <h6 style={{ width: "100%" }}>OR</h6>
        </div>


        <ButtonGoogle onClick={onGoogle} />
        <br />
        <ButtonLinkedin onClick={onLinkedin} />


      </Form>
    </AppBar>
  )
}

export default PageLogin