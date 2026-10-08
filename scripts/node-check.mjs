// Runs on whatever Node invoked npm (plain JS, no flags): if it is too old, say what to do instead of letting Node fail with
// "bad option: --experimental-strip-types" or Astro's own refusal. npm runs this as the `pre*` hook of every script that needs 22.
const NEED = 22;
const major = Number(process.versions.node.split('.')[0]);
if (major < NEED) {
  console.error(
    `\nawo-ki necesita Node ${NEED} y estás en ${process.versions.node}.\n` +
    `  nvm use                                                   # lee el .nvmrc de este directorio\n` +
    `  export PATH="$HOME/.nvm/versions/node/v22.21.1/bin:$PATH" # si nvm no está en esta shell\n`,
  );
  process.exit(1);
}
