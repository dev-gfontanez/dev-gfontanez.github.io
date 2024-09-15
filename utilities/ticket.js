document.addEventListener("DOMContentLoaded", function () {
    // Función para establecer una cookie con una fecha de expiración
    function setCookie(name, value, expirationDays) {
        const date = new Date();
        date.setTime(date.getTime() + (expirationDays * 24 * 60 * 60 * 1000));
        const expires = `expires=${date.toUTCString()}`;
        document.cookie = `${name}=${value};${expires};path=/`;
    }

    // Función para obtener una cookie
    function getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    // Comprobar si la cookie de sesión existe
    let sessionID = getCookie("sessionID");
    let expirationDays = 180; // 6 meses en días
    let sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    if (!sessionID || new Date(sessionID) < sixMonthsAgo) {
        // No hay cookie de sesión o ya pasaron 6 meses, crear una nueva
        sessionID = Math.random().toString(36).substring(2);  // Generar un ID de sesión aleatorio
        setCookie("sessionID", sessionID, expirationDays);  // Establecer la cookie de sesión con una fecha de expiración
        fetchSelectedVehicleLocation(sessionID);
    } else {
        // La cookie de sesión existe y aún no pasaron 6 meses, continuar usándola
        console.log("ID existente:", sessionID);
    }


    // DB SupaBase API
    const database = supabase.createClient('https://svdtdtpqscizmxlcicox.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2ZHRkdHBxc2Npem14bGNpY294Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTY2NTU2ODEsImV4cCI6MjAzMjIzMTY4MX0.9Hkev2jhj11Q6r6DXrf2gpixaVTDj2vODRYwpxB5Y50');
    // Inicializar EmailJS
    emailjs.init('XTFEjpctSxusEo9IC');

    // Cargar y mostrar los registros al cargar la página
    loadTableRecords();

    async function loadTableRecords() {
        const { data: records, error } = await database
            .from('ticket')
            .select('*')
            .eq('tempuser', sessionID)
            .order('created_at', { ascending: false })
            .limit(5);

        if (error) {
            console.error('Error fetching data from Supabase:', error);
        } else {
            // Iterar sobre los registros en la tabla
            if (records.length > 0) {
                // Insertar los registros en la tabla
                records.forEach(loadRecord => {
                    addDataRow(loadRecord.fullName, loadRecord.status, loadRecord.subject, loadRecord.description, loadRecord.id);
                });
            } else {
                addNODataRow();
            }
        }
    }

    // Función para agregar la fila de "No data available"
    function addNODataRow() {
        const tableBody = document.getElementById('tbobyTicketTable');
        const newRow = document.createElement('tr');
        newRow.id = 'noDataRow';
        const newCell = document.createElement('td');
        newCell.classList.add('px-6', 'py-5', 'text-left', 'text-xs', 'font-medium', 'text-gray-900', 'dark:text-white');
        newCell.textContent = 'No data available';
        newCell.setAttribute('colspan', '4'); // Para que la celda ocupe todas las columnas de la tabla
        newRow.appendChild(newCell);
        tableBody.appendChild(newRow);
    }

    // Función para insertar datos a la tabla
    function addDataRow(fullName, status, subject, description, id) {
        const tableBody = document.getElementById('tbobyTicketTable');
        // Eliminar la fila de "No data available" si existe
        const noDataRow = document.getElementById('noDataRow');
        if (noDataRow) {
            noDataRow.remove();
        }

        // Create new row with record data
        const newRow = document.createElement('tr');
        newRow.classList.add('odd:bg-white', 'odd:dark:bg-gray-900', 'even:bg-gray-100', 'even:dark:bg-gray-800');

        // Create cells for each column
        const fullNameCell = document.createElement('td');
        fullNameCell.textContent = fullName;
        fullNameCell.classList.add('fullnameSelect', 'truncate', 'px-6', 'py-3', 'text-left', 'text-xs', 'font-medium', 'text-gray-900', 'dark:text-white');
        fullNameCell.style.maxWidth = '150px';
        fullNameCell.style.overflow = 'hidden';
        fullNameCell.style.textOverflow = 'ellipsis';

        const subjectCell = document.createElement('td');
        const subjectLink = document.createElement('a');
        subjectLink.textContent = subject;
        subjectLink.classList.add('subjectSelect', 'hover:underline', 'truncate', 'px-6', 'py-3', 'text-left', 'text-xs', 'font-medium', 'text-emerald-500', 'dark:text-emerald-400');
        subjectCell.appendChild(subjectLink);
        subjectCell.style.maxWidth = '150px';
        subjectCell.style.overflow = 'hidden';
        subjectCell.style.textOverflow = 'ellipsis';

        const statusCell = document.createElement('td');
        statusCell.textContent = status;
        statusCell.classList.add('statusSelect', 'px-6', 'py-3', 'text-left', 'text-xs', 'font-medium', 'text-gray-900', 'dark:text-white');
        statusCell.style.maxWidth = '80px';
        statusCell.style.overflow = 'hidden';
        statusCell.style.textOverflow = 'ellipsis';

        const descriptionCell = document.createElement('td');
        descriptionCell.textContent = description;
        descriptionCell.classList.add('descriptionSelect', 'truncate', 'px-6', 'py-3', 'text-left', 'text-xs', 'font-medium', 'text-gray-900', 'dark:text-white');
        descriptionCell.style.maxWidth = '100px';
        descriptionCell.style.overflow = 'hidden';
        descriptionCell.style.textOverflow = 'ellipsis';

        const idCell = document.createElement('td');
        idCell.value = id;
        idCell.classList.add('idSelect', 'hidden', 'truncate', 'px-6', 'py-3', 'text-left', 'text-xs', 'font-medium', 'text-gray-900', 'dark:text-white');
        idCell.style.maxWidth = '100px';
        idCell.style.overflow = 'hidden';
        idCell.style.textOverflow = 'ellipsis';

        newRow.appendChild(fullNameCell);
        newRow.appendChild(subjectCell);
        newRow.appendChild(statusCell);
        newRow.appendChild(descriptionCell);
        newRow.appendChild(idCell);


        tableBody.appendChild(newRow);
        addRowClickListeners()
    }

    // Función para agregar eventos de click a las filas de la tabla
    function addRowClickListeners() {
        document.querySelectorAll('#tbobyTicketTable tr').forEach(row => {
            // Remover cualquier evento de click existente
            row.removeEventListener('click', rowTicketSelected);

            // Agregar el nuevo evento de click
            row.addEventListener('click', rowTicketSelected);
        });
        // Agregar eventos de sort click a los encabezados para ordenar las columnas
        document.querySelectorAll('th a').forEach(header => {
            header.addEventListener('click', function (e) {
                e.preventDefault();
                const table = header.closest('table');
                const index = Array.from(header.closest('tr').children).indexOf(header.closest('th'));
                const order = header.dataset.order = -(header.dataset.order || -1);
                const rows = Array.from(table.querySelector('tbody').rows);

                rows.sort((rowA, rowB) => {
                    const cellA = rowA.cells[index].innerText;
                    const cellB = rowB.cells[index].innerText;
                    return (cellA > cellB ? 1 : cellA < cellB ? -1 : 0) * order;
                });

                table.querySelector('tbody').innerHTML = '';
                rows.forEach(row => {
                    table.querySelector('tbody').appendChild(row);
                });
            });
        });
    }

    // Función manejadora del evento de clic en las filas
    function rowTicketSelected(event) {
        selectedRow = event.currentTarget; // Guardar la fila seleccionada
        // Obtener la data de la fila seleccionada
        const fullnameSelect = selectedRow.querySelector('.fullnameSelect').innerText;
        const statusSelect = selectedRow.querySelector('.statusSelect').innerText;
        const subjectSelect = selectedRow.querySelector('.subjectSelect').innerText;
        const descriptionSelect = selectedRow.querySelector('.descriptionSelect').innerText;
        const idSelect = selectedRow.querySelector('.idSelect').value;
        // Mostrar el modal con id "static-modal"
        const modal = document.getElementById('static-modal');
        modal.style.display = 'flex';
        document.body.classList.add('overflow-hidden');
        document.getElementById('modalTitle').innerText = 'Ticket-' + idSelect;
        const commentSection = document.getElementById('commentSection');
        commentSection.classList.remove('hidden');
        const saveNewTicket = document.getElementById('saveNewTicket');
        saveNewTicket.classList.add('hidden');
        const ticketSelectedPdfBtn = document.getElementById('ticketSelectedPdfBtn');
        ticketSelectedPdfBtn.classList.remove('hidden');
        ticketSelectedPdfBtn.classList.add('inline-flex');
        const updateNewTicket = document.getElementById('updateNewTicket');
        updateNewTicket.classList.remove('hidden');
        const addCloseOption = document.getElementById('closeOption');
        addCloseOption.classList.remove('hidden');
        // Agregar los valores en los campos
        document.getElementById('fullName').value = fullnameSelect;
        document.getElementById('status').value = statusSelect;
        document.getElementById('subject').value = subjectSelect;
        document.getElementById('description').value = descriptionSelect;
        // Cargar los comentarios
        loadComments(idSelect);
        // Cerrar el modal al hacer clic en cualquier lugar de la pantalla
        const closeBtn = document.getElementById('closeBtn');
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            document.body.classList.remove('overflow-hidden');
        });
    }

    async function loadComments(ticketId) {
        const { data: ticketWithComments, error } = await database
            .from('ticket')
            .select('comments')
            .eq('id', ticketId);

        if (error) {
            console.error('Error fetching ticket with comments:', error);
        } else {
            // Mostrar los comentarios en el modal
            const commentSection = document.getElementById('readcomments');
            commentSection.innerHTML = ''; // Limpiar comentarios anteriores
            commentSection.classList.add('w-full', 'p-1', 'rounded', 'bg-gray-200', 'dark:bg-gray-700', 'pointer-events-none');

            if (ticketWithComments.length > 0 && ticketWithComments[0].comments !== null && ticketWithComments[0].comments !== " ") {
                const comments = ticketWithComments[0].comments;
                if (comments.length > 0) {
                    const commentList = document.createElement('ul');
                    comments.forEach(comment => {
                        const commentItem = document.createElement('li');
                        commentItem.textContent = comment;
                        commentItem.classList.add('bg-slate-300', 'dark:bg-slate-600', 'rounded', 'm-2', 'truncate', 'px-6', 'py-3', 'text-left', 'text-xs', 'font-medium', 'text-gray-900', 'dark:text-white');
                        commentList.appendChild(commentItem);
                    });
                    commentSection.appendChild(commentList);
                } else {
                    const noCommentsMsg = document.createElement('div');
                    noCommentsMsg.textContent = 'No Comments';
                    noCommentsMsg.classList.add('bg-slate-300', 'dark:bg-slate-600', 'rounded', 'm-2', 'truncate', 'px-6', 'py-3', 'text-left', 'text-xs', 'font-medium', 'text-gray-900', 'dark:text-white');
                    commentSection.appendChild(noCommentsMsg);
                }
            } else {
                const noCommentsMsg = document.createElement('div');
                noCommentsMsg.textContent = 'No Comments';
                noCommentsMsg.classList.add('bg-slate-300', 'dark:bg-slate-600', 'rounded', 'm-2', 'truncate', 'px-6', 'py-3', 'text-left', 'text-xs', 'font-medium', 'text-gray-900', 'dark:text-white');
                commentSection.appendChild(noCommentsMsg);
            }
        }
    }


    // Funcion para agregar un nuevo comentario
    document.getElementById("addComment").addEventListener("click", onAddComment);
    async function onAddComment(event) {
        event.preventDefault();
        const comment = document.getElementById("comments").value;
        const id = selectedRow.querySelector('.idSelect').value;
        // Primero, obtenemos el array de comentarios actual
        const { data: currentCommentsData, error } = await database
            .from('ticket')
            .select('comments')
            .eq('id', id);
        if (error) {
            console.error('Error fetching current comments:', error);
        } else {
            const currentComments = currentCommentsData[0]?.comments || [];
            const updatedComments = [...currentComments, comment];
            const { data: updatedData, error } = await database
                .from('ticket')
                .update({ comments: updatedComments })
                .eq('id', id);
            if (error) {
                console.error('Error updating comments in Supabase:', error);
            } else {
                document.getElementById("comments").value = "";
            }
        }
    };


    // Funcion para abrir y cerrar el modal en New Ticket
    document.getElementById('openNewTicket').addEventListener('click', onOpenNewTicket);
    async function onOpenNewTicket(event) {
        event.preventDefault();
        const modal = document.getElementById('static-modal');
        modal.style.display = 'flex';
        document.body.classList.add('overflow-hidden');
        document.getElementById('modalTitle').innerText = 'New Ticket';
        const commentSection = document.getElementById('commentSection');
        commentSection.classList.add('hidden');
        const ticketSelectedPdfBtn = document.getElementById('ticketSelectedPdfBtn');
        ticketSelectedPdfBtn.classList.add('hidden');
        ticketSelectedPdfBtn.classList.remove('inline-flex');
        const saveNewTicket = document.getElementById('saveNewTicket');
        saveNewTicket.classList.remove('hidden');
        const updateNewTicket = document.getElementById('updateNewTicket');
        updateNewTicket.classList.add('hidden');
        const removeCloseOption = document.getElementById('closeOption');
        removeCloseOption.classList.add('hidden');

        // Resetear el formulario
        document.getElementById('ticketForm').reset();
        // Cerrar el modal al hacer clic en cualquier lugar de la pantalla
        const closeBtn = document.getElementById('closeBtn');
        closeBtn.addEventListener('click', async () => {
            modal.style.display = 'none';
            document.body.classList.remove('overflow-hidden');
        });
    }

    document.getElementById('saveNewTicket').addEventListener('click', onSaveNewTicket);
    async function onSaveNewTicket(event) {
        event.preventDefault();
        const fullName = document.getElementById('fullName').value;
        const status = document.getElementById('status').value;
        const subject = document.getElementById('subject').value;
        const description = document.getElementById('description').value;
        // Verificar si los campos no están vacíos
        if (!fullName || !status || !subject || !description) {
            alert('All fields are required for New Ticket.');
            return;
        }
        try {
            const { data: insertedData, error } = await database
                .from('ticket')
                .insert([
                    {
                        fullName: fullName,
                        status: status,
                        subject: subject,
                        description: description,
                        tempuser: sessionID
                    }
                ])
                .select('*');

            if (error) {
                throw error;
            }

            if (insertedData.length > 0) {
                const insertedRecord = insertedData[0];
                addDataRow(insertedRecord.fullName, insertedRecord.status, insertedRecord.subject, insertedRecord.description, insertedRecord.id);
                // Resetear el formulario
                document.getElementById('ticketForm').reset();
                document.getElementById('static-modal').style.display = 'none';
            } else {
                console.error('Error al insertar el registro.');
            }
        } catch (err) {
            console.error('Error al insertar el registro:', err.message);
        }
    }


    // Funcion para validar y llamar función para actualizar datos en el boton Save Changes
    document.getElementById("updateNewTicket").addEventListener("click", onUpdateTicket);
    async function onUpdateTicket(event) {
        event.preventDefault();
        const fullName = document.getElementById("fullName").value;
        const status = document.getElementById("status").value;
        const subject = document.getElementById("subject").value;
        const description = document.getElementById("description").value;
        const id = selectedRow.querySelector('.idSelect').value;
        // Primero, obtenemos el array de comentarios actual
        const { data: updatedData, error } = await database
            .from('ticket')
            .update({ fullName, status, subject, description })
            .eq('id', id);
        if (error) {
            console.error('Error updating data in Supabase:', error);
        } else {
            // Cerrar el modal
            document.getElementById('static-modal').style.display = 'none';
        }
    };
    document.getElementById("contactEmail").addEventListener("click", modalContact);
    async function modalContact(event) {
        event.preventDefault();
        const contactEmailLink = document.getElementById('contactEmail');
        const modal = document.getElementById('static-modal-contact');
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


    // Función para suscribirse a los cambios en tiempo real de la tabla "ticket"
    async function subscribeToRealtimeUpdates() {
        const { error } = await database
            .channel('public:ticket')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'ticket' }, payload => {
                const subscribeRecord = payload.new;
                const readcomments = document.getElementById('readcomments');
                // Actualizar la tabla HTML basada en los cambios en tiempo real
                const rows = document.querySelectorAll('tr');
                rows.forEach(row => {
                    const idCell = row.querySelector('.idSelect');
                    if (idCell && idCell.value === subscribeRecord.id) {
                        row.querySelector('.fullnameSelect').innerText = subscribeRecord.fullName;
                        row.querySelector('.subjectSelect').innerText = subscribeRecord.subject;
                        row.querySelector('.statusSelect').innerText = subscribeRecord.status;
                        row.querySelector('.descriptionSelect').innerText = subscribeRecord.description;

                        // Crear nuevas filas para los comentarios
                        if (subscribeRecord.comments && Array.isArray(subscribeRecord.comments)) {
                            readcomments.innerHTML = '';
                            const commentList = document.createElement('ul');
                            commentList.classList.add('w-full', 'rounded', 'bg-gray-200', 'dark:bg-gray-700', 'pointer-events-none');
                            subscribeRecord.comments.forEach(comment => {
                                const commentItem = document.createElement('li');
                                commentItem.textContent = comment;
                                commentItem.classList.add('bg-slate-300', 'dark:bg-slate-600', 'rounded', 'm-2', 'truncate', 'px-6', 'py-3', 'text-left', 'text-xs', 'font-medium', 'text-gray-900', 'dark:text-white');
                                commentList.appendChild(commentItem);
                            });
                            readcomments.innerHTML = '';
                            readcomments.appendChild(commentList);
                        }
                    }
                });
            })
            .subscribe();
    }
    // Llamar a la función para suscribirse a las actualizaciones en tiempo real
    subscribeToRealtimeUpdates();


    // Reports
    async function generatePDFTicket(event) {
        event.preventDefault();
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const ticketForm = document.getElementById('ticketForm');

        // Obtener los valores del formulario y otros datos
        const idSelect = String(selectedRow.querySelector('.idSelect').value);
        const fullName = ticketForm.querySelector('#fullName').value;
        const status = ticketForm.querySelector('#status').value;
        const subject = ticketForm.querySelector('#subject').value;
        const description = ticketForm.querySelector('#description').value;
        const commentList = ticketForm.querySelector('#readcomments ul');
        const comments = commentList ? Array.from(commentList.querySelectorAll('li')).map(li => li.textContent) : 'No Comments';

        // Función para agregar texto con envoltura y manejar paginación
        function addWrappedText(doc, text, x, y, maxWidth) {
            const lines = doc.splitTextToSize(text, maxWidth);
            lines.forEach(line => {
                y = checkPageHeight(doc, y); // Verificar si se alcanza el final de la página
                doc.text(line, x, y);
                y += 10;
            });
            return y;
        }

        // Función para verificar y manejar el cambio de página
        function checkPageHeight(doc, y) {
            const pageHeight = doc.internal.pageSize.height;
            if (y + 10 > pageHeight - 20) {
                doc.addPage();
                return 20; // Reiniciar la posición Y para la nueva página
            }
            return y;
        }

        // Agregar los datos del formulario al PDF
        let y = 44; // Posición inicial en Y
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Ticket Data', 14, 22);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('Gilberto Fontanez A Software Developer Report', 14, 28);

        doc.setFont('helvetica', 'bold');
        y = addWrappedText(doc, `Ticket ID:`, 14, y, 150);
        doc.setFont('helvetica', 'normal');
        y = addWrappedText(doc, `${idSelect}`, 50, y - 10, 140);

        doc.setFont('helvetica', 'bold');
        y = addWrappedText(doc, `Full Name:`, 14, y, 150);
        doc.setFont('helvetica', 'normal');
        y = addWrappedText(doc, `${fullName}`, 50, y - 10, 140);

        doc.setFont('helvetica', 'bold');
        y = addWrappedText(doc, `Status:`, 14, y, 150);
        doc.setFont('helvetica', 'normal');
        y = addWrappedText(doc, `${status}`, 50, y - 10, 140);

        doc.setFont('helvetica', 'bold');
        y = addWrappedText(doc, `Subject:`, 14, y, 150);
        doc.setFont('helvetica', 'normal');
        y = addWrappedText(doc, `${subject}`, 50, y - 10, 140);

        doc.setFont('helvetica', 'bold');
        y = addWrappedText(doc, `Description:`, 14, y, 150);
        doc.setFont('helvetica', 'normal');
        y = addWrappedText(doc, `${description}`, 50, y - 10, 140);

        doc.setFont('helvetica', 'bold');
        y = addWrappedText(doc, `Comments:`, 14, y, 150);
        doc.setFont('helvetica', 'normal');


        // Manejar los comentarios
        if (Array.isArray(comments)) {
            comments.forEach(comment => {
                y = checkPageHeight(doc, y); // Verificar si se alcanza el final de la página
                const bulletX = 14; // Posición X del marcador de viñeta
                const bulletY = y; // Ajuste para centrar el marcador verticalmente
                doc.circle(bulletX - 2, bulletY - 1, 1, 'F'); // Dibujar círculo como marcador de viñeta
                y = addWrappedText(doc, comment, bulletX + 4, y, 180);
            });
        } else {
            y = addWrappedText(doc, comments, 14, y, 150); // Si no hay comentarios, mostrar 'No Comments'
        }

        // Obtener el número total de páginas
        const totalPages = doc.internal.getNumberOfPages();

        // Iterar sobre cada página para agregar el número de página
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Page ${i} of ${totalPages}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10, { align: 'right' });
        }

        // Abrir el documento PDF en una nueva pestaña o ventana del navegador
        const timestamp = new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
        const filename = `(${idSelect})_ticket_${timestamp}.pdf`;
        doc.save(filename);
    }

    // Agregar evento al botón de descarga de PDF
    const ticketSelectedPdfBtn = document.getElementById('ticketSelectedPdfBtn');
    ticketSelectedPdfBtn.addEventListener('click', generatePDFTicket);


    // Reports Table
    async function generatePDFTable(event) {
        event.preventDefault();
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const tableBody = document.getElementById('tbobyTicketTable');

        // Función para dibujar encabezados
        const drawTableHeaders = (y) => {
            doc.setDrawColor(0); // Color del borde (negro)
            doc.setFillColor(200); // Color de fondo (gris claro)
            doc.setLineWidth(0.1); // Ancho del borde

            doc.rect(14, y, 40, 8, 'FD'); // Rectángulo para 'Full Name'
            doc.rect(54, y, 40, 8, 'FD'); // Rectángulo para 'Subject'
            doc.rect(94, y, 30, 8, 'FD'); // Rectángulo para 'status'
            doc.rect(124, y, 70, 8, 'FD'); // Rectángulo para 'Description'

            doc.text('Full Name', 16, y + 5); // Texto para 'Full Name'
            doc.text('Subject', 56, y + 5); // Texto para 'Subject'
            doc.text('Status', 96, y + 5); // Texto para 'status'
            doc.text('Description', 126, y + 5); // Texto para 'Description'
        };

        // Función para agregar texto con envoltura y manejar paginación
        function addWrappedText(text, x, y, maxWidth) {
            const lines = doc.splitTextToSize(text, maxWidth);
            lines.forEach(line => {
                y = checkPageHeight(y); // Verificar si se alcanza el final de la página
                doc.text(line, x, y);
                y += 5;
            });
            return y;
        }

        // Función para verificar y manejar el cambio de página
        function checkPageHeight(y) {
            const pageHeight = doc.internal.pageSize.height;
            if (y + 10 > pageHeight - 20) {
                doc.addPage();
                return 30; // Reiniciar la posición Y para el contenido en la nueva página
            }
            return y;
        }

        // Configurar estilos y título inicial
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Ticket Data', 14, 22);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Gilberto Fontanez A Software Developer Report', 14, 28);

        let y = 30; // Posición inicial en Y para el contenido del Table Headers

        // Dibujar encabezados en la primera página
        drawTableHeaders(y);

        y += 20; // Posición inicial en Y para el contenido de la primera fila row

        // Crear tabla en el PDF
        const rows = tableBody.querySelectorAll('tr');
        let currentRow = 0;

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const cols = row.querySelectorAll('td');
            if (cols.length > 0) {
                // Añadir texto con envoltura para cada columna
                let x = 16; // Posición inicial en X para la primera columna

                const text1 = cols[0].textContent;
                y = addWrappedText(text1, x, y - 5, 40);

                const text2 = cols[1].textContent;
                y = addWrappedText(text2, x + 40, y - 5, 40);

                const text3 = cols[2].textContent;
                y = addWrappedText(text3, x + 80, y - 5, 30);

                const text4 = cols[3].textContent;
                y = addWrappedText(text4, x + 110, y - 5, 60);

                currentRow++;
                // Añadir espacio filas de rows 
                if (currentRow < rows.length) {
                    y += 10; // Añadir espacio entre filas
                }
            }
        }

        // Numeración de páginas
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            if (i > 1) { // Dibujar encabezados solo a partir de la segunda página
                drawTableHeaders(10);
            }
            doc.setFontSize(10);
            doc.text(`Page ${i} of ${totalPages}`, doc.internal.pageSize.getWidth() - 50, doc.internal.pageSize.getHeight() - 10);
        }

        // Generar un timestamp
        const timestamp = new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });

        // Guardar y abrir el documento PDF en una nueva pestaña o ventana del navegador
        const filename = `tickets_table_${timestamp}.pdf`;
        doc.save(filename);
    }

    // Agregar evento al botón de descarga de PDF
    const downloadPdfBtnTable = document.getElementById('downloadPdfBtnTable');
    downloadPdfBtnTable.addEventListener('click', generatePDFTable);


    // Reports
    async function generateExcelTable(event) {
        event.preventDefault();
        // Crear un libro de Excel
        var workbook = XLSX.utils.book_new();
        // Crear una hoja de cálculo
        var sheetData = [['Ticket Data'],
        ['Gilberto Fontanez A Software Developer Report'],
        [' '], ['Full Name', 'Subject', 'Status', 'Description']];
        var tableBody = document.getElementById('tbobyTicketTable');
        var rows = tableBody.querySelectorAll('tr');
        var rowsPerPage = 30; // Número de filas por página (ajustable)
        var totalPages = Math.ceil(rows.length / rowsPerPage);

        function addFooter(sheetData, pageNum, totalPages) {
            sheetData.push(['Page ' + pageNum + ' of ' + totalPages]);
        }

        function createSheetData(rows, startRow, endRow, pageNum) {
            var data = [['Ticket Report Data'],
            ['Gilberto Fontanez A Software Developer Report'],
            [' '], ['Full Name', 'Subject', 'Status', 'Description']];

            for (let i = startRow; i < endRow; i++) {
                const row = rows[i];
                const cols = row.querySelectorAll('td');
                if (cols.length > 0) {
                    data.push([
                        cols[0].textContent,
                        cols[1].textContent,
                        cols[2].textContent,
                        cols[3].textContent
                    ]);
                }
            }

            addFooter(data, pageNum, totalPages);
            return data;
        }

        for (let i = 0; i < totalPages; i++) {
            let startRow = i * rowsPerPage;
            let endRow = startRow + rowsPerPage;
            if (endRow > rows.length) endRow = rows.length;

            var sheetName = 'Page ' + (i + 1);
            var currentSheetData = createSheetData(rows, startRow, endRow, i + 1);
            var ws = XLSX.utils.aoa_to_sheet(currentSheetData);
            // Ajustar el ancho de las columnas
            ws['!cols'] = [
                { wch: 20 }, // Ancho de la columna 'Full Name'
                { wch: 25 }, // Ancho de la columna 'Subject'
                { wch: 15 }, // Ancho de la columna 'status'
                { wch: 30 }  // Ancho de la columna 'Description'
            ];
            // Aplicar estilo a los encabezados
            var headerRange = XLSX.utils.decode_range(ws['!ref']);
            for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
                var cell = ws[XLSX.utils.encode_cell({ r: 3, c: C })]; // La fila 3 es la de los encabezados
                if (!cell.s) cell.s = {};
                cell.s.fill = {
                    patternType: "solid",
                    fgColor: { rgb: "D3D3D3" } // Color gris claro
                };
            }
            // Agregar la hoja al libro
            XLSX.utils.book_append_sheet(workbook, ws, 'Ticket Data');
        }
        // Guardar el archivo de Excel
        const timestamp = new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
        XLSX.writeFile(workbook, `tickets_table_${timestamp}.xlsx`);
    }
    // Agregar evento al botón de descarga de Excel
    const downloadExcelBtnTable = document.getElementById('downloadExcelBtnTable');
    downloadExcelBtnTable.addEventListener('click', generateExcelTable);

});

