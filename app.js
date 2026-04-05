const firebaseConfig = {
  apiKey: "Njw5x4SWIEtu-h2-BLJJ-6jOZenaXSKlr2xYp9-sXg8",
  authDomain: "rota-certa-app.firebaseapp.com",
  projectId: "rota-certa-app",
  storageBucket: "rota-certa-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:12345:web:abcde"
};

// Inicia Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

async function cadastrarMotorista() {
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const meta = document.getElementById('metaKm').value;

    if(!email || !senha || !meta) return alert("Preencha tudo!");

    try {
        const cred = await auth.createUserWithEmailAndPassword(email, senha);
        
        // Salva os dados na coleção que você criou no Firebase
        await db.collection("usuarios").doc(cred.user.uid).set({
            email: email,
            metaKm: parseFloat(meta),
            status: "ativo",
            data: new Date().toISOString()
        });

        alert("Rota Certa Ativado!");
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('main-app').style.display = 'block';
        document.getElementById('display-meta').innerText = "Sua meta: R$ " + meta + "/km";
    } catch (error) {
        alert("Erro: " + error.message);
    }
}
