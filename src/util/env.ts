export function parseEnv(env: string) {
  const envLines = env.split("\n");
  const vars: { [key: string]: string } = {};
  for (const line of envLines) {
    const [key, value] = line.split("=");
    vars[key] = value;
  }
  return vars;
}
