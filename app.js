// CONFIGURAÇÕES FIREBASE DO CRISTIAN
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

// Variaveis de Controle
let metaUsuario = 2.00;
let custoUsuario = 0.70;

// O CORAÇÃO DO ASSISTENTE: Lógica de Monitoramento
function assistenteAutomatico() {
    const valor = parseFloat(document.getElementById('sim-valor').value);
    const km = parseFloat(document.getElementById('sim-km').value);
    
    if(!valor || !km) return alert("Insira os dados para simular a leitura");

    // Cálculo que o Assistente faz em milissegundos
    const lucroReal = valor - (km * custoUsuario);
    const valorKmReal = lucroReal / km;

    const luz = document.getElementById('luz-indicadora');
    const txt = document.getElementById('texto-decisao');

    // Decisão do Semáforo
    if (valorKmReal >= metaUsuario) {
        luz.style.background = "var(--green)";
        luz.style.boxShadow = "0 0 40px var(--green)";
        txt.innerText = "ACEITA! ✅";
        txt.style.color = "var(--green)";
        falar("Corrida excelente! Vai que é tua!");
    } else if (valorKmReal >= (metaUsuario * 0.7)) {
        luz.style.background = "var(--yellow)";
        luz.style.boxShadow = "0 0 40px var(--yellow)";
        txt.innerText = "AVALIE! ⚠️";
        txt.style.color = "var(--yellow)";
    } else {
        luz.style.background = "var(--red)";
        luz.style.boxShadow = "0 0 40px var(--red)";
        txt.innerText = "RECUSA! ❌";
        txt.style.color = "var(--red)";
        falar("Prejuízo! Não aceita.");
    }

    document.getElementById('res-lucro').innerText = "R$ " + lucroReal.toFixed(2);
    document.getElementById('res-km').innerText = "R$ " + valorKmReal.toFixed(2);

    salvarHistorico(valor, km, lucroReal, txt.innerText);
}

// Função de Notificação por Voz
function falar(mensagem) {
    const msg = new SpeechSynthesisUtterance(mensagem);
    msg.lang = 'pt-BR';
    window.speechSynthesis.speak(msg);
}

async function salvarHistorico(v, k, l, s) {
    const user = auth.currentUser;
    await db.collection("usuarios").doc(user.uid).collection("monitoramento").add({
        valor: v, km: k, lucro: l, status: s, data: new Date().toISOString()
    });
}

// Navegação de Abas
function mudarTab(aba) {
    const tabs = ['tab-assistente', 'tab-hist', 'tab-config'];
    tabs.forEach(t => document.getElementById(t).style.display = 'none');
    
    if(aba === 'ast') document.getElementById('tab-assistente').style.display = 'block';
    if(aba === 'cfg') document.getElementById('tab-config').style.display = 'block';
    if(aba === 'hist') {
        document.getElementById('tab-hist').style.display = 'block';
        carregarHistorico();
    }
}

// Auth
async function fazerLogin() {
    const e = document.getElementById('login-email').value;
    const s = document.getElementById('login-senha').value;
    try { await auth.signInWithEmailAndPassword(e, s); } catch(err) { alert(err.message); }
}

auth.onAuthStateChanged(user => {
    if(user) {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('main-screen').style.display = 'block';
        db.collection("usuarios").doc(user.uid).get().then(doc => {
            const d = doc.data();
            document.getElementById('badge-val').innerText = "ATÉ " + new Date(d.dataExpiracao).toLocaleDateString();
        });
    }
});
