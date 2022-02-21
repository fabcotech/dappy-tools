export function dedent(strs: TemplateStringsArray) {
  const lines = strs.join('').split('\n');

  let mindent: number | null = null;
  lines.forEach((l) => {
    const m = l.match(/^(\s+)\S+/);
    if (m) {
      const indent = m[1].length;
      if (!mindent) {
        mindent = indent;
      } else {
        mindent = Math.min(mindent, indent);
      }
    }
  });

  let result = '';
  if (mindent !== null) {
    const m = mindent;
    result = lines.map((l) => (l[0] === ' ' ? l.slice(m) : l)).join('\n');
  }
  return result;
}
