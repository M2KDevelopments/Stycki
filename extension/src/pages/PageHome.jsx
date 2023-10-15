/*global chrome*/

import React, { useCallback, useContext } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import AppBar from '../components/AppBar';
import { Badge, Button, Container, Form, ProgressBar } from 'react-bootstrap';
import { ContextCount } from '../App';
import swal from 'sweetalert';
import { FaCopy } from 'react-icons/fa';
import { AiFillDelete } from 'react-icons/ai';

function PageHome() {

  const count = useContext(ContextCount);
  const [notes, setNotes] = useState([]);
  const [urlNoteMap, setUrlNoteMap] = useState(new Map());
  const [search, setSearch] = useState("");


  // Get chrome voices
  useEffect(() => {
    chrome.storage.local.get('notes', (data) => {
      const { notes } = data;
      if (notes) {
        const map = new Map();
        setNotes(notes);
        for (const note of notes) {
          const { url } = note;
          if (map.get(url)) map.set(url, [...map.get(url), note]);
          else map.set(url, [note]);
        }
        setUrlNoteMap(map);
      }
    })
  }, []);


  const onCopy = (note) => window.navigator.clipboard.writeText(note).then(() => swal('Copied Website Link'));

  const onDel = async (url) => {

    const result = await swal({
      title: "Delete Notes",
      text: `Are you sure you want to delete all the notes from this url`,
      icon: "info",
      buttons: ['NO', 'YES']
    });


    if (result) {
      const newNotes = notes.filter(note => note.url !== url);
      const map = new Map();
      chrome.storage.local.set({ notes: newNotes }, () => setNotes(newNotes));
      for (const note of newNotes) {
        const { url } = note;
        if (map.get(url)) map.set(url, [...map.get(url), note]);
        else map.set(url, [note]);
      }
      setUrlNoteMap(map);
    }
  }


  const filter = useCallback((notes) => {
    if (search.replace(/\s/gmi, '') === '') return true;
    if (notes[0].webname.toLowerCase().indexOf(search.toLowerCase()) !== -1) return true;
    for (const note of notes) {
      if (note.name.toLowerCase().indexOf(search.toLowerCase()) !== -1) return true;
      if (note.text.toLowerCase().indexOf(search.toLowerCase()) !== -1) return true;
    }
  }, [search])



  return (
    <AppBar>
      <h6 style={{ marginTop: 10 }}>{notes.length} out of {count} Notes 📝</h6>

      <ProgressBar variant='primary' animated striped now={notes.length} min={0} max={count} style={{ height: 7 }} />

      <Form.Control size="sm" style={{ borderRadius: 20, marginTop: 10, marginBottom: 10 }} type="search" placeholder="Search" value={search} onChange={e => setSearch(e.target.value)} />

      <Container fluid style={{ height: 350, overflowY: "scroll" }}>
        {
          Array.from(urlNoteMap.values()).filter(filter).map(notes =>
            <div style={{ display: "flex", padding: "20px 8px", justifyContent: "center", background: "#e8e6f7", borderRadius: 5 }}>

              <p title={notes[0].url} style={{ textAlign: "left", textOverflow: "ellipsis", width: "70%", color: "grey", fontWeight: 600, fontSize: "0.9rem" }}>
                <Badge title={notes.length + " Notes"} style={{ marginRight: 10 }} pill bg="info">{notes.length}</Badge>
                {notes[0].webname}
              </p>

              <div>
                <Button title="Copy URL to Clipboard" size="sm" variant="outline-info" onClick={() => onCopy(notes[0].url)}><FaCopy size={18} /></Button>
                <Button title="Delete All the notes from this URL" size="sm" variant="light" onClick={() => onDel(notes[0].url)}><AiFillDelete size={18} /></Button>
              </div>

            </div>
          )
        }
      </Container>
    </AppBar >
  )
}

export default PageHome