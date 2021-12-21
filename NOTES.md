# Bif/key querying by resref

1. Name like PLAT06 is searched in chitin.key (TODO: Also override/
   directory where it may look for PLAT06.itm etc.)

2. This will give a Key Resource Entry.  From here, you can use the
   resource locator (bits 31-20 = source index, oridinal value of
   which Bif Entry in the chitin.key we should open up - for instance,
   '1' to get DATA/ITEMS.BIF)

3. Resource Locator from step 2 will also have bits 13-0 identify a 12
   bit value to match against an entry in the actual BIF file after it
   was read, and compared against that file's entries for a
   resourcelocator of equivalency.
