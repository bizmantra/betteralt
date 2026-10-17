// <title> keeps month + year (Ron's sign-off); shortened when over ~60 chars. Used with `title.absolute`.
export function altTitle(name: string, month: string) {
  const opts = [`${name} alternatives (${month}), honestly compared`, `${name} alternatives (${month}), compared`, `${name} alternatives (${month})`];
  return opts.find((t) => t.length <= 60) ?? opts.at(-1)!;
}
