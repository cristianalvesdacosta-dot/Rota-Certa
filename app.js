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
// MONITOR DE ASSINATURA (BLOQUEIO AUTOMÁTICO)
// ==========================================
auth.onAuthStateChanged(user => {
    if (user) {
        // Se o motorista estiver logado, verifica a validade no seu banco
        db.collection("usuarios").doc(user.uid).onSnapshot(doc => {
            if (doc.exists) {
                const dados = doc.data();
                const hoje = new Date();
                const expira = new Date(dados.dataExpiracao);

                // Se hoje passou da data de expiração, mostra a tela de bloqueio
                if (hoje > expira) {
                    document.getElementById('block-screen').style.display = 'block';
                    document.getElementById('app-content').style.opacity = '0.1';
                    document.getElementById('app-content').style.pointerEvents = 'none';
                } else {
                    document.getElementById('block-screen').style.display = 'none';
                    document.getElementById('app-content').style.opacity = '1';
                    document.getElementById('app-content').style.pointerEvents = 'auto';
                }
            } else {
                // Se o usuário não existe no banco, cria um perfil de teste de 3 dias
                criarPerfilTeste(user);
            }
        });
    } else {
        // Se não estiver logado, você pode redirecionar para uma tela de login
        console.log("Usuário deslogado");
    }
});

// Função para dar 3 dias de teste para novos motoristas de Belém
async function criarPerfilTeste(user) {
    const dataExpira = new Date();
    dataExpira.setDate(dataExpira.getDate() + 3); // 3 dias grátis

    await db.collection("usuarios").doc(user.uid).set({
        email: user.email,
        dataExpiracao: dataExpira.toISOString(),
        plano: "Teste Gratis",
        criadoEm: new Date().toISOString()
    });
}

// ==========================================
// SALVAR CONFIGURAÇÕES DA MOTO NO FIREBASE
// ==========================================
async function salvarConfig() {
    const user = auth.currentUser;
    if (!user) return alert("Faça login para salvar!");

    const dadosMoto = {
        consumo: document.getElementById('moto-consumo').value,
        tanque: document.getElementById('moto-tanque').value,
        gasolina: document.getElementById('gas-preco').value,
        metaKm: document.getElementById('user-meta').value,
        categoria: document.getElementById('select-moto').value
    };

    try {
        await db.collection("usuarios").doc(user.uid).update({
            configuracaoVeiculo: dadosMoto
        });
        alert("Configurações da sua moto salvas com sucesso!");
    } catch (error) {
        // Se o documento não permitir update, tenta set
        await db.collection("usuarios").doc(user.uid).set({
            configuracaoVeiculo: dadosMoto
        }, { merge: true });
        alert("Configurações salvas!");
    }
}
