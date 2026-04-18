// Validação simples do formulário de contato
document.querySelector('form').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
    // Aqui poderia enviar para um servidor, mas como é estático, apenas alert
});