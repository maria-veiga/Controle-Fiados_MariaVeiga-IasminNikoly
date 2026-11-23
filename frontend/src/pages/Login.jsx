import { useState } from "react";
import "../styles/login.css";

function Login() {
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [lembrarAcesso, setLembrarAcesso] = useState(true);

  function handleSubmit(event) {
    event.preventDefault();

    alert("A autenticação será implementada na próxima etapa.");
  }

  return (
    <div className="login-container">
      <section className="login-apresentacao">
        <div className="login-logo-container">
          <img
            src="/logo-controle-fiados.png"
            alt="Controle de Fiados"
            className="login-logo"
          />
        </div>

        <div className="login-apresentacao-texto">
          <h1>
            Simplifique o controle e
            <br />
            gestão do seu negócio
          </h1>

          <p>
            Uma plataforma integrada, segura e
            inteligente adaptada para o seu perfil
            comercial de forma ágil.
          </p>
        </div>
      </section>

      <section className="login-area">
        <div className="login-card">
          <div className="login-titulo">
            <h2>Seja bem-vindo</h2>
            <p>Preencha suas credenciais de acesso.</p>
          </div>

          <div className="login-perfil">
            <label>PERFIL DE ACESSO</label>

            <div className="login-perfil-adm">
              Administrador
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="login-campo">
              <label htmlFor="email">ENDEREÇO DE E-MAIL</label>

              <div className="login-input-container">
                <span className="login-icone">✉</span>

                <input
                  type="email"
                  id="email"
                  placeholder="seuemail@empresa.com.br"
                  required
                />
              </div>
            </div>

            <div className="login-campo">
              <label htmlFor="senha">SENHA DE ACESSO</label>

              <div className="login-input-container">
                <span className="login-icone">♙</span>

                <input
                  type={senhaVisivel ? "text" : "password"}
                  id="senha"
                  placeholder="Digite sua senha"
                  required
                />

                <button
                  type="button"
                  className="login-olho"
                  onClick={() => setSenhaVisivel(!senhaVisivel)}
                  aria-label={
                    senhaVisivel ? "Ocultar senha" : "Mostrar senha"
                  }
                >
                  {senhaVisivel ? "◉" : "◎"}
                </button>
              </div>
            </div>

            <div className="login-opcoes">
              <label className="login-lembrar">
                <input
                  type="checkbox"
                  checked={lembrarAcesso}
                  onChange={(event) =>
                    setLembrarAcesso(event.target.checked)
                  }
                />

                <span>Lembrar acesso</span>
              </label>

              <button
                type="button"
                className="login-esqueci"
                onClick={() =>
                  alert("A recuperação de senha será implementada depois.")
                }
              >
                Esqueci minha senha
              </button>
            </div>

            <button type="submit" className="login-botao">
              Entrar no Painel
            </button>
          </form>

          <p className="login-rodape">
            Problemas para acessar?{" "}
            <span>Entre em contato com a gerência.</span>
          </p>
        </div>
      </section>
    </div>
  );
}

export default Login;