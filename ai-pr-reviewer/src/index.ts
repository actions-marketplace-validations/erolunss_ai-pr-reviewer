import * as core from '@actions/core';
import * as github from '@actions/github';
import { GoogleGenAI } from '@google/genai';

async function run() {
  try {
    const githubToken = core.getInput('github_token', { required: true });
    const geminiApiKey = core.getInput('gemini_api_key', { required: true });
    const language = core.getInput('language') || 'tr';

    const context = github.context;
    if (!context.payload.pull_request) {
      core.setFailed('Bu action yalnızca pull_request eventlerinde çalıştırılabilir.');
      return;
    }

    const prNumber = context.payload.pull_request.number;
    const { owner, repo } = context.repo;
    const octokit = github.getOctokit(githubToken);

    core.info(`PR #${prNumber} için diff alınıyor (${owner}/${repo})...`);

    const diffResponse = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: prNumber,
      mediaType: {
        format: 'diff',
      },
    });

    const diffData = diffResponse.data as unknown as string;

    if (!diffData || diffData.trim().length === 0) {
      core.info('Herhangi bir kod değişikliği bulunamadı.');
      return;
    }

    const maxDiffLength = 30000;
    const truncatedDiff = diffData.length > maxDiffLength 
      ? diffData.slice(0, maxDiffLength) + '\n\n... (Diff çok uzun olduğu için kırpıldı)' 
      : diffData;

    core.info('Yapay zeka analizi başlatılıyor...');

    const ai = new GoogleGenAI({ apiKey: geminiApiKey });

    const systemPrompt = language === 'tr' 
      ? `Sen kıdemli bir yazılım mimarısın. Sana sunulan Git Diff'i incele.
Lütfen aşağıdaki başlıklarla markdown formatında profesyonel bir kod incelemesi yap:
1. 📌 **Özet**: Yapılan değişikliklerin 2-3 cümlelik özeti.
2. ⚠️ **Olası Hatalar ve Güvenlik Açıkları**: Kodda gördüğün mantık hataları, null kontrolleri, güvenlik açıkları veya performans problemleri (varsa kod bloklarıyla göster).
3. 💡 **İyileştirme Önerileri**: Kod okunabilirliği ve temiz kod prensipleri açısından öneriler.
Eğer kod temizse ve hata yoksa bunu belirt.`
      : `You are a senior software architect. Review the provided Git Diff.
Provide a professional code review in markdown format with the following sections:
1. 📌 **Summary**: 2-3 sentences summarizing the changes.
2. ⚠️ **Potential Bugs & Security Vulnerabilities**: Logic errors, security holes, performance issues.
3. 💡 **Improvement Suggestions**: Clean code, readability, best practices.`;

    const prompt = `${systemPrompt}\n\nİncelenecek Git Diff:\n\`\`\`diff\n${truncatedDiff}\n\`\`\``;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const reviewComment = response.text;

    if (!reviewComment) {
      core.setFailed('Modelden geçerli bir yanıt alınamadı.');
      return;
    }

    core.info('PR altına inceleme yorumu ekleniyor...');
    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: prNumber,
      body: `### 🤖 Yapay Zeka Kod İncelemesi\n\n${reviewComment}`,
    });

    core.info('Kod incelemesi başarıyla tamamlandı ve yoruma yazıldı!');
  } catch (error: any) {
    core.setFailed(`Action başarısız oldu: ${error.message}`);
  }
}

run();
