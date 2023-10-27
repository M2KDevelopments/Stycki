/*global chrome*/
import React from 'react'
import AppBar from '../components/AppBar'
import { Button, Col, Container, Row } from 'react-bootstrap'
import { FaEvernote, FaFileCsv, FaSave, FaAssistiveListeningSystems } from 'react-icons/fa'
import { BsTrello, BsFillFileEarmarkSpreadsheetFill } from 'react-icons/bs';
import { SiNotion } from 'react-icons/si';
import * as API from "../utils/api";
import drive from '../images/drive.png';
import onenote from '../images/onenote.png';
import { useState, useEffect, useContext } from 'react';
import swal from 'sweetalert';
import { useNavigate } from 'react-router-dom';
import { mkConfig, generateCsv, download } from "export-to-csv";
import { Box, FormControl, InputLabel, MenuItem, Select, Slider } from '@mui/material';
import { ContextUser, ContextSetUser } from '../App';


function PageAPI() {

    const [token, setToken] = useState(null);
    const [rate, setRate] = useState(1.3);
    const [voices, setVoices] = useState([]);
    const [voiceSelected, setVoiceSelected] = useState("-1");
    const navigation = useNavigate();
    const user = useContext(ContextUser);
    const setUser = useContext(ContextSetUser);

    useEffect(() => API.getAccessToken().then((token) => setToken(token)), []);

    // Get chrome voices
    useEffect(() => {
        chrome.tts.getVoices(voices => setVoices(voices.sort((a, b) => a.voiceName.localeCompare(b.voiceName))))
        chrome.storage.local.get('rate', (data) => setRate(data?.rate || 1.3))
        chrome.storage.local.get('voiceName', (data) => setVoiceSelected(data?.voiceName || "-1"))
    }, [])

    const onConnect = async (platform) => {
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

    const onDisconnect = async (platform) => {
        try {
            const res = await API.PostAPI(`/api/integrations/${platform}/disconnect`);
            const user = await API.GetAPI(`/api/user`);
            setUser(user);
            swal('Disconnecting', res.message, res.result ? 'success' : 'error');
        } catch (e) {
            console.log(e.message)
        }
    }

    const onGoogleDrive = async () => onConnect('google/drive')

    const onGoogleSheets = async () => await onConnect('google/sheets')

    const onGoogleSheetsDisconnect = async () => await onDisconnect('google/sheets')

    const onOneNote = async () => await onConnect('microsoft/onenote')

    const onTrello = async () => await onConnect('trello')

    const onTrelloDisconnect = async () => await onDisconnect('trello')

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
        onConnect('notion')
    }

    const onEvernote = async () => {
        onConnect('evernote')
    }

    const onSlack = async () => {
        onConnect('slack')
    }


    const onListen = async () => {

        const options = [
            "Thanks for sticking with Sticky Notes Pro!",
            "You're the adhesive that keeps us together!",
            "Sticky notes are like good friends, and you're the best one!",
            "You make our extension stick out from the rest.",
            "We're stuck on you for being an awesome user!",
            "Thanks for making our day a little more colorful with Sticky Notes Pro!",
            "Your support is as strong as glue.",
            "Sticking with us has never been more fun!",
            "Our extension wouldn't be the same without you.",
            "You're the reason we're sticking around.",
            "Sticky Notes Pro: Making your digital life a bit stickier.",
            "You've stuck with us through thick and thin.",
            "We're glued to your support. Thanks a ton!",
            "Sticky Notes Pro loves you more than a fridge loves magnets.",
            "Your support makes our extension extra sticky.",
            "We're as grateful as a spiderweb for your loyalty.",
            "Thanks for keeping our extension from falling apart!",
            "You're like the glue that holds our community together.",
            "Sticky Notes Pro: Making note-taking extra sticky and fun.",
            "Thanks for being a sticky note superstar!"
        ];

        const index = parseInt(Math.random() * options.length);
        chrome.tts.speak(
            options[index],
            {
                'lang': 'en-US',
                'rate': rate ? rate : 1.0,
                'voiceName': voiceSelected ? voiceSelected : "",
            },
            function (utterance) {
                console.log('utterance', utterance)
            }
        );
    }


    const onSaveAudioSettings = async () => {
        await chrome.storage.local.set({ rate });
        await chrome.storage.local.set({ voiceName: voiceSelected });
        swal('Settings', 'Audio Settings Saved', 'success');
    }


    return (
        <AppBar>
            <Container fluid style={{ overflowY: "scroll", height: 355, marginTop: 55 }}>
                <Row xs={1}>

                    <Col>
                        <Button onClick={onCSV} size="sm" style={{ width: "100%", marginBottom: 10, textAlign: "left" }} variant="light">
                            <FaFileCsv size={20} style={{ marginRight: 10 }} color="green" /> Download CSV
                        </Button>
                    </Col>

                    <Col>
                        {token && user && user.googleSheetsAccessToken ?
                            <Button onClick={onGoogleSheetsDisconnect} size="sm" style={{ width: "100%", marginBottom: 10, textAlign: "left" }} variant="success">
                                <BsFillFileEarmarkSpreadsheetFill size={20} style={{ marginRight: 10 }} /> Connected with Google Sheets
                            </Button> :
                            <Button onClick={onGoogleSheets} size="sm" style={{ width: "100%", marginBottom: 10, textAlign: "left" }} variant="light">
                                <BsFillFileEarmarkSpreadsheetFill size={20} style={{ marginRight: 10 }} color="#0F9D58" /> Connect with Google Sheets
                            </Button>
                        }
                    </Col>

                    <Col>
                        {token && user && user.trelloAccessToken ?
                            <Button onClick={onTrelloDisconnect} size="sm" style={{ width: "100%", marginBottom: 10, textAlign: "left" }} variant="primary">
                                <BsTrello size={20} style={{ marginRight: 10 }} /> Connected with Trello
                            </Button>
                            :
                            <Button onClick={onTrello} size="sm" style={{ width: "100%", marginBottom: 10, textAlign: "left" }} variant="light">
                                <BsTrello size={20} style={{ marginRight: 10 }} color="#0084D1" /> Connect with Trello
                            </Button>
                        }
                    </Col>

                    <Col>
                        <Button disabled={true} onClick={onGoogleDrive} size="sm" style={{ width: "100%", marginBottom: 10, textAlign: "left" }} variant="light">
                            <img width={20} style={{ marginRight: 10 }} src={drive} alt="Slack" /> Cooming Soon Google Drive
                        </Button>
                    </Col>

                    <Col>
                        <Button disabled={true} onClick={onOneNote} size="sm" style={{ width: "100%", marginBottom: 10, textAlign: "left" }} variant="light">
                            <img width={20} style={{ marginRight: 10 }} src={onenote} alt="Slack" /> Cooming Soon One Note
                        </Button>
                    </Col>

                    <Col>
                        <Button disabled={true} onClick={onNotion} size="sm" style={{ width: "100%", marginBottom: 10, textAlign: "left" }} variant="light">
                            <SiNotion size={20} style={{ marginRight: 10 }} color="#443F57" /> Cooming Soon Notion
                        </Button>
                    </Col>




                    <Col>
                        <Button disabled={true} onClick={onEvernote} size="sm" style={{ width: "100%", marginBottom: 10, textAlign: "left" }} variant="light">
                            <FaEvernote size={20} style={{ marginRight: 10 }} color="#5ba525" /> Cooming Soon Evernote
                        </Button>
                    </Col>

                    <br /><br />
                    <h5>Audio Settings</h5>
                    <hr />
                    <FormControl size="small" sx={{ m: 1, maxWidth: "95%" }}>
                        <InputLabel id="voice">Select A Voice</InputLabel>
                        <Select value={voiceSelected} onChange={e => setVoiceSelected(e.target.value)} size="small" labelId="voice" id="voice" label="Select A Voice">
                            <MenuItem disabled value="-1"> <em>Voices</em> </MenuItem>
                            {
                                voices.map(voice => <MenuItem value={voice.voiceName}>
                                    <img src={`http://purecatamphetamine.github.io/country-flag-icons/3x2/${(voice?.lang?.split("-")[1] || "US")}.svg`} height={18} alt={voice.lang} />
                                    {voice.voiceName}
                                </MenuItem>
                                )
                            }
                        </Select>
                    </FormControl>
                    <Box sx={{ width: 320, display: "flex" }}>
                        <span>Rate: {rate}</span>
                        <Slider
                            aria-label="Voice Rate"
                            value={rate}
                            onChange={(e) => setRate(parseFloat(e.target.value))}
                            getAriaValueText={(value) => `${value} rate`}
                            marks
                            min={1.0}
                            step={0.1}
                            max={2.0}
                            valueLabelDisplay="auto"
                        />
                    </Box>
                    <Row xs={2}>
                        <Col>
                            <Button style={{ width: "100%" }} variant='outline-primary' size="sm" onClick={onListen}>
                                <FaAssistiveListeningSystems size={18} style={{ marginRight: 10 }} /> Listen
                            </Button>
                        </Col>
                        <Col>
                            <Button style={{ width: "100%" }} variant='primary' size="sm" onClick={onSaveAudioSettings}>
                                <FaSave size={18} style={{ marginRight: 10 }} /> Save
                            </Button>
                        </Col>
                    </Row>

                    <br /><br />
                </Row>
            </Container>
        </AppBar>
    )
}

export default PageAPI
