// Variáveis globais para controle
let countdownInterval;
let spotsRemaining = 976;
let formSubmitted = false;

// Inicialização quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    initializeCountdown();
    initializeSpotsCounter();
    initializeForm();
    initializeAnimations();
    initializeScrollEffects();
    startCountdownTimer();
});

// Sistema de Countdown Agressivo
function initializeCountdown() {
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + 23);
    endTime.setMinutes(endTime.getMinutes() + 45);
    endTime.setSeconds(endTime.getSeconds() + 30);
    
    localStorage.setItem('aggressive-countdown-end', endTime.getTime());
    updateCountdownDisplay();
}

function startCountdownTimer() {
    countdownInterval = setInterval(() => {
        updateCountdownDisplay();
        decreaseSpots();
    }, 1000);
}

function updateCountdownDisplay() {
    const endTime = parseInt(localStorage.getItem('aggressive-countdown-end'));
    const now = new Date().getTime();
    const timeLeft = endTime - now;
    
    if (timeLeft <= 0) {
        // Tempo acabou - mostrar urgência máxima
        document.querySelectorAll('.countdown-number').forEach(el => {
            el.textContent = '00';
            el.style.color = '#ff0000';
            el.style.animation = 'urgent-flash 0.5s infinite';
        });
        showUrgentMessage();
        return;
    }
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    // Atualizar todos os contadores
    updateCounterElement('hours-banner', hours);
    updateCounterElement('minutes-banner', minutes);
    updateCounterElement('hours-main', hours);
    updateCounterElement('minutes-main', minutes);
    updateCounterElement('seconds-main', seconds);
    
    // Urgência crescente quando o tempo está acabando
    if (hours === 0 && minutes < 10) {
        addUrgencyEffects();
    }
}

function updateCounterElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value.toString().padStart(2, '0');
        
        // Efeito visual quando o número muda
        element.style.transform = 'scale(1.2)';
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 200);
    }
}

function addUrgencyEffects() {
    // Adicionar efeitos visuais de urgência
    document.querySelectorAll('.countdown-main .countdown-item').forEach(item => {
        item.style.animation = 'urgent-shake 0.5s infinite';
        item.style.borderColor = '#ff0000';
    });
    
    // Piscar o banner de alerta
    const emergencyAlert = document.querySelector('.emergency-alert');
    if (emergencyAlert) {
        emergencyAlert.style.animation = 'urgent-flash 0.3s infinite';
    }
}

// Sistema de Diminuição de Vagas
function initializeSpotsCounter() {
    const lastUpdate = localStorage.getItem('spots-last-update');
    const storedSpots = localStorage.getItem('spots-remaining');
    const now = Date.now();
    
    if (lastUpdate && storedSpots && (now - parseInt(lastUpdate)) < 300000) { // 5 minutos
        spotsRemaining = parseInt(storedSpots);
    }
    
    updateSpotsDisplay();
}

function decreaseSpots() {
    // Diminuir vagas aleatoriamente (simula outras pessoas se cadastrando)
    if (Math.random() < 0.1 && spotsRemaining > 50) { // 10% de chance a cada segundo
        spotsRemaining -= Math.floor(Math.random() * 3) + 1; // Diminui 1-3 vagas
        updateSpotsDisplay();
        
        // Salvar no localStorage
        localStorage.setItem('spots-remaining', spotsRemaining);
        localStorage.setItem('spots-last-update', Date.now());
        
        // Mostrar notificação de vaga perdida
        if (Math.random() < 0.3) { // 30% chance de mostrar notificação
            showSpotTakenNotification();
        }
    }
    
    // Urgência máxima quando restam poucas vagas
    if (spotsRemaining <= 100) {
        addSpotsUrgency();
    }
}

function updateSpotsDisplay() {
    const spotElements = [
        'remaining-spots',
        'main-counter', 
        'form-counter',
        'final-counter'
    ];
    
    spotElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = spotsRemaining;
            
            // Efeito visual de mudança
            element.style.color = '#ffeb00';
            element.style.animation = 'number-flash 0.3s';
            
            setTimeout(() => {
                element.style.color = '';
                element.style.animation = '';
            }, 300);
        }
    });
}

