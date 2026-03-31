/* --------------------------------------------------------- */
/*  DONNÉES ET SAUVEGARDE LOCALE */
/* --------------------------------------------------------- */

const inventaire = {
    tissu: [],
    patch: [],
    flasher: [],
    bouton: [],
    rivet: [],
    etiquette: []
};

const projets = [];
const mouvements = [];
const modeles = [];

function saveAll() {
    localStorage.setItem("inventaire", JSON.stringify(inventaire));
    localStorage.setItem("projets", JSON.stringify(projets));
    localStorage.setItem("mouvements", JSON.stringify(mouvements));
    localStorage.setItem("modeles", JSON.stringify(modeles));
}

function loadAll() {
    const inv = localStorage.getItem("inventaire");
    const proj = localStorage.getItem("projets");
    const mouv = localStorage.getItem("mouvements");
    const mod = localStorage.getItem("modeles");

    if (inv) Object.assign(inventaire, JSON.parse(inv));
    if (proj) projets.push(...JSON.parse(proj));
    if (mouv) mouvements.push(...JSON.parse(mouv));
    if (mod) modeles.push(...JSON.parse(mod));
}

loadAll();

/* --------------------------------------------------------- */
/*  NAVIGATION ENTRE LES SECTIONS */
/* --------------------------------------------------------- */

const buttons = document.querySelectorAll("nav button");
const tabs = document.querySelectorAll(".tab");

buttons.forEach(btn => {
    btn.addEventListener("click", () => {
        tabs.forEach(t => t.style.display = "none");
        document.getElementById(btn.dataset.tab).style.display = "block";

        if (btn.dataset.tab === "dashboard") renderDashboard();
        if (btn.dataset.tab === "mouvements") renderMouvements();
        if (btn.dataset.tab === "projets") renderProjectList();
        if (btn.dataset.tab === "modeles") renderModeles();
    });
});

// Section par défaut
document.getElementById("dashboard").style.display = "block";

/* --------------------------------------------------------- */
/*  COULEURS DE STOCK */
/* --------------------------------------------------------- */

function getColorClass(q, min) {
    if (q <= min) return "stock-low";
    if (q <= min * 1.5) return "stock-warning";
    return "stock-ok";
}

/* --------------------------------------------------------- */
/*  AFFICHAGE DES CARTES */
/* --------------------------------------------------------- */

function renderCards(type) {
    const container = document.getElementById("cards-" + type);
    if (!container) return;
    container.innerHTML = "";

    let list = [...inventaire[type]];

    const actifFilter = document.getElementById("filter-actif-" + type)?.value;
    if (actifFilter === "active") list = list.filter(i => i.actif);
    if (actifFilter === "inactive") list = list.filter(i => !i.actif);

    const stockFilter = document.getElementById("filter-stock-" + type)?.value;
    if (stockFilter === "low") list = list.filter(i => i.quantite <= i.min);

    const search = document.getElementById("filter-search-" + type)?.value?.toLowerCase();
    if (search) list = list.filter(i => i.code.toLowerCase().includes(search));

    list.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "card " + getColorClass(item.quantite, item.min);

        div.innerHTML = `
            <h3>${item.code}</h3>
            <div class="info"><strong>Info 1 :</strong> ${item.extra1 || ""}</div>
            <div class="info"><strong>Info 2 :</strong> ${item.extra2 || ""}</div>
            <div class="info"><strong>Quantité :</strong> ${item.quantite} ${item.unite}</div>
            <div class="info"><strong>Stock min :</strong> ${item.min}</div>
            <div class="info"><strong>Actif :</strong> ${item.actif ? "Oui" : "Non"}</div>

            <div class="actions">
                <button class="edit" onclick="openEditForm('${type}', ${index})">Modifier</button>
                <button class="inactive" onclick="toggleActive('${type}', ${index})">
                    ${item.actif ? "Désactiver" : "Activer"}
                </button>
                <button onclick="openReceiveForm('${type}', ${index})">Recevoir</button>
                <button onclick="openShipForm('${type}', ${index})">Expédier</button>
                <button onclick="openCorrectForm('${type}', ${index})">Corriger</button>
            </div>
        `;

        container.appendChild(div);
    });
}

