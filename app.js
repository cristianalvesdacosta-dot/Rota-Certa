async function calcularLucroReal() {
    const valor = parseFloat(document.getElementById('valorCorrida').value);
    const km = parseFloat(document.getElementById('distanciaCorrida').value);
    const custoKm = parseFloat(document.getElementById('custoCombustivel').value) || 0.50;
    
    const lucroLiquido = valor - (km * custoKm);
    const valorPorKm = lucroLiquido / km;
    
    const bola = document.getElementById('bola-semaforo');
    const msg = document.getElementById('msg-resultado');
    const display = document.getElementById('resultado-semaforo');
    
    display.style.display = 'block';

    // LÓGICA DO SEMÁFORO
    if (valorPorKm >= 2.0) { // Meta de 2 reais por KM limpo
        bola.style.backgroundColor = '#2ecc71'; // Verde
        msg.innerText = "ACEITA! ✅";
        msg.style.color = '#2ecc71';
    } else if (valorPorKm >= 1.2) {
        bola.style.backgroundColor = '#f1c40f'; // Amarelo
        msg.innerText = "ATENÇÃO! ⚠️";
        msg.style.color = '#f1c40f';
    } else {
        bola.style.backgroundColor = '#e74c3c'; // Vermelho
        msg.innerText = "RECUSE! ❌";
        msg.style.color = '#e74c3c';
    }

    document.getElementById('detalhe-lucro').innerText = `Sobrou R$ ${lucroLiquido.toFixed(2)} limpo (R$ ${valorPorKm.toFixed(2)}/km)`;

    // SALVAR NO HISTÓRICO DO FIREBASE
    const user = auth.currentUser;
    await db.collection("usuarios").doc(user.uid).collection("historico").add({
        data: new Date().toISOString(),
        valorBruto: valor,
        lucro: lucroLiquido,
        km: km,
        status: msg.innerText
    });
}
