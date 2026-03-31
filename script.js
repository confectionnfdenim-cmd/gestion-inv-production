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
div.innerHTML += `
    <div class="card">
        <h3>Projet ${p.lot}</h3>

        <div class="info"><strong>Client :</strong> ${p.client}</div>
        <div class="info"><strong>Modèle :</strong> ${p.modele}</div>
        <div class="info"><strong>Tissu :</strong> ${p.tissu}</div>
        <div class="info"><strong>Quantité :</strong> ${p.qty}</div>
        <div class="info"><strong>Statut :</strong> ${p.statut}</div>

        <div class="actions">
            <button onclick="startProduction(${p.id})">Déduire tissu</button>
            <button onclick="setStatus(${p.id}, 'En attente')">En attente</button>
            <button onclick="setStatus(${p.id}, 'En production')">En production</button>
            <button onclick="setStatus(${p.id}, 'Terminé')">Terminé</button>
        </div>
    </div>
`;

    });
}

/* --------------------------------------------------------- */
/*  MODÈLES */
/* --------------------------------------------------------- */

function openModeleForm() {
    const form = document.getElementById("modeleForm");

    form.innerHTML = `
        <div class="modal-content">
            <h2>Nouveau modèle</h2>

            <label>Nom du modèle</label>
            <input id="mod-nom">

            <label>Patch</label>
            <select id="mod-patch"></select>

            <label>Flasher</label>
            <select id="mod-flasher"></select>

            <label>Bouton</label>
            <select id="mod-bouton"></select>

            <label>Rivet</label>
            <select id="mod-rivet"></select>

            <label>Étiquette</label>
            <select id="mod-etiquette"></select>

            <div class="form-actions">
                <button onclick="saveModele()">Créer</button>
                <button onclick="closeModeleForm()">Annuler</button>
            </div>
        </div>
    `;

    fillSelect("mod-patch", inventaire.patch);
    fillSelect("mod-flasher", inventaire.flasher);
    fillSelect("mod-bouton", inventaire.bouton);
    fillSelect("mod-rivet", inventaire.rivet);
    fillSelect("mod-etiquette", inventaire.etiquette);

    form.style.display = "flex";
}

function closeModeleForm() {
    document.getElementById("modeleForm").style.display = "none";
}

function saveModele() {
    modeles.push({
        nom: document.getElementById("mod-nom").value,
        patch: document.getElementById("mod-patch").value,
        flasher: document.getElementById("mod-flasher").value,
        bouton: document.getElementById("mod-bouton").value,
        rivet: document.getElementById("mod-rivet").value,
        etiquette: document.getElementById("mod-etiquette").value
    });

    renderModeles();
    saveAll();
    closeModeleForm();
}

function renderModeles() {
    const div = document.getElementById("modeles-list");
    if (!div) return;
    div.innerHTML = "";

    modeles.forEach(m => {
        div.innerHTML += `
            <div class="card">
                <h3>${m.nom}</h3>
                <div class="info"><strong>Patch :</strong> ${m.patch}</div>
                <div class="info"><strong>Flasher :</strong> ${m.flasher}</div>
                <div class="info"><strong>Bouton :</strong> ${m.bouton}</div>
                <div class="info"><strong>Rivet :</strong> ${m.rivet}</div>
                <div class="info"><strong>Étiquette :</strong> ${m.etiquette}</div>
            </div>
        `;
    });
}

/* --------------------------------------------------------- */
/*  DASHBOARD */
/* --------------------------------------------------------- */

function renderDashboard() {
    const div = document.getElementById("dashboard-cards");
    if (!div) return;

    const totalArticles = Object.values(inventaire).reduce((sum, arr) => sum + arr.length, 0);
    const totalProjets = projets.length;
    const totalMouvements = mouvements.length;

    div.innerHTML = `
        <div class="card">
            <h3>Total articles</h3>
            <p>${totalArticles}</p>
        </div>

        <div class="card">
            <h3>Total projets</h3>
            <p>${totalProjets}</p>
        </div>

        <div class="card">
            <h3>Total mouvements</h3>
            <p>${totalMouvements}</p>
        </div>
    `;
}

/* --------------------------------------------------------- */
/*  INITIALISATION */
/* --------------------------------------------------------- */

renderDashboard();
renderMouvements();
renderProjectList();
renderModeles();

["tissu", "patch", "flasher", "bouton", "rivet", "etiquette"].forEach(renderCards);
