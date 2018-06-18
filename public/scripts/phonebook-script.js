// NEW RECORD DUGME KOJE OTVARA OVERLAY FORMU ZA UNOS
document.getElementById('new-record-btn').addEventListener('click', () => {
    console.log("TEST ZA NEW RECORD NUTTON");
    document.getElementById('overlay-background').style.display = 'block';
});


// CLOSE OVERLAY DUGME KOJE ZATVARA OVERLAY FORMU
document.getElementById('close-insert-overlay').addEventListener('click', () => {
    console.log("TEST ZA CLOSE OVERLAY BUTTON");
    document.getElementById('overlay-background').style.display = 'none';
});


// RESET FIELDS DUGME NA OVERLAY FORMI KOJE POSTAVLJA SVA POLJA
// FORME ZA UNOS TEKSTA NA VREDNOST PRAZNOG STRINGA
document.getElementById('reset-fields').addEventListener('click', () => {
    console.log("TEST ZA RESET FIELDS BUTTON");
    document.querySelectorAll('#insert-overlay input[type="text"]').forEach(v => {
        v.value = '';
    });
});