import React from 'react'
import AppBar from '../components/AppBar'
import { Col, Container, Row } from 'react-bootstrap'
import { FaFacebook, FaLinkedin, FaPinterest, FaTumblr, FaTwitter } from 'react-icons/fa'
import { Button } from '@mui/material'
import {
    // FacebookMessengerShareButton,
    FacebookShareButton,
    LinkedinShareButton,
    PinterestShareButton,
    TumblrShareButton,
    TwitterShareButton,
    WhatsappShareButton,
    EmailShareButton
} from "react-share";
import { AiOutlineMail } from 'react-icons/ai'


const url = 'https://chrome.google.com/webstore/detail/hogkcoijhcfikefcdmongnhlhooggfio';
const description = `Just stumbled upon Get Game, this awesome Chrome extension that keeps your browsing clean and free from profanity and adult content. You've got to check it out!`;

function PageShare() {


    return (
        <AppBar>
            <Container>
                <Row xs={1} style={{ maxHeight: 280, overflowY: "scroll" }}>
                    <Col>
                        <FacebookShareButton quote="" hashtag='getgame' url={url}>
                            <Button variant="contained" color="primary" style={{ borderRadius: 20, width: 200, margin: 10 }}>
                                <FaFacebook /> Facebook
                            </Button>
                        </FacebookShareButton>
                    </Col>
                    {/* <Col>
                        <FacebookMessengerShareButton appId='923608558917400' url={url} redirectUri={url}>
                            <Button variant="contained" color="secondary" style={{ borderRadius: 20, width: 200, margin:10  }}>
                                <FaFacebook /> Messenger
                            </Button>
                        </FacebookMessengerShareButton>
                    </Col> */}
                    <Col>
                        <WhatsappShareButton url={url}>
                            <Button variant="contained" color="success" style={{ borderRadius: 20, width: 200, margin: 10 }}>
                                <FaFacebook /> Whatsapp
                            </Button>
                        </WhatsappShareButton>
                    </Col>
                    <Col>
                        <LinkedinShareButton title="Get Game" summary={description} source="Get Game Chrome Extension" url={url}>
                            <Button variant="contained" color="primary" style={{ borderRadius: 20, width: 200, margin: 10 }}>
                                <FaLinkedin /> Linkedin
                            </Button>
                        </LinkedinShareButton>
                    </Col>

                    <Col>
                        <PinterestShareButton title="Get Game" description={description} media='https://getgame.onrender.com/banner.png' url={url}>
                            <Button variant="contained" color="error" style={{ borderRadius: 20, width: 200, margin: 10 }}>
                                <FaPinterest /> Pinterest
                            </Button>
                        </PinterestShareButton>
                    </Col>


                    <Col>
                        <TwitterShareButton title="Get Game" hashtags={["getgame", 'coollines', 'chrome']} url={url}>
                            <Button variant="contained" color="primary" style={{ borderRadius: 20, width: 200, margin: 10 }}>
                                <FaTwitter /> Twitter
                            </Button>
                        </TwitterShareButton>
                    </Col>

                    <Col>
                        <TumblrShareButton title="Get Game" url={url} tags={['getgame', 'coollines']} caption={description}>
                            <Button variant="contained" color="info" style={{ borderRadius: 20, width: 200, margin: 10 }}>
                                <FaTumblr /> Tumblr
                            </Button>
                        </TumblrShareButton>
                    </Col>

                    <Col>
                        <EmailShareButton url={url} subject='Get Game' body={description}>
                            <Button variant="contained" color="warning" style={{ borderRadius: 20, width: 200, margin: 10 }}>
                                <AiOutlineMail /> Email
                            </Button>
                        </EmailShareButton>
                    </Col>
                </Row>
            </Container>
        </AppBar>
    )
}

export default PageShare
