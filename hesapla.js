// Kullanıcı hesaplama fonksiyonu
function kullaniciBolum(sayi, bolen) {
    // DİKKAT: Sıfıra bölme kontrolü yok!
    return sayi / bolen;
}

function kullaniciyiGetir(id) {
    // SQL Injection açığı ve eksik parametre kontrolü
    let sorgu = "SELECT * FROM users WHERE id = " + id;
    return sorgu;
}
