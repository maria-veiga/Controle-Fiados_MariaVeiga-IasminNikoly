import { useState } from "react";
import "../styles/perfil.css";

function Perfil() {
  const [dados, setDados] = useState({
    nome: "Maria",
    email: "",
    telefone: "",
    cargo: "Administradora",
  });

  const [mensagem, setMensagem] = useState("");

  function atualizarCampo(event) {
    const { name, value } = event.target;

    setDados((dadosAtuais) => ({
      ...dadosAtuais,
      [name]: value,
    }));
  }

  function salvarPerfil(event) {
    event.preventDefault();

    setMensagem("Dados atualizados nesta sessão.");
  }

  return (
    <div className="perfil-page">
      <div className="perfil-heading">
        <div>
          <h1>Meu Perfil</h1>
          <p>Visualize e atualize suas informações de administrador.</p>
        </div>
      </div>

      <section className="perfil-card perfil-identificacao">
        <div className="perfil-avatar">
          {dados.nome.trim().charAt(0).toUpperCase() || "M"}
        </div>

        <div className="perfil-identificacao-info">
          <h2>{dados.nome || "Administrador"}</h2>
          <span>{dados.cargo}</span>
          <p>Administrador do sistema Controle de Fiados</p>
        </div>
      </section>

      <section className="perfil-card">
        <div className="perfil-section-heading">
          <div className="perfil-section-icon">♙</div>

          <div>
            <h2>Informações pessoais</h2>
            <p>Gerencie os dados da sua conta.</p>
          </div>
        </div>

        <form onSubmit={salvarPerfil}>
          <div className="perfil-form-grid">
            <div className="perfil-field">
              <label htmlFor="nome">Nome completo</label>
              <input
                id="nome"
                name="nome"
                type="text"
                value={dados.nome}
                onChange={atualizarCampo}
                placeholder="Digite seu nome"
                required
              />
            </div>

            <div className="perfil-field">
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                name="email"
                type="email"
                value={dados.email}
                onChange={atualizarCampo}
                placeholder="Digite seu e-mail"
              />
            </div>

            <div className="perfil-field">
              <label htmlFor="telefone">Telefone</label>
              <input
                id="telefone"
                name="telefone"
                type="tel"
                value={dados.telefone}
                onChange={atualizarCampo}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="perfil-field">
              <label htmlFor="cargo">Tipo de acesso</label>
              <input
                id="cargo"
                name="cargo"
                type="text"
                value={dados.cargo}
                disabled
              />
            </div>
          </div>

          {mensagem && (
            <p className="perfil-success">{mensagem}</p>
          )}

          <div className="perfil-actions">
            <button type="submit" className="perfil-save-button">
              Salvar alterações
            </button>
          </div>
        </form>
      </section>

      <section className="perfil-card perfil-security">
        <div className="perfil-section-heading">
          <div className="perfil-section-icon">♧</div>

          <div>
            <h2>Segurança da conta</h2>
            <p>Informações sobre a proteção do seu acesso.</p>
          </div>
        </div>

        <div className="perfil-security-info">
          <div>
            <strong>Senha de acesso</strong>
            <p>
              A alteração de senha poderá ser disponibilizada
              quando o sistema de autenticação estiver integrado.
            </p>
          </div>

          <span className="perfil-security-status">
            Em desenvolvimento
          </span>
        </div>
      </section>
    </div>
  );
}

export default Perfil;