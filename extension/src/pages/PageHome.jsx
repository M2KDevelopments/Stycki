/* global chrome */

import React, { useCallback, useContext } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import AppBar from '../components/AppBar';
import { Badge, Breadcrumb, Button, Col, Form, Modal, ProgressBar, Row } from 'react-bootstrap';
import { ContextAIVoices, ContextCount, ContextUser } from '../App';
import swal from 'sweetalert';
import { FiMoreVertical } from 'react-icons/fi';
import { FcFolder } from 'react-icons/fc';
import { Fade, FormControl, FormHelperText, InputLabel, Menu, MenuItem, Select, TextField } from '@mui/material';
import { FaFolderPlus } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import favourites from '../images/favourite.png';
import * as API from '../utils/api';
import { BsFillFileEarmarkSpreadsheetFill, BsTrello } from 'react-icons/bs';


function PageHome() {

  const count = useContext(ContextCount);
  const user = useContext(ContextUser);
  const [notes, setNotes] = useState([]);
  const [urlNoteMap, setUrlNoteMap] = useState(new Map());
  const [search, setSearch] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [option, setOption] = useState(null);
  const [folderView, setFolderView] = useState(false);
  const [folders, setFolders] = useState([]);
  const [folderId, setFolderId] = useState("");
  const [folderDialogue, setFolderDialogue] = useState(null);
  const [folderSelected, setFolderSelected] = useState("-1");
  const [voiceDialogue, setVoiceDialogue] = useState(false);
  const aiVoices = useContext(ContextAIVoices);
  const [voiceSelected, setVoiceSelected] = useState("-1");

  //Integrations
  const [integrationsDialogue, setIntegrationsDialogue] = useState(null);
  const [trelloBoards, setTrelloBoards] = useState([]);
  const [trelloLists, setTrelloLists] = useState([]);
  const [trelloSelectedBoard, setTrelloSelectedBoard] = useState("");
  const [trelloSelectedList, setTrelloSelectedList] = useState("");
  const [googleSheetsUrl, setGoogleSheetsUrl] = useState("");

  // Get chrome voices
  useEffect(() => {
    chrome.storage.local.get('notes', async (data) => {
      const { folders } = await chrome.storage.local.get('folders');
      setFolders(folders ? folders : [])

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
    });

  }, []);

  const onCopy = (note) => window.navigator.clipboard.writeText(note).then(() => swal('Copied Page Link'));



  const onDel = async (url) => {

    const result = await swal({
      title: "Delete Notes",
      text: `Are you sure you want to delete all the notes from this url`,
      icon: "info",
      buttons: ['NO', 'YES']
    });


    if (result) {
      const newNotes = notes.filter(note => note.url !== url);
      const ids = notes.filter(note => note.url == url).map(note => note.id);
      const map = new Map();
      chrome.storage.local.set({ notes: newNotes }, () => setNotes(newNotes));
      for (const note of newNotes) {
        const { url } = note;
        if (map.get(url)) map.set(url, [...map.get(url), note]);
        else map.set(url, [note]);
      }
      const res = await API.PutAPI(`/api/notes/delete`, { ids });
      swal(res.message);
      setUrlNoteMap(map);
    }
  }


  const onRename = async (url) => {
    const name = await swal({
      title: "Rename Notes",
      text: `Are you sure you want to rename this list?`,
      icon: "info",
      content: 'input',
      buttons: ['NO', 'YES']
    });


    if (name) {

      // Rename List
      const ids = [];
      for (const index in notes) {
        const note = notes[index];
        if (note.url == url) {
          ids.push(note.id);
          notes[index].webname = name;
        }
      }

      const map = new Map();
      chrome.storage.local.set({ notes: notes }, () => setNotes([...notes]));
      for (const note of notes) {
        const { url } = note;
        if (map.get(url)) map.set(url, [...map.get(url), note]);
        else map.set(url, [note]);
      }
      const res = await API.PutAPI(`/api/notes/rename`, { ids, webname: name });
      swal(res.message);
      setUrlNoteMap(map);

    }
  }


  const onAddFolder = async () => {

    const name = await swal({
      title: "Add Folder",
      text: "What is the name of the folder",
      icon: "info",
      content: "input",
      buttons: ["CANCEL", 'NEW FOLDER']
    });
    if (!name) return;
    const folder = { id: crypto.randomUUID(), name: name };
    folders.push(folder);
    const res = await API.PostAPI(`/api/folders`, folder);
    swal(res.message);
    chrome.storage.local.set({ folders }, () => setFolders([...folders]));

  }

  const onMoveToFolder = async () => {

    const url = folderDialogue;
    const id = folderSelected === "-1" ? "" : folderSelected;
    const ids = [];


    // Moving List to Folder
    for (const index in notes) {
      const note = notes[index];
      if (note.url === url) {
        ids.push(note.id);
        notes[index].folder = id;
      }
    }


    const map = new Map();
    chrome.storage.local.set({ notes: notes }, () => setNotes([...notes]));
    for (const note of notes) {
      const { url } = note;
      if (map.get(url)) map.set(url, [...map.get(url), note]);
      else map.set(url, [note]);
    }

    const res = await API.PutAPI(`/api/notes/folder`, { ids, folder: id });
    swal(res.message);

    setUrlNoteMap(map);
    setFolderId(id);
  }

  const onDownloadAudio = async () => {
    if (voiceSelected === "-1") return swal('Please select an AI Voice');
    const text = notes
      .filter(note => note.url === voiceDialogue)
      .map(note => `${note.name} says ${note.text}`)
      .join("\n");

    try {
      const voice_id = voiceSelected;
      const payload = { voice_id, text };
      const buffer = await API.PostAPI(`/api/openai/audio`, payload);
      const blob = new Blob([buffer], { type: "audio/wav" });
      const href = URL.createObjectURL(blob);
      const a = Object.assign(document.createElement("a"), {
        href,
        style: "display:none",
        download: `Sticky Notes Pro Audio.mp3`,
      });
      a.click();
      URL.revokeObjectURL(href);
      a.remove();
    } catch (e) {
      console.log(e);
    } finally {
      setVoiceDialogue(null)
    }
  }

  const showNoteDetials = useCallback(() => {

    if (voiceDialogue) {
      const list = notes.filter(note => note.url === voiceDialogue);
      return `${list[0].webname} has ${list.length} ${list.length === 1 ? "Note" : "Notes"}`
    }
    return "";
  }, [voiceDialogue, notes]);


  const filter = useCallback((notes) => {
    if (search.replace(/\s/gmi, '') === '') return true;
    if (notes[0].webname.toLowerCase().indexOf(search.toLowerCase()) !== -1) return true;
    for (const note of notes) {
      if (note.name.toLowerCase().indexOf(search.toLowerCase()) !== -1) return true;
      if (note.text.toLowerCase().indexOf(search.toLowerCase()) !== -1) return true;
    }
  }, [search])


  const filterFolder = useCallback((folder) => {
    if (search.replace(/\s/gmi, '') === '') return true;
    if (folder.name.toLowerCase().indexOf(search.toLowerCase()) !== -1) return true;
  }, [search])


  if (folderId) {
    return (
      <AppBar nologo={true}>
        <br /><br />
        <h6 style={{ marginTop: 10 }}>{notes.length} out of {count} Notes 📝</h6>


        <ProgressBar variant='primary' animated striped now={notes.length} min={0} max={count} style={{ height: 7 }} />


        <Form.Control size="sm" style={{ borderRadius: 20, marginTop: 10, marginBottom: 10 }} type="search" placeholder="Search" value={search} onChange={e => setSearch(e.target.value)} />


        <Breadcrumb>
          <Breadcrumb.Item href="#"><Link to="/" onClick={() => setFolderId("")}>Home</Link></Breadcrumb.Item>
          <Breadcrumb.Item active>{folders.find(f => f.id === folderId).name}</Breadcrumb.Item>
        </Breadcrumb>


        <div fluid style={{ width: "100%", height: 300, overflowY: "scroll" }}>
          {
            Array.from(urlNoteMap.values()).filter(notes => notes[0].folder === folderId).filter(filter).map(notes =>
              <div style={{ display: "flex", padding: "5px 4px", justifyContent: "center", background: "#f1eef2", borderRadius: 5 }}>

                <p title={notes[0].url} style={{ textAlign: "left", textOverflow: "ellipsis", width: "80%", color: "grey", fontWeight: 600, fontSize: "0.9rem" }}>
                  <Badge title={notes.length + " Notes"} style={{ marginRight: 10 }} pill bg="info">{notes.length}</Badge>
                  {notes[0].webname}
                </p>

                <div>
                  <Button
                    style={{ borderRadius: 30 }}
                    variant='light'
                    size='sm'
                    aria-controls={anchorEl ? anchorEl : undefined}
                    aria-haspopup="true"
                    aria-expanded={anchorEl ? 'true' : undefined}
                    onClick={(e) => { setAnchorEl(e.currentTarget); setOption(notes[0].url) }}
                  >
                    <FiMoreVertical size={15} />
                  </Button>
                  <Menu
                    id={notes[0].url}
                    MenuListProps={{ 'aria-labelledby': 'fade-button', }}
                    anchorEl={anchorEl}
                    open={anchorEl && option === notes[0].url ? true : false}
                    onClose={() => { setAnchorEl(null); setOption(null) }}
                    TransitionComponent={Fade}
                  >
                    <MenuItem onClick={() => onCopy(notes[0].url)}>Copy Page Link</MenuItem>
                    <MenuItem onClick={() => window.navigator.clipboard.writeText(`${notes[0].url}#share=${user._id}`).then(() => swal('Copied Share link'))}>Share</MenuItem>
                    <MenuItem onClick={() => chrome.tabs.create({ url: notes[0].url })}>Go to Page</MenuItem>

                    {/* <MenuItem onClick={() => setVoiceDialogue(notes[0].url)}>Download Audio</MenuItem> */}
                    <MenuItem onClick={() => setFolderDialogue(notes[0].url)}>Move to Folder</MenuItem>
                    {user ? <MenuItem onClick={() => setIntegrationsDialogue(notes[0].url)}>Integrations</MenuItem> : null}
                    <MenuItem onClick={() => { setAnchorEl(null); setOption(null); onRename(notes[0].url) }}>Rename</MenuItem>

                    <MenuItem onClick={() => onDel(notes[0].url)}>Remove Notes</MenuItem>
                  </Menu>
                </div>

              </div>
            )
          }
        </div>
      </AppBar>
    )
  }

  return (
    <AppBar nologo={true}>
      <br /><br />
      <h6 style={{ marginTop: 10 }}>{notes.length} out of {count} Notes 📝</h6>

      <ProgressBar variant='primary' animated striped now={notes.length} min={0} max={count} style={{ height: 7 }} />

      <Form.Control size="sm" style={{ borderRadius: 20, marginTop: 10, marginBottom: 10 }} type="search" placeholder="Search" value={search} onChange={e => setSearch(e.target.value)} />

      <Row xs={2}>
        <Col>
          <Button style={{ width: "100%" }} size="sm" onClick={() => setFolderView(false)} variant={folderView ? 'light' : 'primary'}>📝 List View</Button>
        </Col>
        <Col>
          <Button style={{ width: "100%" }} size="sm" onClick={() => setFolderView(true)} variant={folderView ? 'primary' : 'light'}><FcFolder /> Folder View</Button>
        </Col>
      </Row>
      <div style={{ marginTop: 8 }} />
      {
        folderView ?

          <div style={{ width: "100%", height: 250, overflowY: "scroll" }}>
            <Row xs={3}>
              <Col>
                <Button style={{ width: "100%", fontSize: "0.8rem" }} size="sm" onClick={onAddFolder} variant="light">
                  <FaFolderPlus color="grey" size={50} />
                  <br />
                  Add
                </Button>
              </Col>
              <Col>
                <Button style={{ width: "100%", fontSize: "0.8rem" }} size="sm" onClick={() => setFolderId("favourites")} variant="light">
                  <img src={favourites} width={50} alt="fav" />
                  <br />
                  Favorites
                </Button>
              </Col>
              {
                folders.sort((a, b) => a.name.localeCompare(b.name)).filter(filterFolder).map(folder =>
                  <Col key={folder.id}>
                    <Button style={{ width: "100%", fontSize: "0.8rem" }} size="sm" onClick={() => setFolderId(folder.id)} variant="light">
                      <FcFolder size={50} />
                      <br />
                      {folder.name}
                    </Button>
                  </Col>)
              }
            </Row>
          </div>

          :

          <div style={{ width: "100%", height: 255, overflowY: "scroll" }}>
            {
              Array.from(urlNoteMap.values()).sort((a, b) => a[0].webname.localeCompare(b[0].webname)).filter(filter).map(notes =>
                <div style={{ display: "flex", padding: "5px 4px", justifyContent: "center", background: "#f1eef2", borderRadius: 5 }}>

                  <p title={notes[0].url} style={{ textAlign: "left", textOverflow: "ellipsis", width: "80%", color: "grey", fontWeight: 600, fontSize: "0.9rem" }}>
                    <Badge title={notes.length + " Notes"} style={{ marginRight: 10 }} pill bg="warning">{notes.length}</Badge>
                    {notes[0].webname}
                  </p>

                  <div>
                    <Button
                      style={{ borderRadius: 30 }}
                      variant='light'
                      size='sm'
                      aria-controls={anchorEl ? anchorEl : undefined}
                      aria-haspopup="true"
                      aria-expanded={anchorEl ? 'true' : undefined}
                      onClick={(e) => { setAnchorEl(e.currentTarget); setOption(notes[0].url) }}
                    >
                      <FiMoreVertical size={15} />
                    </Button>
                    <Menu
                      id={notes[0].url}
                      MenuListProps={{ 'aria-labelledby': 'fade-button', }}
                      anchorEl={anchorEl}
                      open={anchorEl && option === notes[0].url ? true : false}
                      onClose={() => { setAnchorEl(null); setOption(null) }}
                      TransitionComponent={Fade}
                    >
                      <MenuItem onClick={() => onCopy(notes[0].url)}>Copy Page Link</MenuItem>
                      <MenuItem onClick={() => window.navigator.clipboard.writeText(`${notes[0].url}#share=${user._id}`).then(() => swal('Copied Share link'))}>Copy Share Link</MenuItem>
                      <MenuItem onClick={() => chrome.tabs.create({ url: notes[0].url })}>Go to Page</MenuItem>

                      {/* <MenuItem onClick={() => setVoiceDialogue(notes[0].url)}>Download Audio</MenuItem> */}
                      <MenuItem onClick={() => setFolderDialogue(notes[0].url)}>Move to Folder</MenuItem>
                      {user ? <MenuItem onClick={() => setIntegrationsDialogue(notes[0].url)}>Integrations</MenuItem> : null}

                      <MenuItem onClick={() => { setAnchorEl(null); setOption(null); onRename(notes[0].url) }}>Rename</MenuItem>

                      <MenuItem onClick={() => onDel(notes[0].url)}>Remove Notes</MenuItem>
                    </Menu>
                  </div>

                </div>
              )
            }
          </div>
      }


      <Modal size="sm" show={folderDialogue} onHide={() => setFolderDialogue(null)} aria-labelledby="modal-title">
        <Modal.Header closeButton>
          <Modal.Title id="modal-title">Move to Folder</Modal.Title>
        </Modal.Header>

        <Modal.Body className="centralise" style={{ padding: 10 }}>
          <FormControl sx={{ m: 1, minWidth: 300, maxWidth: 300 }}>
            <InputLabel id="folder">Folders</InputLabel>
            <Select labelId="folder" id="folder" value={folderSelected} onChange={(e) => setFolderSelected(e.target.value)} label="Folders" >
              <MenuItem value="-1"><em>NONE</em></MenuItem>
              <MenuItem value="favourites">
                <img src={favourites} width={18} alt="fav" style={{ marginRight: 10 }} />
                Favorites
              </MenuItem>
              {
                folders.sort((a, b) => a.name.localeCompare(b.name)).map(t =>
                  <MenuItem key={t.id} value={t.id}>
                    {t.name.length > 15 ? t.name.substring(0, 12) + "..." : t.name}
                  </MenuItem>
                )
              }
            </Select>
            <FormHelperText>Move to Folder</FormHelperText>
          </FormControl>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setFolderDialogue(null)} >
            Cancel
          </Button>
          <Button variant="primary" onClick={onMoveToFolder} >
            Move to Folder
          </Button>
        </Modal.Footer>
      </Modal>


      <Modal size="sm" show={voiceDialogue} onHide={() => setVoiceDialogue(null)} aria-labelledby="modal-title">
        <Modal.Header closeButton>
          <Modal.Title id="modal-title">Move to Folder</Modal.Title>
        </Modal.Header>

        <Modal.Body className="centralise" style={{ padding: 10 }}>
          <h6>{showNoteDetials()}</h6>
          <FormControl sx={{ m: 1, minWidth: 300, maxWidth: 300 }}>
            <InputLabel id="voices">AI Voices</InputLabel>
            <Select labelId="voices" id="voices" value={voiceSelected} onChange={(e) => setVoiceSelected(e.target.value)} label="AI Voice" >
              <MenuItem value="-1"><em>NONE</em></MenuItem>
              {
                aiVoices.sort((a, b) => a.name.localeCompare(b.name)).map(t =>
                  <MenuItem key={t.voice_id} value={t.voice_id}>
                    {t.name.length > 15 ? t.name.substring(0, 12) + "..." : t.name}
                  </MenuItem>
                )
              }
            </Select>
            <FormHelperText>Choose an AI Voice</FormHelperText>
          </FormControl>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setVoiceDialogue(null)} >
            Cancel
          </Button>
          <Button variant="primary" onClick={onDownloadAudio} >
            Download Audio
          </Button>
        </Modal.Footer>
      </Modal>


      <Modal size="sm" show={integrationsDialogue} onHide={() => setIntegrationsDialogue(null)} aria-labelledby="modal-title">
        <Modal.Header closeButton>
          <Modal.Title>Integrations</Modal.Title>
        </Modal.Header>

        <Modal.Body className="centralise" style={{ padding: 10 }}>
          {
            user && user.googleSheetsAccessToken ?
              <>
                <h5><BsFillFileEarmarkSpreadsheetFill size={20} style={{ marginRight: 10 }} color="#0F9D58" />Google Sheets</h5>
                <hr />
                <TextField size="sm" style={{ width: "100%" }} value={googleSheetsUrl} onChange={e => setGoogleSheetsUrl(e.target.value)} label={<><BsFillFileEarmarkSpreadsheetFill color="green" style={{ marginRight: 10 }} /> Google Sheets</>} />

              </> : null
          }

          {
            user && user.trelloAccessToken ?
              <>
                <h5><BsTrello size={20} style={{ marginRight: 10 }} color="#0084D1" />Trello</h5>
                <hr />
                <FormControl sx={{ m: 1, minWidth: 300, maxWidth: 300 }}>
                  <InputLabel>Boards</InputLabel>
                  <Select value={trelloSelectedBoard} onChange={(e) => setTrelloSelectedBoard(e.target.value)} label="Boards" >
                    {
                      trelloBoards.sort((a, b) => a.name.localeCompare(b.name)).map(t =>
                        <MenuItem key={t.id} value={t.id}>
                          {t.name.length > 15 ? t.name.substring(0, 12) + "..." : t.name}
                        </MenuItem>
                      )
                    }
                  </Select>
                </FormControl>
                <FormControl sx={{ m: 1, minWidth: 300, maxWidth: 300 }}>
                  <InputLabel>Lists</InputLabel>
                  <Select value={trelloSelectedList} onChange={(e) => setTrelloSelectedList(e.target.value)} label="Lists" >
                    {
                      trelloLists.sort((a, b) => a.name.localeCompare(b.name)).map(t =>
                        <MenuItem key={t.id} value={t.id}>
                          {t.name.length > 15 ? t.name.substring(0, 12) + "..." : t.name}
                        </MenuItem>
                      )
                    }
                  </Select>
                </FormControl>
              </> : null
          }

        </Modal.Body>
      </Modal>
    </AppBar >
  )
}

export default PageHome