const $ = (sel) => document.querySelector(sel);

async function api(path, init) {
  const res = await fetch(path, init);
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json();
}

async function loadInventory() {
  const products = await api('/admin/api/products');
  const tbody = $('#inventory tbody');
  tbody.innerHTML = '';

  for (const p of products) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${p.name}</td>
      <td>$${p.price.toFixed(2)}</td>
      <td><input type="number" min="0" value="${p.stock}" data-id="${p.id}" /></td>
      <td><button data-save="${p.id}">Save</button></td>
    `;
    tbody.appendChild(tr);
  }

  tbody.querySelectorAll('[data-save]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.save;
      const input = tbody.querySelector(`input[data-id="${id}"]`);
      btn.disabled = true;
      try {
        await api(`/admin/api/products/${id}/stock`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stock: Number(input.value) }),
        });
        btn.textContent = 'Saved';
        setTimeout(() => { btn.textContent = 'Save'; btn.disabled = false; }, 1200);
      } catch (err) {
        alert(String(err));
        btn.disabled = false;
      }
    });
  });
}

async function loadOrders() {
  const orders = await api('/admin/api/orders');
  const tbody = $('#orders tbody');
  tbody.innerHTML = orders
    .map((o) => `
      <tr>
        <td>${o.id}</td>
        <td>${o.customer}</td>
        <td>${o.items.map((i) => `#${i.productId} ×${i.quantity}`).join(', ')}</td>
        <td>$${o.total.toFixed(2)}</td>
        <td>${o.status}</td>
      </tr>`)
    .join('') || '<tr><td colspan="5">No orders yet</td></tr>';
}

async function refresh() {
  try {
    await Promise.all([loadInventory(), loadOrders()]);
  } catch (err) {
    alert(`Failed to load data: ${err}`);
  }
}

$('#refresh').addEventListener('click', refresh);

$('#search-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const q = $('#search-input').value;
  try {
    const data = await api(`/admin/api/search?q=${encodeURIComponent(q)}`);
    $('#search-output').textContent = JSON.stringify(data.results, null, 2);
  } catch (err) {
    $('#search-output').textContent = String(err);
  }
});

refresh();
