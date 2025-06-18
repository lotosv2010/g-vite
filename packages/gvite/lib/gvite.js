async function main() {
  let argv = process.argv.slice(2);
  console.log(argv);
}

main().catch((err) => {
  console.error(err);
});
