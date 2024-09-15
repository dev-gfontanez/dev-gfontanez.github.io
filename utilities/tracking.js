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


    const database = supabase.createClient('https://svdtdtpqscizmxlcicox.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2ZHRkdHBxc2Npem14bGNpY294Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTY2NTU2ODEsImV4cCI6MjAzMjIzMTY4MX0.9Hkev2jhj11Q6r6DXrf2gpixaVTDj2vODRYwpxB5Y50');
    // Inicializar EmailJS
    emailjs.init('XTFEjpctSxusEo9IC');
    // Inicializar Mapa
    const map = L.map('map').setView([37.7749, -122.4194], 17);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Obtener referencias a los elementos DOM
    const routeList = document.getElementById('routeTag');
    const vehicleList = document.getElementById('vehicleTag');

    // Inicializar variables para guardar las selecciones y la agencia
    let selectedRouteTag = null;
    let selectedVehicleId = null;
    let markers = {};
    let agencyTag = null;
    let lastTime = 0;
    let fetchInterval = null;
    let tableCounter = 0;

    // Función para obtener la lista de agencias y rutas
    async function getAgencyAndRouteList() {
        try {
            const agencyListUrl = 'https://retro.umoiq.com/service/publicXMLFeed?command=agencyList';
            const headers = {
                "Accept-Encoding": "gzip, deflate"
            };
            const agencyListResponse = await fetch(agencyListUrl, {headers});
            const agencyListData = await agencyListResponse.text();
            const agencyXmlDoc = new DOMParser().parseFromString(agencyListData, "text/xml");
            const defaultAgencies = ['jhu-apl', 'ccrta', 'chapel-hill', 'dumbarton-gtfs','ttc'];
            // Other default agencies: 'ttc',

            let routeListToHTML = '';

            for (const agency of defaultAgencies) {
                // Obtener el tag de la agencia actual
                const agencyElement = Array.from(agencyXmlDoc.getElementsByTagName('agency')).find(el => el.getAttribute('tag') === agency);
                if (!agencyElement) {
                    console.warn(`Agency with tag ${agency} not found.`);
                    continue;
                }
                const agencyTag = agencyElement.getAttribute('tag');
                // Obtener la lista de rutas para la agencia actual
                const routeListUrl = `https://retro.umoiq.com/service/publicXMLFeed?command=routeList&a=${agencyTag}`;
                const routeListResponse = await fetch(routeListUrl, {headers});
                const routeListData = await routeListResponse.text();
                const routeXmlDoc = new DOMParser().parseFromString(routeListData, "text/xml");
                const routes = routeXmlDoc.getElementsByTagName('route');

                for (let I = 0; I < routes.length; I++) {
                    const routeTag = routes[I].getAttribute('tag');
                    const routeTitle = routes[I].getAttribute('title');
                    routeListToHTML += `<option value="${routeTag}" data-agency="${agencyTag}">${routeTitle}</option>`;
                }
            }

            return { routeListToHTML };
        } catch (error) {
            console.error('Error fetching agency and route list:', error);
            return { routeListToHTML: '' };
        }
    }

    // Función para obtener las ubicaciones de los vehículos para la ruta seleccionada
    async function fetchVehicleLocations() {
        if (!selectedRouteTag || !agencyTag) {
            console.warn('Route or agency tag not selected.');
            return;
        }

        try {
            const vehicleLocationUrl = `https://retro.umoiq.com/service/publicXMLFeed?command=vehicleLocations&a=${agencyTag}&r=${selectedRouteTag}&t=${lastTime}`;
            const headers = {
                "Accept-Encoding": "gzip, deflate"
            };
            const vehicleLocationResponse = await fetch(vehicleLocationUrl, {headers});
            const vehicleLocationData = await vehicleLocationResponse.text();
            const vehicleLocationXmlDoc = new DOMParser().parseFromString(vehicleLocationData, "text/xml");
            const vehicles = vehicleLocationXmlDoc.getElementsByTagName('vehicle');
            let vehicleListToHTML = '';

            if (vehicles.length > 0) {
                vehicleListToHTML = '<option value="">Select Vehicle...</option>';
                for (let i = 0; i < vehicles.length; i++) {
                    const vehicle = vehicles[i];
                    const id = vehicle.getAttribute('id');
                    const lat = vehicle.getAttribute('lat');
                    const lon = vehicle.getAttribute('lon');
                    vehicleListToHTML += `<option value="${id}">${id}</option>`;

                    // Actualizar o crear marcadores para cada vehículo
                    if (markers[id]) {
                        markers[id].setLatLng([lat, lon]);
                    } else {
                        markers[id] = L.marker([lat, lon]).addTo(map);
                    }
                }
            } else {
                vehicleListToHTML = '<option value="">No vehicles in use. Check another Route.</option>';
            }
            vehicleList.innerHTML = vehicleListToHTML;

            // Actualizar el último tiempo (lastTime)
            const lastTimeElement = vehicleLocationXmlDoc.getElementsByTagName('lastTime')[0];
            if (lastTimeElement) {
                lastTime = lastTimeElement.getAttribute('time');
            }
        } catch (error) {
            console.error('Error fetching vehicle locations:', error);
        }
    }

    // Función para obtener la ubicación del vehículo seleccionado
    async function fetchSelectedVehicleLocation() {
        if (!selectedVehicleId || !agencyTag) {
            console.warn('Vehicle or agency tag not selected.');
            return;
        }

        try {
            const vehicleSelectedUrl = `https://retro.umoiq.com/service/publicXMLFeed?command=vehicleLocation&a=${agencyTag}&v=${selectedVehicleId}`;
            const headers = {
                "Accept-Encoding": "gzip, deflate"
            };
            const vehicleSelectedResponse = await fetch(vehicleSelectedUrl, {headers});
            const vehicleSelectedData = await vehicleSelectedResponse.text();
            const vehicleSelectedXmlDoc = new DOMParser().parseFromString(vehicleSelectedData, "text/xml");
            const vehicleSelected = vehicleSelectedXmlDoc.getElementsByTagName('vehicle')[0];

            if (vehicleSelected) {
                const lat = parseFloat(vehicleSelected.getAttribute('lat'));
                const lon = parseFloat(vehicleSelected.getAttribute('lon'));
                const speed = vehicleSelected.getAttribute('speedKmHr');

                const popupContent = `<b>Vehicle:</b> ${selectedVehicleId}<br><b>Speed:</b> ${speed} km/h`;

                if (markers[selectedVehicleId]) {
                    markers[selectedVehicleId].setLatLng([lat, lon]);
                    markers[selectedVehicleId].bindPopup(popupContent).openPopup();
                } else {
                    markers[selectedVehicleId] = L.marker([lat, lon])
                        .bindPopup(popupContent)
                        .addTo(map)
                        .openPopup();
                }
                map.panTo([lat, lon]);
                if (tableCounter < 10) {
                    const apiUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
                    const reverseResponse = await fetch(apiUrl);
                    const reverseData = await reverseResponse.json();
                    const address = reverseData.address || 'No street name was found';

                    const { data: insertedData, error } = await database
                        .from('tracking')
                        .insert([
                            {
                                vehicle: selectedVehicleId,
                                position: [lat, lon],
                                positionGeocoded: address.road + ', ' + address.state,
                                speed: speed,
                                tempuser: sessionID
                            }
                        ])
                        .select('*');

                    if (error) {
                        console.error('Error inserting data into Supabase:', error);
                    } else {
                        if (insertedData.length > 0) {
                            const insertedRecord = insertedData[0];

                            insertVehicleData(insertedRecord.vehicle, insertedRecord.positionGeocoded, insertedRecord.speed, insertedRecord.created_at, insertedRecord.id);
                        }
                    }

                    tableCounter++;
                }
            }
        } catch (error) {
            console.error('Error fetching selected vehicle location:', error);
        }
    }


    function insertVehicleData(vehicle, positionGeocoded, speed, created_at, id) {
        const tableBody = document.getElementById('vehicleData');
        const noDataRow = document.getElementById('noDataRow');
        if (noDataRow) {
            noDataRow.remove();
        }

        const newRow = document.createElement('tr');
        newRow.classList.add('odd:bg-white', 'odd:dark:bg-gray-900', 'even:bg-gray-100', 'even:dark:bg-gray-800');

        const vehicleCell = document.createElement('td');
        const vehicleLink = document.createElement('a');
        vehicleLink.textContent = vehicle;
        vehicleLink.classList.add('vehicleSelect', 'hover:underline', 'px-6', 'py-3', 'text-left', 'text-xs', 'font-medium', 'text-emerald-500', 'dark:text-emerald-400');
        vehicleCell.appendChild(vehicleLink);
        vehicleCell.style.maxWidth = '150px';
        vehicleCell.style.overflow = 'hidden';
        vehicleCell.style.textOverflow = 'ellipsis';

        const addressCell = document.createElement('td');
        addressCell.textContent = positionGeocoded;
        addressCell.classList.add('addressSelect', 'px-6', 'py-3', 'text-left', 'text-xs', 'font-medium', 'text-gray-900', 'dark:text-white');

        const speedCell = document.createElement('td');
        speedCell.textContent = speed + ' km/h';
        speedCell.classList.add('speedSelect', 'px-6', 'py-3', 'text-left', 'text-xs', 'font-medium', 'text-gray-900', 'dark:text-white');

        const timestampCell = document.createElement('td');
        const date = new Date(created_at);
        timestampCell.textContent = date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
        timestampCell.classList.add('timestampSelect', 'px-6', 'py-3', 'text-left', 'text-xs', 'font-medium', 'text-gray-900', 'dark:text-white');

        const idCell = document.createElement('td');
        idCell.textContent = id;
        idCell.value = id;
        idCell.classList.add('idSelect', 'hidden', 'px-6', 'py-3', 'text-left', 'text-xs', 'font-medium', 'text-gray-900', 'dark:text-white');

        newRow.appendChild(timestampCell);
        newRow.appendChild(vehicleCell);
        newRow.appendChild(addressCell);
        newRow.appendChild(speedCell);
        newRow.appendChild(idCell);

        tableBody.appendChild(newRow);

        addRowClickListeners();
    }


    // Función para agregar eventos de click a las filas de la tabla
    function addRowClickListeners() {
        document.querySelectorAll('#vehicleData tr').forEach(row => {
            // Remover cualquier evento de click existente
            row.removeEventListener('click', rowSelectedVehicle);

            // Agregar el nuevo evento de click
            row.addEventListener('click', rowSelectedVehicle);
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

                // Mostrar el modal con id "static-modal"
                const modal = document.getElementById('static-modal');
                modal.style.display = 'flex';
                document.body.classList.add('overflow-hidden');
                document.getElementById('modalTitle').innerText = 'Vehicle-' + vehicleSelect;
                const trackingSelectedPdfBtn = document.getElementById('trackingSelectedPdfBtn');
                trackingSelectedPdfBtn.classList.remove('hidden');
                trackingSelectedPdfBtn.classList.add('inline-flex');

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
                const closeBtn = document.getElementById('closeBtn');
                closeBtn.addEventListener('click', () => {
                    modal.style.display = 'none';
                    document.body.classList.remove('overflow-hidden');
                });
            }
        } else {
            console.error('No idSelect element found in the selected row.');
        }
    }



    // Events Selects    
    routeList.addEventListener('change', async (event) => {
        selectedRouteTag = event.target.value;
        lastTime = 0; // Reiniciar lastTime para cuando se cambia de ruta obtener datos nuevos al ultimo return del route API ya almacenado.
        document.getElementById('svgSelectRoute').classList.remove('invisible');
        agencyTag = event.target.selectedOptions[0].getAttribute('data-agency');
        await fetchVehicleLocations();
    });

    vehicleList.addEventListener('change', function () {
        selectedVehicleId = this.value;
        fetchSelectedVehicleLocation();

        if (fetchInterval) {
            clearInterval(fetchInterval);
        }
        document.getElementById('svgSelectVehicle').classList.remove('invisible');
        // Fetch data every 10 seconds
        fetchInterval = setInterval(fetchSelectedVehicleLocation, 10000);
    });

    getAgencyAndRouteList().then(({ routeListToHTML }) => {
        // Añadir las opciones obtenidas de routeList al final de la lista en lugar de reemplazar el contenido
        if (routeListToHTML) {
            routeList.innerHTML += routeListToHTML;
        }
    });

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

    // Reports 
    async function generatePDF(event) {
        event.preventDefault();
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const tableBody = document.getElementById('vehicleData');
        const rows = tableBody.querySelectorAll('tr');

        // Configurar estilos y título
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Vehicle Tracking Data', 14, 22);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('Gilberto Fontanez A Software Developer Report', 14, 28);

        doc.setFontSize(12);
        let y = 44; // Posición inicial en Y

        // Agregar encabezados con estilo
        doc.setDrawColor(0); // Color del borde (negro)
        doc.setFillColor(200); // Color de fondo (gris claro)
        doc.setLineWidth(0.1); // Ancho del borde

        doc.rect(14, y, 60, 10, 'FD'); // Rectángulo para 'Time'
        doc.rect(74, y, 50, 10, 'FD'); // Rectángulo para 'Vehicle'
        doc.rect(94, y, 80, 10, 'FD'); // Rectángulo para 'Address'
        doc.rect(174, y, 30, 10, 'FD'); // Rectángulo para 'Speed'

        doc.setFontSize(10);
        doc.text('Time', 18, y + 6); // Texto para 'Time'
        doc.text('Vehicle', 78, y + 6); // Texto para 'Vehicle'
        doc.text('Address', 100, y + 6); // Texto para 'Address'
        doc.text('Speed', 178, y + 6); // Texto para 'Speed'

        y += 20;

        // Crear tabla en el PDF
        rows.forEach((row, index) => {
            const cols = row.querySelectorAll('td');
            if (cols.length > 0) {
                // doc.text(22, y, 30, 10, cols[0].textContent, null, null, null, null, 'left');
                doc.text(cols[0].textContent, 18, y);
                doc.text(cols[1].textContent, 78, y);
                doc.text(cols[2].textContent, 100, y);
                doc.text(cols[3].textContent, 178, y);
                y += 10;
            }
        });
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
        // Abrir el documento PDF en una nueva pestaña o ventana del navegador
        const filename = `vehicles_table_${timestamp}_tracking_data.pdf`;
        doc.save(filename);
    }
    // Botón de descarga de Table PDF
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    downloadPdfBtn.addEventListener('click', generatePDF);


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


    // Función para generar el Excel    
    function generateExcel(event) {
        event.preventDefault();
        // Crear un libro de Excel
        var workbook = XLSX.utils.book_new();
        // Crear una hoja de cálculo
        var sheetData = [['Vehicle Tracking Data'],
        ['Gilberto Fontanez A Software Developer Report'],
        [' '], ['Time', 'Vehicle', 'Address', 'Speed']];
        var tableBody = document.getElementById('vehicleData');
        var rows = tableBody.querySelectorAll('tr');
        var rowsPerPage = 30; // Número de filas por página (ajustable)
        var totalPages = Math.ceil(rows.length / rowsPerPage);

        function addFooter(sheetData, pageNum, totalPages) {
            sheetData.push(['Page ' + pageNum + ' of ' + totalPages]);
        }

        function createSheetData(rows, startRow, endRow, pageNum) {
            var data = [['Vehicle Tracking Data'],
            ['Gilberto Fontanez A Software Developer Report'],
            [' '], ['Time', 'Vehicle', 'Address', 'Speed']];

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
                { wch: 25 }, // Ancho de la columna 'Time'
                { wch: 15 }, // Ancho de la columna 'Vehicle'
                { wch: 50 }, // Ancho de la columna 'Address'
                { wch: 10 }  // Ancho de la columna 'Speed'
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
    const downloadExcelBtn = document.getElementById('downloadExcelBtn');
    downloadExcelBtn.addEventListener('click', generateExcel);


});
