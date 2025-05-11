document.addEventListener('DOMContentLoaded', () => {
    // Initialize EmailJS with an options object (required for version 4.x.x)
    (function(){
        emailjs.init({
            publicKey: "xhk8M4ulDrnQ-Ljef" // Your EmailJS Public Key
        });
    })();

    const steps = document.querySelectorAll('.form-step');
    const nextButtons = document.querySelectorAll('.next-btn');
    const backButtons = document.querySelectorAll('.back-btn');
    const submitButton = document.querySelector('.submit-btn');
    const modal = document.querySelector('.modal');
    const modalButton = document.querySelector('.modal-btn');
    const closeButton = document.querySelector('.close-btn');

    // Form data
    let reservationData = {
        date: '',
        partySize: '',
        time: '',
        name: '',
        email: '',
        phone: '',
        specialRequests: ''
    };

    // Step Navigation
    nextButtons.forEach(button => {
        button.addEventListener('click', () => {
            const nextStep = button.dataset.next;
            if (validateStep(getCurrentStep())) {
                changeStep(nextStep);
            }
        });
    });

    backButtons.forEach(button => {
        button.addEventListener('click', () => {
            const prevStep = button.dataset.prev;
            changeStep(prevStep);
        });
    });

    function getCurrentStep() {
        return document.querySelector('.form-step.active').id;
    }

    function changeStep(stepId) {
        steps.forEach(step => {
            step.classList.remove('active');
        });
        document.querySelector(`#${stepId}`).classList.add('active');

        if (stepId === 'step-2') {
            populateTimeSlots();
        }
    }

    function validateStep(stepId) {
        if (stepId === 'step-1') {
            const date = document.querySelector('#reservation-date').value;
            const partySize = reservationData.partySize;
            if (!date || !partySize) {
                alert('Please select a date and number of guests.');
                return false;
            }
            reservationData.date = date;
            document.querySelector('#selected-date').textContent = date;
            document.querySelector('#selected-party-size').textContent = partySize;
        }
        if (stepId === 'step-2') {
            if (!reservationData.time) {
                alert('Please select a time slot.');
                return false;
            }
        }
        if (stepId === 'step-3') {
            const name = document.querySelector('#name').value;
            const email = document.querySelector('#email').value;
            const phone = document.querySelector('#phone').value;
            if (!name || !email || !phone) {
                alert('Please fill in all required fields.');
                return false;
            }
            reservationData.name = name;
            reservationData.email = email;
            reservationData.phone = phone;
            reservationData.specialRequests = document.querySelector('#special-requests').value;
        }
        return true;
    }

    // Calendar Picker
    const dateInput = document.querySelector('#reservation-date');
    const calendarPicker = document.querySelector('#calendar-picker');
    const calendarMonthYear = document.querySelector('.calendar-month-year');
    const calendarDays = document.querySelector('.calendar-days');
    const prevMonth = document.querySelector('.prev-month');
    const nextMonth = document.querySelector('.next-month');
    let currentDate = new Date();
    let selectedDate = null;

    dateInput.addEventListener('click', () => {
        calendarPicker.classList.toggle('hidden');
        renderCalendar();
    });

    prevMonth.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonth.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    function renderCalendar() {
        const today = new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const lastDay = new Date(year, month + 1, 0).getDate();

        calendarMonthYear.textContent = `${currentDate.toLocaleString('default', { month: 'long' })} ${year}`;
        calendarDays.innerHTML = '';

        // Add weekday headers
        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        weekdays.forEach(day => {
            const dayHeader = document.createElement('span');
            dayHeader.textContent = day;
            calendarDays.appendChild(dayHeader);
        });

        // Add empty slots for days before the 1st
        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('span');
            calendarDays.appendChild(emptyDay);
        }

        // Add days of the month
        for (let day = 1; day <= lastDay; day++) {
            const dayElement = document.createElement('span');
            dayElement.textContent = day;
            dayElement.classList.add('day');
            const date = new Date(year, month, day);
            const isPast = date < today.setHours(0, 0, 0, 0);

            if (isPast) {
                dayElement.classList.add('disabled');
            } else {
                dayElement.classList.add('available');
                dayElement.addEventListener('click', () => {
                    selectedDate = date;
                    dateInput.value = date.toLocaleDateString();
                    calendarPicker.classList.add('hidden');
                    document.querySelectorAll('.day').forEach(d => d.classList.remove('selected'));
                    dayElement.classList.add('selected');
                });
            }

            calendarDays.appendChild(dayElement);
        }
    }

    // Party Size Selection
    const guestButtons = document.querySelectorAll('.guest-btn');
    guestButtons.forEach(button => {
        button.addEventListener('click', () => {
            guestButtons.forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
            reservationData.partySize = button.dataset.size;
        });
    });

    // Time Slots
    function populateTimeSlots() {
        const timeSlotsContainer = document.querySelector('.time-slots');
        timeSlotsContainer.innerHTML = '';
        const times = [
            '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
            '1:00 PM', '1:30 PM', '2:00 PM', '5:30 PM',
            '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM'
        ];

        times.forEach(time => {
            const slot = document.createElement('button');
            slot.classList.add('time-slot');
            slot.textContent = time;
            slot.addEventListener('click', () => {
                document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
                slot.classList.add('selected');
                reservationData.time = time;
            });
            timeSlotsContainer.appendChild(slot);
        });
    }

    // Form Submission with Email Sending
    submitButton.addEventListener('click', () => {
        if (validateStep('step-3')) {
            // Prepare the email parameters using the reservation data
            const templateParams = {
                name: reservationData.name,
                date: reservationData.date,
                time: reservationData.time,
                partySize: reservationData.partySize,
                email: reservationData.email,
                phone: reservationData.phone,
                specialRequests: reservationData.specialRequests || 'None'
            };

            // Send the email using EmailJS
            emailjs.send("service_7dlrhnh", "template_yhll7yt", templateParams)
                .then((response) => {
                    console.log('Email sent successfully:', response.status, response.text);

                    // Show the confirmation modal after email is sent
                    modal.classList.remove('hidden');
                    document.querySelector('#confirm-date').textContent = reservationData.date;
                    document.querySelector('#confirm-time').textContent = reservationData.time;
                    document.querySelector('#confirm-party-size').textContent = reservationData.partySize;
                    document.querySelector('#confirm-name').textContent = reservationData.name;
                    document.querySelector('#confirm-email').textContent = reservationData.email;

                    // Add confetti
                    const confetti = document.querySelector('.confetti');
                    confetti.innerHTML = '';
                    const colors = ['#E0179E', '#FDFF00', '#38E54D', '#2192FF'];
                    for (let i = 0; i < 20; i++) {
                        const confettiPiece = document.createElement('div');
                        confettiPiece.style.position = 'absolute';
                        confettiPiece.style.width = '12px';
                        confettiPiece.style.height = '12px';
                        confettiPiece.style.background = colors[Math.floor(Math.random() * colors.length)];
                        confettiPiece.style.left = `${Math.random() * 100}%`;
                        confettiPiece.style.animation = `confetti-fall ${2 + Math.random()}s infinite`;
                        confettiPiece.style.animationDelay = `${Math.random()}s`;
                        confetti.appendChild(confettiPiece);
                    }
                }, (error) => {
                    console.error('Failed to send email:', error);
                    alert('There was an error sending the confirmation email. Please try again later. Error: ' + JSON.stringify(error));
                });
        }
    });

    // Modal Controls
    modalButton.addEventListener('click', () => {
        modal.classList.add('hidden');
        changeStep('step-1');
        resetForm();
    });

    closeButton.addEventListener('click', () => {
        modal.classList.add('hidden');
        changeStep('step-1');
        resetForm();
    });

    // Reset Form
    function resetForm() {
        reservationData = {
            date: '',
            partySize: '',
            time: '',
            name: '',
            email: '',
            phone: '',
            specialRequests: ''
        };
        document.querySelector('#reservation-date').value = '';
        document.querySelectorAll('.guest-btn').forEach(btn => btn.classList.remove('selected'));
        document.querySelector('#name').value = '';
        document.querySelector('#email').value = '';
        document.querySelector('#phone').value = '';
        document.querySelector('#special-requests').value = '';
    }
});