// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dasbord from "./dasboard/Dasbord";
{/*import ChartBot from "./dashboard/ChartBot";*/}

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Dasbord />} />
      </Routes>
       {/*<ChartBot />*/}
    </Router>
  );
}

export default App;
