# gestion-inv-production
Gestion de la production et la gestion de l'inventaire Github
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Gestion de Production & Inventaire</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<style>
body { font-family: Arial, sans-serif; margin: 0; background:#f5f5f5; }
header { background:#1f3b70; color:#fff; padding:10px 20px; display:flex; justify-content:space-between; align-items:center; }
h1 { font-size:20px; margin:0; }
main { padding:20px; }
.section { background:#fff; border-radius:6px; padding:15px; margin-bottom:20px; box-shadow:0 1px 3px rgba(0,0,0,0.1); }
h2 { margin-top:0; color:#1f3b70; font-size:18px; }
input, select, button { padding:6px; margin:4px 2px; font-size:13px; }
table { border-collapse: collapse; width: 100%; margin-top: 10px; font-size:13px; }
th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
th { background: #f0f0f0; }
.flex { display:flex; flex-wrap:wrap; gap:10px; }
.card { background:#fff; padding:10px; border-radius:6px; box-shadow:0 1px 3px rgba(0,0,0,0.1); min-width:150px; }
#loginScreen { display:flex; justify-content:center; align-items:center; height:100vh; background:#1f3b70; color:#fff; }
#loginBox { background:#fff; color:#000; padding:20px; border-radius:8px; width:300px; box-shadow:0 2px 6px rgba(0,0,0,0.3); }
#app { display:none; }
button { cursor:pointer; }
button.primary { background:#1f3b70; color:#fff; border:none; border-radius:4px; }
button.danger { background:#b3261e; color:#fff; border:none; border-radius:4px; }
.small { font-size:12px; color:#555; }
</style>
</head>
<body>

<!-- LOGIN -->
<div id="loginScreen">
  <div id="loginBox">
    <h2>Connexion</h2>
    <p class="small">Premier usage : définis un mot de passe admin.</p>
    <input id="login_password" type="password" placeholder="Mot de passe"><br>
    <button class="primary" onclick="login()">Se connecter</button>
    <p id="login_msg" class="small"></p>
  </div>
</div>

<!-- APP -->
<div id="app">
<header>
  <h1>Gestion de Production & Inventaire</h1>
  <div>
    <button onclick="exportPDF()" class="primary">Exporter PDF</button>
    <button onclick="logout()" class="danger">Déconnexion</button>
  </div>
</header>

<main>

<!-- DASHBOARD -->
<div class="section">
  <h2>Tableau de bord</h2>
  <div class="flex">
    <div class="card">
      <div class="small">Valeur inventaire matières</div>
      <div id="db_val_mp"><b>0</b> $</div>
    </div>
    <div class="card">
      <div class="small">Valeur inventaire produits</div>
      <div id="db_val_pf"><b>0</b> $</div>
    </div>
    <div class="card">
      <div class="small">Productions totales</div>
      <div id="db_prod_total"><b>0</b> unités</div>
    </div>
    <div class="card">
      <div class="small">Alertes stock bas</div>
      <div id="db_alerts"><b>0</b> articles</div>
    </div>
  </div>
  <canvas id="chartStocks" height="80"></canvas>
</div>

<!-- FOURNISSEURS -->
<div class="section">
  <h2>Fournisseurs</h2>
  <input id="f_nom" placeholder="Nom fournisseur">
  <input id="f_contact" placeholder="Contact">
  <button onclick="ajouterFournisseur()" class="primary">Ajouter</button>
  <table id="table_f">
    <tr><th>Nom</th><th>Contact</th></tr>
  </table>
</div>

<!-- MATIÈRES PREMIÈRES -->
<div class="section">
<h2>Matières premières</h2>
<input id="mp_nom" placeholder="Nom matière">
<input id="mp_stock" type="number" placeholder="Stock initial">
<input id="mp_min" type="number" placeholder="Stock minimum">
<input id="mp_cout" type="number" placeholder="Coût/unité">
<select id="mp_fournisseur"></select>
<button onclick="ajouterMP()" class="primary">Ajouter</button>

<table id="table_mp">
<tr><th>Nom</th><th>Stock</th><th>Min</th><th>Coût</th><th>Fournisseur</th></tr>
</table>
</div>

<!-- PRODUITS FINIS -->
<div class="section">
<h2>Produits finis</h2>
<input id="pf_nom" placeholder="Nom produit">
<input id="pf_stock" type="number" placeholder="Stock initial">
<input id="pf_min" type="number" placeholder="Stock minimum">
<input id="pf_prix" type="number" placeholder="Prix de vente (optionnel)">
<button onclick="ajouterPF()" class="primary">Ajouter</button>

<table id="table_pf">
<tr><th>Nom</th><th>Stock</th><th>Min</th><th>Coût estimé</th></tr>
</table>
</div>

<!-- BOM -->
<div class="section">
<h2>Nomenclature (BOM)</h2>
<select id="bom_produit"></select>
<select id="bom_matiere"></select>
<input id="bom_qte" type="number" placeholder="Quantité requise">
<button onclick="ajouterBOM()" class="primary">Ajouter</button>

<table id="table_bom">
<tr><th>Produit</th><th>Matière</th><th>Quantité</th></tr>
</table>
</div>

<!-- ORDRES DE PRODUCTION -->
<div class="section">
<h2>Ordres de production</h2>
<select id="op_produit"></select>
<input id="op_qte" type="number" placeholder="Quantité à produire">
<input id="op_lot" placeholder="Numéro de lot (auto si vide)">
<button onclick="produire()" class="primary">Produire</button>
<p id="op_message" class="small"></p>

<table id="table_op">
<tr><th>Produit</th><th>Quantité</th><th>Lot</th><th>Coût matières</th><th>Date</th></tr>
</table>
</div>

</main>
</div>

<script>
// ====== DONNÉES ======
let data = {
  fournisseurs: [],
  mp: [],
  pf: [],
  bom: [],
  op: []
};

let chartStocks = null;

// ====== LOGIN ======
function login() {
  const passInput = document.getElementById('login_password');
  const msg = document.getElementById('login_msg');
  const stored = localStorage.getItem('app_pass');

  if (!stored) {
    // premier mot de passe
    if (!passInput.value) {
      msg.textContent = "Définis un mot de passe.";
      return;
    }
    localStorage.setItem('app_pass', passInput.value);
    msg.textContent = "Mot de passe créé. Connexion...";
    showApp();
  } else {
    if (passInput.value === stored) {
      showApp();
    } else {
      msg.textContent = "Mot de passe incorrect.";
    }
  }
}

function showApp() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('app').style.display = 'block';
  chargerDonnees();
  refreshAll();
}

function logout() {
  document.getElementById('app').style.display = 'none';
  document.getElementById('loginScreen').style.display = 'flex';
}

// ====== SAUVEGARDE ======
function sauvegarder() {
  localStorage.setItem('app_data', JSON.stringify(data));
}

function chargerDonnees() {
  const raw = localStorage.getItem('app_data');
  if (raw) {
    data = JSON.parse(raw);
  }
}

// ====== FOURNISSEURS ======
function ajouterFournisseur() {
  const nom = f_nom.value.trim();
  const contact = f_contact.value.trim();
  if (!nom) return;
  data.fournisseurs.push({ nom, contact });
  f_nom.value = ""; f_contact.value = "";
  refreshAll();
  sauvegarder();
}

function refreshFournisseurs() {
  const t = document.getElementById('table_f');
  t.innerHTML = "<tr><th>Nom</th><th>Contact</th></tr>";
  data.fournisseurs.forEach(f => {
    t.innerHTML += `<tr><td>${f.nom}</td><td>${f.contact}</td></tr>`;
  });

  const sel = document.getElementById('mp_fournisseur');
  sel.innerHTML = "<option value=''>Fournisseur</option>";
  data.fournisseurs.forEach(f => {
    sel.innerHTML += `<option>${f.nom}</option>`;
  });
}

// ====== MATIÈRES PREMIÈRES ======
function ajouterMP() {
  const nom = mp_nom.value.trim();
  if (!nom) return;
  data.mp.push({
    nom,
    stock: Number(mp_stock.value) || 0,
    min: Number(mp_min.value) || 0,
    cout: Number(mp_cout.value) || 0,
    fournisseur: mp_fournisseur.value || ""
  });
  mp_nom.value = ""; mp_stock.value = ""; mp_min.value = ""; mp_cout.value = "";
  refreshAll();
  sauvegarder();
}

function refreshMP() {
  const t = document.getElementById('table_mp');
  t.innerHTML = "<tr><th>Nom</th><th>Stock</th><th>Min</th><th>Coût</th><th>Fournisseur</th></tr>";
  data.mp.forEach(m => {
    t.innerHTML += `<tr>
      <td>${m.nom}</td>
      <td>${m.stock}</td>
      <td>${m.min}</td>
      <td>${m.cout.toFixed(2)} $</td>
      <td>${m.fournisseur}</td>
    </tr>`;
  });
}

// ====== PRODUITS FINIS ======
function ajouterPF() {
  const nom = pf_nom.value.trim();
  if (!nom) return;
  data.pf.push({
    nom,
    stock: Number(pf_stock.value) || 0,
    min: Number(pf_min.value) || 0,
    cout: 0,
    prix: Number(pf_prix.value) || 0
  });
  pf_nom.value = ""; pf_stock.value = ""; pf_min.value = ""; pf_prix.value = "";
  refreshAll();
  sauvegarder();
}

function refreshPF() {
  const t = document.getElementById('table_pf');
  t.innerHTML = "<tr><th>Nom</th><th>Stock</th><th>Min</th><th>Coût estimé</th></tr>";
  data.pf.forEach(p => {
    t.innerHTML += `<tr>
      <td>${p.nom}</td>
      <td>${p.stock}</td>
      <td>${p.min}</td>
      <td>${p.cout.toFixed(2)} $</td>
    </tr>`;
  });
}

// ====== BOM ======
function ajouterBOM() {
  if (!bom_produit.value || !bom_matiere.value) return;
  data.bom.push({
    produit: bom_produit.value,
    matiere: bom_matiere.value,
    qte: Number(bom_qte.value) || 0
  });
  bom_qte.value = "";
  refreshAll();
  sauvegarder();
}

function refreshBOM() {
  const t = document.getElementById('table_bom');
  t.innerHTML = "<tr><th>Produit</th><th>Matière</th><th>Quantité</th></tr>";
  data.bom.forEach(b => {
    t.innerHTML += `<tr>
      <td>${b.produit}</td>
      <td>${b.matiere}</td>
      <td>${b.qte}</td>
    </tr>`;
  });

  const dp = document.getElementById('bom_produit');
  const dop = document.getElementById('op_produit');
  const dm = document.getElementById('bom_matiere');

  dp.innerHTML = "";
  dop.innerHTML = "";
  data.pf.forEach(p => {
    dp.innerHTML += `<option>${p.nom}</option>`;
    dop.innerHTML += `<option>${p.nom}</option>`;
  });

  dm.innerHTML = "";
  data.mp.forEach(m => {
    dm.innerHTML += `<option>${m.nom}</option>`;
  });
}

// ====== ORDRES DE PRODUCTION / LOTS / COÛTS ======
function produire() {
  const produitNom = op_produit.value;
  const qte = Number(op_qte.value) || 0;
  if (!produitNom || qte <= 0) return;

  const lot = op_lot.value.trim() || ("LOT-" + Date.now());
  const besoins = data.bom.filter(b => b.produit === produitNom);

  // Vérifier stock
  for (let b of besoins) {
    const mat = data.mp.find(m => m.nom === b.matiere);
    if (!mat || mat.stock < b.qte * qte) {
      op_message.textContent = "Stock insuffisant pour " + b.matiere;
      return;
    }
  }

  // Déduire matières + calcul coût
  let coutTotal = 0;
  besoins.forEach(b => {
    const mat = data.mp.find(m => m.nom === b.matiere);
    const conso = b.qte * qte;
    mat.stock -= conso;
    coutTotal += conso * (mat.cout || 0);
  });

  // Ajouter produits
  const prod = data.pf.find(p => p.nom === produitNom);
  if (prod) {
    prod.stock += qte;
    // coût moyen
    const totalVal = prod.cout * (prod.stock - qte) + coutTotal;
    prod.cout = totalVal / prod.stock;
  }

  // Enregistrer OP
  data.op.push({
    produit: produitNom,
    qte,
    lot,
    cout: coutTotal,
    date: new Date().toLocaleString()
  });

  op_message.textContent = "Production effectuée. Lot : " + lot;
  op_qte.value = ""; op_lot.value = "";
  refreshAll();
  sauvegarder();
}

function refreshOP() {
  const t = document.getElementById('table_op');
  t.innerHTML = "<tr><th>Produit</th><th>Quantité</th><th>Lot</th><th>Coût matières</th><th>Date</th></tr>";
  data.op.forEach(o => {
    t.innerHTML += `<tr>
      <td>${o.produit}</td>
      <td>${o.qte}</td>
      <td>${o.lot}</td>
      <td>${o.cout.toFixed(2)} $</td>
      <td>${o.date}</td>
    </tr>`;
  });
}

// ====== DASHBOARD & GRAPHIQUES ======
function refreshDashboard() {
  // valeur inventaire matières
  let valMP = 0;
  data.mp.forEach(m => valMP += m.stock * (m.cout || 0));
  document.getElementById('db_val_mp').innerHTML = `<b>${valMP.toFixed(2)}</b> $`;

  // valeur inventaire produits
  let valPF = 0;
  data.pf.forEach(p => valPF += p.stock * (p.cout || 0));
  document.getElementById('db_val_pf').innerHTML = `<b>${valPF.toFixed(2)}</b> $`;

  // productions totales
  let prodTotal = 0;
  data.op.forEach(o => prodTotal += o.qte);
  document.getElementById('db_prod_total').innerHTML = `<b>${prodTotal}</b> unités`;

  // alertes stock bas
  let alerts = 0;
  data.mp.forEach(m => { if (m.stock < m.min) alerts++; });
  data.pf.forEach(p => { if (p.stock < p.min) alerts++; });
  document.getElementById('db_alerts').innerHTML = `<b>${alerts}</b> articles`;

  // graphique stocks matières
  const ctx = document.getElementById('chartStocks').getContext('2d');
  const labels = data.mp.map(m => m.nom);
  const values = data.mp.map(m => m.stock);

  if (chartStocks) chartStocks.destroy();
  chartStocks = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Stock matières',
        data: values,
        backgroundColor: '#1f3b70'
      }]
    },
    options: { responsive:true, plugins:{legend:{display:false}} }
  });
}

// ====== EXPORT PDF ======
function exportPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(14);
  doc.text("Rapport Production & Inventaire", 10, 10);

  doc.setFontSize(10);
  doc.text("Valeur inventaire matières : " + document.getElementById('db_val_mp').innerText, 10, 20);
  doc.text("Valeur inventaire produits : " + document.getElementById('db_val_pf').innerText, 10, 26);
  doc.text("Productions totales : " + document.getElementById('db_prod_total').innerText, 10, 32);
  doc.text("Alertes stock bas : " + document.getElementById('db_alerts').innerText, 10, 38);

  doc.text("Derniers ordres de production :", 10, 50);
  let y = 56;
  data.op.slice(-10).forEach(o => {
    doc.text(`${o.date} - ${o.produit} - Qté: ${o.qte} - Lot: ${o.lot} - Coût: ${o.cout.toFixed(2)} $`, 10, y);
    y += 6;
  });

  doc.save("rapport_production_inventaire.pdf");
}

// ====== REFRESH GLOBAL ======
function refreshAll() {
  refreshFournisseurs();
  refreshMP();
  refreshPF();
  refreshBOM();
  refreshOP();
  refreshDashboard();
}
</script>

</body>
</html>****
