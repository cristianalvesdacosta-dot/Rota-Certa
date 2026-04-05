// CONFIGURAÇÕES DO CRISTIAN
const firebaseConfig = {
  apiKey: "AIzaSyC2PyMxApIjZ_bEcyV1FdftHQHzi7irM4k",
  authDomain: "rota-certa-861e7.firebaseapp.com",
  projectId: "rota-certa-861e7",
  storageBucket: "rota-certa-861e7.firebasestorage.app",
  messagingSenderId: "56675221849",
  appId: "1:56675221849:web:ebe796a6f2a93cba204c48"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const CUSTO_POR_KM = 0.70; // Média de gasto em Belém (Gasolina + Manutenção)
const META_MINIMA = 1.80; // Meta por KM limpo

function analisar() {
    const v = parseFloat(document.getElementById('input-valor').value);
    const k = parseFloat(document.getElementById('input-km').value);
    
    if(!v || !k) return;

    const lucroLimp = v - (k * CUSTO_POR_KM);
    const rKm = lucroLimp / k;
    
    // Atualiza Visual
    document.getElementById('val-km').innerText = `R$ ${rKm.toFixed(2)}`;
    document.getElementById('val-lucro').innerText = `R$ ${lucroLimp.toFixed(2)}`;
    
    const ponteiro = document.getElementById('ponteiro');
    const txt = document.getElementById('feedback-txt');

    // Lógica do Ponteiro (0% a 100% da barra)
    let pos = (rKm / 3) * 100; 
    if(pos > 95) pos = 95;
    ponteiro.style.left = pos + "%";

    if(rKm >= META_MINIMA) {
        txt.innerText = "EXCELENTE! ✅";
        txt.style.color = "var(--green)";
    } else if (rKm >= 1.2) {
        txt.innerText = "AVALIE BEM ⚠️";
        txt.style.color = "var(--yellow)";
    } else {
        txt.innerText = "PREJUÍZO! ❌";
        txt.style.color = "var(--red)";
    }

    salvarCorrida(v, k, lucroLimp, txt.innerText);
}

async function salvarCorrida(v, k, l, s) {
    const user = auth.currentUser;
    await db.collection("usuarios").doc(user.uid).collection("corridas").add({
        valor: v, km: k, lucro: l, status: s, data: new Date().toISOString()
    });
}

async function carregarHistorico() {
    const user = auth.currentUser;
    const lista = document.getElementById('lista-historico');
    lista.innerHTML = "Carregando...";
    
    const snap = await db.collection("usuarios").doc(user.uid).collection("corridas").orderBy("data","desc").limit(15).get();
    
    lista.innerHTML = "";
    snap.forEach(doc => {
        const d = doc.data();
        const cor = d.status.includes("EXCELENTE") ? "var(--green)" : d.status.includes("AVALIE") ? "var(--yellow)" : "var(--red)";
        lista.innerHTML += `
            <div class="hist-card" style="border-left-color: ${cor}">
                <div class="hist-header">
                    <span>${new Date(d.data).toLocaleTimeString()}</span>
                    <span>${d.km} KM</span>
                </div>
                <div style="display:flex; justify-content:space-between; margin-top:5px;">
                    <b>Valor: R$ ${d.valor.toFixed(2)}</b>
                    <b style="color:${cor}">Lucro: R$ ${d.lucro.toFixed(2)}</b>
                </div>
            </div>`;
    });
}

function mudarAba(aba) {
    document.getElementById('tab-calculo').style.display = aba === 'calc' ? 'block' : 'none';
    document.getElementById('tab-historico').style.display = aba === 'hist' ? 'block' : 'none';
    document.getElementById('nav-calc').className = 'nav-item ' + (aba === 'calc' ? 'active' : '');
    document.getElementById('nav-hist').className = 'nav-item ' + (aba === 'hist' ? 'active' : '');
    if(aba === 'hist') carregarHistorico();
}

// Auth e Navegação
async function entrar() {
    const e = document.getElementById('email').value;
    const s = document.getElementById('senha').value;
    try { await auth.signInWithEmailAndPassword(e, s); } catch(err) { alert("Erro: " + err.message); }
}

auth.onAuthStateChanged(user => {
    if(user) {
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('app-screen').style.display = 'block';
    } else {
        document.getElementById('auth-screen').style.display = 'block';
        document.getElementById('app-screen').style.display = 'none';
    }
});

function logout() { auth.signOut(); }
