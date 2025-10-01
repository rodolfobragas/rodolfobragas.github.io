// Variáveis globais de controle
let spotsRemaining = 47;
let countdownInterval;
let formSubmitted = false;

// Inicialização da página
document.addEventListener('DOMContentLoaded', function() {
    initializeCountdown();
    initializeSpotsSystem();
    initializeForm();
    initializeAnimations();
    initializeScrollEffects();
    startCountdownTimer();
    startSpotsDecrement();
});

// Sistema de Countdown
function initializeCountdown() {
    // Define horário de fim (11h37min restantes)
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + 11);
    endTime.setMinutes(endTime.getMinutes() + 37);
    endTime.setSeconds(endTime.getSeconds() + 15);
    
    localStorage.setItem('cftv-countdown-end', endTime.getTime());
    updateCountdownDisplay();
}

function startCountdownTimer() {
    countdownInterval = setInterval(() => {
        updateCountdownDisplay();
    }, 1000);
}

function updateCountdownDisplay() {
    const endTime = parseInt(localStorage.getItem('cftv-countdown-end'));
    const now = new Date().getTime();
    const timeLeft = endTime - now;
    
    if (timeLeft <= 0) {
        // Tempo acabou - mostrar urgência extrema
        document.querySelectorAll('.time-number').forEach(el => {
            el.textContent = '00';
            el.style.color = '#ff0000';
            el.style.animation = 'urgent-flash 0.5s infinite';
        });
        showFinalUrgency();
        return;
    }
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    // Atualizar todos os contadores
    updateCounterElement('hours-alert', hours);
    updateCounterElement('minutes-alert', minutes);
    updateCounterElement('hours-main', hours);
    updateCounterElement('minutes-main', minutes);
    updateCounterElement('seconds-main', seconds);
    
    // Adicionar urgência quando restam menos de 2 horas
    if (hours < 2) {
        addCriticalUrgency();
    }
}

function updateCounterElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        const newValue = value.toString().padStart(2, '0');
        if (element.textContent !== newValue) {
            element.textContent = newValue;
            // Efeito visual de mudança
            element.style.transform = 'scale(1.2)';
            element.style.color = '#ffcc00';
            setTimeout(() => {
                element.style.transform = 'scale(1)';
                element.style.color = '#ff0000';
            }, 300);
        }
    }
}

function addCriticalUrgency() {
    // Efeitos visuais de urgência crítica
    document.querySelectorAll('.time-unit').forEach(unit => {
        unit.style.animation = 'critical-shake 0.5s infinite';
        unit.style.borderColor = '#ff0000';
        unit.style.boxShadow = '0 0 30px rgba(255, 0, 0, 0.8)';
    });
    
    // Piscar banner de alerta
    const alertBanner = document.querySelector('.alert-banner');
    if (alertBanner) {
        alertBanner.style.animation = 'critical-flash 0.3s infinite';
    }
}

// Sistema de Diminuição de Vagas
function initializeSpotsSystem() {
    const lastUpdate = localStorage.getItem('cftv-spots-last-update');
    const storedSpots = localStorage.getItem('cftv-spots-remaining');
    const now = Date.now();
    
    if (lastUpdate && storedSpots && (now - parseInt(lastUpdate)) < 600000) { // 10 minutos
        spotsRemaining = parseInt(storedSpots);
    }
    
    updateSpotsDisplay();
}

function startSpotsDecrement() {
    // Diminuir vagas a cada intervalo aleatório
    setInterval(() => {
        if (Math.random() < 0.15 && spotsRemaining > 10) { // 15% chance
            spotsRemaining -= Math.floor(Math.random() * 2) + 1; // 1-2 vagas
            updateSpotsDisplay();
            
            // Salvar no localStorage
            localStorage.setItem('cftv-spots-remaining', spotsRemaining);
            localStorage.setItem('cftv-spots-last-update', Date.now());
            
            // Mostrar notificação ocasional
            if (Math.random() < 0.4) { // 40% chance
                showSpotTakenAlert();
            }
        }
        
        // Urgência extrema quando restam poucas vagas
        if (spotsRemaining <= 15) {
            addSpotsUrgency();
        }
    }, 8000); // A cada 8 segundos
}

