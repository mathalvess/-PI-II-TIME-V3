/* Autor: Eduardo Campos Ferreira Filho
   Validacoes da tela de Login - Projeto Integrador 2 */

// Abriu a tela de login? Entao desloga quem tava antes.
sessionStorage.removeItem("usuario");

const formulario = document.querySelector("#formLogin");

const campoEmail = document.querySelector("#email");
const campoSenha = document.querySelector("#senha");

const erroEmail = document.querySelector("#erroEmail");
const erroSenha = document.querySelector("#erroSenha");

const avisoCredenciais = document.querySelector("#avisoCredenciais");

const camposComErro = [campoEmail, campoSenha];
const mensagensDeErro = [erroEmail, erroSenha];

// Regra do e-mail: texto, @, texto, ponto e no minimo 2 letras no fim.
const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const TAMANHO_MINIMO_SENHA = 8;
const TAMANHO_MAXIMO_SENHA = 20;

// Pinta o campo de vermelho e escreve o erro embaixo dele.
function mostrarErro(campo, elementoErro, mensagem) {
    campo.classList.add("is-invalid");
    elementoErro.innerText = mensagem;
}

// Apaga os erros antigos antes de validar de novo.
function limparErros() {
    camposComErro.forEach(function (campo) {
        campo.classList.remove("is-invalid");
    });

    mensagensDeErro.forEach(function (elementoErro) {
        elementoErro.innerText = "";
    });

    avisoCredenciais.classList.add("d-none");
}

// Devolve o texto do erro, ou "" se o e-mail estiver certo.
function validarEmail(email) {
    if (email === "") {
        return "Informe o seu e-mail.";
    }

    if (!formatoEmail.test(email)) {
        return "Informe um e-mail valido, no formato nome@dominio.com.";
    }

    return "";
}

// Testa uma regra por vez e para na primeira que falhar, por isso sai um erro de cada vez.
function validarSenha(senha) {
    if (senha === "") {
        return "Informe a sua senha.";
    }

    if (senha.length < TAMANHO_MINIMO_SENHA) {
        return `A senha deve ter no minimo ${TAMANHO_MINIMO_SENHA} caracteres.`;
    }

    if (senha.length > TAMANHO_MAXIMO_SENHA) {
        return `A senha deve ter no maximo ${TAMANHO_MAXIMO_SENHA} caracteres.`;
    }

    if (!/[A-Z]/.test(senha)) {
        return "A senha deve ter ao menos uma letra maiuscula.";
    }

    if (!/[0-9]/.test(senha)) {
        return "A senha deve ter ao menos um numero.";
    }

    if (!/[^A-Za-z0-9]/.test(senha)) {
        return "A senha deve ter ao menos um simbolo, como ! @ # $ %.";
    }

    return "";
}

// Esses dois fazem o erro sumir assim que a pessoa arruma o campo.
campoEmail.addEventListener("input", function () {
    if (campoEmail.classList.contains("is-invalid") && validarEmail(campoEmail.value.trim()) === "") {
        campoEmail.classList.remove("is-invalid");
        erroEmail.innerText = "";
    }
});

campoSenha.addEventListener("input", function () {
    if (campoSenha.classList.contains("is-invalid") && validarSenha(campoSenha.value) === "") {
        campoSenha.classList.remove("is-invalid");
        erroSenha.innerText = "";
    }
});

// Manda e-mail e senha pro servidor e espera. Quem confere no banco e o back-end.
async function enviarLogin(email, senha) {
    try {
        const resposta = await fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email, senha: senha })
        });
        const dados = await resposta.json();

        if (dados.status) {
            // Guarda quem entrou no navegador. O comum.js usa isso nas outras telas.
            sessionStorage.setItem("usuario", JSON.stringify(dados.usuario));
            window.location.href = "dashboard.html";
        } else {
            avisoCredenciais.innerText = dados.msg;
            avisoCredenciais.classList.remove("d-none");
        }
    // O catch aqui embaixo e pra quando o servidor nem responde, tipo se tiver desligado.
    } catch (erro) {
        avisoCredenciais.innerText = "Nao foi possivel conectar ao servidor.";
        avisoCredenciais.classList.remove("d-none");
    }
}

// Tudo comeca aqui, quando a pessoa clica em Entrar.
formulario.addEventListener("submit", function (event) {
    // Cancela o envio normal do formulario, daqui pra frente quem manda e o codigo.
    event.preventDefault();
    limparErros();

    const email = campoEmail.value.trim();
    const senha = campoSenha.value;

    let formValido = true;

    const mensagemEmail = validarEmail(email);
    if (mensagemEmail !== "") {
        mostrarErro(campoEmail, erroEmail, mensagemEmail);
        formValido = false;
    }

    const mensagemSenha = validarSenha(senha);
    if (mensagemSenha !== "") {
        mostrarErro(campoSenha, erroSenha, mensagemSenha);
        formValido = false;
    }

    // Tem erro: poe o cursor no primeiro campo errado e nao manda nada.
    if (!formValido) {
        const primeiroCampoInvalido = camposComErro.find(function (campo) {
            return campo.classList.contains("is-invalid");
        });
        primeiroCampoInvalido.focus();
        return;
    }

    // Passou em tudo, agora sim vai pro servidor.
    enviarLogin(email, senha);
});
