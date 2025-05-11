/* global chrome */
import { useCallback } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import AppBar from '../components/AppBar';
import { Badge, Breadcrumb, Button, Col, Form, Modal, Row } from 'react-bootstrap';
import swal from 'sweetalert';
import { FiMoreVertical } from 'react-icons/fi';
import { FcFolder } from 'react-icons/fc';
import { Fade, FormControl, FormHelperText, InputLabel, Menu, MenuItem, Select } from '@mui/material';
import { FaFolderPlus } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { AiFillDelete } from 'react-icons/ai';


function PageHome() {

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

  // Get chrome voices
  useEffect(() => {
    chrome.storage.sync.get('notes', async (data) => {
      const { folders } = await chrome.storage.sync.get('folders');
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
      chrome.storage.sync.set({ notes: newNotes }, () => setNotes(newNotes));
      swal("Deleted");
    }
  }


  const onRename = async (url) => {
    const note = notes.find(note => note.url === url);
    const name = await swal({
      title: "Rename Notes",
      text: `Are you sure you want to rename this list?`,
      icon: "info",
      content: {
        element: 'input',
        attributes: {
          defaultValue: note.webname,
        }
      },
      buttons: ['NO', 'YES']
    });


    if (name) {

      // Rename List
      const ids = [];
      for (const index in notes) {
        const note = notes[index];
        if (note.url === url) {
          ids.push(note.id);
          notes[index].webname = name;
        }
      }
      chrome.storage.sync.set({ notes: notes }, () => setNotes([...notes]));
      swal("Note Rename");

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
    chrome.storage.sync.set({ folders }, () => setFolders([...folders]));
    swal("Added to folder");


  }

  const onDelFolder = async (folderId) => {

    const result = await swal({
      title: "Remove Folder",
      text: "Do you want to remove folder",
      icon: "info",
      buttons: ["CANCEL", 'REMOVE FOLDER']
    });
    if (!result) return;

    setFolderId("");
    const list = folders.filter(f => f.id !== folderId);
    chrome.storage.sync.set({ folders: list }, () => setFolders(list));
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

    chrome.storage.sync.set({ notes: notes }, () => setNotes([...notes]));
    swal("Moved to folder");
    setFolderId(id);
  }



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
                    <MenuItem onClick={() => chrome.tabs.create({ url: notes[0].url })}>Go to Page</MenuItem>
                    <MenuItem onClick={() => setFolderDialogue(notes[0].url)}>Move to Folder</MenuItem>
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
                      <MenuItem onClick={() => chrome.tabs.create({ url: notes[0].url })}>Go to Page</MenuItem>
                      <MenuItem onClick={() => setFolderDialogue(notes[0].url)}>Move to Folder</MenuItem>
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




    </AppBar >
  )
}

export default PageHome