function addSpotsUrgency() {
    // Adicionar efeitos quando restam poucas vagas
    document.querySelectorAll('.remaining-counter, .spots-remaining').forEach(el => {
        el.style.animation = 'urgent-pulse 0.5s infinite';
        el.style.borderColor = '#ff0000';
    });
}

function showSpotTakenNotification() {
    const notification = document.createElement('div');
    notification.className = 'spot-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-exclamation-triangle"></i>
            <span><strong>ATENÇÃO!</strong> Alguém acabou de garantir uma vaga! Restam ${spotsRemaining}</span>
        </div>
    `;
    
    // Estilos da notificação
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(135deg, #ff0000, #ff6b00);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(255, 0, 0, 0.5);
        z-index: 10001;
        animation: slideInRight 0.5s ease, fadeOut 0.5s ease 4s forwards;
        max-width: 300px;
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
    const form = document.getElementById('captureForm');
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
    
    // Validação em tempo real com feedback agressivo
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateFieldAggressive(this);
        });
        
        input.addEventListener('focus', function() {
            this.style.borderColor = '#ff0000';
            this.style.boxShadow = '0 0 20px rgba(255, 0, 0, 0.3)';
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
    
    // Detectar tentativa de sair da página
    window.addEventListener('beforeunload', function(e) {
        if (!formSubmitted) {
            e.preventDefault();
            e.returnValue = 'ESPERE! Você vai perder sua vaga de instalação GRATUITA + WiFi 7!';
            return e.returnValue;
        }
    });
    
    // Detectar movimento do mouse para sair
    document.addEventListener('mouseleave', function(e) {
        if (e.clientY <= 0 && !formSubmitted) {
            showExitIntentModal();
        }
    });
}

function validateFieldAggressive(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // Remove erro anterior
    removeFieldError(field);
    
    // Validações específicas
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'OBRIGATÓRIO! Não deixe vazio!';
    } else if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'EMAIL INVÁLIDO! Corrija agora!';
        }
    } else if (field.type === 'tel' && value) {
        const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
        if (!phoneRegex.test(value)) {
            isValid = false;
            errorMessage = 'TELEFONE INVÁLIDO! Formato: (11) 99999-9999';
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
    field.style.boxShadow = '0 0 20px rgba(255, 0, 0, 0.5)';
    field.style.animation = 'field-shake 0.5s';
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        color: #ff0000;
        font-size: 0.85rem;
        font-weight: bold;
        margin-top: 5px;
        animation: error-flash 0.5s;
    `;
    
    field.parentNode.appendChild(errorDiv);
}

function showFieldSuccess(field) {
    field.style.borderColor = '#00ff00';
    field.style.boxShadow = '0 0 20px rgba(0, 255, 0, 0.3)';
    
    // Adicionar ícone de sucesso
    const successIcon = document.createElement('i');
    successIcon.className = 'fas fa-check field-success-icon';
    successIcon.style.cssText = `
        position: absolute;
        right: 15px;
        top: 50%;
        transform: translateY(-50%);
        color: #00ff00;
        font-size: 1.2rem;
    `;
    
    field.parentNode.style.position = 'relative';
    field.parentNode.appendChild(successIcon);
}

function removeFieldError(field) {
    const existingError = field.parentNode.querySelector('.field-error');
    const existingSuccess = field.parentNode.querySelector('.field-success-icon');
    
    if (existingError) existingError.remove();
    if (existingSuccess) existingSuccess.remove();
    
    field.style.borderColor = '';
    field.style.boxShadow = '';
    field.style.animation = '';
}

function validateFormComplete() {
    const form = document.getElementById('captureForm');
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
        showAggressiveError('ACEITE OS TERMOS PARA CONTINUAR!');
        isValid = false;
    }
    
    return isValid;
}

function submitFormAggressive() {
    const submitBtn = document.querySelector('.btn-capture');
    const originalContent = submitBtn.innerHTML;
    
    // Estado de loading agressivo
    submitBtn.innerHTML = `
        <i class="fas fa-spinner fa-spin"></i>
        <div class="btn-content">
            <span class="btn-main">PROCESSANDO SUA VAGA...</span>
            <span class="btn-sub">Aguarde, não saia da página!</span>
        </div>
    `;
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.7';
    
    // Simular processamento
    setTimeout(() => {
        // Coletar dados
        const formData = new FormData(document.getElementById('captureForm'));
        const leadData = Object.fromEntries(formData);
        
        // Diminuir uma vaga
        spotsRemaining--;
        updateSpotsDisplay();
        
        console.log('Lead Capturado:', leadData);
        
        // Sucesso agressivo
        showSuccessModal();
        formSubmitted = true;
        
        // Tracking de evento
        trackLeadCapture(leadData);
        
    }, 3000);
}

