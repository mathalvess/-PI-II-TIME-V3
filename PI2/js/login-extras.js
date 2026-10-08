/* Autor: Pedro Henrique Bassetto Ruiz
   Complemento das validacoes da tela de Login - Projeto Integrador 2
   As validacoes de e-mail e senha ficam no login.js (Eduardo).
   Este arquivo acrescenta:
   - botao para mostrar/ocultar a senha
   - aviso quando o Caps Lock esta ligado no campo de senha
   - bloqueio de 30 segundos depois de 3 tentativas invalidas seguidas
   - lembrar o e-mail quando "Manter conectado" estiver marcado
   Precisa ser carregado ANTES do login.js no index.html. */

// Elementos que ja existem no index.html
const formLoginExtras = document.querySelector("#formLogin");
const campoEmailExtras = document.querySelector("#email");
const campoSenhaExtras = document.querySelector("#senha");
const caixaLembrar = document.querySelector("#lembrar");
const botaoEntrar = formLoginExtras.querySelector("button[type='submit']");

// Regras do bloqueio de tentativas
const MAXIMO_TENTATIVAS = 3;
const SEGUNDOS_BLOQUEIO = 30;
let tentativasInvalidas = 0;
let bloqueado = false;

// Chave usada para guardar o e-mail no navegador
const CHAVE_EMAIL_SALVO = "sad-email-lembrado";

// ---------- Mostrar / ocultar senha ----------

// Cria o botao "Mostrar" ao lado do campo de senha (input-group do Bootstrap)
const grupoSenha = document.createElement("div");
grupoSenha.className = "input-group has-validation";
campoSenhaExtras.parentNode.insertBefore(grupoSenha, campoSenhaExtras);
grupoSenha.appendChild(campoSenhaExtras);

const botaoMostrarSenha = document.createElement("button");
botaoMostrarSenha.type = "button";
botaoMostrarSenha.id = "btnMostrarSenha";
botaoMostrarSenha.className = "btn btn-outline-secondary";
botaoMostrarSenha.innerText = "Mostrar";
grupoSenha.appendChild(botaoMostrarSenha);

// A mensagem de erro do Eduardo precisa ficar dentro do grupo para continuar aparecendo
grupoSenha.appendChild(document.querySelector("#erroSenha"));

// Troca o tipo do campo entre "password" (escondido) e "text" (visivel)
botaoMostrarSenha.addEventListener("click", function () {
    const estaEscondida = campoSenhaExtras.type === "password";
    campoSenhaExtras.type = estaEscondida ? "text" : "password";
    botaoMostrarSenha.innerText = estaEscondida ? "Ocultar" : "Mostrar";
});

// ---------- Aviso de Caps Lock ----------

// Cria o aviso embaixo do campo de senha, escondido no comeco
const avisoCapsLock = document.createElement("small");
avisoCapsLock.id = "avisoCapsLock";
avisoCapsLock.className = "text-warning d-none";
avisoCapsLock.innerText = "Atencao: o Caps Lock esta ligado.";
grupoSenha.after(avisoCapsLock);

// A cada tecla, confere se o Caps Lock esta ligado e mostra/esconde o aviso
function conferirCapsLock(evento) {
    if (evento.getModifierState && evento.getModifierState("CapsLock")) {
        avisoCapsLock.classList.remove("d-none");
    } else {
        avisoCapsLock.classList.add("d-none");
    }
}
campoSenhaExtras.addEventListener("keydown", conferirCapsLock);
campoSenhaExtras.addEventListener("keyup", conferirCapsLock);

// ---------- Bloqueio apos tentativas invalidas ----------

// Cria o aviso de bloqueio acima do formulario
const avisoBloqueio = document.createElement("div");
avisoBloqueio.id = "avisoBloqueio";
avisoBloqueio.className = "alert alert-warning py-2 small d-none";
avisoBloqueio.setAttribute("role", "alert");
formLoginExtras.before(avisoBloqueio);

// Bloqueia o botao Entrar e mostra a contagem regressiva
function bloquearLogin() {
    bloqueado = true;
    botaoEntrar.disabled = true;
    let segundosRestantes = SEGUNDOS_BLOQUEIO;
    avisoBloqueio.classList.remove("d-none");

    function atualizarAviso() {
        avisoBloqueio.innerText = "Muitas tentativas invalidas. Tente novamente em "
            + segundosRestantes + " segundos.";
    }
    atualizarAviso();

    const relogio = setInterval(function () {
        segundosRestantes--;
        atualizarAviso();

        // Acabou o tempo: libera o login e zera as tentativas
        if (segundosRestantes <= 0) {
            clearInterval(relogio);
            bloqueado = false;
            tentativasInvalidas = 0;
            botaoEntrar.disabled = false;
            avisoBloqueio.classList.add("d-none");
        }
    }, 1000);
}

// Este listener roda ANTES do login.js (por isso o script vem antes no HTML)
formLoginExtras.addEventListener("submit", function (evento) {
    // Durante o bloqueio, nem deixa a validacao do login.js rodar
    if (bloqueado) {
        evento.preventDefault();
        evento.stopImmediatePropagation();
        return;
    }

    // setTimeout 0: espera o login.js terminar de validar para ver o resultado
    setTimeout(function () {
        const temErro = formLoginExtras.querySelector(".is-invalid") !== null;

        if (temErro) {
            tentativasInvalidas++;
            if (tentativasInvalidas >= MAXIMO_TENTATIVAS) {
                bloquearLogin();
            }
        } else {
            tentativasInvalidas = 0;
            salvarOuApagarEmail();
        }
    }, 0);
});

// ---------- Lembrar e-mail ----------

// Se "Manter conectado" estiver marcado, guarda o e-mail; se nao, apaga
function salvarOuApagarEmail() {
    try {
        if (caixaLembrar.checked) {
            localStorage.setItem(CHAVE_EMAIL_SALVO, campoEmailExtras.value.trim());
        } else {
            localStorage.removeItem(CHAVE_EMAIL_SALVO);
        }
    } catch (erro) {
        // Alguns navegadores bloqueiam o localStorage; o login funciona mesmo assim
    }
}

// Ao abrir a pagina, preenche o e-mail guardado (se houver)
try {
    const emailSalvo = localStorage.getItem(CHAVE_EMAIL_SALVO);
    if (emailSalvo) {
        campoEmailExtras.value = emailSalvo;
        caixaLembrar.checked = true;
    }
} catch (erro) {
    // Sem localStorage, so nao preenche
}