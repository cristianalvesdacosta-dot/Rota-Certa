// ==========================================
// CONFIGURAÇÃO FIREBASE DO CRISTIAN
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyC2PyMxApIjZ_bEcyV1FdftHQHzi7irM4k",
  authDomain: "rota-certa-861e7.firebaseapp.com",
  projectId: "rota-certa-861e7",
  storageBucket: "rota-certa-861e7.firebasestorage.app",
  messagingSenderId: "56675221849",
  appId: "1:56675221849:web:ebe796a6f2a93cba204c48"
};

// Inicializa o Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

// ==========================================
// MONITOR DE ACESSO (TRAVA PIX E PERFIL)
// ==========================================
auth.onAuthStateChanged(user => {
    if (user) {
        db.collection("usuarios").doc(user.uid).onSnapshot(doc => {
            if (doc.exists) {
                const dados = doc.data();
                const hoje = new Date();
                const expira = new Date(dados.dataExpiracao);

                // Bloqueio por falta de pagamento (Pix)
                if (hoje > expira) {
                    document.getElementById('block-screen').classList.remove('hidden');
                    document.getElementById('app-main').style.opacity = '0.1';
                    document.getElementById('app-main').style.pointerEvents = 'none';
                } else {
                    document.getElementById('block-screen').classList.add('hidden');
                    document.getElementById('app-main').style.opacity = '1';
                    document.getElementById('app-main').style.pointerEvents = 'auto';
                }
                
                // Carrega as configurações salvas (Moto ou Carro)
                if(dados.configVeiculo) {
                    document.getElementById('tipo-v').value = dados.configVeiculo.tipo;
                    document.getElementById('v-consumo').value = dados.configVeiculo.consumo;
                    document.getElementById('v-meta').value = dados.configVeiculo.meta;
                }
            } else {
                criarNovoPerfil(user);
            }
        });
    }
});

// Criar perfil com 3 dias de teste para novos motoristas
async function criarNovoPerfil(user) {
    const dataExpira = new Date();
    dataExpira.setDate(dataExpira.getDate() + 3); 

    await db.collection("usuarios").doc(user.uid).set({
        email: user.email,
        dataExpiracao: dataExpira.toISOString(),
        perfil: "motorista", // Padrão inicial
        criadoEm: new Date().toISOString()
    });
}

// ==========================================
// FUNÇÃO PARA O ROBO (SKETCHWARE / ANDROID STUDIO)
// ==========================================
// Esta função é chamada automaticamente pelo APK quando lê a Uber
function receberDadosAutomáticos(valorLido, kmLido) {
    document.getElementById('val-entrada').value = valorLido;
    document.getElementById('km-entrada').value = kmLido;
    
    // Chama a função de processar que está no index.html
    if (typeof processar === "function") {
        processar(); 
    }
}

// ==========================================
// SALVAR VEÍCULO E LOCALIZAÇÃO (RADAR 5KM)
// ==========================================
async function salvarConfiguracoes() {
    const user = auth.currentUser;
    if (!user) return;

    const dados = {
        configVeiculo: {
            tipo: document.getElementById('tipo-v').value,
            consumo: document.getElementById('v-consumo').value,
            meta: document.getElementById('v-meta').value,
            gasolina: document.getElementById('v-gas').value
        },
        ultimaAtu: new Date().toISOString()
    };

    try {
        await db.collection("usuarios").doc(user.uid).update(dados);
        alert("Configurações salvas no seu perfil!");
    } catch (e) {
        await db.collection("usuarios").doc(user.uid).set(dados, { merge: true });
    }
}
