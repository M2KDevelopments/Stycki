import React from 'react'
import AppBar from '../components/AppBar'
import { Button, Col, Container, Row } from 'react-bootstrap'
import { FaEvernote, FaFileCsv } from 'react-icons/fa'
import { BsTrello, BsFillFileEarmarkSpreadsheetFill } from 'react-icons/bs';
import { SiNotion } from 'react-icons/si';
import slack from '../images/slack.png';


function PageAPI() {


    return (
        <AppBar>
            <Container fluid>
                <Row xs={1}>
                    
                    <Col>
                        <Button size="sm" style={{ width: "100%", marginBottom: 10, textAlign: "left" }} variant="light">
                            <FaFileCsv size={20} style={{ marginRight: 10 }} color="green" /> Download CSV
                        </Button>
                    </Col>


                    <Col>
                        <Button size="sm" style={{ width: "100%", marginBottom: 10, textAlign: "left" }} variant="light">
                            <img width={20} style={{ marginRight: 10 }} src={slack} alt="Slack" /> Connect with Slack
                        </Button>
                    </Col>

                    <Col>
                        <Button size="sm" style={{ width: "100%", marginBottom: 10, textAlign: "left" }} variant="light">
                            <BsFillFileEarmarkSpreadsheetFill size={20} style={{ marginRight: 10 }} color="#0F9D58" /> Connect with Google Sheets
                        </Button>
                    </Col>

                    <Col>
                        <Button size="sm" style={{ width: "100%", marginBottom: 10, textAlign: "left" }} variant="light">
                            <SiNotion size={20} style={{ marginRight: 10 }} color="#443F57" /> Connect with Notion
                        </Button>
                    </Col>


                    <Col>
                        <Button size="sm" style={{ width: "100%", marginBottom: 10, textAlign: "left" }} variant="light">
                            <BsTrello size={20} style={{ marginRight: 10 }} color="#0084D1" /> Connect with Trello
                        </Button>
                    </Col>

                    <Col>
                        <Button size="sm" style={{ width: "100%", marginBottom: 10, textAlign: "left" }} variant="light">
                            <FaEvernote size={20} style={{ marginRight: 10 }} color="#5ba525" /> Connect with Evernote
                        </Button>
                    </Col>
                </Row>
            </Container>
        </AppBar>
    )
}

export default PageAPI
