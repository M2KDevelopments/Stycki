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
import * as API from '../utils/api';
import { BsFillFileEarmarkSpreadsheetFill, BsTrello } from 'react-icons/bs';
import { AiFillDelete } from 'react-icons/ai';


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
  const [loading, setLoading] = useState(false);
  const [integrationsDialogue, setIntegrationsDialogue] = useState(null);
  const [trelloBoards, setTrelloBoards] = useState([]);
  const [trelloLists, setTrelloLists] = useState(new Map());
  const [trelloSelectedBoard, setTrelloSelectedBoard] = useState("");
  const [trelloSelectedList, setTrelloSelectedList] = useState("-1");
  const [googleSheetsUrl, setGoogleSheetsUrl] = useState("");

  // Get chrome voices
  useEffect(() => {
    chrome.storage.local.get('notes', async (data) => {
      const { folders } = await chrome.storage.local.get('folders');
      setFolders(folders ? folders : [])

      const { notes } = data;
      if (notes) setNotes(notes);
    });

  }, []);


  // Auto update notes
  useEffect(() => {
    const map = new Map();
    for (const note of notes) {
      const { url } = note;
      if (map.get(url)) map.set(url, [...map.get(url), note]);
      else map.set(url, [note]);
    }
    setUrlNoteMap(map);
  }, [notes])


  // Get Trello Information
  useEffect(() => {
    async function run() {
      try {
        const boards = await API.GetAPI('/api/integrations/trello/boards');
        setTrelloBoards(boards);
      } catch (err) {
        console.error(err);
      }
    }
    if (user && user.trelloAccessToken) run()
  }, [user])

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
      const ids = notes.filter(note => note.url === url).map(note => note.id);
      chrome.storage.local.set({ notes: newNotes }, () => setNotes(newNotes));
      const res = await API.PutAPI(`/api/notes/delete`, { ids });
      swal(res.message);
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
      chrome.storage.local.set({ notes: notes }, () => setNotes([...notes]));
      const res = await API.PutAPI(`/api/notes/update`, { ids, webname: name });
      swal(res.message);

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

  const onDelFolder = async (folderId) => {

    const result = await swal({
      title: "Remove Folder",
      text: "Do you want to remove folder",
      icon: "info",
      buttons: ["CANCEL", 'REMOVE FOLDER']
    });
    if (!result) return;

    const res = await API.DeleteAPI(`/api/folders/${folderId}`);
    swal(res.message);
    if (res.result) {
      const list = folders.filter(f => f.id !== folderId);
      chrome.storage.local.set({ folders: list }, () => setFolders(list));
      const data = await API.GetAPI(`/api/notes`);
      if (!data.result) {
        await chrome.storage.local.set({ notes: data });
        setNotes(data)
        setFolderId("");
      }

    }
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

    chrome.storage.local.set({ notes: notes }, () => setNotes([...notes]));
    const res = await API.PutAPI(`/api/notes/update`, { ids, folder: id });
    swal(res.message);
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


  const getBoardLists = useCallback(() => {
    if (trelloLists.get(trelloSelectedBoard)) return trelloLists.get(trelloSelectedBoard)
    return [];
  }, [trelloLists, trelloSelectedBoard])


  const onCreateTrelloList = async () => {

    if (!trelloSelectedBoard) return swal('Please select a trello board');

    // Get info
    const webname = notes.find(note => note.url === integrationsDialogue).webname;
    const board = trelloBoards.find(board => board.id === trelloSelectedBoard);

    const name = await swal({
      title: `Add New List in ${board.name}`,
      text: `Enter the name of the new list?`,
      icon: "info",
      content: {
        element: 'input',
        attributes: {
          defaultValue: webname,
        }
      },
      buttons: ['NO', 'YES']
    });

    if (!name) return;

    try {
      setLoading(true);
      const ids = notes.filter(note => note.url === integrationsDialogue).map(note => note.id);
      const res = await API.PostAPI(`/api/integrations/trello/lists/${board.id}`, { ids, name })
      swal(`Adding New List in ${board.name}`, res.message, res.result ? 'success' : 'error');
      if (res.result) {
        const data = await API.GetAPI(`/api/notes`);
        if (!data.result) await chrome.storage.local.set({ notes: data }, () => setNotes(data));
      }
    } catch (e) {
      console.log(e.message);
    } finally {
      setLoading(false);
    }
  }

  const onUseTrelloList = async () => {

    // Get info
    const list = trelloLists.get(trelloSelectedBoard).find(list => list.id === trelloSelectedList);
    const result = await swal({
      title: `Sync Notes`,
      text: `Are you sure you want to sync notes with '${list.name}'?`,
      icon: "info",
      buttons: ['NO', 'YES']
    });
    if (!result) return;

    try {
      setLoading(true);
      const ids = notes.filter(note => note.url === integrationsDialogue).map(note => note.id);
      const res = await API.PostAPI(`/api/integrations/trello/cards/${trelloSelectedList}`, { ids })
      swal(`Sync Notes`, res.message, res.result ? 'success' : 'error');
      if (res.result) {
        const data = await API.GetAPI(`/api/notes`);
        if (!data.result) await chrome.storage.local.set({ notes: data }, () => setNotes(data));
      }
    } catch (e) {
      console.log(e.message);
    } finally {
      setLoading(false);
    }

  }

  const onGoToTrelloCard = async (cardId) => {
    try {
      swal('Please wait opening trello card')
      const res = await API.GetAPI(`/api/integrations/trello/card/${cardId}`);
      chrome.tabs.create({ url: res.url });
    } catch (e) {
      console.log(e.message);
      swal('Trello Card', 'Could not access trello card', 'warning');
    }
  }

  const onDisableTrello = async (url) => {

    const result = await swal({
      title: "Disable Notes syncing with Trello",
      text: `Are you sure you want to Disable Notes syncing with Trello`,
      icon: "info",
      buttons: ['NO', 'YES']
    });

    if (result) {
      const newNotes = notes.filter(note => note.url !== url);
      const ids = notes.filter(note => note.url === url).map(note => note.id);
      chrome.storage.local.set({ notes: newNotes }, () => setNotes(newNotes));
      const res = await API.PutAPI(`/api/notes/update`, { ids, trellocardId: "" });
      swal(res.message);
    }
  }

  const onGoogleSheets = async (e) => {

    e.preventDefault();
    // Get info
    const result = await swal({
      title: `Sync Notes with Google Sheets`,
      text: `Are you sure you want to sync notes with Google Sheets?`,
      icon: "info",
      buttons: ['NO', 'YES']
    });
    if (!result) return;
    try {
      setLoading(true);
      const ids = notes.filter(note => note.url === integrationsDialogue).map(note => note.id);
      const res = await API.PutAPI(`/api/notes/update`, { ids, googlesheets: googleSheetsUrl })
      swal(`Sync Notes`, res.message, res.result ? 'success' : 'error');
      if (res.result) {
        const data = await API.GetAPI(`/api/notes`);
        if (!data.result) await chrome.storage.local.set({ notes: data }, () => setNotes(data));
      }
    } catch (e) {
      console.log(e.message);
    } finally {
      setLoading(false);
    }
  }


  const onChangeTrelloBoard = async (boardId) => {
    setTrelloSelectedBoard(boardId);
    if (!trelloLists.get(boardId)) {
      try {
        setLoading(true);

        // Get the list of
        const lists = await API.GetAPI(`/api/integrations/trello/lists/${boardId}`);
        if (!lists.result) trelloLists.set(boardId, lists);

        // Create new instance of the map
        const map = new Map();
        for (const id of Array.from(trelloLists.keys())) map.set(id, trelloLists.get(id));

        // Update Map List
        setTrelloLists(map);
      } catch (err) {
        console.error(err);
        setTrelloSelectedList("-1");
      } finally {
        setLoading(false);
      }
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


        <div style={{ display: "flex" }}>
          <Breadcrumb>
            <Breadcrumb.Item href="#"><Link to="/" onClick={() => setFolderId("")}>Home</Link></Breadcrumb.Item>
            <Breadcrumb.Item active>{folders.find(f => f.id === folderId).name}</Breadcrumb.Item>
          </Breadcrumb>
          <Button style={{ marginLeft: 10, fontSize: "0.8rem", height: "fit-content" }} size="sm" variant='outline-dark' onClick={() => onDelFolder(folderId)}><AiFillDelete style={{ marginRight: 10 }} />Remove Folder</Button>
        </div>


        <div fluid style={{ width: "100%", height: 300, overflowY: "scroll" }}>
          {
            Array.from(urlNoteMap.values()).filter(notes => notes[0].folder === folderId).filter(filter).map(notes =>
              <div style={{ display: "flex", padding: "5px 4px", justifyContent: "center", background: "#f1eef2", borderRadius: 5 }}>

                <p title={notes[0].url} style={{ textAlign: "left", textOverflow: "ellipsis", width: "80%", color: "grey", fontWeight: 600, fontSize: "0.9rem" }}>
                  <Badge title={notes.length + " Notes"} style={{ marginRight: 10 }} pill bg="info">{notes.length}</Badge>
                  {notes[0].trellocardId ? <BsTrello title="Go to trello card" onClick={() => onGoToTrelloCard(notes[0].trellocardId)} style={{ marginRight: 5, cursor: "pointer" }} color="#0084D1" /> : null}
                  {notes[0].googlesheets ? <BsFillFileEarmarkSpreadsheetFill color="green" style={{ marginRight: 5 }} /> : null}
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
                    {user ? <MenuItem onClick={() => { setIntegrationsDialogue(notes[0].url); setGoogleSheetsUrl(notes[0]?.googlesheets || "") }}>Integrations</MenuItem> : null}
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
                    {notes[0].trellocardId ? <BsTrello title="Go to trello card" onClick={() => onGoToTrelloCard(notes[0].trellocardId)} style={{ marginRight: 5, cursor: "pointer" }} color="#0084D1" /> : null}
                    {notes[0].googlesheets ? <BsFillFileEarmarkSpreadsheetFill color="green" style={{ marginRight: 5 }} /> : null}
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
                      {user ? <MenuItem onClick={() => { setIntegrationsDialogue(notes[0].url); setGoogleSheetsUrl(notes[0]?.googlesheets || "") }}>Integrations</MenuItem> : null}

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
              <form onSubmit={onGoogleSheets}>
                <TextField type="url" name="googlesheets" error={googleSheetsUrl.replace(/\s/gmi, '') !== '' && !googleSheetsUrl.match(/https:\/\/docs\.google\.com\/spreadsheets\/d\/[a-zA-Z0-9-_]+/)} disabled={loading} size="small" style={{ width: "100%" }} value={googleSheetsUrl} onChange={e => setGoogleSheetsUrl(e.target.value)} label={<><BsFillFileEarmarkSpreadsheetFill color="green" style={{ marginRight: 10 }} /> Google Sheets</>} />
                <Button type="submit" disabled={loading || (googleSheetsUrl.replace(/\s/gmi, '') !== '' && !googleSheetsUrl.match(/https:\/\/docs\.google\.com\/spreadsheets\/d\/[a-zA-Z0-9-_]+/))} style={{ width: "100%" }} variant='success' size="sm">
                  {loading ? "Loading..." : "Sync Notes with Google Sheets"}
                </Button>
                <br /><br />
              </form> : null
          }

          {
            user && user.trelloAccessToken ?
              <>
                <FormControl sx={{ m: 1, minWidth: 345, maxWidth: 345 }}>
                  <InputLabel><BsTrello style={{ marginRight: 10 }} color="#0084D1" />Trello Boards</InputLabel>
                  <Select size="small" value={trelloSelectedBoard} onChange={(e) => onChangeTrelloBoard(e.target.value)} label="        Trello Boards" >
                    {
                      trelloBoards.sort((a, b) => a.name.localeCompare(b.name)).map(t =>
                        <MenuItem key={t.id} value={t.id}>
                          {t.name.length > 45 ? t.name.substring(0, 45) + "..." : t.name}
                        </MenuItem>
                      )
                    }
                  </Select>
                </FormControl>
                <FormControl disabled={loading} sx={{ m: 1, minWidth: 345, maxWidth: 345 }}>
                  <InputLabel><BsTrello style={{ marginRight: 10 }} color="#0084D1" />Trello {loading ? "Loading..." : "Lists"}</InputLabel>
                  <Select size="small" disabled={loading} value={trelloSelectedList} onChange={(e) => setTrelloSelectedList(e.target.value)} label="        Trello Lists" >
                    <MenuItem value="-1">
                      Create New List
                    </MenuItem>
                    {
                      getBoardLists().sort((a, b) => a.name.localeCompare(b.name)).map(t =>
                        <MenuItem key={t.id} value={t.id}>
                          {t.name.length > 45 ? t.name.substring(0, 45) + "..." : t.name}
                        </MenuItem>
                      )
                    }
                  </Select>
                </FormControl>
                {trelloSelectedBoard && trelloSelectedList == "-1" ?
                  <Button style={{ width: "100%" }} variant='primary' size="sm" onClick={onCreateTrelloList}>Create New List</Button>
                  : <Button style={{ width: "100%" }} variant='primary' size="sm" onClick={onUseTrelloList}>Sync Notes With Trello</Button>
                }
                <Button style={{ width: "100%" }} variant='dark' size="sm" onClick={onDisableTrello}>Disconnect Syncing</Button>
              </> : null
          }

        </Modal.Body>
      </Modal>
    </AppBar >
  )
}

export default PageHome