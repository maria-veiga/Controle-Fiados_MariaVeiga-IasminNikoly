
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/sidebar.css";

const menuItems = [
  { label: "Visão Geral", path: "/", icon: "⌂" },
  { label: "Contas de Alunos", path: "/alunos", icon: "♙" },
  { label: "Lançamentos", path: "/lancamentos", icon: "▤" },
  { label: "Relatórios", path: "/relatorios", icon: "▥" },
  { label: "Configurações", path: "/configuracoes", icon: "⚙" },
];

function Sidebar() {
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">CF</div>

        <div>
          <h2>Painel ADM</h2>
          <span>Controle de Fiados</span>
        </div>
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            <span className="menu-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        className="sidebar-user"
        onClick={() => navigate("/perfil")}
        title="Acessar meu perfil"
      >
        <div className="user-avatar">M</div>

        <div className="sidebar-user-info">
          <strong>Maria</strong>
          <span>Administradora</span>
        </div>

        <span className="sidebar-user-arrow">›</span>
      </button>
    </aside>
  );
}

export default Sidebar;
