const setupContainer = document.getElementById('setup-container');
const gameContainer = document.getElementById('game-container');
const wordDisplay = document.getElementById('word-display');
const hintDisplay = document.getElementById('hint-display');
const gameMessage = document.getElementById('game-message');
const errorCount = document.getElementById('error-count');
const resetBtn = document.getElementById('reset-btn');
const letterInput = document.getElementById('letter-input');

const URL_API = 'https://api-palavras-8ptt.onrender.com';

let dificuldadeSelecionada = 'facil'; // Dificuldade padrão

// Nova função para registrar a dificuldade clicada
function setDificuldade(nivel) {
    dificuldadeSelecionada = nivel;
    
    // Atualiza o visual dos botões
    document.querySelectorAll('.btn-diff').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-${nivel}`).classList.add('active');
}

async function iniciarJogo(event) {
    if (event.key === "Enter") {
        const nickname = document.getElementById('nickname-input').value;

        if (!nickname) {
            alert('Oh meu(a) amigo(a), preencha o nickname fio(a)!');
            return;
        }

        try {
            const response = await fetch(`${URL_API}/iniciar`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                // Enviando o nickname e o nível selecionado
                body: JSON.stringify({ nickname: nickname, nivel: dificuldadeSelecionada })
            });

            const data = await response.json();

            if (data.erro) {
                alert(data.erro);
                return;
            }

            setupContainer.classList.add('hidden');
            gameContainer.classList.remove('hidden');
            document.getElementById('player-display').innerText = data.mensagem || `Boa sorte, ${nickname}!`;

            letterInput.focus();
            buscarPalavra();
        } catch (error) {
            console.error("Erro ao iniciar:", error);
            alert("Erro de conexão com a API.");
        }
    }
}

async function buscarPalavra() {
    try {
        const response = await fetch(`${URL_API}/status`, {
            credentials: 'include',
            method: 'GET'
        });

        const data = await response.json();
        wordDisplay.innerHTML = '';

        // Exibe a dica que vem da API
        if (data.dica) {
            hintDisplay.innerText = `Dica: ${data.dica}`;
        } else {
            hintDisplay.innerText = "Dica: Tente adivinhar a palavra!";
        }

        for (let i = 0; i < data.qtde_caracteres; i++) {
            const span = document.createElement('span');
            span.className = 'letter-slot';
            span.id = `slot-${i}`;
            wordDisplay.appendChild(span);
        }
    } catch (error) {
        console.error("Erro ao buscar palavra:", error);
    }
}

async function tentarLetra(event) { 
    if (event.key !== "Enter") return;

    const caractere = letterInput.value.trim();
    letterInput.value = '';
    letterInput.focus();

    if (!caractere) {
        alert('Digite um caractere para jogar!');
        return;
    }

    try {
        const response = await fetch(`${URL_API}/tentativa`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ caractere: caractere })
        });

        const data = await response.json();

        if (data.posicoes) {
            data.posicoes.forEach(pos => {
                const slot = document.getElementById(`slot-${pos}`);
                if (slot) slot.innerText = caractere;
            });

            errorCount.innerText = data.erros_atuais;
            gameMessage.innerText = data.mensagem;

            if (data.status_jogo && data.status_jogo !== 'Jogando') {
                resetBtn.classList.remove('hidden');
                letterInput.disabled = true;
                letterInput.placeholder = "Fim de jogo!";

                const statusNormalizado = data.status_jogo.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

                if (statusNormalizado === 'derrota') {
                    gameMessage.style.color = '#ffeb3b';
                    document.body.classList.add('derrota');
                    document.getElementById('audio-derrota').play().catch(e => console.log("Erro ao tocar áudio:", e));

                    // Revela a palavra usando a classe vermelha do CSS
                    if (data.palavra) {
                        const letrasCompletas = data.palavra.split('');
                        letrasCompletas.forEach((letra, index) => {
                            const slot = document.getElementById(`slot-${index}`);
                            if (slot && slot.innerText === '') {
                                slot.innerText = letra;
                                slot.classList.add('revelada');
                            }
                        });
                    }
                } 
                else if (statusNormalizado === 'vitoria') {
                    gameMessage.style.color = 'white';
                    document.body.classList.add('vitoria');
                    document.getElementById('audio-vitoria').play().catch(e => console.log("Erro ao tocar áudio:", e));
                }
            }
        }
    } catch (error) {
        console.error("Erro na tentativa:", error);
    }
}

function reiniciarJogo() {
    location.reload();
}