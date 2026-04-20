// Validação simples do formulário de contato
const contatoForm = document.querySelector('form');

if (contatoForm) {
    contatoForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const nome = document.getElementById('nome').value.trim();
        const email = document.getElementById('email').value.trim();
        const assunto = document.getElementById('assunto').value.trim();
        const mensagem = document.getElementById('mensagem').value.trim();

        if (!nome || !email || !assunto || !mensagem) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nome, email, assunto, mensagem })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao enviar mensagem');
            }

            contatoForm.reset();
            alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
        } catch (error) {
            console.error(error);
            alert('Erro ao enviar a mensagem. Tente novamente mais tarde.');
        }
    });
}