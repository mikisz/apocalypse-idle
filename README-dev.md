# Developer Notes

## Economy Reporter

Generate the combined economy report (including payback-time sections):

```
npm run report:economy
```

Run the reporter directly with custom options:

```
node --loader ts-node/esm src/dev/economyReporter.ts --season=winter --weights=wood=1,stone=1.2 --format=json --out=economy.json
```

Flags:
- `--season=average|winter|spring|summer|autumn|all`
- `--weights` comma list or path to JSON
- `--targets` comma list of ownership counts (e.g. `1,10,50`)
- `--format=md|json|csv`
- `--out` output file path
- `--include=generators,converters,storage,all`
- `--locale` locale for number formatting

The report includes payback-time estimates for each building and highlights outliers against default thresholds.
