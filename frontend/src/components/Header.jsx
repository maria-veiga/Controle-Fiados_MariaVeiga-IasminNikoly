
import { useLocation } from "react-router-dom";

const pageTitles = {
  "/lancamentos": {
    title: "Lançamentos",
    description: "Acompanhe os consumos e as movimentações da cantina.",
  },
  "/relatorios": {
    title: "Relatórios",
    description: "Consulte os relatórios financeiros e operacionais.",
  },
  "/configuracoes": {
    title: "Configurações",
    description: "Gerencie as regras e configurações do sistema.",
  },
};

function Header() {
  const location = useLocation();
  const page = pageTitles[location.pathname];

  if (!page) return null;

  return (
    <header className="page-header">
      <div>
        <h1>{page.title}</h1>
        <p>{page.description}</p>
      </div>

      <div className="header-info">
        <span>● Sistema Central Ativo</span>
        <span>Área Administrativa</span>
      </div>
    </header>
  );
}

export default Header;
