function escapeCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();
}

function projectLabel(entry) {
  return (entry.project_matches || []).map((match) => match.project).join(', ') || '-';
}

function tierLabel(tier) {
  if (tier === 'exceptional') return 'Exceptionell';
  if (tier === 'strong') return 'Stark';
  return 'Arkiv';
}

export function renderAllTimeMarkdown(ranking, date) {
  const lines = [
    '# AI Radar – Permanent kvalitetsranking',
    '',
    `Uppdaterad: ${date}`,
    '',
    'Listan visar endast exakta, evidensbaserade projektmatchningar som passerat samtliga kvalitetsgrindar. En kort eller tom lista är ett korrekt resultat.',
    '',
    '| Rank | Ranking | Grund | Nivå | Repo | Bäst för | Kategori | Nästa test | Status |',
    '|---:|---:|---:|---|---|---|---|---|---|'
  ];
  ranking.forEach((entry, index) => {
    lines.push(`| ${index + 1} | ${entry.ranking_score ?? entry.score} | ${entry.score} | ${tierLabel(entry.quality_tier)} | [${escapeCell(entry.repo)}](${entry.url}) | ${escapeCell(projectLabel(entry))} | ${escapeCell(entry.category || '-')} | ${escapeCell(entry.next_step || '-')} | ${escapeCell(entry.feedback_status || 'unreviewed')} |`);
  });
  if (!ranking.length) lines.push('| - | - | - | - | - | - | - | Inga tillräckligt starka matchningar ännu. | - |');
  return `${lines.join('\n')}\n`;
}

export function renderDailyMarkdown(assessments, status) {
  const lines = [
    `# AI Radar – Daglig analys ${status.date}`,
    '',
    `Teknisk status: **${status.status}**`,
    `Kvalitetsstatus: **${status.quality_status || 'unknown'}**`,
    ''
  ];
  if (status.reasons?.length) {
    lines.push('## Statusorsaker', '');
    for (const reason of status.reasons) lines.push(`- ${reason}`);
    lines.push('');
  }
  if (status.quality_warning_reasons?.length) {
    lines.push('## Kvalitetsvarningar', '');
    for (const reason of status.quality_warning_reasons) lines.push(`- ${reason}`);
    lines.push('');
  }
  lines.push(
    '| Score | Repo | Nivå | Matchtyp | Confidence | Projektmatch | Action | Orsak till arkiv |',
    '|---:|---|---|---|---:|---|---|---|'
  );
  [...assessments].sort((a, b) => b.score - a.score).forEach((entry) => {
    lines.push(`| ${entry.score} | [${escapeCell(entry.repo)}](${entry.url}) | ${tierLabel(entry.quality_tier)} | ${escapeCell(entry.match_type || '-')} | ${Number(entry.confidence || 0).toFixed(2)} | ${escapeCell(projectLabel(entry))} | ${entry.action} | ${escapeCell((entry.failed_quality_gates || []).join(', ') || '-')} |`);
  });
  return `${lines.join('\n')}\n`;
}

export function renderNotificationsMarkdown(notifications, date) {
  const lines = [`# AI Radar – Notifieringar ${date}`, ''];
  if (!notifications.length) {
    lines.push('Inga nya notifieringsvärda repos upptäcktes idag.');
    return `${lines.join('\n')}\n`;
  }
  for (const item of notifications) {
    lines.push(
      `## Nytt exceptionellt repo: ${item.repo}`,
      '',
      item.summary_sv,
      '',
      `- **Passar:** ${item.project}`,
      `- **Konkret användning:** ${item.concrete_use_case}`,
      `- **Varför:** ${item.fit_reason}`,
      `- **Unik skillnad:** ${item.differentiator}`,
      `- **Nästa test:** ${item.next_step}`,
      `- **Bedömning:** ${item.score}/100, confidence ${Number(item.confidence || 0).toFixed(2)} – Testa nu`,
      `- **Evidens:** ${(item.evidence || []).join(' · ')}`,
      `- **Länk:** ${item.url}`,
      ''
    );
  }
  return `${lines.join('\n')}\n`;
}
