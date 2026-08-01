function escapeCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();
}

function projectLabel(entry) {
  return (entry.project_matches || []).map((match) => match.project).join(', ') || '-';
}

export function renderAllTimeMarkdown(ranking, date) {
  const lines = [
    '# AI Radar – Permanent totalranking',
    '',
    `Uppdaterad: ${date}`,
    '',
    'Listan innehåller alla historiskt relevanta repos som AI Radar har rekommenderat, sorterade efter stabil JonasFitScore.',
    '',
    '| Rank | Score | Repo | Bäst för | Action | Först upptäckt | Kort nytta |',
    '|---:|---:|---|---|---|---|---|'
  ];
  ranking.forEach((entry, index) => {
    lines.push(`| ${index + 1} | ${entry.score} | [${escapeCell(entry.repo)}](${entry.url}) | ${escapeCell(projectLabel(entry))} | ${entry.action} | ${entry.first_seen || '-'} | ${escapeCell(entry.summary_sv)} |`);
  });
  if (!ranking.length) lines.push('| - | - | - | - | - | - | Inga relevanta repos ännu. |');
  return `${lines.join('\n')}\n`;
}

export function renderDailyMarkdown(assessments, status) {
  const lines = [`# AI Radar – Daglig analys ${status.date}`, '', `Status: **${status.status}**`, ''];
  if (status.reasons?.length) {
    lines.push('## Statusorsaker', '');
    for (const reason of status.reasons) lines.push(`- ${reason}`);
    lines.push('');
  }
  lines.push('| Score | Repo | Projektmatch | Action | Analysläge | Sammanfattning |', '|---:|---|---|---|---|---|');
  [...assessments].sort((a, b) => b.score - a.score).forEach((entry) => {
    lines.push(`| ${entry.score} | [${escapeCell(entry.repo)}](${entry.url}) | ${escapeCell(projectLabel(entry))} | ${entry.action} | ${entry.analysis_mode} | ${escapeCell(entry.summary_sv)} |`);
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
      `## Nytt repo upptäckt: ${item.repo}`,
      '',
      item.summary_sv,
      '',
      `- **Passar:** ${item.project}`,
      `- **Varför:** ${item.fit_reason}`,
      `- **Bedömning:** ${item.score}/100 – ${item.action}`,
      `- **Länk:** ${item.url}`,
      ''
    );
  }
  return `${lines.join('\n')}\n`;
}
