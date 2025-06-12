const tabuleiro = document.getElementById("game-board")
const visorTempo = document.getElementById("timer")
const visorPontos = document.getElementById("score")

let icones = ["🐶", "🐱", "🐭", "🦊", "🐸", "🐼", "🐵", "🐷"];
let cartas = []
let primeiraCarta = null;
let segundaCarta = null;
let travarJogo = false;
let pontuacao = 0;
let paresEncontrados = 0;
let totalDePares = icones.length;
let tempoRestante = 60;
let intervaloDoTempo = null;

function iniciarJogo() {
    cartas = duplicarIcones(icones)
    embaralharCartas(cartas);
    criarCartasNoTabuleiro(cartas);
    iniciarContadorRegressivo();
}

function duplicarIcones(lista) {
    let pares = []
    for (let i = 0; i < lista.length; i++) {
        pares.push(lista[i]);
        pares.push(lista[i]);
    }
    return pares
}

function embaralharCartas(lista) {
    for (let i = lista.length - 1; i > 0; i--) {
        let cartaSorteada = Math.floor(Math.random() * (i + 1));
        let temp = lista[i];
        lista[i] = lista[cartaSorteada];
        lista[cartaSorteada] = temp;
    }
}

function criarCartasNoTabuleiro(listaCartas) {
    tabuleiro.innerHTML = ""

    for (let i=0; i < listaCartas.length; i++) {
        let carta = document.createElement("div")
        carta.classList.add("card")
        carta.dataset.icone = listaCartas[i];
        carta.textContent = "?";

        carta.addEventListener("click", function() {
            // função para virar a carta
            virarCarta(carta);
        });
        tabuleiro.appendChild(carta);
    }
}


function iniciarContadorRegressivo() {
    visorTempo.textContent = tempoRestante;
    intervaloDoTempo = setInterval(function() {
        tempoRestante--;
        visorTempo.textContent = tempoRestante;

        // Quando terminar o tempo ???
    }, 1000)
}

function virarCarta(carta) {
    if (travarJogo || 
        carta.classList.contains("card-revealed") || 
        carta === primeiraCarta) {
        return;
    }
    carta.textContent = carta.dataset.icone;
    carta.classList.add("card-revealed");

    if (!primeiraCarta) {
        primeiraCarta = carta;
        return;
    }

    segundaCarta = carta;
    travarJogo = true;

    verificarSeEhPar();
}

function esconderCartas() {
    primeiraCarta.textContent = "?";
    segundaCarta.textContent = "?";
    primeiraCarta.classList.remove("card-revealed");
    segundaCarta.classList.remove("card-revealed");
    limparCartasSelecionadas();
}

function limparCartasSelecionadas() {
    primeiraCarta = null;
    segundaCarta = null;
    travarJogo = false;
}

function verificarSeEhPar() {
    if (primeiraCarta.dataset.icone === 
        segundaCarta.dataset.icone) {
            pontuacao++;
            paresEncontrados++;
            visorPontos.textContent = pontuacao;
            limparCartasSelecionadas();
    } else {
        setTimeout(function() {
            esconderCartas();
        }, 1000);
    }

}



iniciarJogo();
/*
Sugestoes do Miguel para atividade dos alunos:
- Colocar um botão para alterar o tema do jogo
- Contabilizar as tentativas do jogador
- Colocar musica de suspense no jogo
*/