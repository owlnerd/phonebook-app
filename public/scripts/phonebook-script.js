/*
    ==================================================
    NEW RECORD DUGME KOJE OTVARA OVERLAY FORMU ZA UNOS
    ==================================================
*/
document.getElementById('new-record-btn').addEventListener('click', () => {
    console.log("TEST ZA NEW RECORD NUTTON");
    document.getElementById('overlay-background').style.display = 'block';
});



/*
    ==============================================
    CLOSE OVERLAY DUGME KOJE ZATVARA OVERLAY FORMU
    ==============================================
*/
document.getElementById('close-insert-overlay').addEventListener('click', () => {
    console.log("TEST ZA CLOSE OVERLAY BUTTON");
    document.getElementById('overlay-background').style.display = 'none';
});



/*
    ============================================================
    RESET FIELDS DUGME NA OVERLAY FORMI KOJE POSTAVLJA SVA POLJA
    FORME ZA UNOS TEKSTA NA VREDNOST PRAZNOG STRINGA
    ============================================================
*/
document.getElementById('reset-fields').addEventListener('click', () => {
    console.log("TEST ZA RESET FIELDS BUTTON");
    document.querySelectorAll('.error-message').forEach(v => {
        v.remove();
    });
    document.querySelectorAll('#insert-overlay input[type="text"]').forEach(v => {
        v.value = '';
    });
});



/*
    ========================================================================
    FORMA MORA DA POSTOJI DA BIH SELEKTOVAO DUGMAD ZA BRISANJE, OR ELSE BUBA
    ========================================================================
*/
if  (document.getElementById('phonebook')) {
    // SELECT ALL DUGME KOJE CHEKIRA SVE CHECKBOXE ZA SELEKTOVANJE UNOSA
    document.getElementById('select-all').addEventListener('click', () => {
        console.log("TEST ZA SELECT ALL");
        document.querySelectorAll('.select-record').forEach(v => {
            v.checked = true;
        });
    });

    // DESELECT ALL DUGME KOJE CHEKIRA SVE CHECKBOXE ZA SELEKTOVANJE UNOSA
    document.getElementById('deselect-all').addEventListener('click', () => {
        console.log("TEST ZA DESELECT ALL");
        document.querySelectorAll('.select-record').forEach(v => {
            v.checked = false;
        });
    });
}



/*
    ========================================
    VALIDACIJA FORME ZA UNOS NOVIH RECORDS-A
    ========================================
*/
let insertRecordForm = document.getElementById('insert-record-form');
insertRecordForm.addEventListener('submit', e => {
    let valid = true;

    e.preventDefault();

    document.querySelectorAll('.error-message').forEach(v => {
        v.remove();
    });

    let firstNameField = document.getElementById('first-name-input');
    if (firstNameField.value === '') {
        let firstNameErr = document.createElement('p');
        firstNameErr.innerHTML = 'First name field is required.';
        firstNameErr.setAttribute('class', 'error-message');
        firstNameErr.setAttribute('id', 'first-name-error');
        firstNameField.parentNode.insertBefore(firstNameErr, firstNameField.nextSibling);
        valid = false;
    }

    let lastNameField = document.getElementById('last-name-input');
    if (lastNameField.value === '') {
        let lastNameErr = document.createElement('p');
        lastNameErr.innerHTML = 'Last name field is required.';
        lastNameErr.setAttribute('class', 'error-message');
        lastNameErr.setAttribute('id', 'last-name-error');
        lastNameField.parentNode.insertBefore(lastNameErr, lastNameField.nextSibling);
        valid = false;
    }

    let phoneNumberField = document.getElementById('phone-number-input');
    if (!/^\+381\d{8,9}$/.test(phoneNumberField.value)) {
        let phoneNumberErr = document.createElement('p');
        phoneNumberErr.setAttribute('class', 'error-message');
        phoneNumberErr.setAttribute('id', 'phone-number-error');
        if (phoneNumberField.value === '') {
            phoneNumberErr.innerHTML = 'Phone number field is required'
        } else {
            phoneNumberField.value = '';
            phoneNumberErr.innerHTML = `Phone Number must be of format:<br>
            +318ccxxxx<br>where cc is two digit city code and xxxx is 6 or 7 digit phone number.`
        }
        phoneNumberField.parentNode.insertBefore(phoneNumberErr, phoneNumberField.nextSibling);
        valid = false;
    }

    if (valid) {
        e.target.submit();
    }

    return false;
});
