document.addEventListener("DOMContentLoaded", function () {
    // DB SupaBase API
    const database = supabase.createClient('https://svdtdtpqscizmxlcicox.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2ZHRkdHBxc2Npem14bGNpY294Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTY2NTU2ODEsImV4cCI6MjAzMjIzMTY4MX0.9Hkev2jhj11Q6r6DXrf2gpixaVTDj2vODRYwpxB5Y50');
    // Inicializar EmailJS
    emailjs.init('XTFEjpctSxusEo9IC');
    // Call the functions to create the charts
    chartsUsersTracking()
    chartsUsersTicket()
    // Call the functions to load the information
    loadUsersTracking();
    loadUsersTicket();


    // Functions to create the charts
    async function chartsUsersTracking() {
        const { data: dbChartUsersTracking, error } = await database.rpc('get_tempuserstracking_request');
        if (error) {
            console.error('Error fetching data:', error);
        } else {
            const chartUsers = dbChartUsersTracking.map(item => item.tempuser);
            const chartRequest = dbChartUsersTracking.map(item => item.count);
            const theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            const color = theme === 'dark' ? '#FFFFFF' : 'rgb(55, 61, 63)';
            const getChartOptions = () => {
                return {
                    series: chartRequest,
                    chart: {
                        height: 420,
                        width: "100%",
                        type: "pie",
                    },
                    labels: chartUsers,
                    dataLabels: {
                        enabled: true,
                        style: {
                            fontSize: '12px',
                            fontFamily: 'Helvetica, Arial, sans-serif',
                            fontWeight: 400,
                            colors: [color],
                        },
                    },
                    legend: {
                        show: true,
                        colors: [color],
                    },
                    yaxis: {
                        labels: {
                            formatter: function (value) {
                                return value + " Records";
                            },
                        },
                    },
                    xaxis: {
                        labels: {
                            formatter: function (value) {
                                return value + " Records";
                            },
                        },
                        axisTicks: {
                            show: false,
                        },
                        axisBorder: {
                            show: false,
                        },
                    },
                };
            };
            if (document.getElementById("pie-chart") && typeof ApexCharts !== 'undefined') {
                const chart = new ApexCharts(document.getElementById("pie-chart"), getChartOptions());
                chart.render().then(() => {
                    // Apply color to legend text
                    document.querySelectorAll('#pie-chart .apexcharts-legend-text').forEach((element) => {
                        element.style.color = color;
                    });
                });
            }
        }
    }


    async function chartsUsersTicket() {
        const { data: dbChartUsersTicket, error } = await database.rpc('get_tempusersticket_request');
        if (error) {
            console.error('Error fetching data:', error);
        } else {
            const chartUsers = dbChartUsersTicket.map(item => item.tempuser);
            const chartRequest = dbChartUsersTicket.map(item => item.count);
            const theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            const color = theme === 'dark' ? '#FFFFFF' : 'rgb(55, 61, 63)';
            const getChartOptions = () => {
                return {
                    series: chartRequest,
                    chart: {
                        height: 420,
                        width: "100%",
                        type: "donut",
                    },
                    labels: chartUsers,
                    dataLabels: {
                        enabled: true,
                        style: {
                            fontSize: '12px',
                            fontFamily: 'Helvetica, Arial, sans-serif',
                            fontWeight: 400,
                            colors: [color],
                        },
                    },
                    legend: {
                        show: true,
                        colors: [color],
                    },
                    yaxis: {
                        labels: {
                            formatter: function (value) {
                                return value + " Tickets"
                            },
                        },
                    },
                    xaxis: {
                        labels: {
                            formatter: function (value) {
                                return value + " Tickets"
                            },
                        },
                        axisTicks: {
                            show: false,
                        },
                        axisBorder: {
                            show: false,
                        },
                    },
                }
            };
            if (document.getElementById("donut-chart") && typeof ApexCharts !== 'undefined') {
                const chart = new ApexCharts(document.getElementById("donut-chart"), getChartOptions());
                chart.render().then(() => {
                    // Apply color to legend text
                    document.querySelectorAll('#donut-chart .apexcharts-legend-text').forEach((element) => {
                        element.style.color = color;
                    });
                });
            }
        }
    }


    // Event listener
    let selectedUserTracking = null;
    let selectedUserTicket = null;
    // Event listener for the change event on the select element Tracking
    document.getElementById('usersTracking').addEventListener('change', function () {
        selectedUserTracking = this.value;
        loadUsersTrackingTable(selectedUserTracking);
    });
    // Event listener for the change event on the select element Ticket
    document.getElementById('usersTicket').addEventListener('change', function () {
        selectedUserTicket = this.value;
        loadUsersTicketTable(selectedUserTicket);
    })



    // Tracking Report Table
    async function loadUsersTracking() {
        const { data: usersTrackingData, error } = await database
            .rpc('get_unique_tempuserstracking');
        if (error) {
            console.error('Error fetching data:', error);
        } else {
            selectUsersTracking(usersTrackingData);
        }
    }
    // Populate the select with the retrieved information
    function selectUsersTracking(usersTrackingData) {
        const usersTrackingSelect = document.getElementById('usersTracking');
        // Create select options
        usersTrackingData.forEach(item => {
            const option = document.createElement('option');
            option.value = item.tempuser;
            option.textContent = 'TEMP-User: ' + '"' + item.tempuser + '"';
            usersTrackingSelect.appendChild(option);
        });
    }

    // Function to load the table data
    async function loadUsersTrackingTable(selectedUserTracking) {
        const { data: loadUser, error } = await database
            .from('tracking')
            .select('*')
            .eq('tempuser', selectedUserTracking);
        if (error) {
            console.error('Error fetching data:', error);
        } else {
            const trackingReportData = document.getElementById('trackingReportData');
            // Create table rows
            trackingReportData.innerHTML = ''; // Clear previous NO Found data html template
            for (let i = 0; i < loadUser.length; i++) {
                const newRow = document.createElement('tr');
                newRow.classList.add('odd:bg-white', 'odd:dark:bg-gray-900', 'even:bg-gray-100', 'even:dark:bg-gray-800');

                const vehicleCell = document.createElement('td');
                const vehicleLink = document.createElement('a');
                vehicleCell.textContent = loadUser[i].vehicle;
                vehicleCell.classList.add('vehicleSelect', 'hover:underline', 'px-6', 'py-3', 'text-left', 'text-xs', 'font-medium', 'text-emerald-500', 'dark:text-emerald-400');
                vehicleCell.appendChild(vehicleLink);


                const positionGeocodedCell = document.createElement('td');
                positionGeocodedCell.textContent = loadUser[i].positionGeocoded;
                positionGeocodedCell.classList.add('px-6', 'py-3', 'text-left', 'text-xs', 'font-medium', 'text-gray-900', 'dark:text-white');

                const speedCell = document.createElement('td');
                speedCell.textContent = loadUser[i].speed;
                speedCell.classList.add('px-6', 'py-3', 'text-left', 'text-xs', 'font-medium', 'text-gray-900', 'dark:text-white');

                const timestampCell = document.createElement('td');
                const date = new Date(loadUser[i].created_at);
                timestampCell.textContent = date.toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true
                });
                timestampCell.classList.add('px-6', 'py-3', 'text-left', 'text-xs', 'font-medium', 'text-gray-900', 'dark:text-white');

                const idCell = document.createElement('td');
                idCell.textContent = loadUser[i].id;
                idCell.value = loadUser[i].id;
                idCell.classList.add('idSelect', 'hidden', 'px-6', 'py-3', 'text-left', 'text-xs', 'font-medium', 'text-gray-900', 'dark:text-white');

                // Append the cells to the row
                newRow.appendChild(vehicleCell);
                newRow.appendChild(positionGeocodedCell);
                newRow.appendChild(speedCell);
                newRow.appendChild(timestampCell);
                newRow.appendChild(idCell);
                trackingReportData.appendChild(newRow);
                trackingRowClickListeners();
            }
        }
    }
    // Función para agregar eventos de click a las filas de la tabla
    function trackingRowClickListeners() {
        document.querySelectorAll('#trackingReportData tr').forEach(row => {
            // Remover cualquier evento de click existente
            row.removeEventListener('click', rowSelectedVehicle);

            // Agregar el nuevo evento de click
            row.addEventListener('click', rowSelectedVehicle);
        });

        // Agregar eventos de sort click a los encabezados para ordenar las columnas
        document.querySelectorAll('th a').forEach(header => {
            header.addEventListener('click', async function (e) {
                e.preventDefault();
                const table = header.closest('table');
                const index = Array.from(header.closest('tr').children).indexOf(header.closest('th'));
                const order = header.dataset.order = -(header.dataset.order || -1);
                const rows = Array.from(table.querySelector('tbody').rows);

                const sortedRows = rows.sort((rowA, rowB) => {
                    const cellA = rowA.cells[index].innerText;
                    const cellB = rowB.cells[index].innerText;
                    return (cellA > cellB ? 1 : cellA < cellB ? -1 : 0) * order;
                });

                table.querySelector('tbody').innerHTML = '';
                for (const row of sortedRows) {
                    await new Promise(resolve => {
                        setTimeout(() => {
                            table.querySelector('tbody').appendChild(row);
                            resolve();
                        }, 10);
                    });
                }
            });
        });
    }
    // Función manejadora del evento de clic en las filas para tracking
    async function rowSelectedVehicle(event) {
        const selectedRow = event.currentTarget; // Guardar la fila seleccionada
        const idSelect = selectedRow.querySelector('.idSelect').value;

        if (idSelect) {
            const { data: rowSelectedVehicle, error } = await database
                .from('tracking')
                .select('*')
                .eq('id', idSelect);

            if (error) {
                console.error(error);
            } else {
                const vehicleSelect = rowSelectedVehicle[0].vehicle;
                const coordinatesSelect = JSON.parse(rowSelectedVehicle[0].position);
                const addressSelect = rowSelectedVehicle[0].positionGeocoded;
                const speedSelect = rowSelectedVehicle[0].speed;
                const timestampSelect = rowSelectedVehicle[0].created_at;

                // Mostrar el modal con id Tracking "static-modal"
                const modal = document.getElementById('static-modal');
                modal.style.display = 'flex';
                document.body.classList.add('overflow-hidden');
                document.getElementById('modalTitle').innerText = 'Vehicle-' + vehicleSelect;

                // LLenar los valores en los campos del modal
                document.getElementById('vehicle').value = vehicleSelect;
                const coordinates = 'Latitude: ' + coordinatesSelect[0] + ', ' + 'Longitude: ' + coordinatesSelect[1];
                document.getElementById('coordinates').value = coordinates;
                document.getElementById('address').value = addressSelect;
                document.getElementById('speed').value = speedSelect + ' km/h';
                const date = new Date(timestampSelect);
                document.getElementById('timestamp').value = date.toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true
                });
                // Crear el mapa seleccionado
                if (L.DomUtil.get('trackingSelectedMap') !== null) {
                    L.DomUtil.get('trackingSelectedMap')._leaflet_id = null;
                }

                const popupContent = `<b>Vehicle:</b> ${vehicleSelect} <br><b>Address:</b> ${addressSelect} <br> <b> ${coordinates} </b> <br>`;
                const selectedMap = L.map('trackingSelectedMap', { zoomControl: false, addControl: false, scrollWheelZoom: false, touchZoom: false, doubleClickZoom: false, dragging: false, touchZoomRotate: false }).setView([coordinatesSelect[0], coordinatesSelect[1]], 18);
                const tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.png';
                L.tileLayer(tileUrl).addTo(selectedMap);
                L.marker([coordinatesSelect[0], coordinatesSelect[1]]).addTo(selectedMap).bindPopup(popupContent).openPopup();

                // Cerrar el modal al hacer clic en cualquier lugar de la pantalla
                const closeBtnTracking = document.getElementById('closeBtnTracking');
                closeBtnTracking.addEventListener('click', () => {
                    modal.style.display = 'none';
                    document.body.classList.remove('overflow-hidden');
                });
            }
        } else {
            console.error('No idSelect element found in the selected row.');
        }
    }



    // Ticket Report Table 
    async function loadUsersTicket() {
        const { data: userTicketData, error } = await database
            .rpc('get_unique_tempusersticket');
        if (error) {
            console.error('Error fetching data:', error);
        } else {
            selectUsersTicket(userTicketData);
        }
    }
    function selectUsersTicket(userTicketData) {
        const usersTicketSelect = document.getElementById('usersTicket');
        // Create select options
        userTicketData.forEach(item => {
            const option = document.createElement('option');
            option.value = item.tempuser;
            option.textContent = 'TEMP-User: ' + '"' + item.tempuser + '"';
            usersTicketSelect.appendChild(option);
        });
    }
    // Function to load the table data
    async function loadUsersTicketTable(selectedUserTicket) {
        const { data: loadUser, error } = await database
            .from('ticket')
            .select('*')
            .eq('tempuser', selectedUserTicket);
        if (error) {
            console.error('Error fetching data:', error);
        } else {
            const ticketReportData = document.getElementById('ticketReportData');
            // Create table rows
            ticketReportData.innerHTML = ''; // Clear previous NO Found data html template
            for (let i = 0; i < loadUser.length; i++) {
                const newRow = document.createElement('tr');
                newRow.classList.add('odd:bg-white', 'odd:dark:bg-gray-900', 'even:bg-gray-100', 'even:dark:bg-gray-800');

                const fullNameCell = document.createElement('td');
                fullNameCell.textContent = loadUser[i].fullName;
                fullNameCell.classList.add('fullNameSelect', 'px-6', 'py-3', 'text-left', 'text-xs', 'font-medium', 'text-gray-900', 'dark:text-white');

                const statusCell = document.createElement('td');
                statusCell.textContent = loadUser[i].status;
                statusCell.classList.add('statusSelect', 'px-6', 'py-3', 'text-left', 'text-xs', 'font-medium', 'text-gray-900', 'dark:text-white');

                const subjectCell = document.createElement('td');
                const subjectLink = document.createElement('a');
                subjectCell.textContent = loadUser[i].subject;
                subjectCell.classList.add('subjectSelect', 'truncate', 'hover:underline', 'px-6', 'py-3', 'text-left', 'text-xs', 'font-medium', 'text-emerald-500', 'dark:text-emerald-400');
                subjectCell.style.maxWidth = '150px';
                subjectCell.style.overflow = 'hidden';
                subjectCell.style.textOverflow = 'ellipsis';
                subjectCell.appendChild(subjectLink);


                const descriptionCell = document.createElement('td');
                descriptionCell.textContent = loadUser[i].description;
                descriptionCell.classList.add('descriptionSelect', 'truncate', 'px-6', 'py-3', 'text-left', 'text-xs', 'font-medium', 'text-gray-900', 'dark:text-white');
                descriptionCell.style.maxWidth = '150px';
                descriptionCell.style.overflow = 'hidden';
                descriptionCell.style.textOverflow = 'ellipsis';

                const idCell = document.createElement('td');
                idCell.textContent = loadUser[i].id;
                idCell.value = loadUser[i].id;
                idCell.classList.add('idSelect', 'hidden', 'px-6', 'py-3', 'text-left', 'text-xs', 'font-medium', 'text-gray-900', 'dark:text-white');

                newRow.appendChild(fullNameCell);
                newRow.appendChild(subjectCell);
                newRow.appendChild(statusCell);
                newRow.appendChild(descriptionCell);
                newRow.appendChild(idCell);
                ticketReportData.appendChild(newRow);
                ticketRowClickListeners();
            }
        }
    }
    // Función para agregar eventos de click a las filas de la tabla
    function ticketRowClickListeners() {
        document.querySelectorAll('#ticketReportData tr').forEach(row => {
            // Remover cualquier evento de click existente
            row.removeEventListener('click', rowSelectedTicket);

            // Agregar el nuevo evento de click
            row.addEventListener('click', rowSelectedTicket);
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
    // Función manejadora del evento de clic en las filas para ticket
    async function rowSelectedTicket(event) {
        const selectedRow = event.currentTarget; // Guardar la fila seleccionada
        const idSelect = selectedRow.querySelector('.idSelect').value;
        window.idSelectTicketGlobal = selectedRow.querySelector('.idSelect').value; // Guardar el id Global need fix


        if (idSelect) {
            const { data: dbTicket, error } = await database
                .from('ticket')
                .select('*')
                .eq('id', idSelect);

            if (error) {
                console.error(error);
            } else {
                // Obtener los datos de la DB
                const fullnameSelect = dbTicket[0].fullName;
                const statusSelect = dbTicket[0].status;
                const subjectSelect = dbTicket[0].subject;
                const descriptionSelect = dbTicket[0].description;
                const created_atTicket = dbTicket[0].created_at;

                // Mostrar el modal
                const modal = document.getElementById('static-modal-ticket');
                modal.style.display = 'flex';
                document.body.classList.add('overflow-hidden');
                document.getElementById('modalTitle-ticket').innerText = 'Ticket-' + idSelect;

                // Agregar los valores en los campos
                document.getElementById('ticketId').value = idSelect;
                const date = new Date(created_atTicket);
                document.getElementById('created_atTicket').value = date.toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true
                });
                document.getElementById('fullName').value = fullnameSelect;
                document.getElementById('status').value = statusSelect;
                document.getElementById('subject').value = subjectSelect;
                document.getElementById('description').value = descriptionSelect;

                // Cargar los comentarios
                loadComments(idSelect);

                // Cerrar el modal al hacer clic en cualquier lugar de la pantalla
                const closeBtnTicket = document.getElementById('closeBtnTicket');
                closeBtnTicket.addEventListener('click', () => {
                    modal.style.display = 'none';
                    document.body.classList.remove('overflow-hidden');
                });
            }
        } else {
            console.error('No idSelect element found in the selected row.');
        }
    }

    async function loadComments(idSelect) {
        const { data: ticketWithComments, error } = await database
            .from('ticket')
            .select('comments')
            .eq('id', idSelect);

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
        const comment = "Admin: " + document.getElementById("comments").value;
        const ticketId = document.getElementById('ticketId').value;
        // Primero, obtenemos el array de comentarios actual
        const { data: currentCommentsData, error } = await database
            .from('ticket')
            .select('comments')
            .eq('id', ticketId);
        if (error) {
            console.error('Error fetching current comments:', error);
        } else {
            const currentComments = currentCommentsData[0]?.comments || [];
            const updatedComments = [...currentComments, comment];
            const { data: updatedData, error } = await database
                .from('ticket')
                .update({ comments: updatedComments })
                .eq('id', ticketId);
            if (error) {
                console.error('Error updating comments in Supabase:', error);
            } else {
                document.getElementById("comments").value = "";
            }
        }
    };
    // Funcion para validar y llamar función para actualizar datos en el boton Save Changes
    document.getElementById("updateNewTicket").addEventListener("click", onUpdateTicket);
    async function onUpdateTicket(event) {
        event.preventDefault();
        const fullName = document.getElementById("fullName").value;
        const status = document.getElementById("status").value;
        const subject = document.getElementById("subject").value;
        const description = document.getElementById("description").value;
        const ticketId = document.getElementById('ticketId').value;
        // Primero, obtenemos el array de comentarios actual
        const { data: updatedData, error } = await database
            .from('ticket')
            .update({ fullName, status, subject, description })
            .eq('id', ticketId);
        if (error) {
            console.error('Error updating data in Supabase:', error);
        } else {
            // Cerrar el modal
            document.getElementById('static-modal-ticket').style.display = 'none';
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
            modal.setAttribute('aria-hidden', 'false'); // Asegurarse de que el modal sea accesible
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
                        row.querySelector('.fullNameSelect').innerText = subscribeRecord.fullName;
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
    async function userTrackingtablePDF(event) {
        event.preventDefault();
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const tableBody = document.getElementById('trackingReportData');
        const rows = tableBody.querySelectorAll('tr');

        const pageHeight = doc.internal.pageSize.height;
        const margin = 10;
        let y = 44; // Posición inicial en Y para la primera página
        let pageCount = 1;

        // Configurar estilos y título
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Vehicle Tracking Data', 14, 22);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('Gilberto Fontanez A Software Developer Report', 14, 28);
        doc.text(`Username : ${selectedUserTracking}`, 72, 42);

        doc.setFontSize(12);

        // Agregar encabezados con estilo
        function addTableHeaders() {
            doc.setDrawColor(0); // Color del borde (negro)
            doc.setFillColor(200); // Color de fondo (gris claro)
            doc.setLineWidth(0.1); // Ancho del borde

            doc.rect(14, y, 20, 10, 'FD'); // Rectángulo para 'Vehicle'
            doc.rect(34, y, 95, 10, 'FD'); // Rectángulo para 'Address'
            doc.rect(100, y, 20, 10, 'FD'); // Rectángulo para 'Speed'
            doc.rect(118, y, 70, 10, 'FD'); // Rectángulo para 'Time'

            doc.setFontSize(10);
            doc.text('Vehicle', 18, y + 6); // Texto para 'Vehicle'
            doc.text('Address', 38, y + 6); // Texto para 'Address'
            doc.text('Speed', 104, y + 6); // Texto para 'Speed'
            doc.text('Time', 122, y + 6); // Texto para 'Time'

            y += 20;
        }

        function addPageFooter(pageNum, totalPages) {
            const footerY = pageHeight - 10; // Posición del pie de página
            doc.setFontSize(10);
            doc.text(`Page ${pageNum} of ${totalPages}`, 14, footerY);
        }

        addTableHeaders();

        // Calcular cuántas páginas serán necesarias
        let rowsPerPage = Math.floor((pageHeight - 54 - margin) / 10); // Ajuste por el espacio disponible en una página
        let totalPages = Math.ceil(rows.length / rowsPerPage);

        // Crear tabla en el PDF
        rows.forEach((row, index) => {
            const cols = row.querySelectorAll('td');
            if (cols.length > 0) {
                // Verificar si hay suficiente espacio en la página actual
                if (y + 10 > pageHeight - margin) {
                    addPageFooter(pageCount, totalPages);
                    doc.addPage();
                    pageCount++;
                    y = 20; // Nueva posición en Y para la nueva página
                    addTableHeaders();
                }
                doc.text(cols[0].textContent, 18, y);
                doc.text(cols[1].textContent, 38, y);
                doc.text(cols[2].textContent, 104, y);
                doc.text(cols[3].textContent, 122, y);
                y += 10;
            }
        });

        // Añadir el pie de página a la última página
        addPageFooter(pageCount, totalPages);

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
        const filename = `(${selectedUserTracking})user_tracking_${timestamp}.pdf`;
        doc.save(filename);
    }
    // Botón de descarga de Table PDF
    const userTrackingtablePDFBtn = document.getElementById('userTrackingtablePDFBtn');
    userTrackingtablePDFBtn.addEventListener('click', userTrackingtablePDF);


    // Función para generar el Excel    
    function userTrackingtableExcel(event) {
        event.preventDefault();
        // Crear un libro de Excel
        var workbook = XLSX.utils.book_new();
        var tableBody = document.getElementById('trackingReportData');
        var rows = tableBody.querySelectorAll('tr');
        var rowsPerPage = 30; // Número de filas por página (ajustable)
        var totalPages = Math.ceil(rows.length / rowsPerPage);

        function addFooter(sheetData, pageNum, totalPages) {
            sheetData.push(['Page ' + pageNum + ' of ' + totalPages]);
        }

        function createSheetData(rows, startRow, endRow, pageNum) {
            var data = [['Vehicle Tracking Data'],
            ['Gilberto Fontanez A Software Developer Report'],
            [' '], ['Vehicle', 'Address', 'Speed', 'Time']];

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
                { wch: 15 }, // Ancho de la columna 'Vehicle'
                { wch: 50 }, // Ancho de la columna 'Address'
                { wch: 10 }, // Ancho de la columna 'Speed'
                { wch: 25 }  // Ancho de la columna 'Time'
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
            XLSX.utils.book_append_sheet(workbook, ws, sheetName);
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
        XLSX.writeFile(workbook, `vehicles_table_${timestamp}_tracking_data.xlsx`);
    }

    // Botón de descarga de Table Excel
    const userTrackingtableEXCELBtn = document.getElementById('userTrackingtableEXCELBtn');
    userTrackingtableEXCELBtn.addEventListener('click', userTrackingtableExcel);



    // Reports Tickets
    async function userTickettablePDF(event) {
        event.preventDefault();
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const tableBody = document.getElementById('ticketReportData');
        const rows = tableBody.querySelectorAll('tr');

        // Función para dibujar encabezados
        const drawTableHeaders = (y) => {
            doc.text(`Username : ${selectedUserTicket}`, 72, y);
            y += 2;
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

        let y = 40; // Posición inicial en Y para el contenido del Table Headers

        // Dibujar encabezados en la primera página
        drawTableHeaders(y);

        y += 25; // Posición inicial en Y para el contenido de la primera fila row

        // Crear tabla en el PDF
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

    // Botón de descarga de Table PDF
    const userTickettablePDFBtn = document.getElementById('userTickettablePDFBtn');
    userTickettablePDFBtn.addEventListener('click', userTickettablePDF);


    // Función para generar el Excel    
    function userTickettableExcel(event, selectedUserTicket) {
        event.preventDefault();
        // Crear un libro de Excel
        var workbook = XLSX.utils.book_new();
        var tableBody = document.getElementById('ticketReportData');
        var rows = tableBody.querySelectorAll('tr');
        var rowsPerPage = 30; // Número de filas por página (ajustable)
        var totalPages = Math.ceil(rows.length / rowsPerPage);

        function addFooter(sheetData, pageNum, totalPages) {
            sheetData.push(['Page ' + pageNum + ' of ' + totalPages]);
        }

        function createSheetData(rows, startRow, endRow, pageNum, selectedUserTicket) {
            var data = [['Ticket Report Data'],
            ['Gilberto Fontanez A Software Developer Report'],
            ['Username', selectedUserTicket],
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
            var currentSheetData = createSheetData(rows, startRow, endRow, i + 1, selectedUserTicket);
            var ws = XLSX.utils.aoa_to_sheet(currentSheetData);

            // Ajustar el ancho de las columnas
            ws['!cols'] = [
                { wch: 20 }, // Ancho de la columna 'Full Name'
                { wch: 25 }, // Ancho de la columna 'Subject'
                { wch: 15 }, // Ancho de la columna 'status'
                { wch: 30 }, // Ancho de la columna 'Description'
                { wch: 20 }  // Ancho de la columna 'Username'
            ];

            // Aplicar estilo a los encabezados
            var headerRange = XLSX.utils.decode_range(ws['!ref']);
            for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
                var cell = ws[XLSX.utils.encode_cell({ r: 3, c: C })]; // La fila 3 es la de los encabezados
                if (cell && !cell.s) {
                    cell.s = {};
                }
                if (cell) {
                    cell.s.fill = {
                        patternType: "solid",
                        fgColor: { rgb: "D3D3D3" } // Color gris claro
                    };
                }
            }

            XLSX.utils.book_append_sheet(workbook, ws, sheetName);
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
        XLSX.writeFile(workbook, `(${selectedUserTicket})user_tickets_table_${timestamp}.xlsx`);
    }

    // Botón de descarga de Table Excel
    const userTickettableEXCELBtn = document.getElementById('userTickettableEXCELBtn');
    userTickettableEXCELBtn.addEventListener('click', function (event) {
        selectedUserTicket;
        // Llamar a la función userTickettableExcel con el evento y el valor de selectedUserTicket
        userTickettableExcel(event, selectedUserTicket);
    });



    function vehicleSelectedPdf() {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();
        const trackingSelectedMap = document.getElementById('trackingSelectedMap');

        // Configurar estilos y título
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Vehicle Position Data', 14, 22);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Gilberto Fontanez A Software Developer Report', 14, 28);

        pdf.setFontSize(12);
        let y = 44; // Posición inicial en Y

        // Agregar encabezados con estilo
        pdf.setDrawColor(0); // Color del borde (negro)
        pdf.setFillColor(200); // Color de fondo (gris claro)
        pdf.setLineWidth(0.1); // Ancho del borde

        pdf.rect(10, y, 70, 10, 'FD'); // Rectángulo para 'Time'
        pdf.rect(74, y, 20, 10, 'FD'); // Rectángulo para 'Vehicle'
        pdf.rect(94, y, 80, 10, 'FD'); // Rectángulo para 'Address'
        pdf.rect(174, y, 30, 10, 'FD'); // Rectángulo para 'Speed'
        pdf.rect(10, y + 30, 63, 10, 'FD'); // Rectángulo para 'Coordinates'

        pdf.setFontSize(10);
        pdf.text('Time', 14, y + 6); // Texto para 'Time'
        pdf.text('Vehicle', 78, y + 6); // Texto para 'Vehicle'
        pdf.text('Address', 100, y + 6); // Texto para 'Address'
        pdf.text('Speed', 178, y + 6); // Texto para 'Speed'
        pdf.text('Satellite Screenshot', 14, y + 36); // Texto para 'Coordinates'

        y += 20;

        // Agregar los datos del formulario al PDF
        const timeFormValue = document.getElementById('timestamp').value;
        const vehicleFormValue = document.getElementById('vehicle').value;
        const addressFormValue = document.getElementById('address').value;
        const speedFormValue = document.getElementById('speed').value;
        const coordinatesFormValue = document.getElementById('coordinates').value;

        pdf.text(timeFormValue, 12, y);
        pdf.text(vehicleFormValue, 78, y);
        pdf.text(addressFormValue, 100, y);
        pdf.text(speedFormValue, 178, y);

        pdf.text('Position is based on coordinates:', 14, y + 30);
        pdf.text(coordinatesFormValue, 68, y + 30);

        html2canvas(trackingSelectedMap, {
            logging: true,
            scale: 1,
            letterRenderer: 1,
            useCORS: true
        }).then(canvas => {
            const imgWidth = 130;
            const imgHeight = canvas.height * imgWidth / canvas.width;
            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', 14, y + 35, imgWidth, imgHeight);
            const filename = `(${vehicleFormValue})vehicle_${timeFormValue}_data.pdf`;
            pdf.save(filename);
        });
    }
    // Botón de descarga de Selected Vehicle PDF
    const vehicleSelectedPdfBtn = document.getElementById('trackingSelectedPdfBtn');
    vehicleSelectedPdfBtn.addEventListener('click', vehicleSelectedPdf);


    async function ticketSelectedPdf(event) {
        event.preventDefault();
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const ticketFormTicket = document.getElementById('ticketFormTicket');

        // Obtener los valores del formulario
        const idSelect = window.idSelectTicketGlobal;
        const fullName = ticketFormTicket.querySelector('#fullName').value;
        const status = ticketFormTicket.querySelector('#status').value;
        const subject = ticketFormTicket.querySelector('#subject').value;
        const description = ticketFormTicket.querySelector('#description').value;
        const commentList = ticketFormTicket.querySelector('#readcomments ul');
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


        // Configurar estilos y título
        let y = 44; // Posición inicial en Y
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Ticket Data', 14, 22);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('Gilberto Fontanez A Software Developer Report', 14, 28);
        doc.text(`Username : ${selectedUserTicket}`, 14, 36);

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
    ticketSelectedPdfBtn.addEventListener('click', ticketSelectedPdf);
});