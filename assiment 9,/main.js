// 1. مصفوفة تخزين جهات الاتصال واسترجاعها من الـ LocalStorage
let contacts = JSON.parse(localStorage.getItem('contactsHubList')) || [];

// تشغيل النظام أول ما الصفحة تفتح
window.onload = function() {
    displayContacts(contacts);
};

// 2. دالة حفظ جهة الاتصال (سواء إضافة جديدة أو تعديل)
function saveContact() {
    let name = document.getElementById('nameInput').value.trim();
    let phone = document.getElementById('phoneInput').value.trim();
    let email = document.getElementById('emailInput').value.trim();
    let isFav = document.getElementById('favCheck').checked;
    let isEmergency = document.getElementById('emergencyCheck').checked;
    let index = document.getElementById('contactIndex').value;

    // التحقق من الحقول (Validation)
    if (name === '' || phone === '' || email === '') {
        Swal.fire('Error', 'Please fill in all required fields correctly.', 'error');
        return;
    }

    let contactData = { name, phone, email, isFav, isEmergency };

    if (index === '') {
        // إضافة جديدة
        contacts.push(contactData);
    } else {
        // تحديث وتعديل (Update)
        contacts[index] = contactData;
    }

    // حفظ في الـ LocalStorage
    localStorage.setItem('contactsHubList', JSON.stringify(contacts));

    // تحديث الشاشة وإغلاق النافذة المنبثقة
    displayContacts(contacts);
    let modalEl = document.getElementById('contactModal');
    let modalInstance = bootstrap.Modal.getInstance(modalEl);
    modalInstance.hide();

    // رسالة نجاح خفيفة وسريعة
    Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Contact saved successfully.',
        timer: 1200,
        showConfirmButton: false
    });
}

// 3. دالة عرض وتحديث جميع الأقسام والبطاقات على الشاشة
function displayContacts(list) {
    let container = document.getElementById('contactsList');
    let subText = document.getElementById('contactsSubText');
    
    // تحديث النص الإحصائي تحت عنوان All Contacts
    subText.innerText = `Manage and organize your ${contacts.length} contacts`;

    if (list.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="empty-state-box text-center py-5">
                    <div class="empty-icon mb-2">
                        <i class="fa-solid fa-address-book"></i>
                    </div>
                    <h5 class="fw-bold mb-1">No contacts found</h5>
                    <p class="text-muted small">Click "Add Contact" to get started</p>
                </div>
            </div>
        `;
        updateStats();
        updateSidebars();
        return;
    }

    let html = '';
    list.forEach((c, idx) => {
        html += `
            <div class="col-md-6">
                <div class="contact-card-item">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <h5 class="fw-bold mb-1" style="font-size: 1rem; color: #0f172a;">${c.name}</h5>
                            <p class="text-muted mb-1" style="font-size: 0.8rem;"><i class="fa-solid fa-phone me-1 text-primary"></i> ${c.phone}</p>
                            <p class="text-muted mb-0" style="font-size: 0.8rem;"><i class="fa-solid fa-envelope me-1 text-success"></i> ${c.email}</p>
                        </div>
                        <button class="btn btn-sm ${c.isFav ? 'btn-warning text-white' : 'btn-light text-secondary'}" onclick="toggleFav(${idx})" title="Favorite">
                            <i class="fa-solid fa-star"></i>
                        </button>
                    </div>
                    <div class="d-flex justify-content-between align-items-center pt-2 mt-2 border-top">
                        <div class="action-links">
                            <a href="tel:${c.phone}" class="btn btn-sm btn-outline-primary py-0 px-2" style="font-size: 0.75rem;"><i class="fa-solid fa-phone"></i> Call</a>
                            <a href="mailto:${c.email}" class="btn btn-sm btn-outline-success py-0 px-2 ms-1" style="font-size: 0.75rem;"><i class="fa-solid fa-envelope"></i> Email</a>
                        </div>
                        <div class="crud-buttons">
                            <button class="btn btn-sm btn-light text-info py-0 px-2" onclick="editContact(${idx})"><i class="fa-solid fa-pen"></i></button>
                            <button class="btn btn-sm btn-light text-danger py-0 px-2" onclick="deleteContact(${idx})"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
    updateStats();
    updateSidebars();
}

// 4. دالة حذف Contact باستخدام SweetAlert2 confirmation alert زي المطلوب بالحرف
function deleteContact(index) {
    Swal.fire({
        title: 'Are you sure?',
        text: "Do you really want to delete this contact?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            contacts.splice(index, 1);
            localStorage.setItem('contactsHubList', JSON.stringify(contacts));
            displayContacts(contacts);
            Swal.fire('Deleted!', 'Contact has been deleted.', 'success');
        }
    });
}

