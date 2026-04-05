// CONFIGURAÇÕES DO CRISTIAN (COPIADAS DO FIREBASE)
const firebaseConfig = {
  apiKey: "AIzaSyC2PyMxApIjZ_bEcyV1FdftHQHzi7irM4k",
  authDomain: "rota-certa-861e7.firebaseapp.com",
  projectId: "rota-certa-861e7",
  storageBucket: "rota-certa-861e7.firebasestorage.app",
  messagingSenderId: "56675221849",
  appId: "1:56675221849:web:ebe796a6f2a93cba204c48",
  measurementId: "G-EZQYY93VGN"
};

// INICIALIZAÇÃO (VERSÃO COMPAT)
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let planoNome = "Mensal";

// FUNÇÕES DE INTERAÇÃO
function setPlano(nome) {
    planoNome = nome;
    document.getElementById('opt-mensal').classList.toggle('active', nome === 'Mensal');
    document.getElementById('opt-trim').classList.toggle('active', nome === 'Trimestral');
}

function copiarPix() {
    navigator.clipboard.writeText(CONFIG_CHAVE_PIX);
    alert("Chave Pix copiada!");
}

function enviarWhatsapp() {
    const email = auth.currentUser ? auth.currentUser.email : "Não identificado";
    const valor = planoNome === "Mensal" ? CONFIG_PRECO_MENSAL : CONFIG_PRECO_TRIMESTRAL;
    const msg = encodeURIComponent(`Olá Cristian! Paguei o plano ${planoNome} (R$ ${valor}).\nMeu e-mail: ${email}\n\nSegue o comprovante:`);
    window.location.href = `https://wa.me/${CONFIG_WHATSAPP}?text=${msg}`;
}

// CADASTRO DE MOTORISTA (COM TESTE DE 3 DIAS)
async function cadastrarMotorista() {
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const meta = document.getElementById('metaKm').value;

    if(!email || !senha || !meta) return alert("Preencha todos os campos!");

    try {
        const cred = await auth.createUserWithEmailAndPassword(email, senha);
        const exp = new Date();
        exp.setDate(exp.getDate() + 3); // 3 dias de teste automático

        await db.collection("usuarios").doc(cred.user.uid).set({
            email: email,
            metaKm: parseFloat(meta),
            dataExpiracao: exp.toISOString()
        });
        
        alert("Teste de 3 dias ativado com sucesso!");
        location.reload();
    } catch (e) { 
        alert("Erro ao cadastrar: " + e.message); 
    }
}

// VERIFICAÇÃO DE ACESSO AO CARREGAR O APP
auth.onAuthStateChanged(user => {
    if (user) {
        db.collection("usuarios").doc(user.uid).get().then(doc => {
            if (doc.exists) {
                const dados = doc.data();
                const exp = new Date(dados.dataExpiracao);
                const hoje = new Date();

                if (hoje > exp) {
                    // BLOQUEADO - MOSTRA TELA DE PAGAMENTO
                    document.getElementById('auth-section').style.display = 'none';
                    document.getElementById('bloqueio-section').style.display = 'block';
                    document.getElementById('main-app').style.display = 'none';
                } else {
                    // LIBERADO - MOSTRA O SEMÁFORO
                    document.getElementById('auth-section').style.display = 'none';
                    document.getElementById('bloqueio-section').style.display = 'none';
                    document.getElementById('main-app').style.display = 'block';
                    document.getElementById('display-meta').innerText = "Sua Meta: R$ " + dados.metaKm.toFixed(2) + "/km";
                    document.getElementById('status-validade').innerText = "Acesso garantido até: " + exp.toLocaleDateString();
                }
            }
        });
    }
});
