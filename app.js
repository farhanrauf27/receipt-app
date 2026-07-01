let items = [];

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
            <td>$${item.total.toFixed(2)}</td>
        </tr>`;
        tbody.innerHTML += row;
    });

    document.getElementById('grandTotalText').innerText = grandTotal.toFixed(2);
}

// --- SECURE PRODUCTION RECEIPT SHARING ENGINE ---
function generateReceiptImage() {
    const customer = document.getElementById('customerName').value.trim();
    if (!customer) { alert('Please enter a customer name first.'); return; }
    if (items.length === 0) { alert('Please add at least one item.'); return; }

    const now = new Date();
    document.getElementById('recDate').innerText = "Date: " + now.toISOString().split('T')[0];
    document.getElementById('recTime').innerText = "Time: " + now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    document.getElementById('recCustomer').innerText = "Customer: " + customer;
    document.getElementById('recGrandTotal').innerText = document.getElementById('grandTotalText').innerText;

    const receiptItemsBody = document.getElementById('receiptItemsBody');
    receiptItemsBody.innerHTML = '';
    
    items.forEach((item, index) => {
        const row = `<tr>
            <td>${index + 1}</td>
            <td>${item.name}</td>
            <td class="text-center">${item.qty}</td>
            <td class="text-right">$${item.total.toFixed(2)}</td>
        </tr>`;
        receiptItemsBody.innerHTML += row;
    });

    setTimeout(() => {
        const target = document.getElementById('thermalReceipt');
        
        if (typeof html2canvas === 'undefined') {
            alert("html2canvas engine missing.");
            return;
        }

        // Render high-quality resolution layout for thermal printing
        html2canvas(target, { scale: 3 }).then(async canvas => {
            
            // Convert output to file blob container structure
            canvas.toBlob(async (blob) => {
                if (!blob) { return; }

                const file = new File([blob], `receipt_${Date.now()}.png`, { type: 'image/png' });

                // Check if browser native sharing is unlocked by Vercel's HTTPS
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    try {
                        // Kicks open the system sharing pane instantly
                        await navigator.share({
                            files: [file],
                            title: 'Business Receipt',
                            text: 'Open receipt with iPrint App'
                        });
                    } catch (error) {
                        console.log('Share window closed by user.');
                    }
                } else {
                    // Fail-safe backup download option
                    const link = document.createElement('a');
                    link.download = `receipt_${Date.now()}.png`;
                    link.href = canvas.toDataURL("image/png");
                    link.click();
                }
            }, 'image/png');

        });
    }, 200);
}