/* --------------------------------------------------------- */
/*  FILTRES */
/* --------------------------------------------------------- */

function applyFilters(type) {
    renderCards(type);
}

/* --------------------------------------------------------- */
/*  AJOUT D’ARTICLE */
/* --------------------------------------------------------- */

let currentType = null;

function openAddForm(type) {
    currentType = type;

    const form = document.getElementById("addForm");
    form.innerHTML = `
        <div class="modal-content">
            <h2>Ajouter un article (${type})</h2>

            <label>Code</label>
            <input id="add-code">

            <label>Info 1</label>
            <input id="add-extra1">

            <label>Info 2</label>
            <input id="add-extra2">

            <label>Quantité</label>
            <input type="number" id="add-quantite">

            <label>Unité</label>
            <select id="add-unite">
                <option value="m">m</option>
                <option value="yds">yds</option>
                <option value="pcs">pcs</option>
            </select>

            <label>Stock minimum</label>
            <input type="number" id="add-min">

            <label>Actif</label>
            <select id="add-actif">
                <option value="true">Oui</option>
                <option value="false">Non</option>
            </select>

            <div class="form-actions">
                <button onclick="saveItem()">Enregistrer</button>
                <button onclick="closeAddForm()">Annuler</button>
            </div>
        </div>
    `;

    form.style.display = "flex";
}

function closeAddForm() {
    document.getElementById("addForm").style.display = "none";
}

function saveItem() {
    inventaire[currentType].push({
        code: document.getElementById("add-code").value,
        extra1: document.getElementById("add-extra1").value,
        extra2: document.getElementById("add-extra2").value,
        quantite: Number(document.getElementById("add-quantite").value),
        unite: document.getElementById("add-unite").value,
        min: Number(document.getElementById("add-min").value),
        actif: document.getElementById("add-actif").value === "true"
    });

    renderCards(currentType);
    renderDashboard();
    saveAll();
    closeAddForm();
}

/* --------------------------------------------------------- */
/*  MODIFICATION D’ARTICLE */
/* --------------------------------------------------------- */

let editType = null;
let editIndex = null;

function openEditForm(type, index) {
    editType = type;
    editIndex = index;

    const item = inventaire[type][index];

    const form = document.getElementById("editForm");
    form.innerHTML = `
        <div class="modal-content">
            <h2>Modifier un article (${type})</h2>

            <label>Code</label>
            <input id="edit-code" value="${item.code}">

            <label>Info 1</label>
            <input id="edit-extra1" value="${item.extra1 || ""}">

            <label>Info 2</label>
            <input id="edit-extra2" value="${item.extra2 || ""}">

            <label>Quantité</label>
            <input type="number" id="edit-quantite" value="${item.quantite}">

            <label>Unité</label>
            <select id="edit-unite">
                <option value="m">m</option>
                <option value="yds">yds</option>
                <option value="pcs">pcs</option>
            </select>

            <label>Stock minimum</label>
            <input type="number" id="edit-min" value="${item.min}">

            <label>Actif</label>
            <select id="edit-actif">
                <option value="true">Oui</option>
                <option value="false">Non</option>
            </select>

            <div class="form-actions">
                <button onclick="saveEdit()">Enregistrer</button>
                <button onclick="closeEditForm()">Annuler</button>
            </div>
        </div>
    `;

    document.getElementById("edit-unite").value = item.unite;
    document.getElementById("edit-actif").value = item.actif ? "true" : "false";

    form.style.display = "flex";
}

function closeEditForm() {
    document.getElementById("editForm").style.display = "none";
}