// 5. تعديل جهة اتصال
function editContact(index) {
    document.getElementById('contactIndex').value = index;
    document.getElementById('nameInput').value = contacts[index].name;
    document.getElementById('phoneInput').value = contacts[index].phone;
    document.getElementById('emailInput').value = contacts[index].email;
    document.getElementById('favCheck').checked = contacts[index].isFav;
    document.getElementById('emergencyCheck').checked = contacts[index].isEmergency;

    document.getElementById('modalTitle').innerText = 'Edit Contact';
    let modal = new bootstrap.Modal(document.getElementById('contactModal'));
    modal.show();
}

// 6. تصفير الفورم لإضافة اسم جديد
function resetForm() {
    document.getElementById('contactForm').reset();
    document.getElementById('contactIndex').value = '';
    document.getElementById('modalTitle').innerText = 'Add New Contact';
}

// 7. البحث الفوري (Search by Name, Phone, Email)
function searchContacts() {
    let query = document.getElementById('searchInput').value.toLowerCase();
    let filtered = contacts.filter(c => 
        c.name.toLowerCase().includes(query) || 
        c.phone.includes(query) || 
        c.email.toLowerCase().includes(query)
    );
    displayContacts(filtered);
}

// 8. تبديل حالة المفضلة
function toggleFav(index) {
    contacts[index].isFav = !contacts[index].isFav;
    localStorage.setItem('contactsHubList', JSON.stringify(contacts));
    displayContacts(contacts);
}

// 9. تحديث العدادات العلوية
function updateStats() {
    document.getElementById('totalCount').innerText = contacts.length;
    let favCount = contacts.filter(c => c.isFav).length;
    let emCount = contacts.filter(c => c.isEmergency).length;
    document.getElementById('favCount').innerText = favCount;
    document.getElementById('emergencyCount').innerText = emCount;
}

// 10. تحديث الـ Sidebar الجانبي (Favorites & Emergency widgets)
function updateSidebars() {
    let favContainer = document.getElementById('sidebarFavList');
    let emContainer = document.getElementById('sidebarEmergencyList');

    let favs = contacts.filter(c => c.isFav);
    let emergencies = contacts.filter(c => c.isEmergency);

    if (favs.length === 0) {
        favContainer.innerHTML = `<p class="text-muted small text-center py-2 mb-0">No favorites yet</p>`;
    } else {
        let favHtml = '';
        favs.forEach(c => {
            favHtml += `<div class="d-flex justify-content-between align-items-center py-1 border-bottom"><span class="fw-semibold small">${c.name}</span><a href="tel:${c.phone}" class="text-primary small"><i class="fa-solid fa-phone"></i></a></div>`;
        });
        favContainer.innerHTML = favHtml;
    }

    if (emergencies.length === 0) {
        emContainer.innerHTML = `<p class="text-muted small text-center py-2 mb-0">No emergency contacts</p>`;
    } else {
        let emHtml = '';
        emergencies.forEach(c => {
            emHtml += `<div class="d-flex justify-content-between align-items-center py-1 border-bottom"><span class="fw-semibold small text-danger">${c.name}</span><a href="tel:${c.phone}" class="text-danger small"><i class="fa-solid fa-phone"></i></a></div>`;
        });
        emContainer.innerHTML = emHtml;
    }
}