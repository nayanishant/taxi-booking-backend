document.addEventListener('DOMContentLoaded', () => {
    const continueBtn = document.querySelector('.btn-continue');
    const departureInput = document.getElementById('departure');
    const destinationInput = document.getElementById('destination');
    const ridesEndpoint = 'http://localhost:8080/rides';

    continueBtn.addEventListener('click', async () => {
        const departure = departureInput.value;
        const destination = destinationInput.value;

        if (!departure || !destination) {
            alert('Please enter both departure and destination addresses.');
            return;
        }

        // Check for token and auto-login if missing
        // Check for token and auto-login if missing
        // let token = localStorage.getItem('token');
        // if (!token) {
        //     try {
        //         console.log('Logging in automatically...');
        //         const loginResponse = await fetch('http://localhost:8080/auth/login', {
        //             method: 'POST',
        //             headers: { 'Content-Type': 'application/json' },
        //             body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
        //         });
                
        //         if (loginResponse.ok) {
        //             const loginData = await loginResponse.json();
        //             token = loginData.token;
        //             localStorage.setItem('token', token);
        //             console.log('Auto-login successful');
        //         } else {
        //             console.error('Auto-login failed');
        //             alert('Authentication required. Please login.');
        //             return;
        //         }
        //     } catch (error) {
        //         console.error('Auto-login error:', error);
        //         alert('Authentication failed.');
        //         return;
        //     }
        // }

        const body = {
            pickup: departure,
            dropoff: destination
        };

        try {
            continueBtn.textContent = 'Processing...';
            continueBtn.disabled = true;

            const response = await fetch(ridesEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                alert(`Ride booked successfully! Ride ID: ${data.ride.id}`);
                console.log('Ride details:', data.ride);
            } else {
                console.error('Booking failed:', data);
                alert(`Booking failed: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while booking the ride.');
        } finally {
            continueBtn.textContent = 'Continue';
            continueBtn.disabled = false;
        }
    });

    // Make inputs accept "Enter" key
    [departureInput, destinationInput].forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                continueBtn.click();
            }
        });
    });
});

// Global callback for Google Maps API
window.initAutocomplete = function() {
    const departureInput = document.getElementById('departure');
    const destinationInput = document.getElementById('destination');
    const distanceBox = document.querySelector('.distance-box');

    let departurePlace = null;
    let destinationPlace = null;

    function updateDistance() {
        if (departurePlace && destinationPlace) {
            const distanceInMeters = google.maps.geometry.spherical.computeDistanceBetween(
                departurePlace.geometry.location,
                destinationPlace.geometry.location
            );
            const distanceInKm = (distanceInMeters / 1000).toFixed(2);
            distanceBox.textContent = `${distanceInKm} km`;
            distanceBox.style.display = 'flex';
            distanceBox.style.alignItems = 'center';
            distanceBox.style.justifyContent = 'center';
            distanceBox.style.fontWeight = 'bold';
            distanceBox.style.color = '#333';
        }
    }

    if (departureInput && destinationInput) {
        const departureAutocomplete = new google.maps.places.Autocomplete(departureInput);
        const destinationAutocomplete = new google.maps.places.Autocomplete(destinationInput);

        departureAutocomplete.addListener('place_changed', () => {
            const place = departureAutocomplete.getPlace();
            if (place.geometry) {
                departurePlace = place;
                updateDistance();
            }
        });

        destinationAutocomplete.addListener('place_changed', () => {
            const place = destinationAutocomplete.getPlace();
            if (place.geometry) {
                destinationPlace = place;
                updateDistance();
            }
        });
    }
};
