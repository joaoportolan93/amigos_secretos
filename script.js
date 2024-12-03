// Variáveis globais
let participants = [];
let restrictions = [];
const bellSound = new Audio('https://www.soundjay.com/misc/sounds/bell-ringing-01.mp3');

// Inicialização quando o documento carrega
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar particles.js
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: {
                number: { value: 100 },
                color: { value: '#ffffff' },
                shape: { type: 'circle' },
                size: { value: 3 },
                move: {
                    enable: true,
                    speed: 3,
                    direction: 'bottom'
                }
            }
        });
    }

    // Criar ícones flutuantes
    createFloatingIcons();

    // Verificar se há um ID na URL
    checkForResultId();
});

function createFloatingIcons() {
    const icons = ['🎄', '🎅', '🎁', '⛄', '🔔'];
    const container = document.querySelector('.floating-icons');
    if (!container) return;

    for (let i = 0; i < 10; i++) {
        const icon = document.createElement('span');
        icon.className = 'icon';
        icon.textContent = icons[Math.floor(Math.random() * icons.length)];
        icon.style.left = `${Math.random() * 100}%`;
        icon.style.animationDelay = `${Math.random() * 5}s`;
        container.appendChild(icon);
    }
}

function addParticipant() {
    const input = document.getElementById('participantName');
    if (!input) return;

    const name = input.value.trim();
    if (name && !participants.includes(name)) {
        participants.push(name);
        updateParticipantsList();
        updateRestrictionsSelects();
        input.value = '';
    }
}

function updateParticipantsList() {
    const list = document.getElementById('participantsList');
    if (!list) return;

    list.innerHTML = '';
    participants.forEach(name => {
        const div = document.createElement('div');
        div.className = 'alert alert-success d-flex justify-content-between align-items-center';
        div.innerHTML = `
            <span>${name}</span>
            <button class="btn btn-sm btn-danger" onclick="removeParticipant('${name}')">
                Remover
            </button>
        `;
        list.appendChild(div);
    });
}

function removeParticipant(name) {
    participants = participants.filter(p => p !== name);
    updateParticipantsList();
    updateRestrictionsSelects();
}

function updateRestrictionsSelects() {
    const select1 = document.getElementById('person1');
    const select2 = document.getElementById('person2');
    if (!select1 || !select2) return;

    [select1, select2].forEach(select => {
        const currentValue = select.value;
        select.innerHTML = '<option value="">Selecione uma pessoa</option>';
        participants.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            select.appendChild(option);
        });
        if (participants.includes(currentValue)) {
            select.value = currentValue;
        }
    });
}

function addRestriction() {
    const person1 = document.getElementById('person1').value;
    const person2 = document.getElementById('person2').value;
    
    if (person1 && person2 && person1 !== person2) {
        restrictions.push([person1, person2]);
        updateRestrictionsList();
        
        // Limpar as seleções
        document.getElementById('person1').value = '';
        document.getElementById('person2').value = '';
        
        // Feedback visual
        const alert = document.createElement('div');
        alert.className = 'alert alert-success mt-2';
        alert.textContent = `Restrição adicionada: ${person1} não pode tirar ${person2}`;
        setTimeout(() => alert.remove(), 3000);
        document.getElementById('restrictionsList').appendChild(alert);
    } else {
        alert('Selecione duas pessoas diferentes!');
    }
}

function generateUniqueId() {
    return Math.random().toString(36).substr(2, 9);
}

function drawNames() {
    if (participants.length < 2) {
        alert('Adicione pelo menos 2 participantes!');
        return;
    }

    let available = [...participants];
    let result = new Map();
    let success = true;
    let links = new Map();

    // Algoritmo de sorteio
    for (let giver of participants) {
        let possibleReceivers = available.filter(receiver => 
            receiver !== giver && 
            !restrictions.some(r => 
                (r[0] === giver && r[1] === receiver) || 
                (r[1] === giver && r[0] === receiver)
            )
        );

        if (possibleReceivers.length === 0) {
            success = false;
            break;
        }

        const receiver = possibleReceivers[Math.floor(Math.random() * possibleReceivers.length)];
        result.set(giver, receiver);
        available = available.filter(p => p !== receiver);
        
        // Gerar ID único e salvar dados
        const uniqueId = generateUniqueId();
        localStorage.setItem(`draw_${uniqueId}`, receiver);
        localStorage.setItem(`participant_${uniqueId}`, giver);
        
        // Criar URL para a página de verificação
        const resultUrl = `participante.html?id=${uniqueId}`;
        links.set(giver, resultUrl);
    }

    if (success) {
        // Mostrar os links gerados
        const resultsDiv = document.createElement('div');
        resultsDiv.className = 'mt-4 p-3 bg-light rounded';
        
        const resultsList = document.createElement('ul');
        resultsList.className = 'list-group';
        
        links.forEach((url, giver) => {
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
            
            listItem.innerHTML = `
                <span>${giver}</span>
                <button class="btn btn-sm btn-success" onclick="copyToClipboard('${url}', this)">
                    📋 Copiar Link
                </button>
            `;
            
            resultsList.appendChild(listItem);
        });
        
        resultsDiv.appendChild(resultsList);
        
        // Limpar resultados anteriores
        const oldResults = document.querySelector('.results-container');
        if (oldResults) oldResults.remove();
        
        resultsDiv.className = 'results-container ' + resultsDiv.className;
        document.querySelector('.christmas-card').appendChild(resultsDiv);
    } else {
        alert('Não foi possível realizar o sorteio com essas restrições!');
    }
}

// Função auxiliar para copiar links
function copyToClipboard(text, button) {
    navigator.clipboard.writeText(window.location.origin + '/' + text).then(() => {
        const originalText = button.innerHTML;
        button.innerHTML = '✅ Copiado!';
        setTimeout(() => {
            button.innerHTML = originalText;
        }, 2000);
    }).catch(err => {
        alert('Erro ao copiar: ' + err);
    });
}

// Adicionar animação ao botão de sorteio
const drawButton = document.getElementById('drawButton');
drawButton.addEventListener('mouseover', () => {
    drawButton.classList.add('animate__animated', 'animate__pulse');
});

drawButton.addEventListener('mouseout', () => {
    drawButton.classList.remove('animate__animated', 'animate__pulse');
});

function updateRestrictionsList() {
    const list = document.getElementById('currentRestrictions');
    if (!list) return;

    list.innerHTML = '';
    restrictions.forEach((restriction, index) => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.innerHTML = `
            <span>${restriction[0]} não pode tirar ${restriction[1]}</span>
            <button class="btn btn-sm btn-danger" onclick="removeRestriction(${index})">
                Remover
            </button>
        `;
        list.appendChild(li);
    });
}

function removeRestriction(index) {
    restrictions.splice(index, 1);
    updateRestrictionsList();
} 