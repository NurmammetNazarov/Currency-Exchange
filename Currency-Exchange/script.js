$(document).ready(function() {
  // Para birimlerini dropdownlara yükle
  const currencies = {
    "USD": "Amerikan Doları",
    "EUR": "Euro",
    "TRY": "Türk Lirası",
    "GBP": "İngiliz Sterlini",
    "CHF": "İsviçre Frangı",
    "CAD": "Kanada Doları",
    "AUD": "Avustralya Doları",
    "JPY": "Japon Yeni",
    "CNY": "Çin Yuanı",
    "SEK": "İsveç Kronu",
    "NOK": "Norveç Kronu",
    "RUB": "Rus Rublesi"
  };

  // İnternet kesilirse veya API'ye ulaşılamazsa devreye girecek yedek kurlar (1 USD bazlı)
  const fallbackRates = {
    "USD": 1,
    "EUR": 0.92,
    "TRY": 34.50,
    "GBP": 0.79,
    "CHF": 0.88,
    "CAD": 1.39,
    "AUD": 1.52,
    "JPY": 153.0,
    "CNY": 7.24,
    "SEK": 10.85,
    "NOK": 11.05,
    "RUB": 98.50
  };

  const $fromSelect = $('#from');
  const $toSelect = $('#to');
  const $amount = $('#amount');
  const $result = $('#result');
  const $convertBtn = $('button:contains("Dönüştür")');

  // Dropdownları doldur
  $.each(currencies, function(code, name) {
    const optionText = `${code} (${name})`;
    $fromSelect.append($('<option>', {value: code, text: optionText}));
    $toSelect.append($('<option>', {value: code, text: optionText}));
  });

  // Varsayılan değerler
  $fromSelect.val('TRY');
  $toSelect.val('USD');

  // Miktar inputuna her girişte sonucu temizle
  $amount.on('input', function() {
    $result.fadeOut(100, function() {
      $result.text('').show();
    });
  });

  // Dönüştürme fonksiyonu
  window.convertCurrency = function() {
    const amount = parseFloat($amount.val());
    const from = $fromSelect.val();
    const to = $toSelect.val();

    if (isNaN(amount) || amount <= 0) {
      $result.text("Lütfen geçerli bir miktar girin.").css('color', 'red');
      return;
    }
    if (from === to) {
      $result.text(`${amount} ${from} = ${amount.toFixed(2)} ${to}`).css('color', 'green');
      return;
    }

    // Butonu devre dışı bırak, "Yükleniyor..." yaz
    $convertBtn.prop('disabled', true).text('Yükleniyor...');

    // CORS dostu, API anahtarı gerektirmeyen ve RUB dahil tüm birimleri destekleyen servis
    const url = `https://open.er-api.com/v6/latest/${from}`;

    $.getJSON(url)
      .done(function(data) {
        if (data && data.rates && data.rates[to]) {
          const resultVal = amount * data.rates[to];
          $result.text(`${amount} ${from} = ${resultVal.toFixed(2)} ${to}`).css('color', 'green');
        } else {
          throw new Error("Kur verisi bulunamadı");
        }
      })
      .fail(function() {
        // Herhangi bir ağ/API hatasında yedek kurlar üzerinden hesapla (sistem asla çökmez)
        const usdAmount = amount / fallbackRates[from];
        const fallbackResult = usdAmount * fallbackRates[to];
        $result.text(`${amount} ${from} = ${fallbackResult.toFixed(2)} ${to}`).css('color', 'green');
      })
      .always(function() {
        // Butonu tekrar aktif yap, yazıyı eski haline getir
        $convertBtn.prop('disabled', false).text('Dönüştür');
      });
  };

  // Takas butonu fonksiyonu
  window.swapCurrencies = function() {
    const temp = $fromSelect.val();
    $fromSelect.val($toSelect.val());
    $toSelect.val(temp);
    $result.text('');
  };
});