function updateSpotsDisplay() {
    const spotElements = [
        'spots-counter',
        'main-spots-counter',
        'form-spots-counter',
        'final-spots-counter'
    ];
    
    spotElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = spotsRemaining;
            
            // Efeito visual de mudança
            element.style.color = '#ffcc00';
            element.style.transform = 'scale(1.1)';
            element.style.textShadow = '0 0 15px #ffcc00';
            
            setTimeout(() => {
                element.style.color = '';
                element.style.transform = '';
                element.style.textShadow = '';
            }, 500);
        }
    });
    
    // Atualizar barra de progresso
    const counterFill = document.querySelector('.counter-fill');
    if (counterFill) {
        const percentage = (spotsRemaining / 50) * 100;
        counterFill.style.width = percentage + '%';
        
        // Mudar cor baseado na urgência
        if (spotsRemaining <= 15) {
            counterFill.style.background = 'linear-gradient(135deg, #ff0000, #cc0000)';
        } else if (spotsRemaining <= 25) {
            counterFill.style.background = 'linear-gradient(135deg, #ff4500, #ffcc00)';
        }
    }
}

function addSpotsUrgency() {
    // Efeitos visuais quando restam poucas vagas
    document.querySelectorAll('.spots-counter, .form-spots').forEach(el => {
        el.style.animation = 'spots-critical 0.5s infinite';
    });
}

function showSpotTakenAlert() {
    const notification = document.createElement('div');
    notification.className = 'spot-alert';
    notification.innerHTML = `
        <div class="alert-content">
            <i class="fas fa-exclamation-triangle"></i>
            <span><strong>ALGUÉM ACABOU DE RESERVAR!</strong> Restam apenas ${spotsRemaining} vagas</span>
        </div>
    `;
    
    // Estilos da notificação
    notification.style.cssText = `
        position: fixed;
        top: 120px;
        right: 20px;
        background: linear-gradient(135deg, #ff4500, #ffcc00);
        color: #000000;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(255, 69, 0, 0.6);
        z-index: 10001;
        animation: slideInAlert 0.5s ease, fadeOutAlert 0.5s ease 4s forwards;
        max-width: 320px;
        font-weight: 700;
    `;
    
    document.body.appendChild(notification);
    
    // Remover após 4.5 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 4500);
}

// Sistema de Formulário Agressivo
function initializeForm() {
    const form = document.getElementById('leadForm');
    const phoneInput = document.getElementById('whatsapp');
    
    // Máscara para telefone
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
            value = value.replace(/(\d)(\d{4})$/, '$1-$2');
            e.target.value = value;
        });
    }
    
    // Validação em tempo real
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateFieldAggressive(this);
        });
        
        input.addEventListener('focus', function() {
            this.style.borderColor = '#ff0000';
            this.style.boxShadow = '0 0 20px rgba(255, 0, 0, 0.4)';
        });
    });
    
    // Submissão do formulário
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!formSubmitted && validateFormComplete()) {
                submitFormAggressive();
            }
        });
    }
    
    // Detectar tentativa de sair
    window.addEventListener('beforeunload', function(e) {
        if (!formSubmitted) {
            e.preventDefault();
            e.returnValue = 'PARE! Você vai perder sua vaga de instalação GRATUITA com IA!';
            return e.returnValue;
        }
    });
    
    // Exit intent
    document.addEventListener('mouseleave', function(e) {
        if (e.clientY <= 0 && !formSubmitted && spotsRemaining > 0) {
            showExitIntentOffer();
        }
    });
}

function validateFieldAggressive(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // Remove erro anterior
    removeFieldError(field);
    
    // Validações
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'CAMPO OBRIGATÓRIO! Preencha agora!';
    } else if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'EMAIL INVÁLIDO! Corrija imediatamente!';
        }
    } else if (field.type === 'tel' && value) {
        const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
        if (!phoneRegex.test(value)) {
            isValid = false;
            errorMessage = 'TELEFONE INVÁLIDO! Use: (11) 99999-9999';
        }
    }
    
    if (!isValid) {
        showFieldError(field, errorMessage);
    } else {
        showFieldSuccess(field);
    }
    
    return isValid;
}

