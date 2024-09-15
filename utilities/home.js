document.addEventListener("DOMContentLoaded", function () {
    // Inicializar EmailJS
    emailjs.init('XTFEjpctSxusEo9IC');

    document.getElementById("contactEmail").addEventListener("click", modalContact);
    async function modalContact(event) {
        event.preventDefault();
        const contactEmailLink = document.getElementById('contactEmail');
        const modal = document.getElementById('modal-contact');
        document.getElementById('contactFullName').value = '';
        document.getElementById('contactEmailInput').value = '';
        document.getElementById('contactSubject').value = '';
        document.getElementById('contactMessage').value = '';
        modal.style.display = 'flex';
        document.body.classList.add('overflow-hidden');
        // Abrir el modal al hacer clic en el enlace
        contactEmailLink.addEventListener('click', function (event) {
            event.preventDefault(); 
            modal.classList.remove('hidden'); // Mostrar el modal
            modal.setAttribute('aria-hidden', 'false');
            // Enfoque inicial en el modal para accesibilidad
            modal.focus();
        });
        const sendEmailBtn = document.getElementById('sendEmailBtn');

        sendEmailBtn.addEventListener('click', function () {
            const fullName = document.getElementById('contactFullName').value;
            const email = document.getElementById('contactEmailInput').value;
            const subject = document.getElementById('contactSubject').value;
            const message = document.getElementById('contactMessage').value;
            // Validar que todos los campos estén llenos
            if (fullName === '' || email === '' || subject === '' || message === '') {
                alert('Please fill in all fields for the contact form.');
                return; // Prevenir el envío del formulario
            }
            // Envío del correo
            emailjs.send('service_fok2l68', 'template_cb4fgdn', {
                from_name: email,
                message: 'Name: ' + fullName + '\n\n' + 'Subject: ' + subject + '\n\n' + 'Message:' + '\n\n' + message
            })
                .then(response => {
                    console.log('Email enviado correctamente', response.status, response.text);
                    modal.style.display = 'none';
                })
                .catch(error => {
                    console.error('Error al enviar el correo', error);
                });
        });
        // Cerrar el modal al hacer clic en el botón de cerrar
        const closeBtnContact = document.getElementById('closeBtnContact');
        closeBtnContact.addEventListener('click', () => {
            modal.style.display = 'none';
            document.body.classList.remove('overflow-hidden');
        });
    };
});

