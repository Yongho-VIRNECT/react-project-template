import "./App.scss";

import axios from "axios";
import ConfigContext from "contexts/configContext";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";

import Counter from "@/pages/Counter";
import Editor from "@/pages/EditorPage";
import Main from "@/pages/Main";
import NotFound from "@/pages/NotFound";

function App() {
  const { t } = useTranslation();
  const [configUrl, setConfigUrl] = useState({});

  const fetchConfigUrl = async () => {
    const { data } = await axios.get("/configs");
    console.log(data);
    setConfigUrl(data);
    return data;
  };

  useEffect(() => {
    // every rendering or mount with empty deps or update with deps
    fetchConfigUrl();

    // return {
    // unmount
    // }
  }, []);

  return (
    <ConfigContext.Provider value={configUrl}>
      <div className="app">
        <BrowserRouter>
          {/* <ul>
            <li>
              <Link to="/main">Main</Link>
            </li>
            <li>
              <Link to="/editor">Editor</Link>
            </li>
            <li>
              <Link to="/counter">Counter</Link>
            </li>
          </ul> */}
          <Routes>
            <Route path="/main" element={<Main />} />
            <Route path="/editor" element={<Editor />} />
            <Route path="/counter" element={<Counter />} />
            <Route path="/*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </div>
    </ConfigContext.Provider>
  );
}

export default App;
