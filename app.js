let items = [];

function toggleOrderType() {
    const orderType = document.querySelector('input[name="orderType"]:checked').value;
    const deliveryFields = document.getElementById('deliveryFields');
    
    if (orderType === 'delivery') {
        deliveryFields.style.display = 'block';
    } else {
        deliveryFields.style.display = 'none';
        document.getElementById('deliveryAddress').value = '';
        document.getElementById('deliveryCharges').value = '0.00';
    }
    updateTable();
}

function addItem() {
    const name = document.getElementById('itemName').value.trim();
    const qty = parseInt(document.getElementById('itemQty').value);
    const price = parseFloat(document.getElementById('itemPrice').value);

    if (name && qty > 0 && price > 0) {
        items.push({ name, qty, price, total: qty * price });
        document.getElementById('itemName').value = '';
        document.getElementById('itemQty').value = '';
        document.getElementById('itemPrice').value = '';
        updateTable();
    } else {
        alert('Please fill out all item fields with valid entries.');
    }
}

function updateTable() {
    const tbody = document.querySelector('#previewTable tbody');
    tbody.innerHTML = '';
    let grandTotal = 0;

    items.forEach((item, index) => {
        grandTotal += item.total;
        const row = `<tr>
            <td>${index + 1}</td>
            <td>${item.name}</td>
            <td>${item.qty}</td>
            <td>Rs. ${item.total.toFixed(2)}</td>
        </tr>`;
        tbody.innerHTML += row;
    });

    // Check if delivery charges apply
    const orderType = document.querySelector('input[name="orderType"]:checked').value;
    if (orderType === 'delivery') {
        const deliveryCharges = parseFloat(document.getElementById('deliveryCharges').value) || 0;
        grandTotal += deliveryCharges;
    }

    document.getElementById('grandTotalText').innerText = grandTotal.toFixed(2);
}

// --- SECURE PRODUCTION RECEIPT SHARING ENGINE ---
function generateReceiptImage() {
    const customer = document.getElementById('customerName').value.trim();
    if (!customer) { alert('Please enter a customer name first.'); return; }
    if (items.length === 0) { alert('Please add at least one item.'); return; }

    const orderType = document.querySelector('input[name="orderType"]:checked').value;
    const deliveryAddress = document.getElementById('deliveryAddress').value.trim();
    const deliveryCharges = parseFloat(document.getElementById('deliveryCharges').value) || 0;

    if (orderType === 'delivery' && !deliveryAddress) {
        alert('Please enter a delivery address.');
        return;
    }

    const now = new Date();
    document.getElementById('recDate').innerText = "DATE: " + now.toISOString().split('T')[0];
    document.getElementById('recTime').innerText = "TIME: " + now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}).toUpperCase();
    document.getElementById('recCustomer').innerText = "CUSTOMER: " + customer.toUpperCase();
    
    // Update Receipt Order Type details
    document.getElementById('recOrderType').innerText = "ORDER TYPE: " + orderType.toUpperCase();
    
    const recAddressDiv = document.getElementById('recAddress');
    const recDeliveryRowDiv = document.getElementById('recDeliveryRow');

    if (orderType === 'delivery') {
        recAddressDiv.innerText = "ADDRESS: " + deliveryAddress.toUpperCase();
        recAddressDiv.style.display = 'block';
        
        document.getElementById('recDeliveryFee').innerText = deliveryCharges.toFixed(2);
        recDeliveryRowDiv.style.display = 'block';
    } else {
        recAddressDiv.style.display = 'none';
        recDeliveryRowDiv.style.display = 'none';
    }

    document.getElementById('recGrandTotal').innerText = document.getElementById('grandTotalText').innerText;

    const receiptItemsBody = document.getElementById('receiptItemsBody');
    receiptItemsBody.innerHTML = '';
    
    items.forEach((item, index) => {
        const row = `<tr>
            <td>${index + 1}</td>
            <td>${item.name.toUpperCase()}</td>
            <td class="text-center">${item.qty}</td>
            <td class="text-right">Rs. ${item.total.toFixed(2)}</td>
        </tr>`;
        receiptItemsBody.innerHTML += row;
    });

    setTimeout(() => {
        const target = document.getElementById('thermalReceipt');
        
        if (typeof html2canvas === 'undefined') {
            alert("html2canvas engine missing.");
            return;
        }

        html2canvas(target, { scale: 3, logging: false, useCORS: true }).then(async canvas => {
            
            canvas.toBlob(async (blob) => {
                if (!blob) { return; }

                const file = new File([blob], `receipt_${Date.now()}.png`, { type: 'image/png' });

                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    try {
                        await navigator.share({
                            files: [file],
                            title: 'NOORHUB Receipt',
                            text: 'Open receipt with iPrint App'
                        });
                    } catch (error) {
                        console.log('Share drawer operation canceled.');
                    }
                } else {
                    const link = document.createElement('a');
                    link.download = `receipt_${Date.now()}.png`;
                    link.href = canvas.toDataURL("image/png");
                    link.click();
                }
            }, 'image/png');

        });
    }, 200);
}