function saveEdit() {
    const item = inventaire[editType][editIndex];

    item.code = document.getElementById("edit-code").value;
    item.extra1 = document.getElementById("edit-extra1").value;
    item.extra2 = document.getElementById("edit-extra2").value;
    item.quantite = Number(document.getElementById("edit-quantite").value);
    item.unite = document.getElementById("edit-unite").value;
    item.min = Number(document.getElementById("edit-min").value);
    item.actif = document.getElementById("edit-actif").value === "true";

    renderCards(editType);
    renderDashboard();
    saveAll();
    closeEditForm();
}

/* --------------------------------------------------------- */
/*  ACTIVER / DÉSACTIVER */
/* --------------------------------------------------------- */

function toggleActive(type, index) {
    inventaire[type][index].actif = !inventaire[type][index].actif;
    renderCards(type);
    renderDashboard();
    saveAll();
}

/* --------------------------------------------------------- */
/*  RECEVOIR / EXPÉDIER / CORRIGER */
/* --------------------------------------------------------- */

function openReceiveForm(type, index) {
    const item = inventaire[type][index];
    const qty = prompt(`Quantité à RECEVOIR pour ${item.code} :`);
    if (!qty) return;

    item.quantite += Number(qty);

    addMouvement("entrée", type, item.code, Number(qty), "Réception", "");
    renderCards(type);
    renderDashboard();
    saveAll();
}

function openShipForm(type, index) {
    const item = inventaire[type][index];
    const qty = prompt(`Quantité à EXPÉDIER pour ${item.code} :`);
    if (!qty) return;

    item.quantite -= Number(qty);

    addMouvement("sortie", type, item.code, Number(qty), "Expédition", "");
    renderCards(type);
    renderDashboard();
    saveAll();
}

function openCorrectForm(type, index) {
    const item = inventaire[type][index];
    const qty = prompt(`Nouvelle quantité pour ${item.code} :`);
    if (qty === null) return;

    const diff = Number(qty) - item.quantite;
    item.quantite = Number(qty);

    addMouvement(diff > 0 ? "entrée" : "sortie", type, item.code, Math.abs(diff), "Correction", "");
    renderCards(type);
    renderDashboard();
    saveAll();
}

/* --------------------------------------------------------- */
/*  MOUVEMENTS */
/* --------------------------------------------------------- */

function addMouvement(type, categorie, code, quantite, raison, commentaire = "") {
    mouvements.push({
        date: new Date().toLocaleString(),
        type,
        categorie,
        article: code,
        quantite,
        raison,
        commentaire
    });

    renderMouvements();
    saveAll();
}

function renderMouvements() {
    const div = document.getElementById("mouvements-list");
    if (!div) return;
    div.innerHTML = "";

    mouvements.slice().reverse().forEach(m => {
        div.innerHTML += `
            <div class="card">
                <h3>${m.type.toUpperCase()}</h3>
                <div class="info"><strong>Date :</strong> ${m.date}</div>
                <div class="info"><strong>Article :</strong> ${m.article}</div>
                <div class="info"><strong>Catégorie :</strong> ${m.categorie}</div>
                <div class="info"><strong>Quantité :</strong> ${m.quantite}</div>
                <div class="info"><strong>Raison :</strong> ${m.raison}</div>
                <div class="info"><strong>Commentaire :</strong> ${m.commentaire}</div>
            </div>
        `;
    });
}

/* --------------------------------------------------------- */
/*  PROJETS */
/* --------------------------------------------------------- */

