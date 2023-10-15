/*global chrome*/
import React, { useState, useEffect } from "react"
import { MemoryRouter as Router, Routes, Route } from "react-router-dom";
import PageAccount from "./pages/PageAccount";
import PageHome from "./pages/PageHome";
import PageLogin from "./pages/PageLogin";
import PageNotifications from "./pages/PageNotifications";
import PageSignUp from "./pages/PageSignUp";
import PageVerifyAccount from "./pages/PageVerifyAccount";
import * as API from "./utils/api";
import PageShare from "./pages/PageShare";

export const ContextUser = React.createContext(null);
export const ContextSetUser = React.createContext(null);
export const ContextFullScreen = React.createContext(false);
export const ContextCount = React.createContext(40);
const NOTE_LIMIT = 40;


function App({ fullScreen }) {

  const [user, setUser] = useState(null);
  const [count, setCount] = useState(NOTE_LIMIT);

  useEffect(() => {
    if (fullScreen === true) {
      document.body.style.width = "100%";
      document.body.style.height = "100%";
      document.getElementById('root').style.width = "100%";
      document.getElementById('root').style.height = "100%";
    }
  }, [fullScreen]);

  // Authentication
  useEffect(() => {
    async function run() {
      try {
        const token = await API.getAccessToken();
        if (token) {
          const res = await API.GetAPI(`/api/user`);
          if (res.result) {
            setUser(res.user);
            chrome.storage.local.set({ count: res.user?.count || NOTE_LIMIT }, () => setCount(NOTE_LIMIT))
          } else setCount(40)
        } else chrome.storage.local.set({ count: NOTE_LIMIT }, () => setCount(NOTE_LIMIT))
      } catch (e) {
        console.log(e.message);
      }
    }
    run()
  }, []);


  return (
    <div className="main">
      <ContextCount.Provider value={count}>
        <ContextFullScreen.Provider value={fullScreen}>
          <ContextUser.Provider value={user}>
            <ContextSetUser.Provider value={setUser}>
              <Router>
                
                <Routes>
                  <Route path="/" element={<PageHome />} />
                  <Route path="/login" element={<PageLogin />} />
                  <Route path="/signup" element={<PageSignUp />} />
                  <Route path="/account" element={<PageAccount />} />
                  <Route path="/verify" element={<PageVerifyAccount />} />
                  <Route path="/notifications" element={<PageNotifications />} />
                  <Route path="/share" element={<PageShare />} />
                </Routes>

              </Router>
            </ContextSetUser.Provider>
          </ContextUser.Provider>
        </ContextFullScreen.Provider>
      </ContextCount.Provider>
    </div>

  );
}

export default App;
