# 🤖 AI PR Code Reviewer (GitHub Action)

GitHub deponuza açılan her **Pull Request (PR)** için otomatik olarak devreye giren, yapılan kod değişikliklerini özetleyen ve olası mantık/güvenlik açıklarını (SQL Injection, null pointer, performans sorunları vb.) kıdemli bir yazılım mimarı gözüyle inceleyip PR altına yorum yazan yapay zeka destekli bir **GitHub Action**.

---

## ✨ Özellikler

- 📌 **Akıllı Değişiklik Özeti:** PR'da neyin değiştiğini 2-3 cümlede özetler.
- 🚨 **Güvenlik & Mantık Hataları Tespiti:** SQL Injection, bellek sızıntıları, eksik kontroller gibi açıkları tespit eder.
- 💡 **Temiz Kod & Refactoring:** Kod okunabilirliğini artıracak öneriler ve düzeltilmiş kod blokları sunar.
- 🛡️ **Model Fallback Zinciri:** Google Gemini API yoğunluklarında kesinti yaşamamak için otomatik olarak kararlı yedek modellere (gemini-2.0-flash -> gemini-1.5-flash) geçer.
- 🌍 **Çoklu Dil Desteği:** Türkçe ('tr') ve İngilizce ('en') inceleme desteği.

---

## 🚀 Nasıl Kullanılır?

Kendi GitHub deponuzda .github/workflows/ai-review.yml dosyasını oluşturup aşağıdaki içeriği eklemeniz yeterlidir:

\\\yaml
name: AI Code Review

on:
  pull_request:
    types: [opened, synchronize]

permissions:
  contents: read
  pull-requests: write

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Run AI Reviewer
        uses: erolunss/ai-pr-reviewer@main
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          gemini_api_key: ${{ secrets.GEMINI_API_KEY }}
          language: 'tr'
\\\

---

## 🛠️ Teknolojiler
- **Dil:** TypeScript
- **Çalışma Zamanı:** Node.js (GitHub Action Runner)
- **Paketleyici:** esbuild (Hızlı & Tek dosya bundle)
- **API Entegrasyonu:** @actions/github, @actions/core (Octokit)
- **Yapay Zeka Modeli:** Google Gemini API (@google/genai)
