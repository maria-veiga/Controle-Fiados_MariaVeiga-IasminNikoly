
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

import Home from "./pages/Home";
import Alunos from "./pages/Alunos";
import ContaAluno from "./pages/ContaAluno";
import Lancamentos from "./pages/Lancamentos";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";
import Perfil from "./pages/Perfil";
import Login from "./pages/Login";

import { AlunosProvider } from "./context/AlunosContext";

import "./styles/global.css";
import "./styles/layout.css";

function AppLayout() {
  return (
    <AlunosProvider>
      <div className="app-layout">
        <Sidebar />

        <main className="main-area">
          <Header />

          <div className="page-content">
            <Routes>
              <Route path="/home" element={<Home />} />
              <Route path="/alunos" element={<Alunos />} />
              <Route path="/alunos/:id" element={<ContaAluno />} />
              <Route path="/lancamentos" element={<Lancamentos />} />
              <Route path="/relatorios" element={<Relatorios />} />
              <Route path="/configuracoes" element={<Configuracoes />} />
              <Route path="/perfil" element={<Perfil />} />

              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </AlunosProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        <Route path="/*" element={<AppLayout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
