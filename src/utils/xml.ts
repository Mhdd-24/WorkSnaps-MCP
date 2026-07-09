function decodeXmlEntities(value: string): string {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

export function extractTagText(xml: string, tagName: string): string | undefined {
  const match = xml.match(new RegExp(`<${tagName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tagName}>`, 'i'));
  if (!match?.[1]) {
    return undefined;
  }
  return decodeXmlEntities(match[1].trim());
}

export function extractElements(xml: string, elementName: string): string[] {
  const regex = new RegExp(`<${elementName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${elementName}>`, 'gi');
  const blocks: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(xml)) !== null) {
    blocks.push(match[0]);
  }
  return blocks;
}

export function buildOfflineTimeEntryXml(input: {
  taskId: number;
  minutes: number;
  fromTimestamp: number;
  comment?: string | null;
}): string {
  const comment = input.comment?.trim();
  const commentXml = comment ? `\n  <user_comment>${escapeXml(comment)}</user_comment>` : '';
  return `<time_entry>
  <task_id type="integer">${input.taskId}</task_id>${commentXml}
  <from_timestamp type="integer">${input.fromTimestamp}</from_timestamp>
  <duration_in_minutes type="integer">${input.minutes}</duration_in_minutes>
</time_entry>`;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function parseApiError(xml: string): string | undefined {
  const errorString = extractTagText(xml, 'error_string');
  if (errorString) {
    const errorCode = extractTagText(xml, 'error_code');
    return errorCode ? `${errorString} (code ${errorCode})` : errorString;
  }
  return undefined;
}
