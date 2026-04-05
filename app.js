// Substitua pela sua apiKey real
const firebaseConfig = {
  apiKey: "Njw5x4SWIEtu-h2-BLJJ-6jOZenaXSKlr2xYp9-sXg8",
  authDomain: "rota-certa-app.firebaseapp.com",
  projectId: "rota-certa-app",
  storageBucket: "rota-certa-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:12345:web:abcde"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let planoNome = "Mensal";

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

// Funções de Cadastro e Verificação (Mesma lógica anterior)
async function cadastrarMotorista() {
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const meta = document.getElementById('metaKm').value;

    try {
        const cred = await auth.createUserWithEmailAndPassword(email, senha);
        const exp = new Date();
        exp.setDate(exp.getDate() + 3);

        await db.collection("usuarios").doc(cred.user.uid).set({
            email, metaKm: parseFloat(meta), dataExpiracao: exp.toISOString()
        });
        location.reload();
    } catch (e) { alert(e.message); }
}

// Verifica acesso ao carregar
auth.onAuthStateChanged(user => {
    if (user) {
        db.collection("usuarios").doc(user.uid).get().then(doc => {
            const dados = doc.data();
            const exp = new Date(dados.dataExpiracao);
            if (new Date() > exp) {
                document.getElementById('auth-section').style.display = 'none';
                document.getElementById('bloqueio-section').style.display = 'block';
            } else {
                document.getElementById('auth-section').style.display = 'none';
                document.getElementById('main-app').style.display = 'block';
                document.getElementById('display-meta').innerText = "Meta: R$ " + dados.metaKm.toFixed(2) + "/km";
                document.getElementById('status-validade').innerText = "Válido até: " + exp.toLocaleDateString();
            }
        });
    }
});