function showSuccessModal() {
    const modal = document.createElement('div');
    modal.className = 'success-modal';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <div class="success-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h2>🎉 PARABÉNS! VAGA GARANTIDA! 🎉</h2>
            <p>Sua vaga de instalação GRATUITA + WiFi 7 foi <strong>RESERVADA!</strong></p>
            <div class="success-details">
                <div class="detail-item">
                    <i class="fas fa-phone"></i>
                    <span>Nossa equipe ligará em <strong>5 MINUTOS</strong></span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-tools"></i>
                    <span>Instalação em <strong>24 HORAS</strong></span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-gift"></i>
                    <span>Você economizou <strong>R$ 1.198</strong></span>
                </div>
            </div>
            <div class="success-warning">
                <i class="fas fa-exclamation-triangle"></i>
                <p><strong>IMPORTANTE:</strong> Mantenha seu telefone por perto!</p>
            </div>
            <button class="btn-close-modal" onclick="closeSuccessModal()">
                ENTENDI! AGUARDO A LIGAÇÃO
            </button>
        </div>
    `;
    
    // Estilos do modal
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
    const modal = document.querySelector('.success-modal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
}

function showExitIntentModal() {
    if (document.querySelector('.exit-intent-modal')) return;
    
    const modal = document.createElement('div');
    modal.className = 'exit-intent-modal';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content exit-intent">
            <div class="exit-header">
                <h2>🚨 ESPERE! NÃO SAIA AGORA! 🚨</h2>
                <p>Você está prestes a perder sua vaga de <strong>INSTALAÇÃO GRATUITA</strong>!</p>
            </div>
            <div class="exit-offer">
                <h3>OFERTA ESPECIAL PARA VOCÊ:</h3>
                <div class="special-deal">
                    <span class="deal-text">DESCONTO EXTRA DE R$ 50</span>
                    <span class="deal-sub">nos 3 primeiros meses</span>
                </div>
            </div>
            <div class="exit-buttons">
                <button class="btn-stay" onclick="stayOnPage()">
                    <i class="fas fa-heart"></i>
                    SIM! QUERO MINHA VAGA + DESCONTO
                </button>
                <button class="btn-leave" onclick="leavePage()">
                    Não, quero perder essa oportunidade
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

function stayOnPage() {
    const modal = document.querySelector('.exit-intent-modal');
    if (modal) modal.remove();
    
    // Scroll para o formulário
    document.getElementById('capture').scrollIntoView({ 
        behavior: 'smooth' 
    });
    
    // Adicionar desconto visual
    showDiscountBanner();
}

function leavePage() {
    const modal = document.querySelector('.exit-intent-modal');
    if (modal) modal.remove();
}

function showDiscountBanner() {
    const banner = document.createElement('div');
    banner.className = 'discount-banner';
    banner.innerHTML = `
        <div class="discount-content">
            <i class="fas fa-gift"></i>
            <span><strong>DESCONTO ATIVADO!</strong> R$ 50 OFF nos 3 primeiros meses</span>
        </div>
    `;
    
    banner.style.cssText = `
        position: fixed;
        top: 60px;
        left: 0;
        width: 100%;
        background: linear-gradient(135deg, #00ff00, #00cc00);
        color: black;
        padding: 15px;
        text-align: center;
        font-weight: bold;
        z-index: 9998;
        animation: slideDown 0.5s ease;
    `;
    
    document.body.appendChild(banner);
    
    setTimeout(() => {
        banner.style.animation = 'slideUp 0.5s ease';
        setTimeout(() => banner.remove(), 500);
    }, 5000);
}

// Animações e efeitos visuais
function initializeAnimations() {
    // Adicionar CSS para animações
    const animationStyles = document.createElement('style');
    animationStyles.textContent = `
        @keyframes urgent-flash {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        
        @keyframes urgent-shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
        
        @keyframes urgent-pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        
        @keyframes number-flash {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.2); }
        }
        
        @keyframes field-shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
        }
        
        @keyframes error-flash {
            0%, 100% { opacity: 0; }
            50% { opacity: 1; }
        }
        
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
        
        @keyframes slideDown {
            from { transform: translateY(-100%); }
            to { transform: translateY(0); }
        }
        
        @keyframes slideUp {
            from { transform: translateY(0); }
            to { transform: translateY(-100%); }
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
            color: white;
            position: relative;
            z-index: 1;
            box-shadow: 0 0 50px rgba(255, 0, 0, 0.5);
        }
        
        .success-icon i {
            font-size: 5rem;
            color: #00ff00;
            margin-bottom: 20px;
            animation: success-bounce 1s ease;
        }
        
        @keyframes success-bounce {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.2); }
        }
        
        .success-details {
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
            color: #ffeb00;
            font-size: 1.3rem;
            min-width: 25px;
        }
        
        .success-warning {
            background: rgba(255, 107, 0, 0.2);
            border: 2px solid #ff6b00;
            border-radius: 10px;
            padding: 15px;
            margin: 20px 0;
        }
        
        .btn-close-modal {
            background: linear-gradient(135deg, #ff0000, #ff6b00);
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 10px;
            font-weight: bold;
            font-size: 1.1rem;
            cursor: pointer;
            transition: transform 0.3s;
        }
        
        .btn-close-modal:hover {
            transform: scale(1.05);
        }
        
        .exit-intent .exit-header h2 {
            color: #ff0000;
            font-size: 2rem;
            margin-bottom: 15px;
        }
        
        .exit-offer {
            margin: 30px 0;
        }
        
        .special-deal {
            background: linear-gradient(135deg, #00ff00, #00cc00);
            color: black;
            padding: 20px;
            border-radius: 15px;
            margin: 15px 0;
        }
        
        .deal-text {
            font-size: 1.5rem;
            font-weight: black;
            display: block;
        }
        
        .deal-sub {
            font-size: 1rem;
        }
        
        .exit-buttons {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        
        .btn-stay {
            background: linear-gradient(135deg, #ff0000, #ff6b00);
            color: white;
            border: none;
            padding: 20px;
            border-radius: 10px;
            font-weight: bold;
            font-size: 1.2rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        }
        
        .btn-leave {
            background: transparent;
            color: #666;
            border: 1px solid #666;
            padding: 10px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 0.9rem;
        }
    `;
    
    document.head.appendChild(animationStyles);
}

function initializeScrollEffects() {
    // Efeitos de scroll suave
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
function showAggressiveError(message) {
    const toast = document.createElement('div');
    toast.className = 'aggressive-toast error';
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
        color: white;
        padding: 20px 30px;
        border-radius: 15px;
        font-weight: bold;
        font-size: 1.1rem;
        z-index: 10002;
        box-shadow: 0 20px 40px rgba(255, 0, 0, 0.5);
        animation: aggressive-shake 0.5s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.5s ease';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

function showUrgentMessage() {
    if (document.querySelector('.urgent-message')) return;
    
    const urgentDiv = document.createElement('div');
    urgentDiv.className = 'urgent-message';
    urgentDiv.innerHTML = `
        <div class="urgent-content">
            <i class="fas fa-fire"></i>
            <span><strong>TEMPO ESGOTADO!</strong> Últimas vagas disponíveis - Aja AGORA!</span>
        </div>
    `;
    
    urgentDiv.style.cssText = `
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        background: linear-gradient(135deg, #ff0000, #ff6b00);
        color: white;
        padding: 20px;
        text-align: center;
        font-weight: bold;
        font-size: 1.2rem;
        z-index: 9999;
        animation: urgent-pulse 0.5s infinite;
    `;
    
    document.body.appendChild(urgentDiv);
}

// Tracking de eventos
function trackLeadCapture(leadData) {
    // Google Analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'lead_capture', {
            'plan_selected': leadData.plan,
            'spots_remaining': spotsRemaining,
            'page_location': window.location.href
        });
    }
    
    // Facebook Pixel
    if (typeof fbq !== 'undefined') {
        fbq('track', 'Lead', {
            content_name: 'XGSPON Landing Page',
            content_category: 'Internet Provider',
            value: 89,
            currency: 'BRL'
        });
    }
    
    // Console para debug
    console.log('Lead capturado com sucesso:', leadData);
}

// Cleanup ao sair da página
window.addEventListener('beforeunload', function() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
});