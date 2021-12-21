# BGEE (Baldur's Gate Enhanced Edition) Bag Sort

In playing BGEE, I'm a bit of an item hoarder.

As such, this can make it really difficult to find items in the
bottomless bag of holding added by some mods.

The aim of this tool is to decompress/parse a .sav game file, re-order
the items in a bag (.sto resource), and re-compress into a valid .sav
game file.

# Usage

BACKUP YOUR SAVE GAMES FIRST - THIS IS WORKING ON MY COPY - THAT DOES
NOT MEAN IT IS EXTENSIVELY TESTED.

## Sample of organizing a potion bag

```sh
node ./src/index.js \
  --sav ~/bgee/bgeet-saves/save/000000001-Briggs-Quick-Save-2/BALDUR.SAV \
  --override ~/bgee/bgeet/override \
  --bag BAG06_.sto  \
  --out potions.sav

cp potions.sav ~/bgee/bgeet-saves/save/000000001-Briggs-Quick-Save-2/BALDUR.SAV
```

## Sample of organizing a bottomless bag of holding (turquoise)

```sh
node ./src/index.js \
  --sav ~/bgee/bgeet-saves/save/000000001-Briggs-Quick-Save-2/BALDUR.SAV \
  --override ~/bgee/bgeet/override \
  --bag THBAG05.sto  \
  --out sorted.sav

cp sorted.sav ~/bgee/bgeet-saves/save/000000001-Briggs-Quick-Save-2/BALDUR.SAV
```

# License

LGPLv3 (same as NearInfinity)
