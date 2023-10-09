/*global chrome*/

import React, { useContext } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import AppBar from '../components/AppBar';
import { Alert, Col, Row } from 'react-bootstrap';
import { ContextUser } from '../App';
import emojis from "../utils/emojis.json";
import batch1 from "../utils/batch1.json";
import batch2 from "../utils/batch2.json";
import { AiFillCopy } from 'react-icons/ai';
import { HiArrowNarrowLeft, HiArrowNarrowRight } from 'react-icons/hi'
import swal from 'sweetalert';
import { Box, Button, FormControl, InputLabel, MenuItem, Select, Slider } from '@mui/material';
import { RiSpeakFill, RiSpeakLine } from 'react-icons/ri';

function PageHome() {

  const user = useContext(ContextUser);
  const [emoji, setEmojis] = useState("");
  const [game, setGame] = useState("");
  const [index, setIndex] = useState(0);
  const [rate, setRate] = useState(1.3);
  const [voices, setVoices] = useState([]);
  const [voiceSelected, setVoiceSelected] = useState("-1");

  // Get chrome voices
  useEffect(() => {
    chrome.tts.getVoices(voices => setVoices(voices.sort((a, b) => a.voiceName.localeCompare(b.voiceName))))
    chrome.storage.local.get('rate', (data) => setRate(data?.rate || 1.3))
    chrome.storage.local.get('voiceName', (data) => setVoiceSelected(data?.voiceName || "-1"))
  }, [])


  // Auto Change Settings
  useEffect(() => {
    chrome.storage.local.set({ rate });
    if (voiceSelected !== '-1') chrome.storage.local.set({ voiceName: voiceSelected });
  }, [rate, voiceSelected])

  useEffect(() => {
    const index = parseInt(Math.random() * (batch1.length + batch2.length));
    const emojiindex = parseInt(emojis.length * Math.random());
    setGame([...batch1, ...batch2][index]);
    setIndex(index);
    setEmojis(emojis[emojiindex]);
  }, []);

  const onPrev = () => {
    if (index <= 0) {
      setIndex(0);
      setGame([...batch1, ...batch2][0]);
    } else {
      setGame([...batch1, ...batch2][index - 1]);
      setIndex(index - 1);
    }
  }


  const onNext = () => {
    const max = [...batch1, ...batch2].length - 1;
    if (index >= max) {
      setGame([...batch1, ...batch2][max]);
      setIndex(max)
    } else {
      setGame([...batch1, ...batch2][index + 1]);
      setIndex(index + 1);
    }
  }

  const onCopy = () => window.navigator.clipboard.writeText(game).then(() => swal('Copied game'));

  const onPlay = () => chrome.runtime.sendMessage({
    cid: "tts",
    message: game.game,
    rate,
    voiceName: voiceSelected === "-1" ? "" : voiceSelected
  });


  const onMale = () => {
    const audio = document.getElementById('audio_male');
    audio.play();
  }

  const onFemale = () => {
    const audio = document.getElementById('audio_female');
    audio.play();
  }

  return (
    <AppBar>
      <Alert variant="warning">
        <Alert.Heading>
          <div style={{ display: "flex" }}>
            <h1 style={{ fontSize: 40 }}>{emoji}</h1>
            {user ? <h6><strong>Hey {user.name}</strong></h6> : null}
          </div>
          <h6>{game.game}</h6>
          <div style={{ display: "flex", justifyContent: "flex-end", justifyItems: "flex-end" }}>
            <RiSpeakFill style={{ marginRight: 5, cursor: "pointer" }} size={18} onClick={onPlay} title="Speak out" />
            <AiFillCopy style={{ marginRight: 5, cursor: "pointer" }} size={18} onClick={onCopy} title="Copy to clipboard" />
            <HiArrowNarrowLeft style={{ marginRight: 5, cursor: "pointer" }} size={18} onClick={onPrev} title="Previous" />
            <HiArrowNarrowRight style={{ marginRight: 5, cursor: "pointer" }} size={18} onClick={onNext} title="Next" />
          </div>
        </Alert.Heading>
      </Alert>
      <Alert variant="warning">
        <Alert.Heading>
          <h6><RiSpeakLine style={{ marginRight: 10 }} /> <strong>Voice Speed</strong> ({rate})</h6>

          <Box sx={{ width: 252 }}>
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

          <FormControl size="small" sx={{ m: 1, minWidth: "90%" }}>
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
          <h6 style={{ fontSize: "0.8rem" }}>What Upgrade Voices Sound Like</h6>
          <Row xs={2}>
            <Col>
              <Button size="small" onClick={onMale} color="primary"><RiSpeakFill style={{ marginRight: 10 }} />Voice 1</Button>
            </Col>
            <Col>
              <Button size="small" onClick={onFemale} color="secondary"><RiSpeakFill style={{ marginRight: 10 }} />Voice 2</Button>
            </Col>
          </Row>
        </Alert.Heading>
      </Alert>

      <div style={{ position: "absolute", display: "none" }}>
        <audio id="audio_male" src="audio/audio_adam.mp3"></audio>
        <audio id="audio_female" src="audio/audio_bella.mp3"></audio>
      </div>
    </AppBar >
  )
}

export default PageHome