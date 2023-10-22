/*global chrome*/
import React from 'react'
import AppBar from '../components/AppBar'
import { Button, Col, Container, Row } from 'react-bootstrap'
import { FaEvernote, FaFileCsv } from 'react-icons/fa'
import { BsTrello, BsFillFileEarmarkSpreadsheetFill } from 'react-icons/bs';
import { SiNotion } from 'react-icons/si';
import * as API from "../utils/api";
import slack from '../images/slack.png';
import drive from '../images/drive.png';
import onenote from '../images/onenote.png';
import { useState } from 'react';
import { useEffect } from 'react';
import swal from 'sweetalert';
import { useNavigate } from 'react-router-dom';
import { mkConfig, generateCsv, download } from "export-to-csv";

function PageAPI() {

    const [token, setToken] = useState(null);
    const navigation = useNavigate();

    useEffect(() => API.getAccessToken().then((token) => setToken(token)), []);


    const onContect = async (platform) => {
        if (!token) {
            const result = await swal({
                title: 'Integration',
                text: 'Please login first',
                icon: "info",
                buttons: ['CANCEL', 'LOGIN']
            });

            if (result) navigation('/login')
        } else {
            chrome.windows.create({ url: `https://stickynotespro.m2kdevelopments.com/api/integrations/${platform}/oauth?t=${token}`, type: "panel" });
        }
    }

    const onGoogleDrive = async () => {
        onContect('google/drive')
    }

    const onGoogleSheets = async () => {
        onContect('google/sheets')
    }

    const onOneNote = async () => {
        onContect('microsoft/onenote')
    }

    const onTrello = async () => {
        onContect('trello')
    }

    const onCSV = async () => {
        const { notes } = await chrome.storage.local.get('notes');
        if (!notes || !notes.length) return swal('Download CSV', 'There are not notes', 'warning');

        const options = {
            fieldSeparator: ',',
            quoteStrings: '"',
            decimalSeparator: '.',
            showLabels: false,
            showTitle: false,
            title: `Sticky Notes Pro`,
            filename: `Sticky Notes Pro`,
            useTextFile: false,
            useBom: true,
            useKeysAsHeaders: true,
            // headers: ['Column 1', 'Column 2', etc...] <-- Won't work with useKeysAsHeaders present!
        };

        // mkConfig merges your options with the defaults
        // and returns WithDefaults<ConfigOptions>
        const csvExporter = mkConfig(options);

        // Converts your Array<Object> to a CsvOutput string based on the configs
        const csv = generateCsv(csvExporter)(notes.sort((a, b) => a.webname - b.webname));


        download(csvExporter)(csv)
        swal('Export CSV', 'CSV download successfully. Check your download folder', 'success');
    }

    const onNotion = async () => {
        onContect('notion')
    }

    const onEvernote = async () => {
        onContect('evernote')
    }

    const onSlack = async () => {
        onContect('slack')
    }


    return (
        <AppBar>
            <Container fluid>
                <Row xs={1}>

                    <Col>
                        <Button onClick={onCSV} size="sm" style={{ width: "100%", marginBottom: 10, textAlign: "left" }} variant="light">
                            <FaFileCsv size={20} style={{ marginRight: 10 }} color="green" /> Download CSV
                        </Button>
                    </Col>


                    {/* <Col>
                        <Button onClick={onSlack} size="sm" style={{ width: "100%", marginBottom: 10, textAlign: "left" }} variant="light">
                            <img width={20} style={{ marginRight: 10 }} src={slack} alt="Slack" /> Connect with Slack
                        </Button>
                    </Col> */}

                    <Col>
                        <Button onClick={onGoogleSheets} size="sm" style={{ width: "100%", marginBottom: 10, textAlign: "left" }} variant="light">
                            <BsFillFileEarmarkSpreadsheetFill size={20} style={{ marginRight: 10 }} color="#0F9D58" /> Connect with Google Sheets
                        </Button>
                    </Col>

                    <Col>
                        <Button onClick={onGoogleDrive} size="sm" style={{ width: "100%", marginBottom: 10, textAlign: "left" }} variant="light">
                            <img width={20} style={{ marginRight: 10 }} src={drive} alt="Slack" /> Connect with Google Drive
                        </Button>
                    </Col>

                    <Col>
                        <Button onClick={onOneNote} size="sm" style={{ width: "100%", marginBottom: 10, textAlign: "left" }} variant="light">
                            <img width={20} style={{ marginRight: 10 }} src={onenote} alt="Slack" /> Connect with One Note
                        </Button>
                    </Col>

                    <Col>
                        <Button onClick={onNotion} size="sm" style={{ width: "100%", marginBottom: 10, textAlign: "left" }} variant="light">
                            <SiNotion size={20} style={{ marginRight: 10 }} color="#443F57" /> Connect with Notion
                        </Button>
                    </Col>


                    <Col>
                        <Button onClick={onTrello} size="sm" style={{ width: "100%", marginBottom: 10, textAlign: "left" }} variant="light">
                            <BsTrello size={20} style={{ marginRight: 10 }} color="#0084D1" /> Connect with Trello
                        </Button>
                    </Col>

                    <Col>
                        <Button onClick={onEvernote} size="sm" style={{ width: "100%", marginBottom: 10, textAlign: "left" }} variant="light">
                            <FaEvernote size={20} style={{ marginRight: 10 }} color="#5ba525" /> Connect with Evernote
                        </Button>
                    </Col>
                </Row>
            </Container>
        </AppBar>
    )
}

export default PageAPI