function openProjectForm() {
    const form = document.getElementById("projectForm");

    form.innerHTML = `
        <div class="modal-content">
            <h2>Nouveau projet</h2>

            <label>Client</label>
            <input id="proj-client">

            <label>Lot</label>
            <input id="proj-lot">

            <label>Modèle</label>
            <select id="proj-modele"></select>

            <label>Tissu</label>
            <select id="proj-tissu"></select>

            <label>Patch</label>
            <select id="proj-patch"></select>

            <label>Flasher</label>
            <select id="proj-flasher"></select>

            <label>Bouton</label>
            <select id="proj-bouton"></select>

            <label>Rivet</label>
            <select id="proj-rivet"></select>

            <label>Étiquette</label>
            <select id="proj-etiquette"></select>

            <label>Quantité de pièces</label>
            <input type="number" id="proj-qty" value="1">

            <div class="form-actions">
                <button onclick="saveProject()">Créer</button>
                <button onclick="closeProjectForm()">Annuler</button>
            </div>
        </div>
    `;

    fillSelect("proj-modele", modeles);
    fillSelect("proj-tissu", inventaire.tissu);
    fillSelect("proj-patch", inventaire.patch);
    fillSelect("proj-flasher", inventaire.flasher);
    fillSelect("proj-bouton", inventaire.bouton);
    fillSelect("proj-rivet", inventaire.rivet);
    fillSelect("proj-etiquette", inventaire.etiquette);

    form.style.display = "flex";
}

function closeProjectForm() {
    document.getElementById("projectForm").style.display = "none";
}

function fillSelect(id, list) {
    const sel = document.getElementById(id);
    sel.innerHTML = "";
    list.forEach(item => {
        const opt = document.createElement("option");
        opt.value = item.code;
        opt.textContent = item.code;
        sel.appendChild(opt);
    });
}

function saveProject() {
    const p = {
        id: Date.now(),
        client: document.getElementById("proj-client").value,
        lot: document.getElementById("proj-lot").value,
        modele: document.getElementById("proj-modele").value,
        tissu: document.getElementById("proj-tissu").value,
        patch: document.getElementById("proj-patch").value,
        flasher: document.getElementById("proj-flasher").value,
        bouton: document.getElementById("proj-bouton").value,
        rivet: document.getElementById("proj-rivet").value,
        etiquette: document.getElementById("proj-etiquette").value,
        qty: Number(document.getElementById("proj-qty").value),
        statut: "En attente",
        tissuDeduit: false
    };

    projets.push(p);

    deductItem("patch", p.patch, p.qty);
    deductItem("flasher", p.flasher, p.qty);
    deductItem("bouton", p.bouton, p.qty);
    deductItem("rivet", p.rivet, p.qty);
    deductItem("etiquette", p.etiquette, p.qty);

    renderCards("patch");
    renderCards("flasher");
    renderCards("bouton");
    renderCards("rivet");
    renderCards("etiquette");

    renderProjectList();
    renderDashboard();
    saveAll();
    closeProjectForm();
}

function deductItem(type, code, qty) {
    const item = inventaire[type].find(i => i.code === code);
    if (item) {
        item.quantite -= qty;

        addMouvement(
            "sortie",
            type,
            code,
            qty,
            "Projet (création)",
            "Déduction automatique"
        );
    }
}

function startProduction(id) {
    const p = projets.find(x => x.id === id);
    if (!p || p.tissuDeduit) return;

    const tissu = inventaire.tissu.find(t => t.code === p.tissu);
    if (tissu) {
        tissu.quantite -= p.qty;

        addMouvement(
            "sortie",
            "tissu",
            p.tissu,
            p.qty,
            "Projet (production)",
            "Déduction tissu"
        );
    }

    p.tissuDeduit = true;
    p.statut = "En production";

    renderCards("tissu");
    renderProjectList();
    renderDashboard();
    saveAll();
}

function setStatus(id, statut) {
    const p = projets.find(x => x.id === id);
    if (!p) return;

    p.statut = statut;
    renderProjectList();
    renderDashboard();
    saveAll();
}

function renderProjectList() {
    const div = document.getElementById("project-list");
    if (!div) return;
    div.innerHTML = "";

    projets.forEach(p => {
        div.innerHTML += `
            <div class="card">
                <h3>Projet ${p.lot}</h3>
                <div class="info"><strong
