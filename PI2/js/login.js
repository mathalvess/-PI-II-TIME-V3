/* Autor: Eduardo Campos Ferreira Filho
   Validacoes da tela de Login - Projeto Integrador 2 */

const formulario = document.querySelector("#formLogin");

const campoEmail = document.querySelector("#email");
const campoSenha = document.querySelector("#senha");

const erroEmail = document.querySelector("#erroEmail");
const erroSenha = document.querySelector("#erroSenha");

const avisoCredenciais = document.querySelector("#avisoCredenciais");

const camposComErro = [campoEmail, campoSenha];
const mensagensDeErro = [erroEmail, erroSenha];

const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const TAMANHO_MINIMO_SENHA = 8;
const TAMANHO_MAXIMO_SENHA = 20;

function mostrarErro(campo, elementoErro, mensagem) {
    campo.classList.add("is-invalid");
    elementoErro.innerText = mensagem;
}

function limparErros() {
    camposComErro.forEach(function (campo) {
        campo.classList.remove("is-invalid");
    });

    mensagensDeErro.forEach(function (elementoErro) {
        elementoErro.innerText = "";
    });

    avisoCredenciais.classList.add("d-none");
}

function validarEmail(email) {
    if (email === "") {
        return "Informe o seu e-mail.";
    }

    if (!formatoEmail.test(email)) {
        return "Informe um e-mail valido, no formato nome@dominio.com.";
    }

    return "";
}

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

formulario.addEventListener("submit", function (event) {
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

    if (!formValido) {
        const primeiroCampoInvalido = camposComErro.find(function (campo) {
            return campo.classList.contains("is-invalid");
        });
        primeiroCampoInvalido.focus();
        return;
    }

    window.location.href = "dashboard.html";
});