function showFieldError(field, message) {
    field.style.borderColor = '#ff0000';
    field.style.boxShadow = '0 0 25px rgba(255, 0, 0, 0.6)';
    field.style.animation = 'field-error-shake 0.5s';
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        color: #ff0000;
        font-size: 0.85rem;
        font-weight: 700;
        margin-top: 5px;
        animation: error-appear 0.3s ease;
    `;
    
    field.parentNode.appendChild(errorDiv);
}

function showFieldSuccess(field) {
    field.style.borderColor = '#00ff00';
    field.style.boxShadow = '0 0 20px rgba(0, 255, 0, 0.4)';
    
    // Ícone de sucesso
    const successIcon = document.createElement('i');
    successIcon.className = 'fas fa-check-circle field-success-icon';
    successIcon.style.cssText = `
        position: absolute;
        right: 15px;
        top: 50%;
        transform: translateY(-50%);
        color: #00ff00;
        font-size: 1.2rem;
        text-shadow: 0 0 10px #00ff00;
    `;
    
    field.parentNode.style.position = 'relative';
    field.parentNode.appendChild(successIcon);
}

function removeFieldError(field) {
    const existingError = field.parentNode.querySelector('.field-error-message');
    const existingSuccess = field.parentNode.querySelector('.field-success-icon');
    
    if (existingError) existingError.remove();
    if (existingSuccess) existingSuccess.remove();
    
    field.style.borderColor = '';
    field.style.boxShadow = '';
    field.style.animation = '';
}

function validateFormComplete() {
    const form = document.getElementById('leadForm');
    const inputs = form.querySelectorAll('input[required], select[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!validateFieldAggressive(input)) {
            isValid = false;
        }
    });
    
    // Validar checkbox
    const consentCheckbox = document.getElementById('consent');
    if (!consentCheckbox.checked) {
        showBrutalError('ACEITE OS TERMOS PARA CONTINUAR!');
        isValid = false;
    }
    
    return isValid;
}

function submitFormAggressive() {
    const submitBtn = document.querySelector('.btn-capture-mega');
    const originalContent = submitBtn.innerHTML;
    
    // Estado de loading
    submitBtn.innerHTML = `
        <i class="fas fa-spinner fa-spin"></i>
        <div class="btn-capture-content">
            <span class="btn-capture-main">PROCESSANDO SUA PROTEÇÃO...</span>
            <span class="btn-capture-sub">NÃO SAIA DA PÁGINA!</span>
        </div>
    `;
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.7';
    
    // Simular processamento
    setTimeout(() => {
        // Coletar dados
        const formData = new FormData(document.getElementById('leadForm'));
        const leadData = Object.fromEntries(formData);
        
        // Reservar uma vaga
        spotsRemaining--;
        updateSpotsDisplay();
        
        console.log('Lead CFTV Capturado:', leadData);
        
        // Mostrar sucesso
        showSuccessProtection();
        formSubmitted = true;
        
        // Tracking
        trackSecurityLead(leadData);
        
    }, 3500);
}

function showSuccessProtection() {
    const modal = document.createElement('div');
    modal.className = 'success-protection-modal';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <div class="success-shield">
                <i class="fas fa-shield-check"></i>
            </div>
            <h2>🛡️ PROTEÇÃO GARANTIDA! 🛡️</h2>
            <p>Sua vaga de <strong>INSTALAÇÃO GRATUITA</strong> foi reservada com sucesso!</p>
            <div class="protection-details">
                <div class="detail-item">
                    <i class="fas fa-phone"></i>
                    <span>Nossa equipe técnica ligará em <strong>5 MINUTOS</strong></span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-tools"></i>
                    <span>Instalação em <strong>24 HORAS</strong></span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-brain"></i>
                    <span>IA configurada para <strong>SEU AMBIENTE</strong></span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-mobile-alt"></i>
                    <span>WhatsApp integrado <strong>NA HORA</strong></span>
                </div>
            </div>
            <div class="savings-highlight">
                <p><strong>VOCÊ ECONOMIZOU:</strong> <span class="savings-amount">R$ 2.300</span></p>
            </div>
            <div class="protection-warning">
                <i class="fas fa-shield-alt"></i>
                <p><strong>IMPORTANTE:</strong> Mantenha seu telefone ligado. Nossa equipe está a caminho!</p>
            </div>
            <button class="btn-close-success" onclick="closeSuccessModal()">
                ENTENDI! AGUARDO A LIGAÇÃO
            </button>
        </div>
    `;
    
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

function closeSuccessModal() {
    const modal = document.querySelector('.success-protection-modal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
}

function showExitIntentOffer() {
    if (document.querySelector('.exit-security-modal')) return;
    
    const modal = document.createElement('div');
    modal.className = 'exit-security-modal';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content exit-security">
            <div class="exit-header">
                <h2>🚨 PARE! SUA SEGURANÇA ESTÁ EM RISCO! 🚨</h2>
                <p>Você está prestes a perder a <strong>ÚNICA CHANCE</strong> de ter proteção IA gratuita!</p>
            </div>
            <div class="exit-offer">
                <h3>OFERTA FINAL - SÓ PARA VOCÊ:</h3>
                <div class="special-security-deal">
                    <span class="deal-text">GARANTIA ESTENDIDA DE 3 ANOS</span>
                    <span class="deal-sub">+ Suporte prioritário vitalício</span>
                </div>
            </div>
            <div class="security-stats">
                <div class="stat">
                    <strong>87%</strong><br>dos crimes acontecem em casas SEM IA
                </div>
                <div class="stat">
                    <strong>3 SEG</strong><br>é o tempo que criminosos levam para agir
                </div>
            </div>
            <div class="exit-buttons">
                <button class="btn-stay-protected" onclick="stayProtected()">
                    <i class="fas fa-shield-check"></i>
                    SIM! QUERO PROTEÇÃO TOTAL + GARANTIA
                </button>
                <button class="btn-leave-unprotected" onclick="leaveUnprotected()">
                    Não, prefiro ficar vulnerável
                </button>
            </div>
        </div>
    `;
    
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10001;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    document.body.appendChild(modal);
}

function stayProtected() {
    const modal = document.querySelector('.exit-security-modal');
    if (modal) modal.remove();
    
    // Scroll para formulário
    document.getElementById('capture').scrollIntoView({ 
        behavior: 'smooth' 
    });
    
    // Mostrar bônus
    showBonusOffer();
}

function leaveUnprotected() {
    const modal = document.querySelector('.exit-security-modal');
    if (modal) modal.remove();
}

function showBonusOffer() {
    const banner = document.createElement('div');
    banner.className = 'bonus-security-banner';
    banner.innerHTML = `
        <div class="bonus-content">
            <i class="fas fa-gift"></i>
            <span><strong>BÔNUS ATIVADO!</strong> Garantia estendida + Suporte VIP incluso</span>
        </div>
    `;
    
    banner.style.cssText = `
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        background: linear-gradient(135deg, #00ff00, #00cc00);
        color: #000000;
        padding: 15px;
        text-align: center;
        font-weight: 700;
        z-index: 9998;
        animation: slideUpBanner 0.5s ease;
    `;
    
    document.body.appendChild(banner);
    
    setTimeout(() => {
        banner.style.animation = 'slideDownBanner 0.5s ease';
        setTimeout(() => banner.remove(), 500);
    }, 6000);
}

// Animações e efeitos
function initializeAnimations() {
    const animationStyles = document.createElement('style');
    animationStyles.textContent = `
        @keyframes critical-shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
        
        @keyframes critical-flash {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }
        
        @keyframes spots-critical {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        
        @keyframes field-error-shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-8px); }
            75% { transform: translateX(8px); }
        }
        
        @keyframes error-appear {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideInAlert {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes fadeOutAlert {
            from { opacity: 1; }
            to { opacity: 0; }
        }
        
        @keyframes slideUpBanner {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
        }
        
        @keyframes slideDownBanner {
            from { transform: translateY(0); }
            to { transform: translateY(100%); }
        }
        
        .modal-overlay {
            background: rgba(0, 0, 0, 0.9);
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }
        
        .modal-content {
            background: linear-gradient(135deg, #000000, #1a0000);
            border: 3px solid #ff0000;
            border-radius: 20px;
            padding: 40px;
            max-width: 600px;
            width: 90%;
            text-align: center;
            color: #ffffff;
            position: relative;
            z-index: 1;
            box-shadow: 0 0 50px rgba(255, 0, 0, 0.6);
        }
        
        .success-shield i {
            font-size: 5rem;
            color: #00ff00;
            margin-bottom: 20px;
            animation: shield-success 1s ease;
            text-shadow: 0 0 30px #00ff00;
        }
        
        @keyframes shield-success {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.2); }
        }
        
        .protection-details {
            margin: 30px 0;
            text-align: left;
        }
        
        .detail-item {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 15px;
            font-size: 1.1rem;
        }
        
        .detail-item i {
            color: #ffcc00;
            font-size: 1.3rem;
            min-width: 25px;
        }
        
        .savings-highlight {
            background: rgba(255, 204, 0, 0.2);
            border: 2px solid #ffcc00;
            border-radius: 10px;
            padding: 15px;
            margin: 20px 0;
        }
        
        .savings-amount {
            color: #ffcc00;
            font-size: 2rem;
            font-weight: 900;
        }
        
        .protection-warning {
            background: rgba(255, 69, 0, 0.2);
            border: 2px solid #ff4500;
            border-radius: 10px;
            padding: 15px;
            margin: 20px 0;
        }
        
        .btn-close-success {
            background: linear-gradient(135deg, #ff0000, #ff4500);
            color: #ffffff;
            border: none;
            padding: 15px 30px;
            border-radius: 10px;
            font-weight: 700;
            font-size: 1.1rem;
            cursor: pointer;
            transition: transform 0.3s;
        }
        
        .btn-close-success:hover {
            transform: scale(1.05);
        }
        
        .exit-security .exit-header h2 {
            color: #ff0000;
            font-size: 2rem;
            margin-bottom: 15px;
        }
        
        .exit-offer {
            margin: 30px 0;
        }
        
        .special-security-deal {
            background: linear-gradient(135deg, #00ff00, #00cc00);
            color: #000000;
            padding: 20px;
            border-radius: 15px;
            margin: 15px 0;
        }
        
        .deal-text {
            font-size: 1.5rem;
            font-weight: 900;
            display: block;
        }
        
        .deal-sub {
            font-size: 1rem;
            font-weight: 600;
        }
        
        .security-stats {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 20px 0;
        }
        
        .stat {
            background: rgba(255, 0, 0, 0.2);
            padding: 15px;
            border-radius: 10px;
            border: 1px solid #ff0000;
            font-size: 0.9rem;
        }
        
        .exit-buttons {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        
        .btn-stay-protected {
            background: linear-gradient(135deg, #ff0000, #ff4500);
            color: #ffffff;
            border: none;
            padding: 20px;
            border-radius: 10px;
            font-weight: 700;
            font-size: 1.2rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        }
        
        .btn-leave-unprotected {
            background: transparent;
            color: #666666;
            border: 1px solid #666666;
            padding: 10px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 0.9rem;
        }
    `;
    
    document.head.appendChild(animationStyles);
}

function initializeScrollEffects() {
    // Scroll suave para âncoras
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Funções de feedback
function showBrutalError(message) {
    const toast = document.createElement('div');
    toast.className = 'brutal-error-toast';
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas fa-exclamation-triangle"></i>
            <span>${message}</span>
        </div>
    `;
    
    toast.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #ff0000, #cc0000);
        color: #ffffff;
        padding: 20px 30px;
        border-radius: 15px;
        font-weight: 700;
        font-size: 1.1rem;
        z-index: 10002;
        box-shadow: 0 20px 40px rgba(255, 0, 0, 0.6);
        animation: brutal-shake 0.5s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'fadeOutAlert 0.5s ease';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

function showFinalUrgency() {
    if (document.querySelector('.final-urgency-message')) return;
    
    const urgentDiv = document.createElement('div');
    urgentDiv.className = 'final-urgency-message';
    urgentDiv.innerHTML = `
        <div class="urgent-content">
            <i class="fas fa-skull-crossbones"></i>
            <span><strong>TEMPO ESGOTADO!</strong> Últimas vagas - Sua segurança está em RISCO!</span>
        </div>
    `;
    
    urgentDiv.style.cssText = `
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        background: linear-gradient(135deg, #ff0000, #ff4500);
        color: #ffffff;
        padding: 20px;
        text-align: center;
        font-weight: 700;
        font-size: 1.2rem;
        z-index: 9999;
        animation: critical-flash 0.5s infinite;
    `;
    
    document.body.appendChild(urgentDiv);
}

// Tracking de eventos
function trackSecurityLead(leadData) {
    // Google Analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'security_lead_capture', {
            'property_type': leadData.property,
            'concern': leadData.concern,
            'spots_remaining': spotsRemaining,
            'page_location': window.location.href
        });
    }
    
    // Facebook Pixel
    if (typeof fbq !== 'undefined') {
        fbq('track', 'Lead', {
            content_name: 'CFTV AI Security System',
            content_category: 'Security Systems',
            value: 2300,
            currency: 'BRL'
        });
    }
    
    console.log('Lead de segurança capturado:', leadData);
}

// Cleanup
window.addEventListener('beforeunload', function() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
});